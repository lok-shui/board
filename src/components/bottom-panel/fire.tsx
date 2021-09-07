import React, {useEffect, useState, useRef} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import SVGA from 'svgaplayerweb';
import axios from '@/api/axios';
import pageEvent from '@/utils/event';

const useStyles = makeStyles(() => {
    return createStyles({
        root: {
            position: 'relative',
            width: 280,
            height: 280
        },
        canvas: {
            position: 'relative',
            transformOrigin: '0 0'
        },
        svgaCount: {
            position: 'absolute',
            width: 110,
            height: 60,
            top: 'calc(50% + 40px)',
            left: 'calc(50% - 55px)',
            '&.hidden': {
                top: 'calc(50% + 250px)'
            }
        },
        countWave: {
            animation: 'countWave .4s cubic-bezier(0.37, 0, 0.63, 1) infinite'
        },
        countWave2: {
            animation: 'countWave2 .8s cubic-bezier(0.37, 0, 0.63, 1)',
            transformOrigin: 'center center'
        }
    });
});

const svgList = [
    require('@/assets/svg-fire/Shape_explode-01.svg'),
    require('@/assets/svg-fire/Shape_explode-02.svg'),
    require('@/assets/svg-fire/Shape_explode-03.svg'),
    require('@/assets/svg-fire/Shape_explode-04.svg'),
    require('@/assets/svg-fire/Shape_explode-05.svg'),
    require('@/assets/svg-fire/Shape_explode-06.svg'),
    require('@/assets/svg-fire/Shape_explode-07.svg')
];

let myPlayer: any;
let myInterval: any;
let myTimeout: any;
let images: Array<any>[] = [];
let animateEls: any[] = [];
let frame: number = 0;
let countStart: number = 0;
let stopTag: boolean = true;

const random = (num: number) => Math.floor(Math.random() * num);

