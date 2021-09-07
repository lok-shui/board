import {CONTENT_TYPE} from '@/const';
import {InstructionDone} from '@/types/instruction';

export interface Content {
    type: CONTENT_TYPE;
    done: InstructionDone;
}
