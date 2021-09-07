import {StructureCollapse, StructureMeta, StructureStep, ContentMath, ContentText, LampStructureCollapse} from '@/components';

export enum CONTENT_TYPE {
    Text,
    MathML
}

export const CONTENT_NODE = {
    [CONTENT_TYPE.Text]: ContentText,
    [CONTENT_TYPE.MathML]: ContentMath
};

export enum STRUCT_TYPE {
    Collapse,
    Meta,
    Step,
    LampCollapse
}

export const STRUCT_NODE = {
    [STRUCT_TYPE.Collapse]: StructureCollapse,
    [STRUCT_TYPE.Meta]: StructureMeta,
    [STRUCT_TYPE.Step]: StructureStep,
    [STRUCT_TYPE.LampCollapse]: LampStructureCollapse
};
