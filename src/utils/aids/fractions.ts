import Konva from 'konva';
import {lineGap, 分段定义, 刻度定义, 标记定义, 概括定义} from './types';
import {theme} from '@/index';
import {Shape} from 'konva/types/Shape';

let fontSize = 14;
const strokeWidth = 2;
const arrowWidth = 6;
const 支持形状: {
    [propName: string]: typeof Konva.Arrow;
} = {
    箭头: Konva.Arrow
};

export function 创建线段(线段数据: {定义: number[]; 线型: string; 教具id?: string}, 配置: Object = {}) {
    return new Konva.Line({
        name: 线段数据.教具id,
        points: 线段数据.定义,
        stroke: theme.aid.line,
        strokeWidth: strokeWidth,
        fill: theme.aid.line,
        pointerWidth: arrowWidth,
        pointerLength: arrowWidth,
        dash: [4, 4],
        ...配置,
        dashEnabled: 线段数据.线型 === '虚线'
    });
}

export function 创建分段({定义, 线型, 箭头}: {定义: [number, number]; 线型: string; 箭头: string}, 配置: Object = {}, 是否垂直 = false) {
    const AxisLineShape = 箭头 !== '无' ? Konva.Arrow : Konva.Line;
    const dashEnabled = 线型 === '虚线';
    if (箭头 === '左') {
        //方向相反，需要颠倒一下
        定义.reverse();
    }
    return new AxisLineShape({
        points: 是否垂直 ? [0, 定义[0], 0, 定义[1]] : [定义[0], 0, 定义[1], 0],
        stroke: theme.aid.line,
        strokeWidth: strokeWidth,
        fill: theme.aid.line,
        pointerWidth: arrowWidth,
        pointerLength: arrowWidth,
        dash: [4, 4],
        dashEnabled,
        ...配置
    });
}

export function 创建分段集(分段集数据: 分段定义[], 配置: Object = {}, 是否垂直 = false) {
    let 分段集 = new Konva.Group();

    for (let 分段数据 of 分段集数据) {
        分段集.add(创建分段(分段数据, 配置, 是否垂直));
    }

    return 分段集;
}

export function 创建文字({文字, 文字方向, x, y}: {文字: string; 文字方向: string | null; x?: number; y?: number}, 配置: any = {}) {
    const 文字对象 = new Konva.Text({
        text: 文字,
        fill: theme.aid.text,
        x,
        y,
        fontFamily: `MJXZERO, MJXTEX-I, MJXTEX, Times New Roman, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`,
        fontSize,
        ...配置
    });

    if (配置.是否垂直) {
        if (文字 === 'O') {
            文字对象.offsetX(文字对象.width() + 2);
            文字对象.offsetY(-theme.aid.lineHeight - 3);
        } else {
            文字对象.offsetX(文字对象.width() + theme.aid.lineHeight + 3);
            文字对象.offsetY(文字对象.height() / 2 - theme.aid.lineHeight);
        }
        //调整左右偏移(文字对象, 文字方向, 配置.标记偏移量);
    } else {
        if (!配置.不需要偏移) {
            文字对象.offsetX(文字对象.width() / 2);
        }
        调整上下偏移(文字对象, 文字方向, 配置.标记偏移量);
    }

    return 文字对象;
}

function 调整上下偏移(konvaShape: Shape, 方向: string | null, 偏移量?: number) {
    const 偏移值 = konvaShape.height() * (偏移量 || 0);
    if (方向 === '上') {
        if (konvaShape instanceof Konva.Text) {
            //由于mathjax字体会向上偏移一小段，所以处理下
            konvaShape.offsetY(konvaShape.height() + 2 + 偏移值);
        } else {
            //往上 偏移刻度高度+2
            konvaShape.offsetY(konvaShape.height() + theme.aid.lineHeight + 5 + 偏移值);
        }
    } else if (方向 === '下') {
        if (konvaShape instanceof Konva.Text) {
            //由于mathjax字体会向上偏移一小段，所以处理下
            konvaShape.offsetY(-theme.aid.lineHeight - 5 - 偏移值);
        } else {
            konvaShape.offsetY(-theme.aid.lineHeight - 偏移值);
        }
    } else if (方向 === '右') {
        konvaShape.offsetX(-theme.aid.lineHeight - 5 - 偏移值);
        if (konvaShape instanceof Konva.Text) {
            //由于mathjax字体会向上偏移一小段，所以处理下
            konvaShape.offsetY(konvaShape.height() / 2 - theme.aid.lineHeight);
        } else {
            konvaShape.offsetY(konvaShape.height() / 2);
        }
    } else if (方向 === '左') {
        konvaShape.offsetX(konvaShape.width() + theme.aid.lineHeight + 5 + 偏移值);
        if (konvaShape instanceof Konva.Text) {
            //由于mathjax字体会向上偏移一小段，所以处理下
            konvaShape.offsetY(konvaShape.height() / 2 - theme.aid.lineHeight);
        } else {
            konvaShape.offsetY(konvaShape.height() / 2);
        }
    }
}

