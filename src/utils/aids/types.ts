/**
 * 新定义指令类型
 */
export interface 刻度定义 {
    数字: number;
    替换文字: string;
}

export interface 标记定义 {
    教具id: string;
    坐标: Array<number>;
    上下: string;
    形状: string;
    文本: string;
    是更新: boolean;
    所在线: string;
    是否强调: boolean;
    标记偏移量: number;
    标记线: boolean;
    url: string;
    svg: string;
    富文本: Array<string>;
}

export interface 分段定义 {
    定义: [number, number];
    左: number;
    右: number;
    连接线: string;
    线型: string;
    箭头: string;
}

export interface 参数定义 {
    定义: string;
    参数名: string;
    参数说明集: [];
    x标记: boolean;
    参数定义: string;
}

interface 位置定义 {
    偏移量: number;
    相对教具名: string;
}

export interface 概括定义 {
    教具id: string;
    左: number;
    右: number;
    文本: string;
    svg?: string;
    形状: string;
    位置: 位置定义;
    是更新: boolean;
    所在线: string;
}

export interface 动画定义 {
    类型: string;
    方向: string;
}

export interface 线段数轴定义 {
    名称: string;
    教具id: string;
    是否有刻度文字: boolean;
    刻度间距: number;
    标记集: Array<标记定义>;
    刻度集: Array<刻度定义>;
    原始分段集: Array<分段定义>;
    动画: 动画定义;
    左: number;
    右: number;
    左露头: boolean;
    右露头: boolean;
    位置: {
        偏移量: number;
    };
}

export interface 概括集定义 {
    教具id: string;
    名称: string;
    参数集: Array<参数定义>;
    概括集: Array<概括定义>;
}

export interface 折线定义 {
    教具id: string;
    名称: string;
    参数集: Array<参数定义>;
    位置: 位置定义;
    标记集: Array<标记定义>;
    原始分段集: Array<分段定义>;
    左: number;
    右: number;
    方向: '左' | '右' | '闭';
    是否隐藏区域: boolean;
    区域: [number, number];
}

export interface 强调线段定义 {
    左: number;
    右: number;
    教具id: string;
    标记集: Array<标记定义>;
}

export interface 竖线定义 {
    教具id: string;
    上端: string;
    上露头: boolean;
    下端: string;
    下露头: boolean;
    参数集: [];
    名称: string;
    坐标: number;
    定义: string;
    是更新: false;
    线型: '虚线';
}

export interface 刻度集定义 {
    教具id: string;
    强调刻度集: number[];
    隐藏刻度集: number[];
}

export interface 标记集定义 {
    教具id: string;
    强调标记集: Array<标记定义>;
    移动标记集: Array<标记定义>;
    动画: 动画定义;
}

export interface 线段集定义 {
    教具id: string;
    所在线: string;
    强调线段集: Array<强调线段定义>;
}

export interface 十字相乘定义 {
    教具id: string;
    方程: string;
    方程svg: string;
    十字相乘结果svg: string;
    二次项系数: Array<number>;
    常数项: Array<number>;
}

export interface 坐标系定义 {
    教具id: string;
    是否有刻度文字: boolean;
    网格: string;
    轴集: Array<线段数轴定义>;
    点集: Array<Array<Array<number>>>;
    强调形状: 形状定义;
    移动形状: 形状定义;
    原点: boolean;
    轴: boolean;
    圆: boolean;
    刻度间距: number;
    左: number;
    右: number;
    上: number;
    下: number;
}

export interface 形状定义 {
    教具id: string;
    所在线: string;
    是否强调: boolean;
    是否填充: boolean;
    虚线: boolean;
    点集: Array<标记定义>;
    移动: Array<移动定义>;
    旋转: 旋转定义;
}

export interface 移动定义 {
    方向: string;
    移动量: number;
}

export interface 旋转定义 {
    点: Array<number>;
    角度: number;
}

export interface 语义布局定义 {
    左: number;
    右: number;
    线段与数轴队列: Array<any>;
    独立区: Array<any>;
}

export const lineGap = ['round', 'square', 'round'];

export const aidType = {
    数轴: 2,
    线段: 1,
    坐标系: 0
};

export function flatDeep(arr: Array<any>, d = 1): Array<any> {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
}
