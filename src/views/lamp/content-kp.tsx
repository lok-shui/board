import React, {useEffect, useRef} from 'react';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {showMathMl} from '@/utils';

const useStyles = makeStyles((theme: Theme) => {
    const isDark = theme.palette.type === 'dark';

    return createStyles({
        root: {
            // padding: '0 10px',
            padding: '0 20px',
            // background: theme.palette.type === 'dark' ? 'rgba(69,69,69,0.3)' : 'rgba(232,232,232,0.3)',
            background: theme.palette.type === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(232,232,232,0.3)',
            // borderRadius: '15px',
            borderRadius: '25px',
            // color: isDark ? 'rgba(158,158,158,1)' : 'rgba(174,174,174,1)',
            color: isDark ? 'rgba(255,255,255,1)' : 'rgba(174,174,174,1)',
            // height: 32,
            // fontSize: 17,
            height: 50,
            fontSize: 30,
            // lineHeight: '24px',
            lineHeight: '50px',
            fontWeight: 400,
            maxWidth: '100%'
        }
    });
});

declare var MathJax: any;

export default (props: {data: TextContent}) => {
    const classes = useStyles();
    const $el = useRef(null);

    useEffect(() => {
        showMathMl($el.current);
        setTimeout(() => props.data.done.run(), 300);
    }, [props.data]);

    return (
        <div className={`${classes.root} mt-1 d-flex align-center`}>
            <div className="text-truncate" ref={$el} dangerouslySetInnerHTML={{__html: props.data.text}} />
        </div>
    );
};
