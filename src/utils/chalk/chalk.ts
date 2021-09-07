import {ChalkInfo} from './typing';
import {CHALK_ATTR_NAME} from './const';
import {generateUUID, eachBefore, mergeAdjacentTextNode, restoreToNode, wrapTagToNode, text2Index} from './utils';

export default class Chalk {
    /**
     * 移除指定已应用的粉笔操作
     * @Param id 操作过的粉笔动作返回的id
     */
    static remove(id: string) {
        const selection = document.querySelectorAll(`[${CHALK_ATTR_NAME}]`);
        let dataId, node;

        // @ts-ignore
        for (node of selection) {
            dataId = node.getAttribute(CHALK_ATTR_NAME);
            if (dataId && dataId.includes(id)) restoreToNode(node);
        }
    }

    /**
     * 获取对应id圈划元素
     */
    static getElementById(id: string): NodeListOf<Element> {
        const selection = document.querySelectorAll(`[${CHALK_ATTR_NAME}="${id}"]`);
        return selection || [];
    }

    /**
     * 返回鼠标选中内容的圈划信息
     */
    static getSelectionInfo(wrapElement: string | Element | null) {
        if (typeof wrapElement === 'string') {
            wrapElement = document.querySelector(wrapElement);
        }
        if (!wrapElement) throw Error('找不到指定容器节点');
    }

    /**
     * 将文字及需要转换为位置索引
     * @Param container 包含目标文字的元素
     * @Param text 目标文字
     * @Param textOrder 目标文字次序
     */
    static text2Index(textContent: string, text: string, textOrder: number) {
        let index = textContent.indexOf(text);

        for (let i = 1; i < textOrder; i++) {
            index = textContent.indexOf(text, index + 1);
        }

        return {start: index, end: index + text.length};
    }

    private unitSelectors: Set<string> = new Set(['mjx-container']);
    private expectedSelectors: Set<string> = new Set(['script', 'style']);
    private delay: number = 50;
    private traversal = eachBefore();

    private unitElements: Set<Element> = new Set();
    private expectedElements: Set<Element> = new Set();

    addUnitSelector(selector: string) {
        this.unitSelectors.add(selector);
    }

