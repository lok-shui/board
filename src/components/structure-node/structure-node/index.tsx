import React, {useEffect, useRef} from 'react';
import {CONTENT_NODE, STRUCT_NODE} from '@/const';
import {PGNode} from '@/types/instruction';

const StructureNode = (props: {data: PGNode}) => {
    const visible = props.data.show && props.data.visible;
    const StructNode = STRUCT_NODE[props.data.structType];
    const content = props.data.content;
    const ContentNode = content && CONTENT_NODE[content.type];
    const children = props.data.children;
    const nodeRef = useRef(null);

    useEffect(() => {
        props.data.$el = (nodeRef.current as unknown) as HTMLElement;
    }, [props.data.structType]);

    return (
        <div className="structure-node" id={props.data.pathName} style={{display: visible ? undefined : 'none'}} ref={nodeRef}>
            {StructNode ? <StructNode data={props.data}></StructNode> : ContentNode && <ContentNode data={content as any} />}

            {!StructNode &&
                children.map(node => {
                    return <StructureNode key={node.pathName} data={node} />;
                })}
        </div>
    );
};

export default StructureNode;
