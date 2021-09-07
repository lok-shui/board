import React, {useEffect, useRef, useState} from 'react';
import aitAudio from './ait-audio';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import SVGA from 'svgaplayerweb';
import store from '@/store';
import {theme} from '@/index';
import {async} from 'rxjs';

const useStyles = makeStyles((theme: Theme) => {
    const landscapeMode = store.getState().info.landscapeMode;
    const isDark = theme.palette.type === 'dark';

    return createStyles({
        root: {
            background: theme.palette.type === 'dark' ? 'rgba(69,69,69,0.85)' : 'rgba(232,232,232,0.85)',
            borderRadius: '50%',
            padding: 3,
            [landscapeMode && theme.breakpoints.up('sm')]: {
                background: 'none',
                width: '100%',
                height: '100%',
                padding: 0
            }
        },
        icon: {
            height: '18px',
            width: '18px',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                width: 24,
                height: 24
            }
        },
        changeContain: {
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
            '&.animate': {
                animation: 'tickFadeIn 0.2s cubic-bezier(0.65, 0, 0.35, 1)'
            }
        },
        tick: {
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

export default (props: any) => {
    const [muted, setMuted] = useState(aitAudio.muted);
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [first, setFirst] = useState(true);
    const [changeVisible, setVisible] = useState(false);
    const [tickPlayer, setTickPlayer] = useState(null);
    const targetRef = useRef(null);
    const tickRef = useRef(null);
    const classes = useStyles();

    /**
     * 监听静音状态
     */
    useEffect(() => {
        audioPlayer && (muted ? audioOff(audioPlayer) : audioOn(audioPlayer));
        if (first) setFirst(false);
        else {
            setVisible(true);
            try {
                //@ts-ignore
                tickPlayer && tickPlayer.startAnimation();
            } catch (e) {
                console.error(e.message);
            }
        }
    }, [muted]);

    /**
     * 初始化播放事件
     */
    useEffect(() => {
        const audioPlayer = loadIcon();
        setAudioPlayer(audioPlayer as any);

        aitAudio.onPlay(() => {
            if (!aitAudio.muted) audioPlaying(audioPlayer);
        });
        aitAudio.onPause(() => {
            if (!aitAudio.muted) audioPaused(audioPlayer);
        });
    }, []);

    useEffect(() => {
        const player = loadTick();
        setTickPlayer(player as any);
    }, []);

    /**
     * 加载按钮图标
     */
    function loadIcon() {
        const audioBtn = (targetRef.current as unknown) as HTMLDivElement;
        let player = new SVGA.Player(audioBtn);
        let parser = new SVGA.Parser();

        parser.load(theme.palette.type === 'dark' ? '/svga/bugle.svga' : '/svga/bugle_W.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.loops = 1;
            player.stepToFrame(11);
        });

        return player;
    }

    /**
     * tick svga加载
     */
    function loadTick() {
        const tickBtn = (tickRef.current as unknown) as HTMLDivElement;
        let player = new SVGA.Player(tickBtn);
        let parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(async () => {
            player.stepToPercentage(1);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setVisible(false);
        });

        parser.load('/svga/tick.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.stepToFrame(0);
        });

        return player;
    }

    return (
        <div
            style={{...props.style}}
            className={`${props.className} ${classes.root} d-flex justify-center align-center`}
            onClick={() => {
                aitAudio.muted = !aitAudio.muted;
                setMuted(aitAudio.muted);
            }}>
            <div className={classes.icon} ref={targetRef} />

            <div className={`${classes.changeContain} ${changeVisible && 'animate'}`} style={{opacity: changeVisible ? 1 : 0}}>
                <div className={`${classes.tick}`} ref={tickRef} />
                <div className={`${classes.text}`}>
                    已切换
                    <br />
                    {!muted ? '听讲模式' : '查阅模式'}
                </div>
            </div>
        </div>
    );
};

/**
 * 点击播放逻辑
 */
function audioOn(audioPlayer: any) {
    audioPlayer.loops = 1;

    audioPlayer.onFinished(() => {
        audioPlayer.stepToFrame(11);
    });

    try {
        audioPlayer.startAnimationWithRange({location: 0, length: 11});
    } catch (e) {
        console.error(e.message);
    }

    if (aitAudio.audio && !aitAudio.audio.paused) {
        audioPlaying(audioPlayer);
    }
}

/**
 * 点击暂停逻辑
 */
function audioOff(audioPlayer: any) {
    audioPlayer.loops = 1;

    audioPlayer.onFinished(() => {
        audioPlayer.stepToFrame(0);
    });

    try {
        audioPlayer.startAnimationWithRange({location: 11, length: 10});
    } catch (e) {
        console.error(e.message);
    }
}

function audioPlaying(audioPlayer: any) {
    audioPlayer.loops = 0;

    try {
        audioPlayer.startAnimationWithRange({location: 35, length: 20});
    } catch (e) {
        console.error(e.message);
    }
}

function audioPaused(audioPlayer: any) {
    try {
        audioPlayer.stepToFrame(10);
    } catch (e) {
        console.error(e.message);
    }
}
