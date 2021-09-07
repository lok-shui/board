import {HandlerTemplate} from './handler-template';
import {MathContent, TextContent} from '../content';
import {PGNode} from '@/types/instruction';
import {STRUCT_TYPE} from '@/const';
import store from '@/store';
import {InfoActions} from '@/store/info';
import aitAudio from '../../ait-audio';
import {Chalk, goto, showMathMl, gotoOld} from '@/utils';
import {axios} from '@/api/axios';
import {theme} from '@/index';
import {color, RGBColor} from 'd3-color';
import {diff_match_patch} from 'diff-match-patch';
import pageEvent from '@/utils/event';
import {messageEvent} from '@/views/lamp/message.event';
import lampAudio from '@/views/lamp/lamp-audio';

// 语音内容文件的分段符号
const SPLITTER_TEXT = '[,，。;；:：!！?？．](?![^（]*）)(?![^()]*\\))';
const SPLITTER_REG = new RegExp(`${SPLITTER_TEXT}`);
const MIN_SPLIT_LEN = 4;
const OPTIONS_REG = new RegExp(/A\..*B\..*C\..*D\..*|A\s.*B\s.*C\s.*D\s.*/);

const 同步方式类型 = {无同步: '无同步', 引读: '引读', 导读: '导读'};

let imgInstructions: string[] = [];
const emphasizeWait = 2000;

export class BaseHandler extends HandlerTemplate {
    强调队列: ((wait?: number) => Promise<any>)[] = [];
    当前强调: ((wait?: number) => Promise<any>) | null = null;

    async 执行强调(强调: (wait?: number) => Promise<any>) {
        this.强调队列.push(强调);
        if (this.当前强调) return;

        this.当前强调 = this.强调队列.shift() || null;
        await new Promise(resolve => setTimeout(resolve, 500));

        while (this.当前强调) {
            // @ts-ignore
            // await this.当前强调(this.强调队列.length ? 0 : emphasizeWait);
            await this.当前强调(emphasizeWait);
            this.当前强调 = this.强调队列.shift() || null;
        }
    }

