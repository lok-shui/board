import store from '@/store';
import {InfoActions} from '@/store/info';

const DEFAULT_EVNET_NAMES = {
    instruction: 'instruction',
    result: 'instruction-result',
    error: 'instruction-error'
};

class SocketIoClient {
    constructor(url, io, config = {}, timeout = 3000) {
        this.events = config.events || DEFAULT_EVNET_NAMES;
        delete config.events;
        this.url = url + this.getQueryString(config);
        this.io = io;
        this.timeout = timeout;
        this.isClosed = false;
    }

    getQueryString(config) {
        if (Object.keys(config).length === 0) return '';
        return (
            '?' +
            Object.keys(config)
                .map(key => `${key}=${config[key] + ''}`)
                .join('&')
        );
    }

    async open() {
        await new Promise((resolve, reject) => {
            const tid = setTimeout(_ => {
                store.getState().info.isLamp && store.dispatch({type: InfoActions.setNetError, payload: 'default'});
                return reject(new Error(`TIMEOUT, can't connect to the server in ${this.timeout}`));
            }, this.timeout);
            this.socket = this.io(this.url, {transports: ['websocket']});
            this.socket.on('connect', _ => {
                clearTimeout(tid);
                resolve('connected');
            });
            this.handleSocketEvents();
        });
        return this;
    }

    handleSocketEvents() {
        throw new Error('Abstract method SHOULD be implemented!');
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.socket.on('disconnect', () => {
                if (this.isClosed) resolve();
                this.isClosed = false;
            });
            this.isClosed = true; // 用来避免其它disconnect事件，例如：断线重连
            this.socket.close(true);
        });
    }
}

const taskIdName = 'ins-id';

class JsSocketIoClient extends SocketIoClient {
    setTarget(target, delay = 0) {
        this.target = target;
        this.delay = delay;
        return this;
    }

    handleSocketEvents() {
        this.socket.on(this.events.instruction, data => {
            const taskId = data[taskIdName];
            setTimeout(_ => {
                try {
                    // TODO: 执行target上的异步方法
                    this.execute(data, taskId);
                } catch (err) {
                    this.socket.emit(this.events.error, {[taskIdName]: taskId, err});
                }
            }, this.delay);
        });
    }

    execute(instruction, taskId) {
        if (typeof this.target[instruction.instruction] === 'undefined') return; // 不执行自己无关的指令
        const res = this.target[instruction.instruction](instruction); // TODO: 改进？
        const next = res instanceof Promise ? res : Promise.resolve(res);
        next.then(res => this.socket.emit(this.events.result, {[taskIdName]: taskId, res})).catch(err =>
            this.socket.emit(this.events.error, {[taskIdName]: taskId, err})
        );
    }
}

export default JsSocketIoClient;
