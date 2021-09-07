import {instruction$} from '../pg-client';
import {Subscription, asyncScheduler, queueScheduler} from 'rxjs';
import {filter, tap, observeOn} from 'rxjs/operators';
import {INSTRUCTIONS} from '../instructions';
import {InstructionMessage, InstructionDone, PGNode} from '@/types/instruction';
import {HandlerTemplate} from './handler-template';
import {AidsHandler} from './aids-handler';
import {BaseHandler} from './base-handler';

export class InstructionTool {
    handlers: HandlerTemplate[] = [];
    preprocess!: (...arg: any) => void | null;

    constructor() {
        this.missedInstruction();
    }

    setPreprocess(preprocess: (...arg: any) => void) {
        this.preprocess = preprocess;
    }

    private unsubscribe(subscription: Subscription) {}

    subscribe() {
        for (let handler of this.handlers) handler.subscribe();
    }

    extend(...instructions: HandlerTemplate[]) {
        this.handlers = this.handlers.concat(instructions);
    }

    /**
     * 正常的订阅指令方法
     */
    onInstruction(instructionName: INSTRUCTIONS, handler: (instruction: InstructionMessage, done: InstructionDone) => void) {
        let subscription = instruction$
            .on(instructionName)
            .pipe(
                filter(([instruction]) => instruction.instruction === instructionName),
                observeOn(queueScheduler),
                tap(([instruction]) => (instruction.hitting = true))
            )
            .subscribe(([instruction, done]) => {
                this.preprocess && this.preprocess(instruction, done);
                handler(instruction, done);
            });

        this.unsubscribe(subscription);
    }

    /**
     * 订阅处理没有被订阅处理的指令
     */
    missedInstruction() {
        let subscription = instruction$
            .on()
            .pipe(observeOn(asyncScheduler))
            .subscribe(([instruction, done]) => {
                if (!instruction.hitting) {
                    console.log('missed:', instruction.instruction);
                    setTimeout(() => {
                        done.run();
                    }, 500);
                }
            });

        this.unsubscribe(subscription);
    }
}

export class Handler {
    constructor(preprocess?: (...arg: any) => void) {
        let instructionTool = new InstructionTool();
        instructionTool.extend(new AidsHandler(instructionTool), new BaseHandler(instructionTool));

        preprocess && instructionTool.setPreprocess(preprocess);
        instructionTool.subscribe();
    }
}
