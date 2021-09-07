import {Content} from './content';
import {CONTENT_TYPE} from '@/const';
import {InstructionDone, PGNode} from '@/types/instruction';

export class MathContent implements Content {
    type = CONTENT_TYPE.MathML;
    text: string;
    explain: string;
    node: PGNode;
    done: InstructionDone;
    $el!: Element;
    说明位置: string = '右';

    constructor(text: string, done: InstructionDone, node: PGNode, explain: string) {
        this.text = text;
        this.done = done;
        this.node = node;
        this.explain = explain;
    }
}
