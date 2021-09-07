import EventEmitter from 'events';
import {InstructionDone} from '@/types/instruction';
import {effectSound} from '@/utils';
import store from '@/store';

class AitAudio {
    event: EventEmitter = new EventEmitter();
    // audio!: HTMLAudioElement | null;
    audio!: HTMLAudioElement;

    done?: InstructionDone | null;

    waitBeforeEnd: number = 0;
    事件标识!: string;
    private _muted: boolean = false;

    constructor() {
        this.audio = new Audio();
        this.audio.autoplay = true;
    }

    get muted() {
        return this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;
        effectSound.mute(value);
        this.audio && (this.audio.muted = value);
    }

    setAudio(url: string, done: InstructionDone, 事件标识: string) {
        this.removeAudio();
        // const audio = new Audio(url);
        // this.audio = audio;
        if (store.getState().info.isPhone) {
            this.audio = document.querySelector('#audioTest') as HTMLAudioElement;
            this.audio.setAttribute('src', url);
        } else {
            this.audio.src = url;
        }

        //@ts-ignore
        const tencentMode = store.getState().info.tencentMode && window.vdcShow;
        const audio = this.audio;
        this.audio.muted = this.muted;

        if (tencentMode) {
            this.audio.muted = true;
        }
        // this.audio.muted = true;
        this.done = done;
        this.事件标识 = 事件标识;

        const play = () => {
            audio.play();
        };

        audio.oncanplay = () => play();

        audio.onended = async () => {
            this.event.emit('语音事件', (this.audio && (this.audio.duration + 1) * 1000) || 0, true);
            await new Promise(resolve => setTimeout(resolve, this.waitBeforeEnd));
            !tencentMode && done.run();
            this.pause();
            this.removeAudio();

            aitAudio.event.removeAllListeners('语音事件');
        };

        audio.onerror = () => {
            !tencentMode && done.run();

            this.pause();
            this.removeAudio();

            aitAudio.event.removeAllListeners('语音事件');
        };

        audio.ontimeupdate = () => {
            let currentTime = audio.currentTime * 1000;
            this.event.emit('语音事件', currentTime);
        };

        // this.play();
    }

    onPlay(callback: (arg: any) => void) {
        return this.event.on('play', callback);
    }

    onPause(callback: (arg: any) => void) {
        return this.event.on('pause', callback);
    }

    play() {
        if (!this.audio) return;
        if (!this.audio.src) return;
        this.audio.muted = this.muted;
        let promise = this.audio.play();

        promise &&
            promise.catch &&
            promise.catch(() => {
                this.pause();
            });
        this.event.emit('play');
    }

    pause() {
        this.event.emit('pause');
        if (!this.audio) return;
        if (!this.audio.src) return;
        this.audio.pause();
    }

    removeAudio() {
        this.waitBeforeEnd = 0;
        if (!this.audio) return;
        if (!this.audio.src) return;
        this.pause();

        this.audio.onended = null;
        this.audio.oncanplay = null;
        this.audio.onerror = null;
        this.audio.ontimeupdate = null;

        // this.audio = null;
        this.audio.src = '';
        this.done = null;

        this.事件标识 && aitAudio.event.emit(this.事件标识, '', true);
        this.event.emit('语音事件', 0, true);
    }
}

const aitAudio = new AitAudio();

export default aitAudio;
