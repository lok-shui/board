import React, {useEffect, useMemo, useRef, useState} from 'react';
import {connector} from './@instruction';
import store from '@/store';
import {connectInfoStore, InfoActions} from '@/store/info';
import {StructureNode, StructureQuestion, ContentKp} from '@/components';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {useLocation} from 'react-router-dom';
import AudioSwitch from './ait-audio-switch';
import ProgressBar from './ait-progress-bar';
// import BottomBar from './ait-bottom-bar';
import HeaderBar from './ait-header-bar';
import Fade from '@material-ui/core/Fade';

import BottomPanel from '@/components/bottom-panel';
import LoadingPanel from '@/components/loading-panel';
import AitError from './ait-error';

import {color, RGBColor} from 'd3-color';
import {setAuth} from '@/api/axios';
import {PGNode} from '@/types/instruction';
import aitAudio from '@/views/tutor-board/ait-audio';
import SVGA from 'svgaplayerweb';
import {effectSound} from '@/utils';
import pageEvent from '@/utils/event';
import HilcChoose from './hilc-choose';

import {RealTimeUpdate} from './@instruction/real-time-update';
import {tutor} from '@/api';

const useStyles = makeStyles((theme: Theme) => {
    const gradient = color(theme.palette.background.default) as RGBColor;
    gradient.opacity = 0.65;
    const gradient1 = gradient.toString();
    gradient.opacity = 0;
    const gradient2 = gradient.toString();

    const backgroundUrl = theme.palette.type === 'dark' ? '/images/background.jpg' : '/images/background_white.jpg';

    return createStyles({
        root: {
            height: `100vh`,
            width: '100vw',
            // overflow: 'auto',
            position: 'fixed',
            // background: theme.palette.background.default
            background: `url('${backgroundUrl}') repeat`,
            overflow: 'hidden'
        },
        question: {
            position: 'relative',
            minHeight: '25vh',
            maxHeight: '40vh',
            overflow: 'hidden',
            transition: 'opacity 200ms linear'
        },
        kps: {
            overflow: 'hidden',
            fontSize: '14px'
        },
        questionBottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '4px 15px 20px',
            background: `linear-gradient(0, ${theme.palette.background.default} 0%, ${gradient1} 53%, ${gradient2} 100%);`
        },
        main: {
            background: theme.palette.background.paper
        },
        content: {
            overflow: 'auto',
            // paddingBottom: '3em'
            paddingBottom: 80
            // '& *': {
            //     zIndex: 1
            // }
        },
        skipRead: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#FFFFFF',
            pointerEvents: 'none',
            '& .top-mask': {
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                pointerEvents: 'none',
                background: 'rgba(0, 0, 0, 0.5)'
            }
        },
        endAnimate: {
            position: 'relative',
            margin: 'auto',
            height: 75,
            width: 90
        }
    });
});

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const TutorBoard = (props: any) => {
    const contentRef = useRef(null);
    const questionRef = useRef(null);
    const pageRef = useRef(null);
    const endAnimateRef = useRef(null);
    const classes = useStyles();
    const query = useQuery();
    const [loaded, setLoaded] = useState(false);
    const [hilcChooseVisible, setHilcChooseVisible] = useState(true);
    const [isIntroducing, setIsIntroducing] = useState(false);
    const [showSkipRead, setShowSkipRead] = useState(false);
    const [endAnimate, setEndAnimate] = useState(false);
    const [endAnimatePlayer, setEndAnimatePlayer] = useState(null as any);

    const [maskTop, setMaskTop] = useState({});
    const [isMove, setIsMove] = useState(false);
    const [hasPgs, setHasPgs] = useState(false);

    useEffect(() => {
        const el = (questionRef.current as unknown) as HTMLDivElement;
        setMaskTop(el.offsetTop);
    }, []);

    /**
     * 监听实时编辑更新
     */
    useEffect(() => {
        let realTimeUpdate = new RealTimeUpdate();
        return () => realTimeUpdate.remove();
    }, []);

    /**
     * 观察进度点激活变化
     */
    useEffect(() => {
        if (!props.info.navPoints || !props.info.navPoints.length) return;
        const activeNav = props.info.navPoints.find((node: PGNode) => node.currentStep);

        setIsIntroducing(activeNav && activeNav.name === '题目');
    }, [props.info.navPoints]);

    /**
     * 获取查询参数
     */
    useMemo(() => {
        const questionId = query.get('id') || '';
        const type = query.get('type') || 'explain';
        const appId = query.get('appId') || undefined;
        const token = query.get('token') || '';
        const room = query.get('roomId') || '';
        const hilMode = !!query.get('hilMode');
        const none = query.get('none') || false;
        const qrCode = !!query.get('qrCode');

        store.dispatch({type: InfoActions.setTvMode, payload: qrCode});

        if (none) {
            store.dispatch({type: InfoActions.setNetError, payload: 'none'});
            return;
        }

        store.dispatch({type: InfoActions.setHilMode, payload: hilMode});
        store.dispatch({type: InfoActions.setGuideRead, payload: appId !== '5fae7360-c026-11ea-875d-734b8155ec24'});
        setAuth(token, appId);

        connector(questionId as any, type as any, room).then(() => {});
    }, []);

    const removeHeader = useMemo(() => {
        return !!query.get('removeHeader');
    }, []);

    const questionId = useMemo(() => query.get('id'), []);

    useEffect(() => {
        if (!props.info.pgId) return;
        let info = store.getState().info;

        tutor
            .startExplain({
                questionId: info.questionId,
                roomId: info.roomId,
                type: info.pgType,
                initOnly: true,
                hilMode: info.hilMode,
                eaogId: info.pgId || undefined
            })
            .catch(e => {
                const message = e?.response?.data?.error || '';
                const idError = !!message.match('题目不存在');
                store.dispatch({type: InfoActions.setNetError, payload: idError ? 'idError' : 'default'});
            });
    }, [props.info.pgId]);

    /**
     * 加载结束动画svga
     */
    useEffect(() => loadEndAnimate(), []);

    /**
     * 设置加载状态
     */
    useEffect(() => {
        if (!props.info.questionNode) return;

        !loaded && setTimeout(() => setLoaded(true), 400);
    }, [loaded, props.info.questionNode]);

    /**
     * 监听结束状态
     */
    useEffect(() => {
        if (props.info.ended) showEndAnimate();
    }, [props.info.ended]);

    /**
     * 跳过引读
     */
    function skipRead() {
        setShowSkipRead(false);
        if (!(isIntroducing && !props.info.paused) || isMove) return;

        aitAudio.done && aitAudio.done.run();
        aitAudio.removeAudio();
    }

    function showSkip() {
        if (!(isIntroducing && !props.info.paused)) return;
        setShowSkipRead(true);
        setIsMove(false);
    }

    /**
     * 显示结束动画svga
     */
    async function showEndAnimate() {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEndAnimate(true);

            endAnimatePlayer.startAnimation();

            /*
             * effectSound方法在IOS小程序端失效
             * 故用替换aitAudio的src资源路径来解决该问题。
             * */
            // await effectSound.ending.play();
            aitAudio.audio.src = '/audio/ending.mp3';
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 加载结束动画svga
     */
    function loadEndAnimate() {
        let player = new SVGA.Player((endAnimateRef.current as unknown) as HTMLDivElement);
        let parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(() => {
            player.stepToPercentage(100);

            setTimeout(() => {
                setEndAnimate(false);
                pageEvent.emit('showFeedback');
            }, 1500);
        });

        parser.load('/svga/ending.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
        });

        setEndAnimatePlayer(player);
    }

    /**
     * 跳过引读
     */
    function onSetShowSkipRead() {
        showSkip();

        const handleMouseup = () => {
            document.removeEventListener('mouseup', handleMouseup);
            skipRead();
        };

        document.addEventListener('mouseup', handleMouseup);
    }

    return (
        <div
            className={`${classes.root} d-flex flex-column ${props.info.isIos && 'ios-root'} ${
                props.info.isPhone && 'iphone-root'
            } overwrite-root`}
            ref={pageRef}>
            {!removeHeader && <HeaderBar showPgsChoose={() => setHilcChooseVisible(true)} hasPgs={hasPgs} swipeTarget={pageRef.current} />}

            {props.info.netError && <AitError />}

            <div ref={questionRef} style={{opacity: loaded ? 1 : 0}} className={`${classes.question} flex-shrink-0 d-flex flex-column`}>
                <div
                    className="overflow-auto flex-grow-1 pb-12"
                    id={'questionContent'}
                    onMouseDown={() => onSetShowSkipRead()}
                    onTouchStart={event => {
                        event.currentTarget.scrollTop += 0;
                        showSkip();
                    }}
                    onTouchEnd={() => skipRead()}
                    onTouchMove={() => setIsMove(true)}>
                    <div>{props.info.questionNode && <StructureQuestion data={props.info.questionNode.node} />}</div>
                </div>

                <div className={`${classes.questionBottom} d-flex align-end`}>
                    {props.info.questionNode && (
                        <AudioSwitch className={'d-flex flex-shrink-0 mr-2'} style={{height: '24px', width: '24px'}} />
                    )}

                    <div className={`${classes.kps} flex-grow-1 d-flex flex-column align-end justify-end `}>
                        {props.info.kps.map((data: TextContent) => (
                            <ContentKp data={data} key={data.text} />
                        ))}
                    </div>
                </div>

                {isIntroducing && showSkipRead && !props.info.paused && (
                    <div className={`${classes.skipRead} d-flex justify-center align-center`}>
                        <div className={`top-mask`} style={{height: `${maskTop}px`}} />
                        <span style={{marginTop: `-${Math.floor((maskTop as number) / 2)}px`}}>跳过引读</span>
                    </div>
                )}
            </div>

            {loaded && (
                <div
                    className={`d-flex flex-column flex-grow-1 overflow-hidden ${classes.main} animate__fadeInUp animate__animated animate__faster`}>
                    <ProgressBar />

                    <div
                        id={'tutorBoardContent'}
                        ref={contentRef}
                        className={`${classes.content} flex-grow-1 overflow-auto`}
                        onTouchStart={event => (event.currentTarget.scrollTop += 0)}>
                        {props.info.structure && <StructureNode data={props.info.structure} />}

                        {props.info.loadingVisible && <LoadingPanel />}
                    </div>
                </div>
            )}

            {loaded && <BottomPanel swipeTarget={pageRef.current} showPgsChoose={() => setHilcChooseVisible(true)} hasPgs={hasPgs} />}

            <Fade in={endAnimate} style={{position: 'fixed', bottom: 10, left: 0, right: 0, pointerEvents: 'none'}}>
                <div className={classes.endAnimate} ref={endAnimateRef} />
            </Fade>

            {/* <BottomBar swipeTarget={contentRef.current} available={props.info.ended} /> */}

            <HilcChoose
                hilcChooseVisible={hilcChooseVisible}
                hide={() => setHilcChooseVisible(false)}
                hasPgs={(value = true) => setHasPgs(value)}
                questionId={questionId}
            />
        </div>
    );
};

export default connectInfoStore<any>(TutorBoard) as any;
