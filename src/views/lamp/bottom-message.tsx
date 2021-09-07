import React, {useEffect, useRef, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {messageEvent} from './message.event';
import {color, RGBColor} from 'd3-color';
import {showMathMl} from '@/utils';
import Slide from '@material-ui/core/Slide';

const useStyles = makeStyles((theme: Theme) => {
    const gradient = color(theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)') as RGBColor;
    gradient.opacity = 0.25;

    return createStyles({
        root: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            // padding: 25,
            paddingLeft: 25,
            height: 100,
            // lineHeight: '70px',
            // background: theme.palette.background.default
            background: gradient.toString(),
            fontSize: '1.5rem',
            zIndex: 19
        },
        inner: {
            position: 'relative',
            width: '100%',
            // height: '100%',
            height: 70,
            overflow: 'hidden'
        },
        messageContain: {
            transition: 'transform .3s ease-in-out',
            width: '100%'
        },
        messageItem: {
            height: 70,
            lineHeight: '70px'
        }
    });
});

let myMessage: any[] = [];
export default (props: any) => {
    const classes = useStyles();
    const [message, setMessage] = useState([] as any[]);

    useEffect(() => {
        messageEvent.on('message', data => {
            let _data = {
                html: '',
                id: (myMessage.length + 1).toString()
            };
            if (isMathML(data)) {
                const el = document.createElement('div');
                //@ts-ignore
                el.appendChild(MathJax.mathml2chtml(data));
                _data.html = el.innerHTML;
            } else {
                _data.html = data;
            }
            myMessage.push(_data);
            setMessage([...myMessage]);
        });

        messageEvent.on('message-clear', () => {
            myMessage = [];
            setMessage([...myMessage]);
        });

        return () => {
            messageEvent.removeListener('message');
            messageEvent.removeListener('message-clear');
        };
    }, []);

    function isMathML(content: string) {
        return /^<math(.|\n|\r)*<\/math>$/.test(content);
    }

    // return <div className={`${classes.root}`} dangerouslySetInnerHTML={{__html: message}}></div>;
    return (
        <Slide in={props.visible && !!message.length} direction={'up'}>
            <div className={`${classes.root}`}>
                <div className={`${classes.inner}`}>
                    <div className={`${classes.messageContain}`} style={{transform: `translateY(${(message.length - 1) * -70}px)`}}>
                        {message.map(data => (
                            <div className={`${classes.messageItem}`} dangerouslySetInnerHTML={{__html: data.html}} key={data.id} />
                        ))}
                    </div>
                </div>
            </div>
        </Slide>
    );
};
