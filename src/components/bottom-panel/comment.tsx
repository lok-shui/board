import React, {useEffect, useState, useRef} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {color, RGBColor} from 'd3-color';
import commentBg from '@/assets/images/comment_bg.png';
import commentBgW from '@/assets/images/comment_bg_W.png';
import store from '@/store';

const useStyles = makeStyles((theme: Theme) => {
    const isDark = theme.palette.type === 'dark';
    const background = color(isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)') as RGBColor;
    background.opacity = 0.25;

    const landscapeMode = store.getState().info.landscapeMode;

    return createStyles({
        root: {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99
        },
        bg: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: background.toString(),
            [landscapeMode && theme.breakpoints.up('sm')]: {
                backgroundColor: 'rgba(0, 0, 0, 0.65)'
            }
        },
        commentBg: {
            width: '100%',
            height: 346,
            backgroundSize: '100% 100%',
            marginTop: -27,
            position: 'relative',
            paddingTop: 57,
            paddingLeft: 12,
            paddingRight: 12,
            backgroundImage: `url(${isDark ? commentBg : commentBgW})`,
            // transition: '.3s cubic-bezier(0.65, 0, 0.35, 1)',
            '&.fadeIn': {
                animation: 'fadeInDown 0.3s cubic-bezier(0.65, 0, 0.35, 1)'
            },
            '& @keyframes fadeInDown': {
                '0%': {
                    marginTop: -375
                },
                '100%': {
                    marginTop: -27
                }
            },
            [landscapeMode && theme.breakpoints.up('sm')]: {
                width: 380,
                height: 220,
                margin: '5% auto 0',
                padding: '20px 25px 0',
                backgroundImage: 'none',
                backgroundColor: isDark ? '#353639' : '#ffffff',
                borderRadius: 8
            }
        },
        title: {
            lineHeight: '22px',
            height: 22,
            color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                display: 'flex',
                alignItem: 'center',
                justifyContent: 'space-between'
            }
        },
        textarea: {
            width: '100%',
            height: 130,
            borderRadius: 2,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.09)'}`,
            marginTop: 16,
            backgroundColor: 'transparent',
            resize: 'none',
            outline: 'none',
            padding: 5,
            color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.85)',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                height: 80
            }
        },
        submit: {
            marginTop: 20,
            width: '100%',
            height: 32,
            borderRadius: 2,
            backgroundColor: '#51A0FF',
            color: '#ffffff'
        },
        close: {
            color: '#51A0FF'
        }
    });
});

export default (props: any) => {
    const classes = useStyles();

    const inputRef = useRef(null);

    useEffect(() => {
        ((inputRef.current as unknown) as HTMLTextAreaElement).focus();
    }, []);

    function submit() {
        const target = (inputRef.current as unknown) as HTMLTextAreaElement;
        const comment = target.value;
        props.submit(comment, target);
    }

    function close() {
        ((inputRef.current as unknown) as HTMLTextAreaElement).blur();
        props.hide();
    }

    return (
        <div className={`${classes.root}`}>
            <div className={`${classes.bg}`} onClick={props.hide}></div>
            <div className={`${classes.commentBg} fadeIn`}>
                <div className={`${classes.title}`}>
                    <span>反馈建议:</span>
                    {props.landscapeMode && (
                        <span className={`${classes.close}`} onClick={() => close()}>
                            关闭
                        </span>
                    )}
                </div>
                <textarea className={`${classes.textarea}`} ref={inputRef} />
                <div className={`${classes.submit} d-flex align-center justify-center`} onClick={() => submit()}>
                    提 交
                </div>
            </div>
        </div>
    );
};
