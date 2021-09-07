/*
 * 重构后所有音效类型共用同一个Audio对象
 * 主要为了解决IOS下audio无法通过js控制播放不同audio问题，同时也减少了大部分的空间内存占用。
 * IOS下还有不支持ogg格式文件问题，需要替换为MP3等可支持类型，后续扩展也要注意。
 * 还有注意是否有可能存在多音效同时播放情况，若有此情况出现可能需要创建一个/多个备胎Audio实例对象才能满足。
 * */

class EffectSound {
    // enter: any;
    audio: HTMLAudioElement;
    ending!: HTMLAudioElement;
    btnSound!: HTMLAudioElement;
    like!: HTMLAudioElement;
    playSound!: HTMLAudioElement;
    pauseSound!: HTMLAudioElement;
    smile!: HTMLAudioElement;
    smile2!: HTMLAudioElement;
    frown!: HTMLAudioElement;
    frownCancel!: HTMLAudioElement;
    comment!: HTMLAudioElement;
    progressSound!: HTMLAudioElement;
    praise!: HTMLAudioElement;

    static soundSrcMap = {
        ending: '/audio/ending.mp3',
        btnSound: '/audio/暂停与播放.mp3',
        like: '/audio/点赞动画.mp3',
        praise: '/audio/praise.ogg',
        playSound: '/audio/点击播放.mp3',
        pauseSound: '/audio/点击暂停.mp3',
        smile: '/audio/赞.mp3',
        smile2: '/audio/赞_持续.mp3',
        frown: '/audio/踩.mp3',
        frownCancel: '/audio/取消踩.mp3',
        comment: '/audio/报警.mp3',
        progressSound: '/audio/进度条跳转交互音效.mp3'
    };

    constructor() {
        // TODO: 未知作用代码，本地搜索无此方法调用，故暂时注释，待测试后无影响在未来版本中可进行删除。（当前版本dev-8）
        // this.enter = {
        //     play: () => {
        //     }
        // };

        this.audio = new Audio('');

        for (const soundType in EffectSound.soundSrcMap) {
            // @ts-ignore
            const src = EffectSound.soundSrcMap[soundType];
            (this as any)[soundType] = this.audio;
            Object.defineProperty(this, soundType, {
                get() {
                    this.audio.src !== src && (this.audio.src = src);
                    return this.audio;
                }
            });
        }
    }

    // 开启/关闭静音
    mute(state: boolean = true) {
        this.audio.muted = state;
    }
}

const effectSound = new EffectSound();
export default effectSound;
