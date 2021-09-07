import * as io from 'socket.io-client';
import {InstructionMessage, InstructionDone} from '@/types/instruction';
// @ts-ignore
import JsSocketIoClient from './js-socket-io.js';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {INSTRUCTIONS} from '../instructions';
import {Handler} from '@/views/tutor-board/@instruction';

/**
 * 发布指令主题
 */
class InstructionSubject {
    private subject = new Subject<[InstructionMessage, InstructionDone]>();

    next(instruction: InstructionMessage, done: InstructionDone) {
        this.subject.next([instruction, done]);
    }

    on(instruction?: INSTRUCTIONS): Observable<[InstructionMessage, InstructionDone]> {
        return this.subject.asObservable().pipe(filter(([i]) => i && (i.instruction === instruction || !instruction)));
    }
}

export const instruction$ = new InstructionSubject();

/**
 * 用于发布指令的方法
 */
export const emitInstruction = (instruction: InstructionMessage, resolve: Function, reject: Function, isFast?: boolean) => {
    const instructionDone: InstructionDone = {
        needPause: false,
        executed: false,
        fast: isFast,
        run(result: any, isReject: boolean, isReplay: boolean) {
            !isReplay && (this.executed = true);

            if (this.needPause) return;
            if (isReplay && !this.executed) return;
            isReject ? reject(result) : resolve(result);
        },
        replay() {
            this.needPause = false;
            this.run(null, false, true);
        },
        pause() {}
    };

    instruction$.next(instruction, instructionDone);
};

/**
 * 连接 websocket
 */
export class PGClient {
    socket!: SocketIOClient.Socket;
    handler: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    async init(roomId: string) {
        const target: Record<string, Function> = {};
        const url = `/?roomId=${roomId}`;

        for (let i of INSTRUCTIONS) {
            target[i] = (instruction: InstructionMessage) =>
                new Promise((resolve, reject) => emitInstruction(instruction, resolve, reject));
        }

        const client = await new JsSocketIoClient(url, io, {}, 10000).setTarget(target).open();
        this.socket = client.socket;
        if (window && window.parent) {
            window.parent.postMessage('socket-init', '*');
        }

        this.socket.on('init', ({eid}: {eid: string}) => {
            this.socket.emit('init-result', {eid, success: true});
        });
    }

    on(type: string, callback: (arg: any) => void) {
        this.socket.on(type, callback);
    }

    emit(type: string, params: any) {
        this.socket.emit(type, params);
    }
}
