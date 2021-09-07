import {InstructionDone} from '@/types/instruction';

class LampAudio {
    audio!: HTMLAudioElement | null;

    done?: InstructionDone | null;

    pauseByUser: boolean = false;

    setAudio(url: string, done: InstructionDone) {
        this.removeAudio();
        const audio = new Audio(url);
        this.audio = audio;
        // this.audio.muted = this.muted;
        this.done = done;

        const play = () => {
            // console.log(this.audio?.duration);
            this.pauseByUser = false;
            audio.play();
        };

        // audio.ondurationchange = () => {
        //     console.log('durationchange', this.audio?.duration);
        // };

        audio.oncanplay = () => play();

        audio.onended = async () => {
            done.run();
            this.pause();
            this.removeAudio();
        };

        audio.onerror = () => {
            console.log('audio error');
            done.run();

            this.pause();
            this.removeAudio();
        };

        audio.ontimeupdate = () => {
            // let currentTime = audio.currentTime * 1000;
            // const currentTime = audio.currentTime;
            // console.log(url, currentTime);
        };

        audio.onpause = async () => {
            // console.log('pause', audio.currentTime === audio.duration);
            if (!this.pauseByUser && audio.currentTime !== audio.duration) {
                console.log('end by interrupt and restart');
                await new Promise(resolve => setTimeout(resolve, 100));
                play();
            }
        };

        // audio.onwaiting = () => {
        //     console.log('audio waiting');
        // };

        // audio.onsuspend = () => {
        //     console.log('audio suspend');
        // };

        // audio.onstalled = () => {
        //     console.log('audio stalled');
        // };

        // audio.onabort = () => {
        //     console.log('audio abort');
        // };

        // this.play();
    }

    play() {
        if (!this.audio) return;
        this.pauseByUser = false;
        let promise = this.audio.play();

        promise &&
            promise.catch &&
            promise.catch(() => {
                console.log('in audio promise.catch');
                this.pause();
            });
    }

    pause(tag?: boolean) {
        if (!this.audio) return;
        if (tag) this.pauseByUser = true;
        this.audio.pause();
    }

    removeAudio() {
        // this.audio && console.log('removeAudio', this.audio);
        if (!this.audio) return;
        this.pause();

        this.audio.onended = null;
        this.audio.oncanplay = null;
        this.audio.onerror = null;
        this.audio.ontimeupdate = null;
        // this.audio.ondurationchange = null;
        this.audio.onpause = null;
        // this.audio.onwaiting = null;
        // this.audio.onsuspend = null;
        // this.audio.onstalled = null;
        // this.audio.onabort = null;

        this.audio = null;
        this.done = null;
    }
}

const lampAudio = new LampAudio();

export default lampAudio;
