import {CHALK_ATTR_NAME} from '../const';

/**
 * 包裹指定节点
 * @params node 待包裹的节点
 * @params id 圈划标识
 * @params className 圈划后附加的css类名
 * @params css 圈划后附加的样式
 * @Return wrapTag 圈划后的包裹元素
 */
export function wrapTagToNode(node: Node, id: string, className?: string | string[], css?: string): Element {
    const parent = node.parentNode;
    const wrapTag = document.createElement('span');
    css && wrapTag.setAttribute('style', css);

    if (className) {
        className instanceof Array && className.forEach(name => wrapTag.classList.add(name));
        typeof className === 'string' && wrapTag.classList.add(className);
    }
    wrapTag.setAttribute(CHALK_ATTR_NAME, id);

    wrapTag.appendChild(node.cloneNode(true));
    parent && parent.replaceChild(wrapTag, node);

    return wrapTag;
}

/**
 * 将被 chalk 包裹的元素还原为被包裹前
 * @param wrapTag 圈划后的元素
 * @Return void
 */
export function restoreToNode(wrapTag: Element): void {
    const parent = wrapTag.parentNode;
    const fragment = document.createDocumentFragment();

    // @ts-ignore
    for (const node of wrapTag.childNodes) {
        fragment.appendChild(node.cloneNode(true));
    }

    parent && parent.replaceChild(fragment, wrapTag);
}

/**
 * 合并节点数组中相邻的文本节点，返回合并后的节点数组
 * @param nodes 节点数组
 * @Return mergedNodes 相邻文本节点合并后的节点数组
 */
export function mergeAdjacentTextNode(nodes: Node[]): Node[] {
    const mergedNodes = [];
    let node!: Node, nextNode;

    while ((nextNode = nodes.shift())) {
        if (node && node.nodeType !== Node.TEXT_NODE) {
            mergedNodes.push(node);
            node = nextNode;
            continue;
        }

        if (node && node.nextSibling === nextNode && nextNode.nodeType === Node.TEXT_NODE) {
            nextNode.textContent = (node.textContent || '') + (nextNode.textContent + '');
            node.parentNode && node.parentNode.removeChild(node);
        } else if (node) {
            mergedNodes.push(node);
        }

        node = nextNode;
    }

    node && mergedNodes.push(node);

    return mergedNodes;
}

/**
 * 将文字及需要转换为位置索引
 * @Param container 包含目标文字的元素
 * @Param text 目标文字
 * @Param textOrder 目标文字次序
 */
export function text2Index(container: Element, text: string, textOrder: number) {
    const textContent = container.textContent || '';

    let index = textContent.indexOf(text);

    for (let i = 1; i < textOrder; i++) {
        index = textContent.indexOf(text, index + 1);
    }

    return {start: index, end: index + text.length};
}