function 调整左右偏移(konvaShape: Shape, 方向: string | null, 偏移量?: number) {
    const 偏移值 = konvaShape.height() * (偏移量 || 0);
    if (方向 === '上') {
        konvaShape.offsetX(konvaShape.height() + theme.aid.lineHeight + 偏移值);
    } else if (方向 === '下') {
        konvaShape.offsetX(-theme.aid.lineHeight - 偏移值);
    }
}

function 创建形状({形状, 方向, x, y}: {形状: typeof Konva.Arrow; 方向: string | null; x?: number; y?: number}, 配置: any = {}) {
    const shapeLength = 16;
    let points = [x || 0, y || 0];
    if (方向 === '上') {
        points.push(x || 0, y || 0 + shapeLength);
    } else if (方向 === '下') {
        points.unshift(x || 0, y || 0 + shapeLength);
    }
    const 形状对象 = new 形状({
        points: points,
        stroke: 配置.fill || theme.aid.text,
        strokeWidth: strokeWidth,
        fill: theme.aid.line,
        pointerWidth: 4,
        pointerLength: 4,
        ...配置
    });

    调整上下偏移(形状对象, 方向, 配置.标记偏移量);
    return 形状对象;
}

function 创建图片(标记数据: {文本: string; 文字方向: string; x?: number; y?: number}, 配置: any) {
    return new Promise<any>((resolve, reject) => {
        let img = new Image();
        img.onload = function () {
            if (标记数据.文本.startsWith('http')) {
                let {width, height} = img;
                const normalHeight = 20;
                img.height = normalHeight;
                img.width = (normalHeight * width) / height;
            }
            const image = new Konva.Image({
                image: img,
                x: 标记数据.x,
                y: 标记数据.y
            });
            if (!配置.不需要偏移) {
                image.offsetX(image.width() / 2);
            }

            调整上下偏移(image, 标记数据.文字方向, 配置.标记偏移量);
            resolve(image);
        };
        img.onerror = function () {
            resolve(null);
        };
        if (标记数据.文本.startsWith('<svg')) {
            标记数据.文本 = 标记数据.文本
                .replace('fill="currentColor"', `fill="${配置.fill || theme.aid.text}"`)
                .replace(/(style=")([^"]+)(")/, '$1' + 'font-size:10px;' + '$2$3');
            img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(标记数据.文本)));
        } else {
            img.src = 标记数据.文本;
        }
        img.crossOrigin = '';
    });
}

export function 创建刻度集(
    刻度集数据: 刻度定义[],
    刻度高度: number,
    刻度配置: any,
    文字配置: {是否有刻度文字: boolean; [propName: string]: any} = {是否有刻度文字: true},
    是否垂直: boolean = false
) {
    let 刻度集 = new Konva.Group();
    文字配置.fill = theme.aid.lineText;
    for (let 刻度 of 刻度集数据) {
        刻度集.add(
            new Konva.Line({
                points: 是否垂直 ? [0, 刻度.数字, 刻度高度, 刻度.数字] : [刻度.数字, 0, 刻度.数字, -刻度高度],
                stroke: theme.aid.line,
                strokeWidth: strokeWidth,
                lineCap: 'round',
                ...刻度配置
            })
        );
        if (文字配置.是否有刻度文字) {
            if (是否垂直) {
                刻度集.add(创建文字({文字: 刻度.替换文字, 文字方向: '下', y: 刻度.数字}, 文字配置));
            } else {
                const 文字 = 创建文字({文字: 刻度.替换文字, 文字方向: '下', x: 刻度.数字}, 文字配置);
                // 判断文字是否超出显示范围，如果超出，则将其水平移动到边界内
                if (刻度配置.画板) {
                    const 右边界 = 刻度配置.画板.viewport.width + 刻度配置.画板.paddingX * 2;
                    if (文字.x() + 文字.width() / 2 > 右边界) {
                        const 越界宽度 = 文字.x() + 文字.width() / 2 - 右边界;
                        文字.x(文字.x() - 越界宽度);
                    }
                }

                if (文字.x() - 文字.width() / 2 < 0) {
                    const 越界宽度 = 文字.width() / 2 - 文字.x();
                    文字.x(文字.x() + 越界宽度);
                }
                刻度集.add(文字);
            }
        }
    }

    return 刻度集;
}

