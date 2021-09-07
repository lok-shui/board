import pageEvent from './event';
import eachBefore from './traversal';

type InfoCollection = {display: string | null; node: Node | Text | HTMLElement; char: string};
type CallbackByChar = (char: string, index: number, end?: boolean) => void;

class TextPrinter {
    private delay = 100;
    private traversal = eachBefore()
        .skip((node: Node) => {
            return ['SCRIPT', 'STYLE', '#comment'].includes(node.nodeName);
        })
        .skipChildren((node: Node) => {
            return ['MJX-MATH', 'SVG'].includes(node.nodeName.toUpperCase());
        });

    private selections: InfoCollection[] = [];
    private charsLen: number = 0;
    private countTag: Map<string, number> = new Map();
    private paused = false;

    /**
     * 将元素内文本元素拆分成单个字符长度的节点，
     * 并获取元素内部文本长度
     * @Params target 包含文本的目标元素
     */
    private getInfo(target: Element): [InfoCollection[], number] {
        const selections: InfoCollection[] = [];
        let charsLen = 0;

        this.traversal(target, node => {
            let display: string | null = '';
            let char: string = '';

            if ((node instanceof HTMLElement || node instanceof SVGElement) && node.style) {
                display = node.style.display;
            }

            /**
             * 将所有文本几点拆分成单个字符长度的文本节点
             */
            if (node instanceof Text) {
                let splitNode = node;
                let temp;

                while (splitNode.length && (temp = splitNode.splitText(1))) {
                    char = splitNode.textContent || '';
                    selections.push({display: display, node: splitNode, char});
                    splitNode.textContent = '';
                    // @ts-ignore
                    splitNode = temp;
                    charsLen++;
                }
            } else {
                selections.push({display: display, node, char});
            }
        });

        return [selections, charsLen];
    }

    /**
     * 指定输出元素
     * @Params target 包含文本的目标元素
     */
    in(target: Element): this {
        const [selections, charsLen] = this.getInfo(target);

        selections.forEach(({node}) => {
            node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).style && ((node as HTMLElement).style.display = 'none');
        });

        this.selections = selections;
        this.charsLen = charsLen;

        return this;
    }

    /**
     * 将元素内文本按指定时长逐个显示
     * @Params [callback] 逐个输出文字时的回调函数
     * @Params [duration] 指定时长内输出元素内容，未指定该项时使用默认延时
     */
    async out(callback?: CallbackByChar | null, duration?: number) {
        const {selections, charsLen} = this;

        let charIndex = 0;
        let delay = this.delay || 0;

        if (duration && duration > 0) delay = duration / charsLen;

        /**
         * 逐个输出显示文字
         */
        for (const item of selections) {
            const {node, display, char} = item;

            if (node instanceof HTMLSpanElement && node.getAttribute('id') === 'handleImage') {
                pageEvent.emit('handleImageChange');
                await new Promise(resolve => setTimeout(resolve, 2500));
            }

            if ((node instanceof HTMLElement || node instanceof SVGElement) && node.style) node.style.display = display || '';
            if (node.nodeType !== Node.TEXT_NODE) {
                continue;
            }

            node.textContent += char;
            callback && callback(char, ++charIndex);

            while (this.paused) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
        callback && callback('', charIndex, true);

        return new Promise(resolve => resolve());
    }

    pause(state: boolean = true) {
        this.paused = state;
    }

    addCountTag(tagName: string) {
        this.countTag.set(tagName.toLocaleLowerCase(), 0);
    }

    /**
     * 设置延时参数
     * @Param delay 单个字符应用chalk后应用下一个字符的延时
     */
    delayTime(delay: number): number | this {
        return arguments.length ? ((this.delay = delay), this) : this.delay;
    }
}

export {TextPrinter};
export default TextPrinter;
