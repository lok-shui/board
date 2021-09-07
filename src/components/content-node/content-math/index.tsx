import React, {useEffect, useRef, useState} from 'react';
import {MathContent} from '@/views/tutor-board/@instruction/content';
import MathML from 'mathml-animation';
import {goto, gotoOld} from '@/utils';
import store from '@/store';
import {messageEvent} from '@/views/lamp/message.event';

import {noBreak} from 'ait-mathml-utils';

const MathmlAnimation = MathML.MathmlAnimationNative;

export default (props: {data: MathContent}) => {
    const $el = useRef(null);
    const [mathMLAni, setMathMLAni] = useState(null);

    useEffect(() => {
        const mathMLAni = new MathmlAnimation($el.current, {说明位置: props.data.说明位置});
        setMathMLAni(mathMLAni);
    }, []);

    useEffect(() => {
        if (!props.data || !mathMLAni) return;
        const info = store.getState().info;

        (async () => {
            moveToCurrent();

            if (info.isLamp) {
                messageEvent.emit('message', props.data.explain);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const text = noBreak.addNoBreak(props.data.text);

            if (props.data.说明位置 === '左') {
                !info.isLamp && (await (mathMLAni as any).说明下一步(props.data.explain));
                await (mathMLAni as any).演示(text, {速率: props.data.done.fast ? 0 : 1});
            } else {
                await (mathMLAni as any).演示(text, {速率: props.data.done.fast ? 0 : 1});
                !info.isLamp && (await (mathMLAni as any).说明下一步(props.data.explain));
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            if (info.isLamp) {
                messageEvent.emit('math-end', props.data.done);
                return;
            }
            props.data.done.run();
        })();
    }, [props.data, mathMLAni]);

    /**
     * 移动到当前显示文字
     */
    function moveToCurrent() {
        if (props.data.done.fast) return;
        const target = ($el.current as unknown) as HTMLElement;
        if (!target) return;
        const info = store.getState().info;

        const option = {
            container: info.globalScroll ? '#container' : '#tutorBoardContent',
            offset: 0
        };
        target.parentElement && info.isLamp
            ? gotoOld(target.parentElement as HTMLElement, option)
            : goto(target.parentElement as HTMLElement, option);
    }

    return <div ref={$el} className={``}></div>;
};
