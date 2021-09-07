import React, {useEffect, useState} from 'react';
import {PGNode} from '@/types/instruction';
import StructureNode from '@/components/structure-node/structure-node';

import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: '0 15px'
        }
    })
);

const StructureStep = (props: {data: PGNode} & any) => {
    const children = (props.data.children || []) as PGNode[];
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {children.map(node => (
                <StructureNode key={node.pathName} data={node} />
            ))}
        </div>
    );
};

export default connectInfoStore<any>(StructureStep) as any;