    subscribe(): void {
        pageEvent.on('toggleNavPoint', () => {
            this.强调队列 = [];
            this.当前强调 = null;
        });

        /**
         * 题目指令处理
         */
        this.onInstruction('显示题目', async (instruction, done) => {
            const {内容, 同步方式, 重点} = instruction.params;
            const node = this.pathMap.get(instruction.path);

            let contentText = 内容;
            if (!isImg(contentText)) {
                contentText += '<img style="display:none" />';
            }

            // 忽略重复显示题目指令
            if (node && node.content && (node.content as TextContent).text === contentText) {
                done.run();
            } else {
                // 移出原本结构
                if (node && node.parent) {
                    const index = node.parent.children.indexOf(node);
                    node.parent.children.splice(index, 1);
                    // @ts-ignore
                    node.parent = null;
                }

                const textNode = new TextContent(contentText, done, node as PGNode);
                node && (node.content = textNode);
                done.fast = true;
                textNode.isQuestion = true;

                setKeyPoints(重点, textNode);

                done.run();
                store.dispatch({type: InfoActions.setQuestionNode, payload: {...{node}}});
            }

            store.dispatch({type: InfoActions.setGuideRead, payload: 同步方式 === 同步方式类型.引读});

            if (同步方式 === 同步方式类型.引读 && node && store.getState().info.guideRead) {
                // @ts-ignore
                const textNode = node.content as TextContent;

                /**
                 * textSplit：题目内容分段
                 * audioParagraphs：语音内容分段
                 * count：分段计数
                 */
                let textSplit: string[] = [];
                let audioParagraphs: {text: string; startTime: number; duration: number}[] = [];
                let count = 0;

                aitAudio.event.once('时间轴', data => {
                    if (!data || !data.length) {
                        store.dispatch({type: InfoActions.setGuideRead, payload: false});
                        return;
                    }

                    audioParagraphs = data || [];
                    audioParagraphs.sort((a, b) => a.startTime - b.startTime);

                    const textContent = textNode.$el.textContent || '';
                    let content = textContent.split(OPTIONS_REG).shift() || '';
                    let splitContent = content;
                    // 选项内容文字
                    let optionText = textContent.substring(content.length);
                    let match;

                    while ((match = splitContent.match(SPLITTER_REG))) {
                        let position = (match.index as number) + match.toString().length;
                        textSplit.push(splitContent.slice(0, position));
                        splitContent = splitContent.slice(position);
                    }
                    splitContent && textSplit.push(splitContent);

                    /**
                     * 短文字拼接
                     */
                    let textSplitCache: string[] = [];
                    let prevText = '';

                    textSplit.reduce((content: string, text: string, index: number) => {
                        // prevText = textSplit[index - 1];
                        if (
                            (text.length < MIN_SPLIT_LEN ||
                                (prevText && prevText.length < MIN_SPLIT_LEN) ||
                                new RegExp(`^([-+0-9.])+${SPLITTER_TEXT}$`).test(text)) &&
                            /[,，]/.test(content.charAt(content.length - 1))
                        ) {
                            textSplitCache[textSplitCache.length - 1] += text;
                            prevText = textSplitCache[textSplitCache.length - 1];
                        } else {
                            textSplitCache.push(text);
                            prevText = text;
                        }

                        return text;
                    }, '');
                    textSplit = textSplitCache;

                    /**
                     * 文字比对
                     */
                    let diff = new diff_match_patch();
                    diff.Diff_EditCost = 3;
                    let audioText = data.map((item: any) => item.text).join('');

                    let diffs = diff.diff_main(content, audioText);
                    diff.diff_cleanupEfficiency(diffs);

                    const cacheTextSplit: typeof textSplit = [];
                    const cacheAudioParagraphs: typeof audioParagraphs = [];

                    const sameTexts = diffs.filter(([state]) => !state);
                    let ci = 0,
                        ai = 0;

                    for (let [, text] of sameTexts) {
                        let splits = text.split(SPLITTER_REG);

                        for (let segment of splits) {
                            if (!segment) continue;

                            let indexOfContent = indexOfContentSplit(segment);
                            let indexOfAudio = indexOfAudioSplit(segment);

                            if (indexOfContent - ci > 0 && indexOfAudio - ai > 0) {
                                mergeTextSplit(indexOfContent);
                                mergeAudioParagraph(indexOfAudio);

                                ci = ai = 0;
                            } else {
                                ci = indexOfContent;
                                ai = indexOfAudio;
                            }
                        }
                    }

                    function indexOfContentSplit(text: string) {
                        return textSplit.findIndex(item => item.includes(text));
                    }

                    function indexOfAudioSplit(text: string) {
                        return audioParagraphs.findIndex(item => item.text.includes(text));
                    }

                    function mergeTextSplit(size: number) {
                        cacheTextSplit.push(textSplit.splice(0, size).join(''));
                    }

                    function mergeAudioParagraph(size: number) {
                        let audioParagraph = audioParagraphs.splice(0, size).reduce(
                            (value, item) => {
                                return {
                                    text: value.text + item.text,
                                    startTime: value.startTime !== -1 ? value.startTime : item.startTime,
                                    duration: value.duration + item.duration
                                };
                            },
                            {text: '', startTime: -1, duration: 0}
                        );

                        cacheAudioParagraphs.push(audioParagraph);
                    }

                    if (audioParagraphs.length || textSplit.length) {
                        mergeTextSplit(textSplit.length);
                        mergeAudioParagraph(audioParagraphs.length);
                    }

                    textSplit = cacheTextSplit;
                    audioParagraphs = cacheAudioParagraphs;

                    // 如果有选项内容
                    if (optionText) {
                        const waitBeforeEnd = 2000;
                        const lastAudioParagraph = audioParagraphs[audioParagraphs.length - 1];
                        aitAudio.waitBeforeEnd = 2000;
                        textSplit.push(optionText);
                        audioParagraphs.push({
                            text: optionText,
                            duration: waitBeforeEnd,
                            startTime: lastAudioParagraph.startTime + lastAudioParagraph.duration
                        });
                    }

                    aitAudio.event.on('语音事件', audioHandler);
                });

                const chalk = new Chalk().delayTime(0);
                chalk.addUnitSelector('mjx-math');
                chalk.addUnitSelector('svg');

                /**
                 * 处理语音引读
                 */
                const audioHandler = (time: number, ended: boolean) => {
                    if (ended || !textNode.$el) aitAudio.event.off('语音事件', audioHandler);

                    if (!(audioParagraphs[0] && audioParagraphs[0].startTime < time)) return;

                    let paragraph = audioParagraphs.shift();
                    let start = 0;

                    for (let i = 0; i < count; i++) {
                        let text = textSplit[i];
                        text && (start += text.length);
                        !text && count--;
                    }
                    chalk
                        .chalk({
                            start: start,
                            end: start + (textSplit[count] || '').length,
                            container: textNode.$el
                        })
                        .then(([{id}, nodes]) => {
                            let container = document.getElementById('questionContent');
                            container && (container.scrollTop -= 1);
                            nodes[0] && goto(nodes[0] as HTMLElement, {container: '#questionContent', offset: 8});

                            const color1 = color(theme.palette.text.primary) as RGBColor;
                            color1.opacity = 1;
                            color1.brighter();

                            const highLight = color1.toString();

                            nodes.forEach(node => {
                                node.setAttribute('style', `transition: color 1000ms; color: ${highLight}`);
                            });

                            setTimeout(() => {
                                nodes.forEach(item => {
                                    (item as HTMLElement).style.color = '';
                                    (item as HTMLElement).style.background = '';
                                });

                                setTimeout(() => Chalk.remove(id as string), 1000);
                            }, Math.max((paragraph as any).duration, 0));
                        });

                    count++;
                };
            }
        });

        /**
         * 显示元信息指令处理
         */
        this.onInstruction('显示元信息', async (instruction, done) => {
            let {内容, 类型, 重点, 缩进, 序号, 关联} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            const node = this.pathMap.get(instruction.path);
            序号 && (内容 = `（${序号}）&nbsp;${内容}`);

            if (类型 === '知识点') {
                const kpContent = new TextContent(内容, done, node as PGNode);
                const kps = store.getState().info.kps || [];

                let index = kps.findIndex((item: TextContent) => item.node === node);
                node && (node.kp = true);

                if (~index) {
                    kps[index] = kpContent;
                } else if (!~kps.findIndex((content: TextContent) => content.text === 内容)) {
                    kps.push(kpContent);
                }

                done.run();

                this.updateKps(kps);
            } else if (['已知量', '易错点', '关键信息', '规律', '干扰信息'].includes(类型)) {
                if (!node) {
                    done.run();
                    return;
                }
                const parent = node.parent;

                if (parent.structType !== STRUCT_TYPE.Step) {
                    const textNode = new TextContent(类型, {run: () => {}, fast: true} as any, parent as PGNode);
                    parent.structType = STRUCT_TYPE.Step;
                    parent.content = textNode;
                }

                const textNode = new TextContent(内容, done, node as PGNode);
                // textNode.indent = 缩进 || 0;
                事件标识 && (textNode.eventName = 事件标识);
                node.content = textNode;
                setKeyPoints(重点, textNode);

                this.updateNode();
            }
        });

        /**
         * 显示步骤名称
         */
        this.onInstruction('显示步骤', async (instruction, done) => {
            let {内容, 序号, 重点} = instruction.params;
            const node = this.pathMap.get(instruction.path);
            const parent = node && node.parent;
            序号 && (内容 = `${序号}.&nbsp;${内容}`);

            if (!node) {
                done.run();
                return;
            }
            done.fast = true;

            const textNode = new TextContent(内容, done, node as PGNode);
            if (重点) {
                textNode.emphasis = 重点.map((item: any) => resolveEmphasize(item.开始));
            }

            parent && (parent.structType = STRUCT_TYPE.Step);
            parent && (parent.content = textNode);

            this.updateNode();
        });

        /**
         * 显示步骤内的内容
         */
        this.onInstruction('显示内容', async (instruction, done) => {
            const {内容, 重点, 说明, 说明位置, 关联, 竖式标识} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            let node = this.pathMap.get(instruction.path);

            if (!node) {
                done.run();
                return;
            }

            if (竖式标识) {
                if (this.shushiMap.get(竖式标识)) {
                    node = this.shushiMap.get(竖式标识);
                } else {
                    this.shushiMap.set(竖式标识, node);
                    this.updateShushiMap(this.shushiMap);
                }
            }

            if (isImg(内容)) {
                const _images: any[] = [];
                let str = 内容;
                const _el = document.createElement('div');
                let index = 0;
                _el.innerHTML = 内容;
                _el.querySelectorAll('img').forEach(img => {
                    _images.push(img.outerHTML);
                });

                while (str.indexOf('<img') !== -1) {
                    const start = str.indexOf('<img');
                    // const end = str.indexOf('png">');
                    // _images.push(str.substring(start, end + 5));
                    // str = `${str.substring(0, start)}替换图片${str.substring(end + 5)}`;
                    const end = start + _images[index].length;
                    str = `${str.substring(0, start)}替换图片${str.substring(end)}`;
                    index += 1;
                }
                //如果指令包含文本
                str = str !== '替换图片' ? str.replace(/替换图片/g, '<span id="handleImage" />') : '';

                const handleImageChange = async (imgString: string, callback?: Function) => {
                    const imgEls = document.querySelectorAll('#questionContent img');
                    let img: HTMLImageElement;
                    if (imgEls.length <= 1) {
                        img = imgEls[0] as HTMLImageElement;
                    } else {
                        !imgInstructions.includes(imgString) && imgInstructions.push(imgString);
                        const index = imgInstructions.indexOf(imgString);
                        img = imgEls[index] as HTMLImageElement;
                        for (let i = 0; i < index; i++) {
                            const _img = imgEls[i] as HTMLImageElement;
                            _img.classList.remove('light');
                        }
                    }

                    if (!img) {
                        done.run();
                        return;
                    }

                    if (!img.getAttribute('src')) {
                        //代表题目原来无图片
                        img.style.display = 'block';
                        // img.style.height = '20rem';
                        await new Promise(resolve => {
                            const el = document.createElement('div');
                            el.innerHTML = imgString;
                            const _img = el.querySelector('img') as HTMLImageElement;
                            const myImg = new Image();
                            myImg.src = _img.src;
                            myImg.onload = () => {
                                const landscapeMode = store.getState().info.landscapeMode;
                                const questionEl = document.getElementById('questionContent') as HTMLElement;
                                const proportion = questionEl.clientWidth / 750 / (landscapeMode ? 2 : 1);
                                const naturalHeight = myImg.naturalHeight;
                                img.style.height = `${naturalHeight * proportion + 10}px`;
                                resolve();
                            };
                        });
                        img.style.opacity = '0';
                    }

                    goto(img, {container: '#questionContent', isImg: true, landscape: store.getState().info.landscapeMode}).then(
                        async () => {
                            const el = document.createElement('div');
                            el.innerHTML = imgString;
                            const _img = el.querySelector('img') as HTMLImageElement;
                            const width = _img.getAttribute('width');
                            const height = _img.getAttribute('height');

                            if (width) {
                                img.setAttribute('myWidth', width);
                            } else if (height) {
                                img.setAttribute('myHeight', height);
                            } else {
                                const myImg = new Image();
                                myImg.src = _img.src;
                                myImg.onload = () => {
                                    const naturalWidth = myImg.naturalWidth;
                                    img.setAttribute('myWidth', naturalWidth.toString());
                                };
                            }

                            img.classList.remove('img-fade-in');
                            img.classList.add('img-fade-out');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            img.setAttribute('data-image-src', _img.src);
                            img.src = _img.src;
                            img.classList.remove('img-fade-out');
                            img.classList.add('img-fade-in', 'light');

                            if (imgEls.length > 1 || !str) done.run();
                            callback && callback();
                        }
                    );
                };

                if (!str) {
                    handleImageChange(内容);
                    return;
                } else {
                    pageEvent.addListener('handleImageChange', () => {
                        const _img = _images.shift();
                        handleImageChange(_img, () => {
                            if (!_images.length) {
                                pageEvent.removeAllListeners('handleImageChange');
                                pageEvent.emit('handleImageFinish');
                            }
                        });
                    });
                }

                const textNode = new TextContent(str, done, node as PGNode);
                textNode.eventName = 事件标识;
                node && (node.content = textNode);

                setKeyPoints(重点, textNode);

                this.updateNode();

                return;
            }

            if (isMathML(内容, 说明)) {
                const mathNode = new MathContent(内容, done, node as PGNode, 说明);
                mathNode.说明位置 = 说明位置;

                node && (node.content = mathNode);
                this.updateNode();
                return;
            }

            const textNode = new TextContent(内容, done, node as PGNode);
            textNode.eventName = 事件标识;
            node && (node.content = textNode);

            setKeyPoints(重点, textNode);

            if (store.getState().info.isLamp) {
                messageEvent.emit('message', 说明);
                await new Promise(resolve => setTimeout(resolve, 说明 ? 10 : 1000));
            }

            this.updateNode();
        });

        /**
         * 音频解说
         */
        this.onInstruction('解说', async (instruction, done) => {
            const {时间轴, 语音, 关联} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            if (done.fast) {
                done.run();
                return;
            }

            if (store.getState().info.isLamp) {
                lampAudio.setAudio(语音, done);
                return;
            }

            // @ts-ignore
            let audioText: {content: string; startTime: number; endTime: number; index: number; type: string}[] | any = undefined;

            try {
                audioText = 时间轴 ? await axios.get(时间轴, {baseURL: ''}).catch(_ => undefined) : undefined;
            } catch (e) {
                console.log(e);
            }

            const audioParagraphs = audioText && splitAudioText(audioText);

            if (store.getState().info.tencentMode) {
                pageEvent.emit('tencentAudio', {
                    params: instruction.params,
                    done
                });
            } else {
                aitAudio.setAudio(语音, done, 事件标识);
            }

            aitAudio.event.emit('时间轴', audioParagraphs);

            if (事件标识 && audioText && aitAudio.audio) {
                let textContent = '';

                audioText = audioText.map((item: any) => {
                    let content = item.content || '';
                    if (content.match(/<math/)) {
                        let el = document.createElement('span');
                        el.innerHTML = item.content;
                        content = el.textContent || '';
                    }
                    return {...item, content};
                });

                aitAudio.audio.ontimeupdate = () => {
                    // @ts-ignore
                    let currentTime = aitAudio.audio.currentTime * 1000;
                    aitAudio.event.emit('语音事件', currentTime);

                    while (audioText[0] && currentTime > audioText[0].startTime) {
                        let textNode = audioText.shift();
                        textNode && (textContent += textNode.content);
                    }

                    aitAudio.event.emit(事件标识, textContent);
                };

                // // 语音关联强调等待
                // const handlePrinter = (pause: boolean) => {
                //     const fn = pause ? aitAudio.pause : aitAudio.play;
                //
                //     fn.bind(aitAudio)();
                // };
                //
                // const removeListener = () => {
                //     aitAudio.event.removeListener('ended', handleEnded);
                //     aitAudio.event.removeListener('error', handleError);
                //     pageEvent.removeListener('printer', handlePrinter);
                // };
                //
                // const handleEnded = () => {
                //     removeListener();
                // };
                //
                // const handleError = () => {
                //     removeListener();
                // };
                //
                // pageEvent.addListener('printer', handlePrinter);
                //
                // aitAudio.audio.addEventListener('ended', handleEnded);
                // aitAudio.audio.addEventListener('error', handleError);
            }
        });

        /**
         * 强调划线
         */
        this.onInstruction('强调', async (instruction, done) => {
            const {开始, 关联} = instruction.params;
            let {事件标识, 位置} = 关联 || {事件标识: null, 位置: null};
            事件标识 && (事件标识 += '');

            const node = this.pathMap.get(instruction.path);

            // 关联，被强调划线的节点元素
            const relatePath = 开始.区域 || '';
            const relateNode = this.pathMap.get(relatePath);
            const relateElement = relateNode && relateNode.$el;
            const relateText = 位置 || '';
            const relateLocation = resolveEmphasize(relateText);

            // 被强调划线的节点元素中被划线的内容
            const emphasizeText = 开始.定位;
            const emphasizeInfo = resolveEmphasize(emphasizeText);

            if (!relateElement || !emphasizeInfo.textOrder) {
                done.run();
                return;
            }

            const doEmphasize = async (wait: number = 0) => {
                let isQuestionContent = false;
                let parent = relateElement;
                while (parent) {
                    if (parent.id === 'questionContent') {
                        parent = null as any;
                        isQuestionContent = true;
                    } else {
                        parent = parent.parentNode as HTMLElement;
                    }
                }
                let contentId = isQuestionContent ? '#questionContent' : '#tutorBoardContent';
                if (contentId !== '#questionContent')
                    (await store.getState().info.tencentMode)
                        ? gotoOld(relateElement, {container: contentId, offset: 10})
                        : goto(relateElement, {container: contentId, offset: 10});

                const twinkleElement = async (elements: any[]) => {
                    if (!elements || !elements.length) return;
                    if (contentId === '#questionContent') await goto(elements[0] as HTMLElement, {container: contentId, offset: 10});

                    await twinkle(elements);
                    setTimeout(() => {
                        for (let el of elements) el.classList.remove('active');
                    }, Math.max(emphasizeWait - 500, 0));

                    await new Promise(resolve => setTimeout(resolve, wait));
                };

                if (node && node.chalkedId) {
                    const elements = [...Chalk.getElementById(node.chalkedId)];
                    for (let el of elements) el.classList.add('active');

                    if (elements && elements.length) {
                        await twinkleElement(elements);
                        done.run();
                        if (!this.强调队列.length) pageEvent.emit('printer', false);
                        return;
                    }
                }

                await new Chalk()
                    .chalk({
                        container: relateElement,
                        start: 0,
                        end: 0,
                        // css: 'color: #2196f3; font-weight: bold;',
                        className: ['highlight-color', 'active'],
                        textOrder: emphasizeInfo.textOrder,
                        text: emphasizeInfo.text,
                        element: emphasizeInfo.isMath ? 'mjx-container' : undefined,
                        elementOrder: emphasizeInfo.isMath ? emphasizeInfo.textOrder : undefined
                    })
                    .then(async ([{id}, elements]) => {
                        node && (node.chalkedId = id);

                        await twinkleElement(elements);
                    })
                    .catch(() => done.run())
                    .finally(async () => {
                        done.run();
                        if (!this.强调队列.length) pageEvent.emit('printer', false);
                    });
            };

            const handleEmphasize = async (textContent: string | number, finished: boolean) => {
                if (textContent === null) return;

                if (typeof textContent === 'string' && !finished) {
                    let {start} = Chalk.text2Index(textContent, relateLocation.text, relateLocation.textOrder);

                    if (!~start) return;
                }

                pageEvent.emit('printer', true);
                事件标识 && aitAudio.event.off(事件标识, handleEmphasize);
                this.执行强调((wait?: number) => doEmphasize(wait));
            };

            if (relateElement && 事件标识 && !done.fast) {
                aitAudio.event.on(事件标识, handleEmphasize);
            } else if (relateElement) {
                setTimeout(() => handleEmphasize('', true), 500);
            } else {
                done.run();
            }
        });
    }
}

