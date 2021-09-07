import React, {useEffect, useMemo, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {connectInfoStore, InfoActions} from '@/store/info';
import {useLocation} from 'react-router';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import {Transition} from 'react-transition-group';
import pageEvent from '@/utils/event';
import store from '@/store';

const duration = 300;
const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
    opacity: 0,
    transform: 'translate(0, 0)'
};

const titleTransitionStyle = {
    entering: {opacity: 1, transform: 'translate(0, 0%)'},
    entered: {opacity: 1, transform: 'translate(0, 0%)'},
    exiting: {opacity: 0, transform: 'translate(0, -100%)'},
    exited: {opacity: 0, transform: 'translate(0, -100%)'}
} as any;

const miniTitleTransitionStyle = {
    entering: {opacity: 1, transform: 'translate(0, 0)'},
    entered: {opacity: 1, transform: 'translate(0, 0)'},
    exiting: {opacity: 0, transform: 'translate(0, 100%)'},
    exited: {opacity: 0, transform: 'translate(0, 100%)'}
} as any;

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            position: 'relative',
            height: 45,
            color: theme.palette.text.primary,
            padding: '0 15px',
            transition: 'height 300ms, color 300ms'
        },
        mini: {
            height: 20,
            fontWeight: 500,
            fontSize: 14
        },
        navIcon: {
            fontSize: 18,
            padding: 4,
            marginLeft: -4,
            marginRight: 4
        },
        title: {
            fontSize: 24,
            color: '#51A0FF',
            fontWeight: 'bold'
        },
        codeBtn: {
            width: 60,
            height: 30,
            lineHeight: '30px',
            backgroundColor: '#0188FB',
            color: '#ffffff',
            borderRadius: 6,
            textAlign: 'center',
            position: 'absolute',
            right: 15
        }
    });
});

const TYPE_NAME = {
    explain: '智能讲解',
    tip: '智能提示'
};

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const HeaderBar = (props: {swipeTarget: HTMLElement} & any) => {
    const classes = useStyles();
    const [mini, setMini] = useState(false);
    const [first, setFirst] = useState(false);
    const query = useQuery();
    const stateBarH = useMemo(() => query.get('stateBarH') || 0, [query]);
    const pgType = useMemo(() => props.info.pgType, [props.info.pgType]) as 'explain' | 'tip';

    const codeBtnVisible = useMemo(() => {
        return props.info.tvMode && !props.info.landscapeMode && !props.info.netError;
    }, [props.info.tvMode, props.info.landscapeMode, props.info.netError]);

    // /**
    //  * 绑定元素事件
    //  */
    // useEffect(() => {
    //     if (!props.swipeTarget) return;
    //
    //     let startY = 0;
    //
    //     const handleTouchstart = (ev: TouchEvent) => {
    //         const touchData = ev.targetTouches[0];
    //         startY = touchData.clientY;
    //     };
    //     const handleTouchmove = (ev: TouchEvent) => {
    //         if (!props.info.paused) return;
    //         const touchData = ev.targetTouches[0];
    //         const y = touchData.clientY;
    //
    //         setMini(y < startY);
    //     };
    //
    //     const el = props.swipeTarget;
    //
    //     el.addEventListener('touchstart', handleTouchstart);
    //     el.addEventListener('touchmove', handleTouchmove);
    //
    //     return () => {
    //         el.removeEventListener('touchstart', handleTouchstart);
    //         el.removeEventListener('touchmove', handleTouchmove);
    //     };
    // }, [props.swipeTarget, props.info.paused]);
    //
    // /**
    //  * 监听播放结束
    //  */
    // useEffect(() => {
    //     if (props.info.ended) setMini(false);
    // }, [props.info.ended]);
    //
    // useEffect(() => {
    //     if (!props.info.paused) {
    //         if (!first) {
    //             setFirst(true);
    //             return;
    //         }
    //         setMini(true);
    //     }
    // }, [props.info.paused]);

    return (
        <div style={{position: 'relative'}} className="flex-shrink-0">
            <div style={{height: stateBarH + 'px'}} className="d-flex align-center" />

            <div className={`${classes.root} ${mini && classes.mini} d-flex align-center`} style={{zIndex: 9}}>
                <Transition in={!mini} timeout={duration}>
                    {state => (
                        <div
                            style={{
                                ...defaultStyle,
                                ...titleTransitionStyle[state]
                            }}>
                            <div className={`d-flex align-center`}>
                                <div
                                    className={`${classes.navIcon} d-flex align-center scale-btn`}
                                    onClick={() => back(props.hasPgs, props.showPgsChoose)}>
                                    <ArrowBackIosRoundedIcon style={{fontSize: 'inherit'}} />
                                </div>

                                <div className={`${classes.title} ios-title`}>{TYPE_NAME[pgType]}</div>
                            </div>
                        </div>
                    )}
                </Transition>

                <Transition in={mini} timeout={duration}>
                    {state => (
                        <div
                            style={{
                                ...defaultStyle,
                                ...miniTitleTransitionStyle[state],
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: '100%',
                                lineHeight: 1.5
                            }}
                            className="d-flex justify-center">
                            <div>{TYPE_NAME[pgType]}</div>
                        </div>
                    )}
                </Transition>

                {codeBtnVisible && (
                    <div className={`${classes.codeBtn}`} onClick={() => openScanner()}>
                        投屏
                    </div>
                )}
            </div>
        </div>
    );
};

function back(hasPgs: boolean, fn: Function) {
    store.dispatch({type: InfoActions.setNetError, payload: false});

    if (hasPgs) {
        fn();
        pageEvent.emit('pause');
        return;
    }
    try {
        if (navigator.userAgent.includes('dm-ait-flutter')) {
            const json = '{"action":"back"}';
            // @ts-ignore
            window.DM.postMessage(json);
        } else {
            // @ts-ignore
            window.dm.exit();
        }
    } catch (e) {
        console.error(e.message);
    }
}

function openScanner() {
    //@ts-ignore
    window.dm && window.dm.screenProjection();
}

export default connectInfoStore<any>(HeaderBar) as React.FunctionComponent<{
    swipeTarget: HTMLElement | null;
    hasPgs?: boolean;
    showPgsChoose?: any;
}>;
