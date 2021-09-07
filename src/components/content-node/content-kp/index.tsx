import React, {useEffect, useMemo, useRef} from 'react';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {makeStyles, Theme, createStyles, withStyles} from '@material-ui/core/styles';
import {showMathMl} from '@/utils';
import Tooltip from '@material-ui/core/Tooltip';

const HtmlTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: theme.palette.type === 'dark' ? 'rgba(69,69,69,0.85)' : 'rgba(232,232,232,0.85)',
        color: theme.palette.text.primary,
        margin: '0.75rem 0'
    },

    arrow: {
        color: theme.palette.type === 'dark' ? 'rgba(69,69,69,0.85)' : 'rgba(232,232,232,0.85)'
    }
}))(Tooltip);

const useStyles = makeStyles((theme: Theme) => {
    const isDark = theme.palette.type === 'dark';

    return createStyles({
        root: {
            padding: '0 10px',
            background: theme.palette.type === 'dark' ? 'rgba(69,69,69,0.85)' : 'rgba(232,232,232,0.85)',
            borderRadius: '15px',
            color: isDark ? 'rgba(158,158,158,1)' : 'rgba(174,174,174,1)',
            height: 24,
            fontSize: 14,
            lineHeight: '24px',
            fontWeight: 400,
            maxWidth: '100%',
            '&.tencent': {
                fontSize: 24,
                lineHeight: '48px',
                height: 48,
                padding: '0 15px',
                borderRadius: 24
            }
        }
    });
});

declare var MathJax: any;

export default (props: {data: TextContent}) => {
    const classes = useStyles();
    const $el = useRef(null);

    const tip = useMemo(() => {
        const html = document.createElement('span');
        html.innerHTML = props.data.text;
        showMathMl(html);

        return html.innerHTML;
    }, [props.data.text]);

    useEffect(() => {
        showMathMl($el.current);
        setTimeout(() => props.data.done.run(), 300);
    }, [props.data]);

    return (
        //@ts-ignore
        <div className={`${classes.root} mt-1 d-flex align-center ${props.tencentMode && 'tencent'}`}>
            <HtmlTooltip arrow={true} title={<span dangerouslySetInnerHTML={{__html: tip}} />} placement="top" enterTouchDelay={0}>
                <div className="text-truncate" ref={$el} dangerouslySetInnerHTML={{__html: props.data.text}} />
            </HtmlTooltip>
        </div>
    );
};
