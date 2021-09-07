import React, {useEffect, useRef, useState, useMemo} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
// import IconButton from '@material-ui/core/IconButton';
// import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
// import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import {tutor} from '@/api';
import {connectInfoStore, InfoActions} from '@/store/info';
import aitAudio from './ait-audio';
import {InstructionDone, InstructionMessage, PGNode} from '@/types/instruction';
import {activateNavPoint, showNode} from './@instruction/utils';
import {effectSound} from '@/utils';
import {color, RGBColor} from 'd3-color';
import SVGA from 'svgaplayerweb';
import {useMount} from 'react-use';
import store from '@/store';
import {theme} from '@/index';
import pageEvent from '@/utils/event';

const useStyles = makeStyles((theme: Theme) => {
    const gradient = color(theme.palette.background.paper) as RGBColor;
    gradient.opacity = 0.65;
    const gradient1 = gradient.toString();
    gradient.opacity = 0;
    const gradient2 = gradient.toString();

    const isDark = theme.palette.type === 'dark';
    const navPointColor = isDark ? 'rgba(180,180,180,1)' : 'rgba(179,179,179,1)';
    const navPointDisabled = isDark ? 'rgba(112,112,112,1)' : 'rgba(220,220,220,1)';
    const navPointActive = isDark ? 'rgba(255,255,255,1)' : 'rgba(114,114,114,1)';

    const landscapeMode = store.getState().info.landscapeMode;

    return createStyles({
        root: {
            height: '45px',
            paddingRight: '15px'
        },
        navs: {
            position: 'relative',
            paddingLeft: '10px',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            backgroundImage: `linear-gradient(${theme.palette.action.selected}, ${theme.palette.action.selected})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'calc(100% - 10px) 2px',
            backgroundPosition: '10px 21px'
        },
        navPoint: {
            position: 'relative',
            height: 1,
            width: 1,
            marginRight: '30px',
            '& *': {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            },
            '&:before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '2px',
                background: theme.palette.divider,
                borderRadius: '2px',
                transition: 'width .2s',
                width: 0
            },
            '&.active:before': {
                width: 30
            },
            [landscapeMode && theme.breakpoints.up('sm')]: {
                marginRight: 95,
                transition: '.4s',
                '&:before': {
                    transition: 'width .4s'
                },
                '&.active:before': {
                    width: 95
                },
                '&.short': {
                    marginRight: 60,
                    '&.active:before': {
                        width: 60
                    }
                }
            }
        },
        navPointRound: {
            height: 6,
            width: 6,
            background: navPointDisabled,
            borderRadius: '50%',
            '&.dirty': {
                background: navPointColor
            },
            '&.active': {
                height: 8,
                width: 8,
                background: navPointActive
            },
            [landscapeMode && theme.breakpoints.up('sm')]: {
                '&.active': {
                    height: 12,
                    width: 12
                }
            }
        },
        navPointTouch: {
            height: 25,
            width: 25,
            borderRadius: '50%'
        },
        navPointWave: {
            height: 8,
            width: 8,
            background: theme.palette.action.active,
            borderRadius: '50%',
            animation: 'wave 2s infinite',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                height: 12,
                width: 12
            }
        },
        divider: {
            position: 'absolute',
            width: 'calc(100% - 10px)',
            height: '3px',
            borderRadius: '3px'
        },
        activeLine: {
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '2px',
            background: theme.palette.divider,
            borderRadius: '2px',
            transition: 'width 200ms',
            marginLeft: '10px'
        },
        contentShadow: {
            position: 'absolute',
            width: '100%',
            top: '45px',
            height: 15,
            zIndex: 9,
            background: `linear-gradient(180deg, ${gradient1} 0%, ${gradient2} 53%, transparent 100%)`
        },
        playIcon: {
            zIndex: 1,
            height: 45,
            width: 45,
            '&:active': {
                '&:before': {
                    backgroundColor: `${isDark ? '#2e2f30' : '#e8e8e8'} !important`
                }
            },

            '&:before': {
                backgroundColor: 'transparent'
            },
            [landscapeMode && theme.breakpoints.up('sm')]: {
                width: 60,
                height: 56,
                marginRight: 10
            }
        },
        //横屏版相关样式
        progressContain: {
            width: '100%'
        }
    });
});

const AitProgressBar = (props: any) => {
    const classes = useStyles();
    const [started, setStarted] = useState(false);
    const [playIcon, setPlayIcon] = useState(null as any);
    const [navIndex, setNavIndex] = useState(-1);
    const navPointsRef = useRef(null);
    const navLineRef = useRef(null);
    const targetRef = useRef(null);

    const [landscapeMode, setMode] = useState(false);
    const [playIconStyle, setIconStyle] = useState({
        width: '20px',
        height: '20px'
    });

    /**
     * 组件mounted
     */
    useMount(() => {
        setPlayIcon(loadIcon() as any);
    });

    useEffect(() => {
        const fn = () => pause();
        pageEvent.on('pause', fn);

        checkDevice();
        return () => {
            pageEvent.removeListener('pause', fn);
        };
    }, []);

    useEffect(() => {
        if (!props.info.landscapeMode) return;
        setMode(props.info.landscapeMode);
        setIconStyle({
            width: '26px',
            height: '26px'
        });
    }, [props.info.landscapeMode]);

    /**
     * 监听结束状态
     */
    useEffect(() => {
        handleEnded(props.info.ended);
    }, [props.info.ended]);

    /**
     * 监听播放状态
     */
    useEffect(() => {
        changePlayerIcon(!props.info.paused);
    }, [props.info.paused]);

    /**
     * 观察进度点激活变化
     */
    useEffect(() => {
        if (!props.info.navPoints || !props.info.navPoints.length) return;
        const activeNav = props.info.navPoints.find((node: PGNode) => node.currentStep);
        const activeNavIndex = props.info.navPoints.indexOf(activeNav);
        setNavIndex(activeNavIndex);

        if (props.info.tvMode) {
            pageEvent.emit('tv-emit', {
                status: props.info.paused ? 'pause' : 'play',
                canPrev: activeNavIndex > 0,
                canNext:
                    activeNavIndex >= 0 &&
                    activeNavIndex < props.info.navPoints.length - 1 &&
                    !!props.info.navPoints[activeNavIndex + 1].dirty
            });
        }

        if (!activeNav) return;

        // const navLine = (navLineRef.current as unknown) as HTMLElement;
        const navPoints = (navPointsRef.current as unknown) as HTMLElement;
        const points = navPoints.children;
        const navPoint = points[activeNavIndex] as HTMLElement;

        if (!navPoint) return;
        // const offsetLeft = navPoint.offsetLeft;
        // navLine.style.width = offsetLeft - navLine.offsetLeft + 'px';
    }, [props.info.navPoints, props.info.paused]);

    /**
     * 判断tv模式增加事件消息通信
     */
    useEffect(() => {
        if (props.info.tvMode && props.info.landscapeMode) {
            pageEvent.on('tv-action', (instruction: string) => {
                switch (instruction) {
                    case 'tv-play':
                    case 'tv-pause':
                        const btn = (targetRef.current as unknown) as HTMLDivElement;
                        !btn.classList.contains(instruction) && btn.click();
                        break;
                    case 'tv-next':
                        switchStep(1);
                        break;
                    case 'tv-prev':
                        switchStep(-1);
                        break;
                    default:
                        break;
                }
            });
        }
    }, [props.info.tvMode, props.info.landscapeMode]);

    /**
     * tv模式切换进度
     */
    function switchStep(num: number) {
        const navPoints = (navPointsRef.current as unknown) as HTMLElement;
        const points = Array.from(navPoints.children as HTMLCollection);
        const index = points.findIndex(node => node.classList.contains('isCurrent'));
        const newIndex = index + num;
        if (newIndex < 0 || newIndex >= points.length) return;
        const node = points[newIndex] as HTMLElement;
        node && node.click();
    }

    /**
     * 判断设备类型
     */
    function checkDevice() {
        const ua = navigator.userAgent,
            isWindowsPhone = /(?:Windows Phone)/.test(ua),
            isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
            isAndroid = /(?:Android)/.test(ua) || /(?:android)/.test(ua),
            isFireFox = /(?:Firefox)/.test(ua),
            isChrome = /(?:Chrome|CriOS)/.test(ua),
            isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
            isPhone = /(?:iPhone)/.test(ua) && !isTablet,
            isIos = /(?:iPad)/.test(ua) || /(?:AppleWebKit)/.test(ua),
            isPc = !isPhone && !isAndroid && !isSymbian && !isTablet;

        store.dispatch({type: InfoActions.setIsPhone, payload: isPhone});
        store.dispatch({type: InfoActions.setIsIos, payload: isIos && !isPhone});
    }

    /**
     * 获取进度节点元素
     */
    function getNavPoint(node: PGNode) {
        const activeNav = props.info.navPoints.find((item: PGNode) => item.pathName === node.pathName);
        const activeNavIndex = props.info.navPoints.indexOf(activeNav);

        const navPoints = (navPointsRef.current as unknown) as HTMLElement;
        const points = navPoints.children;

        return points[activeNavIndex] as HTMLElement;
    }

    /**
     * 更新 store 暂停状态
     */
    function changePausedState(state: boolean) {
        props.setPaused(state);
    }

    /**
     * 切换状态
     */
    function togglePlayState() {
        props.info.paused ? play() : pause();
    }

    /**
     * 控制播放
     */
    async function play() {
        effectSound.playSound.play().catch((err: Error) => {
            alert(err);
        });
        if (props.info.ended) {
            //重播的状况
            //重置题目图片初始化状态
            resetImage(props.info.navPoints[0]);
        }

        setStarted(true);
        changePausedState(false);

        needSkipRestart() ? start() : replay();
    }

    /**
     * 处理讲解结束
     */
    function handleEnded(state: boolean = true) {
        if (!started) return;

        changePausedState(state);
    }

    /**
     * 开始播放
     */
    function start() {
        if (!props.info.questionId && !props.info.pgId) return;
        tutor
            .startExplain({
                questionId: props.info.questionId,
                roomId: props.info.roomId,
                type: props.info.pgType,
                initOnly: false,
                skipToPath: props.info.currentPath || undefined,
                skipInitProcess: !props.info.hilMode,
                hilMode: props.info.hilMode,
                eaogId: store.getState().info.pgId || undefined
            })
            .catch(() => {
                props.setNetError('netError');
            });

        props.setCurrentPath('');
    }

    /**
     * 暂停播放
     */
    function pause() {
        // !props.info.paused && effectSound.pauseSound.play();
        !props.info.paused &&
            effectSound.pauseSound.play().catch((err: Error) => {
                alert(err);
            });

        changePausedState(true);
        aitAudio.pause();

        const instructions = (props.info.instructions || []) as [InstructionMessage, InstructionDone][];
        const executableInstructions = instructions.filter(([, done]) => !done.executed);

        executableInstructions.forEach(([, done]) => (done.needPause = true));
    }

    /**
     * 重新播放
     */
    function replay() {
        aitAudio.play();

        pausedInstructions().forEach(([, done]) => {
            done.replay();
        });
    }

    /**
     * 判断是否需要重新请求PG
     */
    function needSkipRestart() {
        return !!props.info.currentPath || !props.info.instructions.length;
    }

    /**
     * 获取暂停的指令
     */
    function pausedInstructions(): [InstructionMessage, InstructionDone][] {
        return ((props.info.instructions || []) as [InstructionMessage, InstructionDone][]).filter(([, done]) => done.needPause);
    }

    /**
     * 切换进度点
     */
    async function toggleNavPoint(node: PGNode) {
        if (node.currentStep) return;
        effectSound.progressSound.play();

        if (!node.dirty) {
            const element = getNavPoint(node);
            shakeNavPoint(element);
            return;
        }

        if (activateNavPoint(node.pathName, true)) {
            props.setCurrentPath(node.pathName);
            showNode(node.pathName);

            aitAudio.removeAudio();
            pageEvent.emit('toggleNavPoint', true);
            pause();
        }

        resetImage(node);
    }

    function resetImage(node: PGNode) {
        const images = node.questionImages;
        if (images && images.length) {
            const contentImages = document.querySelectorAll('#questionContent img');
            images.forEach((url: string, index: number) => {
                const img = contentImages[index] as HTMLImageElement;
                if (img) {
                    if (url) {
                        img.src = url;
                        img.classList.remove('light');
                    } else {
                        img.style.display = 'none';
                        img.src = '';
                    }
                }
                // if (img && url) {
                //     img.src = url;
                //     img.classList.remove('light');
                // }
            });
        }
    }

    /**
     * 进度点禁止交互时抖动
     */
    function shakeNavPoint(element: HTMLElement) {
        element.classList.add('animate__headShake');
        element.classList.add('animate__animated');
        element.classList.add('animate__faster');

        element.addEventListener('animationend', function fn() {
            let classList = element && element.classList;
            if (classList) {
                classList.remove('animate__headShake');
                classList.remove('animate__animated');
                classList.remove('animate__faster');
            }
            element.removeEventListener('animationend', fn);
        });
    }

    /**
     * 加载按钮图标
     */
    function loadIcon() {
        const audioBtn = (targetRef.current as unknown) as HTMLDivElement;
        let player = new SVGA.Player(audioBtn);
        let parser = new SVGA.Parser();

        parser.load(theme.palette.type !== 'dark' ? '/svga/play-pause_W.svga' : '/svga/play-pause.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.loops = 1;
            player.stepToFrame(6);
        });

        return player;
    }

    /**
     * 播放按钮切换
     */
    function changePlayerIcon(paused: boolean) {
        if (!playIcon) return;
        if (paused) {
            playIcon.onFinished(() => {
                playIcon.stepToFrame(0);
            });
            try {
                playIcon.startAnimationWithRange({location: 0, length: 7}, true);
            } catch (e) {
                console.error(e.message);
            }
        } else {
            playIcon.onFinished(() => {
                playIcon.stepToFrame(6);
            });

            try {
                playIcon.startAnimationWithRange({location: 0, length: 7});
            } catch (e) {
                console.error(e.message);
            }
        }
    }

    return (
        <div className={`${classes.root} flex-shrink-0 d-flex align-center`}>
            {/*<IconButton
                className={`flex-shrink-0 ${started ? '' : 'playBtn__beat'} scale-btn`}
                component="span"
                onContextMenu={(event: any) => {
                    event.preventDefault();
                    togglePlayState();
                }}
                onClick={() => togglePlayState()}>
                {props.info.paused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
            </IconButton>*/}

            <div
                className={`${classes.playIcon} d-flex justify-center align-center scale-btn active-btn`}
                onClick={() => togglePlayState()}
                onContextMenu={(event: any) => {
                    event.preventDefault();
                    togglePlayState();
                }}>
                <div
                    className={`${started ? '' : 'playBtn__beat'} ${props.info.tvMode && (props.info.paused ? 'tv-pause' : 'tv-play')}`}
                    style={playIconStyle}
                    ref={targetRef}
                />
            </div>
            {props.info.isPhone && (
                <audio
                    id={`audioTest`}
                    style={{width: '45px', height: '45px', position: 'absolute', left: 0, top: 0, opacity: 0, zIndex: 9}}
                    onTouchEnd={() => {
                        togglePlayState();
                    }}
                    autoPlay
                    controls
                />
            )}

            <div className={`${classes.navs} flex-grows-1 d-flex align-center`}>
                {/* <div className={classes.activeLine} ref={navLineRef} /> */}
                <div className={`d-flex ${landscapeMode && classes.progressContain}`} ref={navPointsRef}>
                    {props.info.navPoints.map((node: PGNode, index: number) => (
                        <div
                            className={`${classes.navPoint}  ${props.info.paused && 'short'} ${navIndex > index && 'active'} ${
                                node.currentStep && 'isCurrent'
                            }`}
                            key={node.pathName}
                            onClick={() => toggleNavPoint(node)}>
                            <div className={`${classes.navPointRound} ${node.currentStep ? 'active' : ''} ${node.dirty ? 'dirty' : ''}`} />
                            <div className={`${classes.navPointTouch}`} />
                            <div
                                className={`${classes.navPointWave}`}
                                style={{display: node.currentStep && !props.info.paused ? '' : 'none', zIndex: 1}}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {!landscapeMode && <div className={`${classes.contentShadow}`} />}
        </div>
    );
};

export default connectInfoStore(AitProgressBar);
