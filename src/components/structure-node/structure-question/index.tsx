import React, {useEffect, useMemo, useRef} from 'react';
import {PGNode} from '@/types/instruction';
import {ContentText} from '../../content-node';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';
import {color, RGBColor} from 'd3-color';

const useStyles = makeStyles((theme: Theme) => {
    const dimColor = color(theme.palette.text.primary) as RGBColor;
    dimColor.opacity = 0.25;

    const lampColor = color(theme.palette.text.primary) as RGBColor;
    lampColor.opacity = 0.85;

    return createStyles({
        root: {
            padding: '8px 15px',
            transition: 'opacity 500ms',
            color: theme.palette.text.primary
        },
        dim: {
            // opacity: 0.25
            color: dimColor.toString()
        },
        rootLand: {
            padding: '10px 20px 50px 20px'
        },
        lampRoot: {
            paddingTop: 180,
            color: lampColor.toString()
        }
    });
});

const StructureQuestion = (props: {data: PGNode} & any) => {
    const content = props.data.content;
    const classes = useStyles();
    const nodeRef = useRef(null);

    const isCurrent = useMemo(() => {
        if (!props.info.navPoints || !props.info.navPoints.length) return false;
        const activeNav = props.info.navPoints.find((node: PGNode) => node.currentStep);

        return activeNav && activeNav.name === '题目';
    }, [props.info.navPoints]);

    useEffect(() => {
        props.data.$el = (nodeRef.current as unknown) as HTMLElement;
    }, [props.data]);

    return (
        <div
            ref={nodeRef}
            className={`structure-question ${classes.root} ${
                !props.info.isLamp && !props.info.paused && (!props.info.guideRead ? !isCurrent : true) && classes.dim + ' dim'
            } ${props.info.paused || isCurrent ? 'paused' : ''} ${props.info.landscapeMode && classes.rootLand} ${
                props.info.isLamp && classes.lampRoot
            }`}>
            {content && <ContentText data={props.data.content as TextContent} />}
        </div>
    );
};

export default connectInfoStore<any>(StructureQuestion) as any;
