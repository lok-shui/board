import {Content} from './content';
import {CONTENT_TYPE} from '@/const';
import {InstructionDone, PGNode} from '@/types/instruction';

export class TextContent implements Content {
    type = CONTENT_TYPE.Text;
    text: string;

    // 说明文字
    explain: string;
    done: InstructionDone;

    // 作为源的发布事件名
    eventName: string = '';

    node: PGNode;
    animate: boolean = true;
    style: Object = {};
    class: string = '';
    $el!: Element;
    isQuestion: boolean = false;
    emphasis: {text: string; textOrder: number}[] = [];

    // 内容缩进
    indent: number = 0;

    constructor(text: string, done: InstructionDone, node: PGNode, explain: string = '') {
        this.text = text;
        this.done = done;
        this.node = node;
        this.explain = explain;
    }
}
