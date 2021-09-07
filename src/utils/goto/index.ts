import {getContainer, getOffset} from './util';
import * as easingPatterns from './easing';
import Vue, {VueConstructor} from 'vue';

import {$} from '@/utils/goto/util';

export type gotoTarget = number | string | HTMLElement | Vue;

export type Easing =
    | ((t: number) => number)
    | 'linear'
    | 'easeInQuad'
    | 'easeOutQuad'
    | 'easeInOutQuad'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeInQuart'
    | 'easeOutQuart'
    | 'easeInOutQuart'
    | 'easeInQuint'
    | 'easeOutQuint'
    | 'easeInOutQuint';

export interface gotoOption {
    container?: string | HTMLElement | Vue;
    duration?: number;
    offset?: number;
    easing?: Easing;
    appOffset?: boolean;
    landscape?: boolean;
    isImg?: boolean;
}

function goto(target: gotoTarget, option?: gotoOption): Promise<number> {
    // @ts-ignore
    target = $(target) as HTMLElement;
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    return new Promise<number>(resolve => {
        setTimeout(() => {
            resolve(1);
        }, 800);
    });
}

function gotoOld(target: gotoTarget, option?: gotoOption): Promise<number> {
    const settings: gotoOption = {
        container: (document.scrollingElement as HTMLElement | null) || document.body || document.documentElement,
        duration: 300,
        offset: 0,
        easing: 'easeInOutCubic',
        appOffset: true,
        ...option
    };

    const container = getContainer(settings.container);
    const startTime = performance.now();
    let targetLocation: number;

    if (settings.landscape && settings.isImg) {
        const _target = target as HTMLElement;
        if (_target.offsetHeight + _target.offsetTop < container.offsetHeight - 100) return new Promise(resolve => resolve());
    }

    if (typeof target === 'number') {
        targetLocation = getOffset(target) - settings.offset!;
    } else {
        targetLocation = getOffset(target) - getOffset(container) - settings.offset!;
    }

    const startLocation = container.scrollTop;

    if (targetLocation === startLocation) return Promise.resolve(targetLocation);

    const ease = typeof settings.easing === 'function' ? settings.easing : easingPatterns[settings.easing!];
    if (!ease) throw new TypeError(`Easing function "${settings.easing}" not found.`);

    return new Promise(resolve =>
        requestAnimationFrame(function step(currentTime: number) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.abs(settings.duration ? Math.min(timeElapsed / settings.duration, 1) : 1);

            container.scrollTop = Math.floor(startLocation + (targetLocation - startLocation) * ease(progress));

            const clientHeight = container === document.body ? document.documentElement.clientHeight : container.clientHeight;
            if (progress === 1 || clientHeight + container.scrollTop === container.scrollHeight) {
                return resolve(targetLocation);
            }

            requestAnimationFrame(step);
        })
    );
}

export {goto, gotoOld};
