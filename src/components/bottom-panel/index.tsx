import React, {useEffect, useState, useRef, useMemo} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import {color, RGBColor} from 'd3-color';
import SVGA from 'svgaplayerweb';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import {connectInfoStore} from '@/store/info';
import {useLocation} from 'react-router-dom';
import {questions} from '@/api';
import {effectSound} from '@/utils';
import Comment from './comment';
import Fire from './fire';
import pageEvent from '@/utils/event';
import {theme} from '@/index';
import store from '@/store';
import {Subject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {useWindowSize} from 'react-use';

const useStyles = makeStyles((theme: Theme) => {
    const gradient = color(theme.palette.type === 'dark' ? 'rgba(33, 33, 33, 1)' : 'rgba(255, 255, 255, 1)') as RGBColor;
    gradient.opacity = 0.65;
    const gradient1 = gradient.toString();
    gradient.opacity = 0;
    const gradient2 = gradient.toString();
    gradient.opacity = 1;

    const landscapeMode = store.getState().info.landscapeMode;
    const isDark = theme.palette.type === 'dark';

    return createStyles({
        root: {
            position: 'fixed',
            bottom: 0,
            height: 75,
            width: '100%',
            // padding: '0 30px',
            background: `linear-gradient(0, ${gradient} 0%, ${gradient1} 53%, ${gradient2} 100%);`,
            justifyContent: 'space-between',
            zIndex: 99,
            [landscapeMode && theme.breakpoints.up('sm')]: {
                position: 'relative',
                height: '100%',
                background: 'none'
            }
        },
        back: {
            height: '100%',
            width: 70,
            paddingLeft: 15,
            [theme.breakpoints.up('sm')]: {
                opacity: 0,
                pointerEvents: 'none'
            }
        },
        svgBox: {
            position: 'relative',
            height: 40,
            width: 40,
            marginRight: 20,
            [landscapeMode && theme.breakpoints.up('sm')]: {
                width: 58,
                marginRight: 0
            }
        },
        svgIcon: {
            width: '100%',
            height: '100%',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                width: 36,
                height: 36
                // '& canvas': {
                //     transform: 'matrix(0.2, 0, 0, 0.2, -64, -64)!important'
                // }
            }
        },
        count: {
            position: 'absolute',
            fontSize: 14,
            top: 0,
            left: 32,
            [landscapeMode && theme.breakpoints.up('sm')]: {
                // top: 'calc(50% - 14px)',
                fontSize: 12,
                left: 30
            }
        },
        fireContain: {
            position: 'absolute',
            width: 280,
            height: 280,
            right: 20,
            top: -240,
            pointerEvents: 'none',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                right: 20,
                top: -260
            }
        },
        collectionContain: {
            pointerEvents: 'none',
            position: 'fixed',
            zIndex: 99,
            width: 150,
            height: 150,
            top: 200,
            left: 'calc(50% - 75px)',
            paddingTop: 15,
            borderRadius: 15,
            transformOrigin: 'center center',
            // backgroundColor: isDark ? 'rgba(128, 128, 128, 0.45)' : 'rgba(0, 0, 0, 0.65)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            animation: 'tickFadeIn 0.2s cubic-bezier(0.65, 0, 0.35, 1)'
        },
        collection: {
            width: 60,
            height: 60,
            margin: 'auto'
        },
        text: {
            margin: '8px auto 0',
            width: 80,
            textAlign: 'center',
            wordBreak: 'break-all',
            lineHeight: '28px',
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.85)'
        }
    });
});

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const playerItems: any = {
    smile: {tag: false, player: null},
    frown: {tag: false, player: null},
    comment: {tag: false, player: null}
};
let timeout: any;
let isPress: boolean = false;

