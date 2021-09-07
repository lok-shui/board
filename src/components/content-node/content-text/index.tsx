import React, {useEffect, useRef, useState} from 'react';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {TextPrinter, goto, showMathMl, gotoOld} from '@/utils';
import classNames from 'classnames';
import Collapse from '@material-ui/core/Collapse';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Chalk from '@/utils/chalk';
import aitAudio from '@/views/tutor-board/ait-audio';
import pageEvent from '@/utils/event';

import store from '@/store';
// import {messageEvent} from '@/views/lamp/message.event';

const chalk = new Chalk().delayTime(0);

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& ul': {
                listStyleType: 'none',
                margin: '0',
                '& li': {
                    margin: '0.25rem 0'
                }
            }
        },
        cursor: {
            color: theme.palette.text.primary
        }
    })
);

declare var MathJax: any;

let fontSize = getComputedStyle(document.documentElement).fontSize as any;
fontSize = parseInt(fontSize || '15');

export default (props: {data: TextContent}) => {
    const classes = useStyles();
    const $el = useRef(null);
    const $container = useRef(null);
    const $cursor = useRef(null);
    const [visible, setVisible] = useState(false);
    const [collapse, setCollapse] = useState(props.data.isQuestion);
    const [finished, setFinished] = useState(true);

    useEffect(() => {
        if (visible) handleTextChanged();
    }, [props.data.text]);

    useEffect(() => {
        if (!props.data) return;

        (async () => {
            if (visible) {
                moveToCurrent();
                !props.data.done.fast && (await printText((($el.current as unknown) as HTMLElement).cloneNode(true) as HTMLElement));
                await new Promise(resolve => setTimeout(resolve, 200));
                props.data.done.run();
                return;
            }

            handleTextChanged();
            await handleEmphasis();
            await new Promise(resolve => setTimeout(resolve, 200));

            props.data.isQuestion ? setVisible(true) : setCollapse(true);
            setFinished(false);

            !props.data.done.fast && (await printText());
            setFinished(true);
            props.data.done.run();
        })();
    }, [props.data]);

    /**
     * 绑定节点内容元素
     */
    useEffect(() => {
        props.data.$el = ($el.current as unknown) as HTMLElement;
    }, [props.data]);

    /**
     * 处理内容变更
     */
    function handleTextChanged() {
        showMathMl($el.current);

        resizeImg();
    }

    /**
     * 移动到当前显示文字
     */
    function moveToCurrent() {
        if (props.data.done.fast) return;
        const target = ($container.current as unknown) as HTMLElement;
        if (!target) return;

        const option = {
            container: store.getState().info.globalScroll ? '#container' : '#tutorBoardContent',
            offset: 0
        };
        target.parentElement && goto(target.parentElement as HTMLElement, option);
    }

    /**
     * 逐文本显示
     */
    async function printText(targetElement?: HTMLElement) {
        const target = targetElement || (($el.current as unknown) as HTMLElement);
        const container = (target.parentElement as HTMLElement) || target;
        const cursorKeep = 800;
        container.style.minHeight = container.getBoundingClientRect().height + 'px';

        let callback = props.data.eventName
            ? (char: string, index: number, end?: boolean) => {
                  aitAudio.event.emit(props.data.eventName, target.textContent, end);
              }
            : null;

        const printer = new TextPrinter().in(target);
        await new Promise(resolve => setTimeout(resolve, cursorKeep));

        const handlePrinter = async (pause: boolean) => {
            !pause && (await moveToCurrent());
            printer.pause(pause);
        };
        pageEvent.addListener('printer', handlePrinter);
        await printer.out(callback);
        container.style.minHeight = '';

        pageEvent.removeListener('printer', handlePrinter);

        return new Promise(resolve => setTimeout(resolve, cursorKeep));
    }

    /**
     * 调整图片尺寸
     */
    function resizeImg() {
        // @ts-ignore
        let images = $el.current.querySelectorAll('img');

        const landscapeMode = store.getState().info.landscapeMode;
        const questionEl = document.getElementById('questionContent') as HTMLElement;
        const proportion = questionEl.clientWidth / 750 / (landscapeMode ? 2 : 1);

        for (let img of images) {
            img.onload = () => {
                img.style.height = '';
                img.style.opacity = '';
                const width = img.getAttribute('width') || img.getAttribute('myWidth');
                const height = img.getAttribute('height') || img.getAttribute('myHeight');
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                if (width) {
                    const _width = +width * proportion;
                    img.style.width = `${_width}px`;
                    if (img.getAttribute('width')) {
                        img.setAttribute('myWidth', width);
                        img.removeAttribute('width');
                    }
                } else if (height) {
                    const _width = +height * (naturalWidth / naturalHeight) * proportion;
                    img.style.width = `${_width}px`;
                    if (img.getAttribute('height')) {
                        img.setAttribute('myHeight', height);
                        img.removeAttribute('height');
                    }
                } else {
                    img.style.width = `${naturalWidth * proportion}px`;
                }

                img.style.display = 'block';
                img.classList.add('dark');
                img.style.maxHeight = 360 / fontSize + 'rem';
            };
        }

        // for (let img of images) {
        //     img.onload = () => {
        //         img.style.maxWidth = '100%';
        //     };
        // }
    }

    /**
     * 显示强调划线
     */
    async function handleEmphasis() {
        const textTarget = ($container.current as unknown) as HTMLElement;
        if (!textTarget) return;

        for (let {text, textOrder} of props.data.emphasis) {
            await chalk.chalk({
                container: textTarget,
                start: 0,
                end: 0,
                className: ['highlight-color', 'no-transition'],
                text,
                textOrder
            });
        }
    }

    return (
        <div
            ref={$container}
            className={`content-text ${classes.root}`}
            style={{visibility: visible ? undefined : 'hidden', textIndent: props.data.indent + 'em'}}>
            <Collapse
                in={collapse}
                onEntered={() => {
                    setVisible(true);
                    moveToCurrent();
                }}>
                <span className={``} ref={$el} dangerouslySetInnerHTML={{__html: props.data.text}} />
                <span
                    ref={$cursor}
                    className={classNames('animate__flash', 'animate__animated', 'animate__infinite', 'animate__slow', classes.cursor)}
                    style={{display: !finished ? undefined : 'none'}}>
                    |
                </span>
            </Collapse>
        </div>
    );
};