export default (props: any) => {
    const classes = useStyles();
    const [style, setStyle] = useState({});
    const [countVisible, setCountVisible] = useState(false);
    // const [stopTag, setStopTag] = useState(false);
    const [waveMode, setWaveMode] = useState('');

    const fireRef = useRef(null);
    const canvasRef = useRef(null);
    const countRef = useRef(null);

    useEffect(() => {
        const el = (fireRef.current as unknown) as HTMLDivElement;
        setStyle({
            transform: `scale(${el.clientWidth / 250})`
        });

        pageEvent.on('fireOnce', num => {
            once(num);
        });

        pageEvent.on('firePlay', num => {
            startRandom();
            fire();
            play(num);
        });

        pageEvent.on('fireStop', num => {
            stop();
        });

        init();
    }, []);

    function init() {
        let domEls: HTMLElement[] = [];
        const target = (countRef.current as unknown) as HTMLDivElement;
        const player = new SVGA.Player(target);
        const parser = new SVGA.Parser();
        player.loops = 1;
        myPlayer = player;

        player.onFinished(() => {
            player.stepToPercentage(1);
        });

        //@ts-ignore
        player.onFrame((f: number) => {
            frame = f;
        });

        parser.load(`/svga/NuLike.svga`, (videoItem: any) => {
            player.setVideoItem(videoItem);
            player.stepToFrame(0);
        });

        Promise.all(
            svgList.map(svg => {
                return new Promise(async (resolve, reject) => {
                    const response = (await axios.get(svg, {baseURL: ''})) as string;
                    const el = document.createElement('div');
                    el.innerHTML = response;
                    domEls.push(el);
                    resolve();
                });
            })
        ).then(() => {
            initImages(domEls);
        });
    }

    function initImages(domEls: HTMLElement[]) {
        const colors = ['#f42f60', '#f9c813', '#7dc69c', '#caad83', '#f22126', '#0d8cbf', '#03b404'];
        domEls.forEach((el, index) => {
            for (let i = 0; i < 7; i++) {
                const path = (el.querySelector('path') || el.querySelector('polygon')) as SVGPathElement;
                if (!path) return;
                path.setAttribute('fill', colors[i]);
                const img = new Image(30, 30);
                img.onload = () => {
                    if (!images[index]) images[index] = [];
                    const start = [120, 240];
                    const tag = random(2) % 2 === 0 ? 1 : -1;
                    const end = [120 + random(100) * tag, tag < 0 ? random(150) + 30 : random(120) + 50];
                    const progressList = [];
                    for (let i = 1; i <= 25; i++) {
                        const percent = (i / 25) * 100;
                        const point = getPoint(start, end, 0.15, percent);
                        progressList.push(point);
                    }

                    images[index].push({
                        img,
                        progressList,
                        start,
                        end
                    });
                };
                img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(el.innerHTML)))}`;
            }
        });
    }

    function randomImage(length: number) {
        if (!images.length) return;
        const startTime = performance.now();
        for (let i = 0; i < length; i++) {
            const index1 = random(images.length);
            const target = images[index1];
            const index2 = random(target.length);
            // const img = target[index2].img;
            // const start = [120, 240];
            // const tag = random(2) % 2 === 0 ? 1 : -1;
            // const end = [120 + random(100) * tag, tag < 0 ? random(150) + 30 : random(120) + 50];
            const size = random(8) + 10;
            const {img, progressList, start, end} = target[index2];

            const item = {
                img,
                startTime,
                start,
                end,
                size,
                progressList,
                isOver: false
            };
            animateEls.push(item);
        }
    }

    function startRandom() {
        myInterval = setInterval(() => {
            const length = random(4) + 6;
            randomImage(length);
        }, 200);
    }

    function getPoint(start: number[], end: number[], curviness: number, percent: number) {
        const cp = [(start[0] + end[0]) / 2 - (start[1] - end[1]) * curviness, (start[1] + end[1]) / 2 - (end[0] - start[0]) * curviness];

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const t = easeOutCubic(percent / 100);

        const p0 = start;
        const p1 = cp;
        const p2 = end;

        const v01 = [p1[0] - p0[0], p1[1] - p0[1]];
        const v12 = [p2[0] - p1[0], p2[1] - p1[1]];

        const q0 = [p0[0] + v01[0] * t, p0[1] + v01[1] * t];
        const q1 = [p1[0] + v12[0] * t, p1[1] + v12[1] * t];

        const v = [q1[0] - q0[0], q1[1] - q0[1]];

        const b = [q0[0] + v[0] * t, q0[1] + v[1] * t];

        return b;
    }

    function fire() {
        // setStopTag(false);
        stopTag = false;
        let tag = false;
        const canvas = (canvasRef.current as unknown) as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        //currentTime: number
        const animate = (currentTime: number) => {
            ctx.clearRect(0, 0, 250, 250);
            animateEls.forEach(item => {
                // const {img, startTime, start, end, size, progressList} = item;
                // const time = currentTime - startTime;
                // const percent = Math.min(Math.floor((time * 100) / 420), 100);
                // const coordinate = getPoint(start, end, 0.15, percent);

                const {img, size, progressList, startTime} = item;
                const time = (currentTime - startTime) * 100;
                const percent = Math.min(Math.floor(time / 420), 100);
                const index = Math.floor(percent / 4) - 1;
                const coordinate = progressList[index < 0 ? 0 : index];

                const [x, y] = coordinate;
                ctx.globalAlpha = percent <= 70 ? 1 : (100 - percent) / 30;
                ctx.drawImage(img, x, y, size, size);

                if (percent === 100) {
                    item.isOver = true;
                    tag = true;
                }
            });

            if (tag) {
                animateEls = animateEls.filter(item => !item.isOver);
                tag = false;
            }

            if (stopTag) {
                return;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        // animate()
    }

    function once(count: number) {
        if (!count) return;
        clearTimeout(myTimeout);
        myPlayer.stepToFrame(1 + (count - 1) * 6);
        setWaveMode('click');
        setCountVisible(true);
        // if (!animateEls.length) randomImage(16);
        if (animateEls.length > 36) animateEls.splice(0, 12);
        randomImage(12);
        if (stopTag) fire();
        myTimeout = setTimeout(() => {
            clearTimeout(myTimeout);
            clearInterval(myInterval);
            setCountVisible(false);
            // setStopTag(true);
            stopTag = true;
            setWaveMode('');
        }, 600);
    }

    async function play(count: number) {
        setWaveMode('press');
        await new Promise(resolve => setTimeout(resolve, 200));
        setCountVisible(true);
        countStart = count;
        const startFrame = 1 + count * 6;

        try {
            myPlayer.startAnimationWithRange({location: startFrame, length: 55 - startFrame});
        } catch (e) {
            console.error(e.message);
        }
    }

    function stop() {
        clearInterval(myInterval);
        // setStopTag(true);
        stopTag = true;
        animateEls = [];
        myPlayer.pauseAnimation();
        setCountVisible(false);
        setWaveMode('');
        const total = Math.floor((frame - 1) / 6) + 1;
        const count = total - countStart;
        props.handleSmile(count, total);
    }

    return (
        <div className={`${classes.root}`} ref={fireRef}>
            <canvas style={style} className={`${classes.canvas}`} width="250" height="250" ref={canvasRef} />
            <div
                className={`${classes.svgaCount} ${countVisible ? '' : 'hidden'} ${waveMode === 'press' && classes.countWave} ${
                    waveMode === 'click' && classes.countWave2
                }`}
                ref={countRef}
            />
        </div>
    );
};