const BottomPanel = (props: any) => {
    const classes = useStyles();
    const [visible, setVisible] = useState(false);
    const [lock, setLock] = useState(false);
    const [questionId, setQuestionId] = useState('');
    const [feedback, setFeedback] = useState({
        smile: 0,
        frown: 0
    });
    const [smileCount, setSmileCount] = useState(0);
    const [commentVisible, setCommentVisible] = useState(false);
    const [fireVisible, setFireVisible] = useState(false);
    const [landscapeMode, setMode] = useState(false);

    const query = useQuery();

    const smileRef = useRef(null);
    const frownRef = useRef(null);
    const commentRef = useRef(null);

    const [visibleSubject, setVisibleSubject] = useState(new Subject<boolean>());

    const [collectionVisible, setCollectionVisible] = useState(false);
    const [collectionPlayer, setCollectionPlayer] = useState(null);
    const targetRef = useRef(null);

    const {width, height} = useWindowSize();

    const isPc = useMemo(() => {
        const webType = getScreenType();
        return webType.isPc;
    }, [width, height]);

    useEffect(() => {
        if (!props.info.landscapeMode) return;
        setMode(true);
    }, [props.info.landscapeMode]);

    useEffect(() => {
        const target = (targetRef.current as unknown) as HTMLDivElement;
        let player = new SVGA.Player(target);
        let parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(async () => {
            player.stepToPercentage(1);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCollectionVisible(false);
        });

        parser.load('/svga/collection.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.stepToFrame(0);
        });

        setCollectionPlayer(player as any);
    }, []);

    useEffect(() => {
        const smileBtn = (smileRef.current as unknown) as HTMLDivElement;
        const player = new SVGA.Player(smileBtn);
        const parser = new SVGA.Parser();
        const fileUrl = `/svga/${theme.palette.type === 'dark' ? 'smile2' : 'smile_W'}.svga`;

        player.onFinished(() => {
            player.stepToPercentage(1);
        });

        parser.load(fileUrl, (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.loops = 1;
            player.stepToFrame(0);
        });

        playerItems.smile.player = player;
    }, []);

    useEffect(() => {
        const frownBtn = (frownRef.current as unknown) as HTMLDivElement;
        const player = new SVGA.Player(frownBtn);
        const parser = new SVGA.Parser();
        const fileUrl = `/svga/${theme.palette.type === 'dark' ? 'frown' : 'frown_W'}.svga`;

        player.onFinished(() => {
            player.stepToPercentage(1);
        });

        parser.load(fileUrl, (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.loops = 1;
            player.stepToFrame(0);
        });

        playerItems.frown.player = player;
    }, []);

    useEffect(() => {
        const commentBtn = (commentRef.current as unknown) as HTMLDivElement;
        const player = new SVGA.Player(commentBtn);
        const parser = new SVGA.Parser();
        const fileUrl = `/svga/${theme.palette.type === 'dark' ? 'warning' : 'warning_W'}.svga`;

        player.onFinished(() => {
            player.stepToPercentage(1);
        });

        parser.load(fileUrl, (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.loops = 1;
            player.stepToFrame(0);
        });

        playerItems.comment.player = player;
    }, []);

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

            visibleSubject.next(y > startY);
        };

        const el = props.swipeTarget;

        el.addEventListener('touchstart', handleTouchstart, {passive: true});
        el.addEventListener('touchmove', handleTouchmove, {passive: true});

        const subscription = visibleSubject.pipe(distinctUntilChanged()).subscribe((visible: boolean) => {
            setVisible(visible);
        });

        return () => {
            el.removeEventListener('touchstart', handleTouchstart, {passive: true});
            el.removeEventListener('touchmove', handleTouchmove, {passive: true});
            subscription.unsubscribe();
        };
    }, [props.swipeTarget]);

    // useEffect(() => {
    //     if (props.info.ended) {
    //         setTimeout(() => {
    //             setVisible(true);
    //         }, 3200);
    //     }
    // }, [props.info.ended]);

    useEffect(() => {
        pageEvent.on('showFeedback', () => {
            setVisible(true);
        });
    }, []);

    useEffect(() => {
        if (!props.info.paused) setVisible(false);
    }, [props.info.paused]);

    useEffect(() => {
        getQuestionDetail().then();
    }, []);

    function back() {
        try {
            if (navigator.userAgent.includes('dm-ait-flutter')) {
                const json = '{"action":"back"}';
                // @ts-ignore
                window.DM.postMessage(json);
                // @ts-ignore
            } else if (window.dm && window.exit) {
                // android
                // @ts-ignore
                window.dm.exit();
            } else {
                // browser || mini-program
                props.showPgsChoose(true);
            }
        } catch (e) {
            console.error(e.message);
        }
    }

    function getScreenType() {
        const ua = navigator.userAgent,
            isWindowsPhone = /(?:Windows Phone)/.test(ua),
            isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
            isAndroid = /(?:Android)/.test(ua) || /(?:android)/.test(ua),
            isFireFox = /(?:Firefox)/.test(ua),
            isChrome = /(?:Chrome|CriOS)/.test(ua),
            isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
            isPhone = /(?:iPhone)/.test(ua) && !isTablet,
            isPc = !isPhone && !isAndroid && !isSymbian && !isTablet;

        return {
            isTablet: isTablet,
            isPhone: isPhone,
            isAndroid: isAndroid,
            isPc: isPc
        };
    }

    async function getQuestionDetail() {
        const questionId = query.get('id') || undefined;
        if (!questionId) return;
        setQuestionId(questionId);
        const response = await questions.getQuestionDetail({id: questionId});
        if (!response.feedback) return;
        const {likeTimes, dislikeTimes} = response.feedback;
        const max = landscapeMode ? 9999 : 999;
        setFeedback({
            smile: likeTimes > max ? `${max}+` : likeTimes,
            frown: dislikeTimes > max ? `${max}+` : dislikeTimes
        });
    }

    function submitFeedback(params: any, callback?: Function) {
        questions.submitFeedback({id: questionId, ...params}).then(() => {
            // if (data === 'success') {
            //     getQuestionDetail();
            //     callback && callback();
            // }
            getQuestionDetail().then();
            callback && callback();
        });
    }

    async function submitComment(comment: string, target: HTMLTextAreaElement) {
        if (!comment) return;
        target.blur();
        await new Promise(resolve => setTimeout(resolve, 200));
        setCommentVisible(false);
        setCollectionVisible(true);
        try {
            //@ts-ignore
            collectionPlayer.startAnimation();
        } catch (e) {
            console.error(e.message);
        }

        const {tag, player} = playerItems.comment;
        if (!tag) {
            try {
                player.startAnimation();
            } catch (e) {
                console.error(e.message);
            }
            playerItems.comment.tag = true;
        }

        submitFeedback({comment});
    }

    function handleDislike() {
        if (lock) return;
        setLock(true);
        const {tag, player} = playerItems.frown;
        if (tag) {
            try {
                player.stepToPercentage(0);
            } catch (e) {
                console.error(e.message);
            }
        } else {
            try {
                player.startAnimation();
            } catch (e) {
                console.error(e.message);
            }
            effectSound.frown.play();
        }

        playerItems.frown.tag = !tag;
        submitFeedback(
            {
                dislike: playerItems.frown.tag ? 1 : -1,
                like: -smileCount
            },
            async () => {
                await new Promise(resolve => setTimeout(resolve, 600));
                setLock(false);
            }
        );

        if (smileCount) {
            try {
                playerItems.smile.player.stepToPercentage(0);
            } catch (e) {
                console.error(e.message);
            }
            setSmileCount(0);
        }
    }

    function handleLike(num: number = 1) {
        const questionId = query.get('id');
        const {tag, player} = playerItems.frown;
        submitFeedback({
            like: num,
            dislike: tag ? -1 : 0,
            id: questionId
        });

        if (tag) {
            try {
                player.stepToPercentage(0);
            } catch (e) {
                console.error(e.message);
            }
            playerItems.frown.tag = false;
        }
    }

    function handleSmile(num: number, total: number) {
        if (!num) return;
        const {player} = playerItems.smile;
        playerItems.smile.tag = true;

        try {
            player.startAnimation();
        } catch (e) {
            console.error(e.message);
        }
        setSmileCount(total);
        handleLike(num);
    }

    function likeHandler() {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            isPress = true;
            setFireVisible(true);
            // effectSound.smile2.load();
            effectSound.smile2.loop = true;
            await effectSound.smile2.play();
            pageEvent.emit('firePlay', smileCount);
        }, 600);
    }

    function likeEvent() {
        clearTimeout(timeout);
        const tag = smileCount >= 10;

        if (isPress) {
            setFireVisible(false);
            isPress = false;
            effectSound.smile2.pause();
            effectSound.smile2.loop = false;
            pageEvent.emit('fireStop');
        } else {
            const {player} = playerItems.smile;
            setFireVisible(true);

            try {
                player.startAnimation();
            } catch (e) {
                console.error(e.message);
            }
            playerItems.smile.tag = true;
            effectSound.smile.load();
            effectSound.smile.play();
            pageEvent.emit('fireOnce', smileCount + 1);

            if (!tag) setSmileCount(smileCount + 1);

            timeout = setTimeout(() => {
                setFireVisible(false);
            }, 1500);

            if (tag) return;
            handleLike();
        }
    }

    function onSetLikeHandler() {
        if (!isPc) return;

        likeHandler();

        const handleMouseup = () => {
            document.removeEventListener('mouseup', handleMouseup);
            likeEvent();
        };

        document.addEventListener('mouseup', handleMouseup);
    }

    // 判断底部返回按钮是否显示
    const shouldShowBackButton = useMemo(() => {
        // @ts-ignore
        return navigator.userAgent.includes('dm-ait-flutter') || window.dm || props.hasPgs;
    }, [props.hasPgs]);

    return (
        <Slide in={landscapeMode || (visible && props.info.paused)} direction={landscapeMode ? 'left' : 'up'}>
            <div className={`${classes.root} d-flex align-center`}>
                {!landscapeMode && shouldShowBackButton ? (
                    <div className={`${classes.back} d-flex align-center`} onClick={() => back()}>
                        <ArrowBackIosRoundedIcon style={{fontSize: 'inherit'}} />
                    </div>
                ) : (
                    <div className={'d-flex align-center'} />
                )}

                <div className={`d-flex`}>
                    <div className={`${classes.fireContain}`}>
                        <Fire handleSmile={handleSmile} />
                    </div>

                    <div className={`${classes.svgBox} d-flex align-center`}>
                        <div
                            className={`${classes.svgIcon}`}
                            ref={smileRef}
                            onMouseDown={() => onSetLikeHandler()}
                            onTouchStart={() => likeHandler()}
                            onTouchEnd={() => likeEvent()}
                        />
                        {!!feedback.smile && <div className={`${classes.count} ios-count`}>{feedback.smile}</div>}
                    </div>

                    <div className={`${classes.svgBox} d-flex align-center`}>
                        <div className={`${classes.svgIcon}`} ref={frownRef} onClick={() => handleDislike()} />
                        {!!feedback.frown && <div className={`${classes.count} ios-count`}>{feedback.frown}</div>}
                    </div>

                    <div className={`${classes.svgBox} d-flex align-center`}>
                        <div
                            className={`${classes.svgIcon}`}
                            ref={commentRef}
                            onClick={() => {
                                setCommentVisible(true);
                                effectSound.comment.play();
                            }}
                        />
                    </div>
                </div>

                {commentVisible && <Comment hide={() => setCommentVisible(false)} submit={submitComment} landscapeMode={landscapeMode} />}

                <div className={`${classes.collectionContain}`} style={{opacity: collectionVisible ? 1 : 0}}>
                    <div className={`${classes.collection}`} ref={targetRef} />
                    <div className={`${classes.text}`}>
                        已发送
                        <br />
                        感谢反馈
                    </div>
                </div>
            </div>
        </Slide>
    );
};

export default connectInfoStore<any>(BottomPanel) as React.FunctionComponent<{
    swipeTarget: HTMLElement | null;
    showPgsChoose?: Function;
    hasPgs?: boolean;
}>;
