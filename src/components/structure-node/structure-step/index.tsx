import React from 'react';
import StructureNode from '../structure-node';
import {PGNode} from '@/types/instruction';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {ContentText} from '../../content-node';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';
import {color, RGBColor} from 'd3-color';

const useStyles = makeStyles((theme: Theme) => {
    const dimColor = color(theme.palette.text.primary) as RGBColor;
    dimColor.opacity = 0.25;

    return createStyles({
        root: {
            position: 'relative',
            marginBottom: '12px',
            '& > .content-text': {
                lineHeight: 2.5,
                fontWeight: 'bold'
            }
        },
        lampRoot: {
            marginBottom: 30,
            paddingTop: 90,
            // paddingBottom: 30,
            paddingBottom: 0,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none'
            },
            '& > .content-text': {
                fontWeight: 'normal'
            }
        },
        dim: {
            // color: theme.palette.text.secondary,
            // filter: 'opacity(0.25)'
            color: dimColor.toString(),
            '& img': {
                opacity: 0.25
            },
            '& canvas': {
                opacity: 0.25
            }
        }
    });
});

const StructureStep = (props: {data: PGNode} & any) => {
    const stepContent = props.data.content as TextContent;
    const children = props.data.children || [];
    const classes = useStyles();
    const isActive =
        props.data.currentStep ||
        (props.data.parent && props.data.parent.name === '元信息' && props.data.parent.currentStep) ||
        (props.data.parent.parent && props.data.parent.parent.name === '元信息' && props.data.parent.parent.currentStep);

    return (
        // <div
        //     className={`${classes.root} ${!isActive && !props.info.paused && classes.dim} ${props.info.isLamp && classes.lampRoot}`}
        //     style={{minHeight: props.info.isLamp ? `${height - 90}px` : 'auto'}}>
        //     {stepContent && <ContentText data={stepContent} />}

        //     {children.map((node: PGNode) => (
        //         <StructureNode key={node.pathName} data={node} />
        //     ))}
        // </div>

        <div
            className={`${classes.root} ${!props.info.isLamp && !isActive && !props.info.paused && classes.dim}  ${
                !props.info.isLamp && !isActive && !props.info.paused && 'dim'
            } ${props.info.isLamp && classes.lampRoot}`}>
            {stepContent && <ContentText data={stepContent} />}

            {children.map((node: PGNode) => (
                <StructureNode key={node.pathName} data={node} />
            ))}
        </div>
    );
};

export default connectInfoStore<any>(StructureStep) as any;
