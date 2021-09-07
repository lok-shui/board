import React, {useEffect, useState} from 'react';
import {PGNode} from '@/types/instruction';
import StructureNode from '@/components/structure-node/structure-node';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Typography from '@material-ui/core/Typography';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';

import store from '@/store';

const useStyles = makeStyles((theme: Theme) => {
    const landscapeMode = store.getState().info.landscapeMode;

    return createStyles({
        root: {
            borderRadius: `0!important`,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`
        },
        summary: {
            height: '45px',
            minHeight: '45px!important',
            padding: '0 15px',
            position: 'relative',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                padding: '0 20px'
            }
        },
        detail: {
            padding: '0 15px 8px',
            [landscapeMode && theme.breakpoints.up('sm')]: {
                padding: '0 20px 8px'
            }
        },
        tag: {
            position: 'absolute',
            background: '#51A0FF',
            left: 0,
            // top: '50%',
            top: 'calc(50% - 8px)',
            // transform: 'translateY(-50%)',
            // height: '16px',
            height: '1rem',
            width: '4px'
        },
        dim: {
            // color: theme.palette.text.secondary,
            filter: 'opacity(0.25)'
        },
        noBg: {
            backgroundColor: 'transparent'
        }
    });
});

const StructureStep = (props: {data: PGNode} & any) => {
    const children = (props.data.children || []) as PGNode[];
    const show = props.data.show && props.data.visible;
    const classes = useStyles();
    const [expanded, setExpanded] = useState(true);
    const isActive = props.data.children.some((node: PGNode) => node.currentStep);

    useEffect(() => {
        props.data.$open = () => setExpanded(true);
    }, []);

    return (
        <Accordion
            onChange={() => setExpanded(!expanded)}
            expanded={expanded}
            style={{display: show ? undefined : 'none'}}
            className={`${classes.root} ${props.info.tencentMode && classes.noBg}`}>
            <AccordionSummary
                className={classes.summary}
                expandIcon={<ExpandMoreRoundedIcon />}
                aria-label="Expand"
                aria-controls={props.data.pathName + '-content'}
                id={props.data.pathName + '-header'}>
                <div className={classes.tag}></div>
                <Typography className={`${!isActive && !props.info.paused && classes.dim} ios-collapse-title`}>
                    {props.data.name}
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={`flex-column ${classes.detail}`}>
                {children.map(node => (
                    <StructureNode key={node.pathName} data={node} />
                ))}
            </AccordionDetails>
        </Accordion>
    );
};

export default connectInfoStore<any>(StructureStep) as any;
