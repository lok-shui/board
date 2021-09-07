import {flatDeep, 语义布局定义} from '@/utils/aids/types';

const 图形高度 = {
    折线: 25,
    概括: 35,
    十字相乘法: 100
};

const SEGMENT_HEIGHT = 25;
let hasLoadMathml = false;
/**
 * 解析语义布局
 */
export function 解析语义布局(语义布局: 语义布局定义) {
    //调用下MathJax文件加载下font文件
    if (!hasLoadMathml) {
        //@ts-ignore
        MathJax.mathml2chtml('<math xmlns="http://www.w3.org/1998/Math/MathML"> <mn> 1 </mn> <mi> a </mi> <mi> A </mi> </math>');
        //@ts-ignore
        MathJax.startup.document.updateDocument();
        hasLoadMathml = true;
    }
    const {线段与数轴队列} = 语义布局;
    const 图形字典 = new Map();
    const 层级高度字典 = new Map();

    let 画布高度 = 0;

    for (let i = 0; i < 线段与数轴队列.length; i++) {
        let 线段与数轴 = 线段与数轴队列[i];

        let 分段高度 = 解析分段尺寸(线段与数轴.线段与数轴及附属概括折线, 图形字典, 层级高度字典, i);

        层级高度字典.set(i, {右上角: 画布高度});
        画布高度 += 分段高度;
    }

    设置图元垂向位置(图形字典, 层级高度字典);
    return {图形字典, 画布高度};
}

/**
 * 判断折线是否堆叠
 */
function 堆叠高度校正(统计数组: any, 图形: any, 校正高度系数: number) {
    let 左重叠次数 = 0,
        右重叠次数 = 0;

    for (let 已有图形 of 统计数组) {
        const {左, 右} = 图形;

        if (左 > 已有图形.左 && 左 < 已有图形.右) 左重叠次数++;
        if (右 > 已有图形.左 && 右 < 已有图形.右) 右重叠次数++;
    }

    统计数组.push(图形);

    图形.校正高度系数 = 校正高度系数 * Math.max(左重叠次数, 右重叠次数);
}

/**
 * 解析分段尺寸
 * 线段与数轴及附属概括折线: 一个数轴及相关内容
 * 偏移量：一个教具团体的中的 0 位置向上或向下
 * 分段高度：这个分段图形的总高度
 */
function 解析分段尺寸(线段与数轴及附属概括折线: any[], 图形字典: Map<string, any>, 层级高度字典: Map<string, any>, 层级: number) {
    let 教具队列 = Object.values(线段与数轴及附属概括折线).map(item => {
        return item.教具队列.map((图形: any) => {
            图形.偏移量 = item.偏移量;
            return 图形;
        });
    });
    教具队列 = flatDeep(教具队列);
    const 折线集: any[] = [];
    for (const 图形 of 教具队列) {
        const {类型} = 图形;
        图形字典.set(图形.教具id || 图形.id, 图形);

        if (类型 === '折线') {
            堆叠高度校正(折线集, 图形, 0.3);
        }
        图形.高度 = (图形高度 as any)[类型] * (1 + (图形.校正高度系数 || 0)) || 0;
        图形.垂向位置 = 0;
        图形.层级 = 层级;
        图形.偏移值 = 0;
        图形.上界 = 0;
        图形.下界 = 0;

        if (类型 === '数轴' || 类型 === '线段') {
            图形.上界 += SEGMENT_HEIGHT;
            图形.下界 -= SEGMENT_HEIGHT;
        }
        if (类型 === '折线') {
            图形.上界 += 图形.高度;
        }
        if (类型 === '概括' || 类型 === '数轴' || 类型 === '线段') {
            if (图形.偏移量 > 0) {
                图形.上界 += 图形.偏移量 * SEGMENT_HEIGHT + 图形.高度;
            } else if (图形.偏移量 < 0) {
                图形.下界 -= Math.abs(图形.偏移量) * SEGMENT_HEIGHT + 图形.高度;
            }
        }
        if (类型 === '十字相乘法') {
            图形.下界 -= 图形.高度;
        }
        if (类型 === '坐标系') {
            const x轴长度 = 图形.右 - 图形.左;
            const y轴长度 = 图形.上 - 图形.下;
            const unitWidth = y轴长度 > x轴长度 ? y轴长度 : x轴长度;
            const unit = 235 / unitWidth;
            图形.上界 += 图形.上 * unit;
            图形.下界 += 图形.下 * unit;
            图形.width = unit * x轴长度;
        }
    }

    const maxUp = Math.max(...教具队列.map((图形: any) => 图形.上界));
    const minDown = Math.min(...教具队列.map((图形: any) => 图形.下界));

    for (const 图形 of 教具队列) {
        if (图形.偏移量 > 0) {
            图形.垂向位置 = maxUp - 图形.偏移量 * SEGMENT_HEIGHT;
        } else if (图形.偏移量 < 0) {
            图形.垂向位置 = maxUp + Math.abs(图形.偏移量) * SEGMENT_HEIGHT;
        } else {
            图形.垂向位置 = maxUp;
        }
    }

    const 分段高度 = maxUp - minDown;

    return 分段高度;
}

/**
 * 设置图元垂向位置
 */
function 设置图元垂向位置(图形字典: Map<string, any>, 层级高度字典: Map<string, any>) {
    let 图形集合 = 图形字典.values();
    for (let 图形 of 图形集合) {
        const {层级} = 图形;
        const {右上角} = 层级高度字典.get(层级);
        图形.垂向位置 += 右上角;
    }
}
