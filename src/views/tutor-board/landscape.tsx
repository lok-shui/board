import React, {useEffect, useRef, useState, useMemo} from 'react';
import {connector} from './@instruction';
import {connectInfoStore} from '@/store/info';
import {StructureNode, StructureQuestion, ContentKp} from '@/components';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {useLocation} from 'react-router-dom';
import AudioSwitch from './ait-audio-switch';
import ProgressBar from './ait-progress-bar';
import HeaderBar from './ait-header-bar';

import BottomPanel from '@/components/bottom-panel';

// import {color, RGBColor} from 'd3-color';
import {setAuth} from '@/api/axios';
import {PGNode} from '@/types/instruction';
import aitAudio from '@/views/tutor-board/ait-audio';
import SVGA from 'svgaplayerweb';
import {effectSound} from '@/utils';

import store from '@/store';
import {InfoActions} from '@/store/info';

import Fade from '@material-ui/core/Fade';

import {tutor as tutorApi, questions as questionsApi} from '@/api';
import pageEvent from '@/utils/event';

const useStyles = makeStyles((theme: Theme) => {
    // const gradient = color(theme.palette.background.default) as RGBColor;
    // gradient.opacity = 0.65;
    // const gradient1 = gradient.toString();
    // gradient.opacity = 0;
    // const gradient2 = gradient.toString();

    const backgroundUrl = theme.palette.type === 'dark' ? '/images/background.jpg' : '/images/background_white.jpg';
    const tencentBgUrl = '/images/virtual_bg.png';
    const tencentBottomUrl = '/images/virtual_bottom.png';

    return createStyles({
        root: {
            height: `100vh`,
            width: '100vw',
            // overflow: 'auto',
            position: 'fixed',
            // background: theme.palette.background.default
            background: `url('${backgroundUrl}') repeat`
        },
        questionContain: {
            position: 'relative',
            width: '50%',
            transition: '.5s cubic-bezier(0.65, 0, 0.35, 1)',
            paddingTop: 10,
            '&.full': {
                width: '100%'
                // backgroundColor: '#ffffff'
                // background: `url('${backgroundUrl}') repeat`
            },
            '&.small': {
                width: '40%'
            }
        },
        question: {
            position: 'relative',
            flex: 1,
            // minHeight: '25vh',
            // maxHeight: '40vh',
            overflow: 'hidden',
            transition: 'opacity 200ms linear'
        },
        kps: {
            fontSize: '14px',
            position: 'relative'
        },
        questionBottom: {
            position: 'absolute',
            // bottom: 0,
            bottom: 72,
            left: 0,
            width: '100%',
            // padding: '4px 15px 12px',
            paddingLeft: 20,
            // paddingTop: 18,
            // paddingBottom: 18,
            // background:
            //     theme.palette.type === 'dark'
            //         ? ''
            //         : `linear-gradient(0, ${theme.palette.background.default} 0%, ${gradient1} 53%, ${gradient2} 100%)`,
            // marginTop: -20
            '&.tencent': {
                position: 'fixed',
                bottom: '120px',
                paddingRight: 20,
                zIndex: 1
            }
        },
        bottomMask: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -16,
            top: -16,
            background:
                theme.palette.type === 'dark'
                    ? 'linear-gradient(0, rgba(33,33,33,1) 0%, rgba(33,33,33,0.65) 53%, rgba(33,33,33,0) 100%)'
                    : 'linear-gradient(0, rgba(243,243,243,1) 0%, rgba(243,243,243,0.65) 53%, rgba(243,243,243,0) 100%)'
        },
        main: {
            background: theme.palette.background.paper,
            flex: '1',
            position: 'relative',
            minWidth: '50%',
            maxWidth: '60%',
            marginRight: '-50%',
            transition: '.5s cubic-bezier(0.65, 0, 0.35, 1)',
            '&.in': {
                marginRight: 0
            }
        },
        content: {
            overflow: 'auto',
            paddingBottom: 30,
            '& *': {
                zIndex: 1
            }
        },
        moveBtn: {
            position: 'absolute',
            width: 12,
            height: 50,
            right: -20,
            top: 'calc(50% - 25px)',
            zIndex: 99,
            '&::after': {
                content: '""',
                display: 'block',
                width: 6,
                height: 30,
                borderRadius: 3,
                backgroundColor: '#cccccc',
                margin: '10px auto'
            }
        },
        bottomContain: {
            // position: 'fixed',
            // bottom: 0,
            height: 56,
            width: '100%',
            // background: `linear-gradient(0, ${theme.palette.background.default} 0%, ${gradient1} 53%, ${gradient2} 100%);`,
            backgroundColor: theme.palette.type === 'dark' ? 'rgba(66,67,70,1)' : theme.palette.background.paper,
            boxShadow: theme.palette.type === 'dark' ? '0px -5px 20px -9px rgba(0,0,0,0.12)' : '0px -5px 20px -9px rgba(0, 0, 0, 0.12)',
            zIndex: 99
            // transition: '.4s',
            // '&.hidden': {
            //     bottom: -75
            // }
        },
        progressContain: {
            // flex: 1
            width: '100%'
        },
        audioContain: {
            marginLeft: 20,
            width: 44,
            height: 40
        },
        contentLand: {
            paddingBottom: 180,
            // padding: '5px 20px'
            paddingTop: 5
            // '&.more-bottom': {
            //     paddingBottom: 250
            // }
        },
        feedbackContain: {
            width: 216,
            height: 32,
            borderRadius: 20,
            // backgroundColor: theme.palette.type === 'dark' ? '' : 'rgba(0, 0, 0, 0.03)',
            marginLeft: 25,
            marginRight: -10,
            transition: '.5s cubic-bezier(0.65, 0, 0.35, 1)',
            '&.hidden': {
                width: 0,
                overflow: 'hidden'
            }
        },
        skipRead: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99,
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
            width: 95
        },
        qrContain: {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#000000',
            zIndex: 999,
            background: `url(/images/tv_bg.png)`,
            backgroundSize: 'cover'
        },
        qrImg: {
            position: 'relative',
            width: '15.625vw',
            height: '15.625vw'
        },
        qrMask: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
        },
        qrBtn: {
            position: 'relative',
            width: '13vw',
            height: '3.5vw',
            backgroundColor: '#0188FB',
            color: '#ffffff',
            borderRadius: '0.5vw'
        },
        tencentBottom: {
            opacity: '0!important',
            pointerEvents: 'none'
        },
        tencentLand: {
            paddingBottom: '55vh',
            borderLeft: 'rgba(255, 255, 255, 0.12) solid 1px'
        },
        tencentBg: {
            background: `url('${tencentBgUrl}') repeat`
        }
    });
});

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

