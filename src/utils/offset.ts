export function getOffset(target: any, offsetParent?: HTMLElement): number {
    if (typeof target === 'number') {
        return target;
    }

    let el = $(target);
    if (!el) {
        throw typeof target === 'string'
            ? new Error(`Target element "${target}" not found.`)
            : new TypeError(`Target must be a Number/Selector/HTMLElement.`);
    }

    let totalOffset = 0;
    while (el && el !== offsetParent) {
        totalOffset += el.offsetTop;
        el = el.offsetParent as HTMLElement;
    }

    return totalOffset;
}

function $(el: any): HTMLElement | null {
    if (typeof el === 'string') {
        return document.querySelector<HTMLElement>(el);
    } else if (el instanceof HTMLElement) {
        return el;
    } else {
        return null;
    }
}