function isMathML(content: string, hasExplain?: string) {
    const mathStart = /^<math(.|\n|\r)*<\/math>$/.test(content);
    const hasAnimation = /ani-/.test(content);

    return mathStart && (hasAnimation || !!hasExplain);
}

function isImg(content: string) {
    return /<img /.test(content);
}

/**
 * 解析强调信息
 */
function resolveEmphasize(params: string) {
    let count = (params.match(/.*\((\d*)\)/) || [])[1];
    let text = (params.match(/(.*)(?:\(\d*\))/) || [])[1];
    let isMath = /^<math/.test(text || '');

    if (!isMath) {
        let el = document.createElement('span');
        el.innerHTML = text;

        try {
            let mathList = (el as HTMLElement).querySelectorAll('math');
            for (let math of mathList) {
                let mml = math.outerHTML;
                math.parentNode && math.parentNode.replaceChild(MathJax.mathml2chtml(mml), math);
            }
        } catch (e) {
            console.log(e);
        }
        text = el.textContent || '';
    }

    return {text: text, textOrder: (count && parseInt(count)) || 1, isMath};
}

/**
 * 元素闪烁
 */
async function twinkle(elements: (HTMLElement | Element)[]) {
    return new Promise(resolve => {
        for (let element of elements) {
            element.classList.add('animate__flash');
            element.classList.add('animate__animated');
            element.classList.add('animate__fast');

            element.addEventListener('animationend', function fn() {
                let classList = element && element.classList;
                if (classList) {
                    classList.remove('animate__animated');
                    classList.remove('animate__flash');
                    classList.remove('animate__fast');
                }
                element.removeEventListener('animationend', fn);
                resolve();
            });
        }

        setTimeout(() => resolve(), 2000);
    });
}

