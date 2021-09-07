/**
 * 显示表达式
 */

declare var MathJax: any;

export async function showMathMl(container: any) {
    if (!container) return;
    let t = 0;

    while (!MathJax || (!MathJax.mathml2chtml && t < 5)) {
        t++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    let mathList = (container as HTMLElement).querySelectorAll('math');
    for (let math of mathList) {
        let mml = math.outerHTML;
        math.parentNode && math.parentNode.replaceChild(MathJax.mathml2chtml(mml), math);
    }
    mathList.length && MathJax.startup.document.updateDocument();
}
