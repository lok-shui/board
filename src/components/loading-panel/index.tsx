import React, {useEffect, useRef, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
// import SVGA from 'svgaplayerweb';

const useStyles = makeStyles((theme: Theme) => {
    const isDark = theme.palette.type === 'dark';
    return createStyles({
        root: {
            position: 'relative',
            width: '100%',
            height: 30,
            paddingLeft: 15,
            color: '#ffffff'
        },
        writing: {
            position: 'relative',
            width: 30,
            height: 30
        },
        text: {
            position: 'relative',
            height: 23,
            lineHeight: '23px',
            // marginLeft: 5,
            letterSpacing: 1,
            color: isDark ? '#909092' : '#bfbfbf'
        },
        dotContain: {
            color: isDark ? '#909092' : '#bfbfbf',
            height: 26
        }
    });
});

export default (props: any) => {
    const classes = useStyles();
    // const loadingRef = useRef(null);

    // useEffect(() => {
    //     const target = (loadingRef.current as unknown) as HTMLDivElement;
    //     const player = new SVGA.Player(target);
    //     const parser = new SVGA.Parser();
    //     player.loops = 0;

    //     parser.load(`/svga/HIL_Loading02.svga`, (videoItem: any) => {
    //         player.setVideoItem(videoItem);
    //         player.startAnimation();
    //     });
    // }, []);

    return (
        <div className={`${classes.root} d-flex align-end`}>
            {/* <div className={`${classes.writing}`} ref={loadingRef}></div> */}
            <div className={`${classes.text}`}>正在加载</div>
            <div className={`dot-contain ${classes.dotContain}`}>
                <span className={`dotting`}></span>
            </div>
        </div>
    );
};