export function 创建概括图形(概括数据: 概括定义, 概括高度: number, 向上: boolean = true) {
    return new Konva.Shape({
        左: 概括数据.左,
        右: 概括数据.右,
        向上,
        percent: 0,
        strokeWidth: strokeWidth,
        stroke: theme.aid.mark,
        sceneFunc: (context: any, shape: any) => {
            const 向上 = shape.getAttr('向上');
            const x1 = shape.getAttr('左');
            const x2 = shape.getAttr('右');
            let y = 0;

            const braceHeight = 概括高度;

            const reverse = 向上 ? 1 : -1;
            const startpoint = [x1, y];
            const midpoint = [(x1 + x2) / 2, y - braceHeight * reverse];
            const endpoint = [x2, y];
            context.beginPath();
            context.moveTo(startpoint[0], startpoint[1]);
            context.quadraticCurveTo(
                startpoint[0],
                startpoint[1] - braceHeight * reverse,
                startpoint[0] + braceHeight,
                startpoint[1] - braceHeight * reverse
            );
            context.lineTo(midpoint[0] - braceHeight, midpoint[1]);
            context.quadraticCurveTo(midpoint[0], midpoint[1], midpoint[0], midpoint[1] - braceHeight * reverse);
            context.quadraticCurveTo(midpoint[0], midpoint[1], midpoint[0] + braceHeight, midpoint[1]);
            context.lineTo(endpoint[0] - braceHeight, endpoint[1] - braceHeight * reverse);
            context.quadraticCurveTo(endpoint[0], endpoint[1] - braceHeight * reverse, endpoint[0], endpoint[1]);

            context.strokeShape(shape);
        }
    });
}

export async function 创建概括对象(概括数据: 概括定义, 概括高度: number, 向上: boolean, 文字配置 = {}) {
    const 概括对象 = new Konva.Group({name: 概括数据.教具id});

    const 概括图形 = 创建概括图形(概括数据, 概括高度, 向上);
    let 概括文字;
    if (概括数据.svg) {
        概括文字 = await 创建图片(
            {文本: 概括数据.svg, 文字方向: 向上 ? '上' : '下', x: (概括数据.左 + 概括数据.右) / 2, y: 向上 ? -8 : 10},
            文字配置
        );
    } else {
        概括文字 = 创建文字(
            {文字: 概括数据.文本, 文字方向: 向上 ? '上' : '下', x: (概括数据.左 + 概括数据.右) / 2, y: 向上 ? -8 : 10},
            文字配置
        );
    }

    概括对象.add(概括图形);
    概括对象.add(概括文字);

    if (Math.abs(概括数据.位置.偏移量 || 0) > 1) {
        const 概括左虚线 = 创建线段(
            {定义: [概括数据.左, 0, 概括数据.左, 概括数据.位置.偏移量 * 25], 线型: '虚线'},
            {stroke: theme.aid.mark}
        );
        const 概括右虚线 = 创建线段(
            {定义: [概括数据.右, 0, 概括数据.右, 概括数据.位置.偏移量 * 25], 线型: '虚线'},
            {stroke: theme.aid.mark}
        );
        概括对象.add(概括左虚线);
        概括对象.add(概括右虚线);
    }

    return 概括对象;
}