    /**
     * 应用圈划信息
     * @Param chalkInfo 需要圈划的内容信息
     */
    async chalk(chalkInfo: ChalkInfo, callback?: ((index: number) => void) | null, duration?: number): Promise<[ChalkInfo, Element[]]> {
        if (!chalkInfo.id) chalkInfo.id = generateUUID();
        let {start, end, container, text, textOrder} = chalkInfo;
        const wrapTags: Element[] = [];
        let selectedNodes: Node[] = [];
        let pickedStartNode: boolean | undefined, pickedEndNode: boolean | undefined, withinRange: boolean | undefined;
        let count: number = 0;

        if (chalkInfo.element && chalkInfo.elementOrder) return this.chalkElement(chalkInfo);

        if (text && textOrder) {
            ({start, end} = Chalk.text2Index(container.textContent || '', text, textOrder));
            if (start === -1) {
                console.error('没有找到对应文字', container, text, textOrder);
                return Promise.resolve([null as any, null as any]);
            }
        }

        this.unitElements.clear();
        Array.from(this.unitSelectors).forEach(selector => {
            container.querySelectorAll(selector).forEach(node => this.unitElements.add(node));
        });

        this.expectedElements.clear();
        Array.from(this.expectedSelectors).forEach(selector => {
            container.querySelectorAll(selector).forEach(node => this.expectedElements.add(node));
        });

        /**
         * 当遍历到的节点文本索引到达目标终点时结束节点遍历
         */
        this.traversal.break(() => !!pickedEndNode);

        /**
         * 当遍历到的排除元素时候跳过
         */
        this.traversal.skip(node => Array.from(this.expectedElements).some(expectedNode => node === expectedNode));
        this.traversal.skipChildren(node => Array.from(this.unitElements).some(unitNode => node === unitNode));

        /**
         * 获取目标节点集合
         */
        this.traversal(container, node => {
            /**
             * 视为一个整体单元的元素处理
             */
            if (start === 0 && count === 0) withinRange = true;
            const isUnitNode = Array.from(this.unitElements).some(unitNode => node === unitNode);
            if (isUnitNode) count += (node.textContent || '').length;

            if (withinRange && isUnitNode) {
                selectedNodes.push(node);
                return null;
            }
            if (!pickedStartNode && isUnitNode && count > start && count - start < (node.textContent || '').length) {
                selectedNodes.push(node);
                if (count > start) pickedStartNode = true;
                return null;
            }

            /**
             * 对于不是文本的节点不进行处理
             */
            if (!(node instanceof Text)) return null;

            /**
             * 起点、终点 在同一文本节点，直接截断当前文本节点，
             * 获取指定位置内容节点后退出遍历
             */
            count += node.length;
            if (count >= start && count >= end && !pickedStartNode && !pickedEndNode) {
                pickedStartNode = true;
                pickedEndNode = true;

                const targetText = node.splitText(start - (count - node.length));
                targetText.splitText(end - start);

                selectedNodes.push(targetText);
            }

            /**
             * 起点、终点 不在同一文本节点，截断起点节点和
             * 终点节点，获取中间所有的文本节点
             */
            if (count >= start && !pickedStartNode) {
                pickedStartNode = true;
                withinRange = true;
                if (node.length >= 1) {
                    selectedNodes.push(node.splitText(start - (count - node.length)));
                } else {
                    selectedNodes.push(node);
                }
            } else if (count >= end && !pickedEndNode) {
                pickedEndNode = true;
                withinRange = false;

                const nodeLength = node.length;
                if (count - end !== 0 && count - end <= nodeLength) {
                    node.splitText(end - (count - nodeLength));
                }
                count - end <= nodeLength && selectedNodes.push(node);
            } else if (withinRange) {
                (node.textContent || '').trim() && selectedNodes.push(node);
            }
        });

        selectedNodes = mergeAdjacentTextNode(selectedNodes);

        const delay = duration ? duration / (end - start) : this.delay;
        count = start;

        for (const node of selectedNodes) {
            const nodeLength = node.nodeType !== Node.TEXT_NODE ? 0 : (node.textContent || '').length;
            if (node instanceof Text && !node.textContent) continue;
            await this.wrapNode(node, wrapTags, chalkInfo, count, delay, callback);
            count += nodeLength;
        }

        return Promise.resolve([chalkInfo, wrapTags]);
    }

    private async chalkElement(chalkInfo: ChalkInfo): Promise<[ChalkInfo, Element[]]> {
        let {element, elementOrder, container} = chalkInfo;
        let targets = container.querySelectorAll(element as string);
        let target = targets[(elementOrder as number) - 1];

        let wrapTags: Element[] = [];
        await this.wrapNode(target, wrapTags, chalkInfo, 0, 0, null);

        return Promise.resolve([chalkInfo, wrapTags]);
    }

    /**
     * 对节点的文本内容逐个应用样式
     */
    private wrapNode(
        node: Node,
        wrapTags: Element[],
        chalkInfo: ChalkInfo,
        count: number,
        delay: number,
        callback?: null | ((index: number) => void)
    ) {
        let charNode: any, charsNode;
        const {id, className, css} = chalkInfo as any;

        return new Promise(async resolve => {
            if (node.nodeType !== Node.TEXT_NODE) {
                wrapTags.push(wrapTagToNode(node, id, className, css));
                resolve();
                return;
            }

            while (true) {
                !!delay && (await new Promise(r => setTimeout(r, delay)));

                if (!charNode && (node as Text).length > 0) {
                    charsNode = (node as Text).splitText(1);
                    const wrapTag = wrapTagToNode(node, id, className, css);
                    wrapTags.push(wrapTag);
                    charNode = wrapTag.childNodes[0];
                    node = charsNode;

                    callback && callback(count++);
                } else if (node instanceof Text && node.length) {
                    charsNode = (node as Text).splitText(1);
                    charNode.textContent += node.textContent;
                    node.parentNode && node.parentNode.removeChild(node);
                    node = charsNode;

                    callback && callback(count++);
                }

                if (node instanceof Text && node.length === 0) {
                    resolve();
                    charNode = null;
                    break;
                }
            }
        });
    }

    /**
     * 设置延时参数
     * @Param delay 单个字符应用chalk后应用下一个字符的延时
     */
    delayTime(delay: number): this {
        this.delay = delay;
        return this;
    }
}
