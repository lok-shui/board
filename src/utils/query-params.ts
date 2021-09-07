/**
 * 获取 hash 查询参数
 */
export function getQueryVariable(variable: string) {
    const hashArr = window.location.hash.split('?');
    if (hashArr[1]) {
        const vars = hashArr[1].split('&');
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            if (pair[0] === variable) {
                return pair[1];
            }
        }
    }
    return null;
}