export async function 创建标记对象(标记数据: 标记定义, 教具类型: number, x = 0) {
    let 配置 = {标记偏移量: 标记数据.标记偏移量 || 0};
    if (标记数据.形状 === '刻度点') {
        Object.assign(配置, {fill: theme.aid.lineText});
    }
    if (标记数据.是否强调) {
        Object.assign(配置, {fill: theme.aid.mark});
    }
    const 标记对象 = new Konva.Group({x: 标记数据.坐标[0], y: 标记数据.坐标[1] || 0, name: 标记数据.教具id});

    const 标记类型 = {
        空心点: 创建点标记,
        实心点: 创建点标记,
        刻度点: 创建刻度标记
    };
    // @ts-ignore
    const 形状 = 标记类型[标记数据.形状];
    if (标记数据.标记线) {
        标记对象.add(创建线段({定义: [0, 0, x - 标记数据.坐标[0], 0], 线型: '虚线'}));
        标记对象.add(创建线段({定义: [0, 0, 0, -标记数据.坐标[1]], 线型: '虚线'}));
    }
    形状 && 标记对象.add(形状(标记数据, 教具类型));
    const 文字位置 = {上方: '上', 下方: '下', 上: '上', 下: '下', 左方: '左', 右方: '右'};
    if (Array.isArray(标记数据.富文本)) {
        let position = 0;
        const 富文本对象集 = [];
        for (const 标记 of 标记数据.富文本) {
            let 插入内容;
            if (标记.startsWith('<svg')) {
                插入内容 = await 创建图片({文本: 标记, 文字方向: (文字位置 as any)[标记数据.上下] || '下'}, 配置);
            } else {
                插入内容 = 创建文字({文字: 标记, 文字方向: (文字位置 as any)[标记数据.上下] || '下'}, {...配置});
            }
            const 插入内容宽度 = 插入内容.width();
            插入内容.x(position + 插入内容宽度 / 2);
            position += 插入内容宽度;
            标记对象.add(插入内容);
            富文本对象集.push(插入内容);
        }
        富文本对象集.forEach(item => item.x(item.x() - position / 2));
    } else if (标记数据.svg || 标记数据.url) {
        标记对象.add(await 创建图片({文本: 标记数据.svg || 标记数据.url, 文字方向: (文字位置 as any)[标记数据.上下] || '下'}, 配置));
    } else if (标记数据.文本) {
        if (标记数据.文本.startsWith('$')) {
            标记对象.add(创建形状标记(标记数据, 配置));
        } /*else if(标记数据.文本.startsWith('<math')){

        }*/ else {
            标记对象.add(创建文字标记(标记数据, 配置));
        }
    }
    return 标记对象;
}

function 创建点标记(标记数据: 标记定义) {
    return new Konva.Circle({
        radius: fontSize / 5,
        strokeWidth: strokeWidth,
        stroke: theme.aid.mark,
        fill: 标记数据.形状 === '空心点' ? theme.aid.dotFill : theme.aid.mark
    });
}

function 创建刻度标记(标记数据: 标记定义, 教具类型: number) {
    return new Konva.Line({
        points: [0, 0, 0, -theme.aid.lineHeight - 教具类型],
        stroke: 标记数据.是否强调 ? theme.aid.mark : theme.aid.line,
        strokeWidth: strokeWidth,
        lineCap: lineGap[教具类型]
    });
}

function 创建文字标记(标记数据: 标记定义, 配置: Object = {}) {
    const 文字位置 = {上方: '上', 下方: '下', 上: '上', 下: '下', 左方: '左', 右方: '右'};
    return 创建文字({文字: 标记数据.文本, 文字方向: (文字位置 as any)[标记数据.上下] || '下'}, {...配置});
}

function 创建形状标记(标记数据: 标记定义, 配置: Object = {}) {
    const 文字位置 = {上方: '上', 下方: '下', 上: '上', 下: '下', 左方: '左', 右方: '右'};
    const 形状: string = 标记数据.文本.substring(1);
    if (!支持形状[形状]) {
        return 创建文字({文字: 标记数据.文本, 文字方向: (文字位置 as any)[标记数据.上下] || '下'}, {...配置});
    }
    return 创建形状({形状: 支持形状[形状], 方向: (文字位置 as any)[标记数据.上下] || '下'}, {...配置});
}

export function 创建区域(配置: {x: number; y: number; width: number; height: number}, id: string) {
    return new Konva.Rect({name: id, fill: theme.aid.area, ...配置});
}

export async function 创建方程(数据: {文本: string; 文字方向: string; x?: number; y?: number}) {
    return await 创建图片(数据, {fill: theme.aid.mark, 不需要偏移: true});
}