/**
 * 设置重点
 */
function setKeyPoints(keyPoints: [], textContent: TextContent) {
    if (!keyPoints || !Array.isArray(keyPoints)) return;
    textContent.emphasis = keyPoints.map((item: any) => resolveEmphasize(item.开始));
}

/**
 * 语音内容分段
 */
function splitAudioText(_data: {content: string; startTime: number; endTime: number; index: number}[]) {
    if (!Array.isArray(_data)) return undefined;
    let sections: {startTime: number; duration: number; text: string}[] = [];

    const result = _data.reduce(
        (
            data: {text: string; time: number; end: number},
            item: {content: string; startTime: number; endTime: number; index: number},
            index: number
        ) => {
            if (!SPLITTER_REG.test(item.content)) {
                return {text: data.text + item.content, time: data.time, end: item.endTime};
            }
            let rest = splitToSection(item, sections, data);

            return {text: rest.content, time: rest.startTime, end: rest.endTime};
        },
        {text: '', time: 0, end: 0}
    );

    if (result.text) {
        sections.push({text: result.text, startTime: result.time, duration: result.end - result.time});
    }

    /**
     * 括号内文本合并
     */
    let textSplit = [];
    let content = sections.map(item => item.text).join('');
    let match;
    let sectionsCache: typeof sections = [];

    while ((match = content.match(SPLITTER_REG))) {
        let position = (match.index as number) + match.toString().length;
        textSplit.push(content.slice(0, position));
        content = content.slice(position);
    }
    content && textSplit.push(content);

    for (let text of textSplit) {
        let newSection = {startTime: undefined, duration: 0, text: ''};
        while (sections[0] && text.includes(sections[0].text)) {
            let section = sections.shift() as {startTime: number; duration: number; text: string};
            newSection.text += section.text;
            // @ts-ignore
            newSection.startTime = newSection.startTime !== undefined ? newSection.startTime : section.startTime;
            newSection.duration += section.duration;
        }
        // @ts-ignore
        newSection.text && sectionsCache.push(newSection);
    }

    return sectionsCache;
}

/**
 * 语音文本中出现没有拆分的内容段落处理
 */
function splitToSection(
    item: {content: string; startTime: number; endTime: number},
    sections: {startTime: number; duration: number; text: string}[],
    data: {text: string; time: number; end: number}
): {content: string; startTime: number; endTime: number} {
    let match = item.content.match(SPLITTER_REG);
    let text = '';
    let rest = '';
    let endTime = item.endTime;

    if (match) {
        let position = (match.index as number) + match.toString().length;
        text = item.content.slice(0, position);
        rest = item.content.slice(position);

        endTime = ((item.endTime - item.startTime) / item.content.length) * text.length + item.startTime;
        sections.push({startTime: data.time, duration: endTime - data.time, text: data.text + text});

        data.text = '';
        data.time = endTime;
        data.end = endTime;
    } else {
        return item;
    }

    return splitToSection({content: rest, startTime: data.time, endTime: item.endTime}, sections, data);
}
