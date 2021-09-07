import React, {useEffect, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import {color, RGBColor} from 'd3-color';
import SVGA from 'svgaplayerweb';

const useStyles = makeStyles((theme: Theme) => {
    const gradient = color(theme.palette.background.default) as RGBColor;
    gradient.opacity = 0.65;
    const gradient1 = gradient.toString();
    gradient.opacity = 0;
    const gradient2 = gradient.toString();

    return createStyles({
        root: {
            position: 'fixed',
            bottom: 0,
            height: 75,
            width: '100%',
            padding: '0 30px',
            background: `linear-gradient(0, ${theme.palette.background.default} 0%, ${gradient1} 53%, ${gradient2} 100%);`
        },
        actionBtn: {}
    });
});

export default (props: any) => {
    const classes = useStyles();
    const [visible, setVisible] = useState(false);

    /**
     * 绑定元素事件
     */
    useEffect(() => {
        if (!props.swipeTarget) return;

        let startY = 0;

        const handleTouchstart = (ev: TouchEvent) => {
            const touchData = ev.targetTouches[0];
            startY = touchData.clientY;
        };
        const handleTouchmove = (ev: TouchEvent) => {
            const touchData = ev.targetTouches[0];
            const y = touchData.clientY;

            setVisible(y > startY);
        };

        const el = props.swipeTarget;

        el.addEventListener('touchstart', handleTouchstart);
        el.addEventListener('touchmove', handleTouchmove);

        return () => {
            el.removeEventListener('touchstart', handleTouchstart);
            el.removeEventListener('touchmove', handleTouchmove);
        };
    }, [props.swipeTarget]);

    /**
     * 结束时显示底部
     */
    useEffect(() => {
        if (props.available) setVisible(true);
    }, [props.available]);

    return (
        <Slide in={visible && props.available} direction={'up'}>
            <div className={`${classes.root} d-flex align-center`}>
                <div className="flex-grow-1" />
                <div className="d-flex flex-shrink-0">hello</div>
            </div>
        </Slide>
    );
};
