import React, {useEffect, useRef, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';
import {PGNode} from '@/types/instruction';
import {color, RGBColor} from 'd3-color';

const useStyles = makeStyles((theme: Theme) => {
    const isDark = theme.palette.type === 'dark';
    const navPointColor = isDark ? 'rgba(180,180,180,1)' : 'rgba(179,179,179,1)';
    const navPointDisabled = isDark ? 'rgba(112,112,112,1)' : 'rgba(220,220,220,1)';
    const navPointActive = isDark ? 'rgba(255,255,255,1)' : 'rgba(114,114,114,1)';

    return createStyles({
        root: {
            position: 'fixed',
            right: 20,
            // top: '50%',
            // transform: 'translateY(-50%)'
            bottom: 104,
            zIndex: 19
        },
        navPoint: {
            position: 'relative',
            height: 1,
            width: 1,
            marginBottom: 14,
            '& *': {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            },
            '&:before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '2px',
                background: theme.palette.divider,
                borderRadius: '2px',
                transition: 'width .2s',
                width: 0
            },
            '&.active:before': {
                width: 30
            }
        },
        navPointRound: {
            height: 7,
            width: 7,
            background: navPointDisabled,
            borderRadius: '50%',
            '&.dirty': {
                // background: navPointColor
            },
            '&.active': {
                // height: 10,
                // width: 10,
                background: navPointActive
            }
        },
        navPointTouch: {
            height: 16,
            width: 16,
            borderRadius: '50%'
        },
        navPointWave: {
            height: 7,
            width: 7,
            background: theme.palette.action.active,
            borderRadius: '50%',
            animation: 'wave 2s infinite'
        }
    });
});

const ProgressBar = (props: any) => {
    const classes = useStyles();
    const [navIndex, setNavIndex] = useState(-1);

    return (
        <div className={`${classes.root} d-flex flex-column`}>
            {props.info.navPoints.map((node: PGNode, index: number) => (
                <div className={`${classes.navPoint}  ${props.info.paused && 'short'} ${navIndex > index && 'active'}`} key={node.pathName}>
                    <div className={`${classes.navPointRound} ${node.currentStep ? 'active' : ''} ${node.dirty ? 'dirty' : ''}`} />
                    <div className={`${classes.navPointTouch}`} />
                    <div
                        className={`${classes.navPointWave}`}
                        style={{display: node.currentStep && !props.info.paused ? '' : 'none', zIndex: 1}}
                    />
                </div>
            ))}
        </div>
    );
};

export default connectInfoStore(ProgressBar);