declare var window: any;
let tencentDone: any;
const TutorBoard = (props: any) => {
    const contentRef = useRef(null);
    const questionRef = useRef(null);
    const pageRef = useRef(null);
    const endAnimateRef = useRef(null);
    const classes = useStyles();
    const query = useQuery();
    const [loaded, setLoaded] = useState(false);
    // const [move, setMove] = useState(false);
    const [smallMode, setSmallMode] = useState(false);

    const [isIntroducing, setIsIntroducing] = useState(false);
    const [showSkipRead, setShowSkipRead] = useState(false);
    const [endAnimate, setEndAnimate] = useState(false);
    const [endAnimatePlayer, setEndAnimatePlayer] = useState(null as any);

    // const [maskTop, setMaskTop] = useState({});
    const [isMove, setIsMove] = useState(false);

    //tv版本专用
    //显示二维码弹层
    const [qrCodeVisible, setQrCodeVisible] = useState(false);
    const [qrImg, setQrImg] = useState('');
    const [qrVisible, setQrVisible] = useState(false);

    /**
     * 获取查询参数
     */
    useEffect(() => {
        const questionId = query.get('id') || undefined;
        const type = query.get('type') || 'explain';
        const appId = query.get('appId') || undefined;
        const token = query.get('token') || '';
        const qrCode = !!query.get('qrCode');
        const tencent = query.get('tencent') || undefined;

        setAuth(token, appId);
        store.dispatch({type: InfoActions.setTencentMode, payload: !!tencent});
        // connector(questionId, type as any).then(() => {});

        if (qrCode) {
            store.dispatch({type: InfoActions.setTvMode, payload: true});
            setQrCodeVisible(true);
            setQrVisible(true);
            // getQrCode(type);
            getQrCode();

            pageEvent.on('tv-stop', () => {
                window.location.reload();
            });
        } else {
            // connector(questionId, type as any).then(() => {});
            if (!tencent) {
                connector(questionId, type as any).then(() => {});
            } else {
                questionId && getPgId(questionId, type);
            }
        }
    }, []);

    const removeHeader = useMemo(() => {
        return !!query.get('removeHeader');
    }, []);

    /**
     * 获取pgId
     */
    async function getPgId(questionId: string, type: string) {
        const pgId = query.get('pgId') || null;
        if (pgId) {
            store.dispatch({type: InfoActions.setPgId, payload: pgId});
        } else {
            const res = await questionsApi.availablePgs(questionId);
            const {pg} = res;
            store.dispatch({type: InfoActions.setPgId, payload: pg});
        }

        connector(questionId, type as any).then(() => {});
        registerTencent();
    }

    /**
     * 腾讯虚拟人定制版用监听事件注册
     */
    function registerTencent() {
        window.vdcStart && window.vdcStart();

        pageEvent.on('tencentAudio', data => {
            const {params, done} = data;
            const {内容, 语音} = params;
            const id = randomId();
            tencentDone = {
                ...done,
                id
            };

            vdcShow(内容, id, 语音);
        });

        window.onVDCEnd = (id: string) => {
            id === tencentDone.id && tencentDone.run();
        };
    }

    function randomId() {
        return Math.random().toString(36).substr(2);
    }

    async function vdcShow(text: string, id: string, url: string = '') {
        const timeStamp = +new Date();
        const params = {
            appKey: '43081f80771011eb9f5d6394c4110a18',
            accessToken: 'aad56dbe96eb44f9aa7173eadf4e228f',
            model: 'yantian',
            voice: 'default',
            position: {
                x: 100,
                y: 100,
                width: 540,
                height: 720
            },
            force: true,
            text
        };

        console.log(timeStamp, params, id);
        if (window.vdcShow) {
            window.vdcShow(timeStamp, id, params, 'onVDCEnd');
        }
        aitAudio.setAudio(url, tencentDone, '');
    }

    /**
     * 监听结束状态
     */
    useEffect(() => {
        if (props.info.ended) {
            showEndAnimate();
        }
    }, [props.info.ended]);

    /**
     * 设置加载状态
     */
    useEffect(() => {
        if (!props.info.questionNode) return;

        !loaded &&
            setTimeout(() => {
                setLoaded(true);
                loadEndAnimate();
            }, 400);
    }, [loaded, props.info.questionNode]);

    /**
     * 观察进度点激活变化
     */
    useEffect(() => {
        if (!props.info.navPoints || !props.info.navPoints.length) return;
        const activeNav = props.info.navPoints.find((node: PGNode) => node.currentStep);
        setIsIntroducing(activeNav && activeNav.name === '题目');

        store.dispatch({type: InfoActions.setIntroFinished, payload: activeNav && activeNav.name !== '题目'});
    }, [props.info.navPoints]);

    /**
     *
     */
    useEffect(() => {
        if (!props.info.questionNode) return;
        const questionEl = (questionRef.current as unknown) as HTMLDivElement;
        const outerHeight = (questionEl.parentNode as HTMLDivElement).clientHeight - 60;
        setSmallMode(questionEl.clientHeight < outerHeight * 0.5);
    }, [props.info.questionNode]);

    /**
     * 显示结束动画svga
     */
    async function showEndAnimate() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEndAnimate(true);

        try {
            endAnimatePlayer.startAnimation();
        } catch (e) {
            console.error(e.message);
        }
        effectSound.ending.play();
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
                window.vdcFinish && window.vdcFinish();
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
    function skipRead() {
        if (props.info.tencentMode) return;
        setShowSkipRead(false);
        if (!(isIntroducing && !props.info.paused) || isMove) return;

        aitAudio.done && aitAudio.done.run();
        aitAudio.removeAudio();
    }

    function showSkip() {
        if (props.info.tencentMode) return;
        if (!(isIntroducing && !props.info.paused)) return;
        setShowSkipRead(true);
        setIsMove(false);
    }

    /**
     * 跳过引读
     */
    function onSetShowSkipRead() {
        if (props.info.tencentMode) return;
        showSkip();

        const handleMouseup = () => {
            document.removeEventListener('mouseup', handleMouseup);
            skipRead();
        };

        document.addEventListener('mouseup', handleMouseup);
    }

    /**
     * tv版本相关
     * 获取二维码
     */
    async function getQrCode() {
        const type = (query.get('type') || 'explain') as any;
        const result = await tutorApi.getQrCode();
        // console.log(result);
        const {qrCode, roomId} = result;
        setQrImg(qrCode);
        connector(null, type as any, roomId).then(() => {
            pageEvent.on('tv-start', async questionId => {
                tutorApi.startExplain({
                    questionId,
                    type,
                    roomId,
                    initOnly: true
                });
                setQrCodeVisible(false);
                store.dispatch({type: InfoActions.setQuestionId, payload: questionId});
                store.dispatch({type: InfoActions.setIntroFinished, payload: false});
            });

            pageEvent.once('tv-stop', () => {
                window.location.reload();
            });
        });
    }

    return (
        <div
            className={`${classes.root} d-flex ${props.info.isIos && 'ios-root'} overwrite-root ${
                props.info.tencentMode && classes.tencentBg
            } ${props.info.tencentMode && 'tencent-mode'}`}
            ref={pageRef}>
            <div
                className={`${classes.questionContain} d-flex flex-column ${
                    (smallMode || props.info.tencentMode) && props.info.introFinished && 'small'
                } ${!props.info.introFinished && 'full'}`}
                style={{height: props.info.tencentMode ? '25%' : 'auto'}}>
                {!removeHeader && !props.info.tvMode && !props.info.tencentMode && <HeaderBar swipeTarget={null} />}

                <div
                    onMouseDown={() => onSetShowSkipRead()}
                    onTouchStart={() => showSkip()}
                    onTouchEnd={() => skipRead()}
                    onTouchMove={() => setIsMove(true)}
                    style={{opacity: loaded ? 1 : 0}}
                    className={`${classes.question} flex-shrink-0 d-flex flex-column`}>
                    <div className="overflow-auto flex-grow-1" id={'questionContent'} style={{paddingBottom: '60px'}}>
                        <div ref={questionRef}>{props.info.questionNode && <StructureQuestion data={props.info.questionNode.node} />}</div>
                    </div>

                    {isIntroducing && showSkipRead && !props.info.paused && (
                        <div className={`${classes.skipRead} d-flex justify-center align-center`}>跳过引读</div>
                    )}

                    <div className={`${classes.questionBottom} d-flex align-center ${props.info.tencentMode && 'tencent'}`}>
                        {!props.info.tencentMode && <div className={`${classes.bottomMask}`} />}
                        <div
                            className={`${classes.kps} flex-grow-1 d-flex flex-column align-start justify-end ${
                                props.info.tencentMode && 'align-end'
                            }`}>
                            {props.info.kps.map((data: TextContent) => (
                                //@ts-ignore
                                <ContentKp data={data} key={data.text} tencentMode={props.info.tencentMode} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* <div className={`${classes.moveBtn}`} ref={moveRef} /> */}
            </div>

            {loaded && (
                <div
                    className={`d-flex flex-column flex-grow-1 overflow-hidden ${
                        classes.main
                    } animate__fadeInUp animate__animated animate__faster ${props.info.introFinished && 'in'} ${
                        props.info.tencentMode && classes.tencentBg
                    }`}>
                    <div
                        id={'tutorBoardContent'}
                        ref={contentRef}
                        className={`${classes.content} flex-grow-1 overflow-auto ${classes.contentLand} ${endAnimate && 'more-bottom'} ${
                            props.info.tencentMode && classes.tencentLand
                        }`}>
                        {props.info.structure && <StructureNode data={props.info.structure} />}
                    </div>

                    {/* <div style={{display: endAnimate ? 'block' : 'none', position: 'absolute', bottom: 75, left: 0, right: 0}}>
                        <div className={classes.endAnimate} ref={endAnimateRef} />
                    </div> */}
                    <Fade in={endAnimate} style={{position: 'fixed', bottom: 60, left: 0, right: 0, pointerEvents: 'none'}}>
                        <div className={classes.endAnimate} ref={endAnimateRef} />
                    </Fade>
                </div>
            )}

            <Fade in={loaded} style={{position: 'fixed', bottom: 0, left: 0, right: 0}}>
                <div
                    className={`${classes.bottomContain} ${!loaded ? 'hidden' : ''} ${
                        props.info.tencentMode && classes.tencentBottom
                    } d-flex align-center justify-center`}>
                    <div className={`${classes.progressContain}`}>
                        <ProgressBar />
                    </div>
                    <div className={`${classes.audioContain}`}>{props.info.questionNode && <AudioSwitch />}</div>
                    {!props.info.tencentMode && loaded && (
                        <div className={`${classes.feedbackContain} ${!props.info.paused && 'hidden'}`}>
                            <BottomPanel swipeTarget={null} />
                        </div>
                    )}
                </div>
            </Fade>

            {qrCodeVisible && (
                <div className={`${classes.qrContain} d-flex align-center justify-center`}>
                    {qrImg && (
                        <div className={`${classes.qrImg}`}>
                            <img className={`${classes.qrImg}`} src={qrImg} />
                            {qrVisible && (
                                <div className={`${classes.qrMask} d-flex align-center justify-center`}>
                                    <div
                                        className={`${classes.qrBtn} d-flex align-center justify-center`}
                                        onClick={() => setQrVisible(false)}>
                                        点击获取二维码
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default connectInfoStore<any>(TutorBoard) as any;
