import {CONTENT_TYPE, STRUCT_TYPE} from '@/const';

export type InstructionDone = {
    run: Function;
    replay: Function;
    pause: Function;
    needPause: boolean;
    executed: boolean;
    fast: boolean | undefined;
};

export interface Content {
    type: CONTENT_TYPE;
    done: InstructionDone;
}

export type PGNode = {
    name: string;
    pathName: string;
    parent: PGNode;
    children: PGNode[];

    content: Content | null;
    structType: STRUCT_TYPE;

    // 判断是否显示
    show: boolean;
    visible: boolean;

    // 只在折叠组件节点上有
    $open?: () => void;
    $el?: HTMLElement;

    // 只在强调指令上有
    chalkedId?: string;

    // 是否当前进度节点/进度节点是否可交互
    currentStep: boolean;
    dirty: boolean;

    //当前进度初始图片
    questionImages?: string[];

    // 表示节点是知识点
    kp?: boolean;
};

export type InstructionMessage = {
    instruction: string;
    path: string;
    params: any;

    hitting?: boolean;
};
