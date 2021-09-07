import Konva from 'konva';

import {创建分段集, 创建刻度集, 创建线段, 创建概括对象, 创建标记对象, 创建区域, 创建方程, 创建文字} from './fractions';
import {
    线段数轴定义,
    概括集定义,
    折线定义,
    竖线定义,
    标记定义,
    刻度集定义,
    标记集定义,
    线段集定义,
    动画定义,
    十字相乘定义,
    坐标系定义,
    lineGap,
    aidType,
    flatDeep
} from './types';

import {Aid} from './Aid';
import {Group} from 'konva/types/Group';
import {Text} from 'konva/types/shapes/Text';
import {theme} from '@/index';
import {Shape} from 'konva/types/Shape';
import {Arrow} from 'konva/types/shapes/Arrow';

export class AxisAid extends Aid {
    constructor(container: HTMLDivElement, config: {domainX: [number, number]; domainY: [number, number]; nodeMap: Map<string, any>}) {
        super(container, config);
    }

    /**
     * 新增数轴
     * 包含数轴中的：刻度, 原始分段, 标记
     */
    async 新增数轴(线段数轴数据: 线段数轴定义, 教具类型: number = 2, fast: boolean = false) {
        let {刻度集, 原始分段集, 标记集, 教具id, 是否有刻度文字, 动画, 位置} = 线段数轴数据;
        let {垂向位置} = this.nodeMap.get(教具id);

        原始分段集 = 原始分段集.map(分段 => ({...分段, 定义: 分段.定义.map(this.xScale) as any}));
        刻度集 = 刻度集.map(刻度 => ({数字: this.xScale(刻度.数字), 替换文字: 刻度.替换文字 || 刻度.数字 + ''}));

        const 刻度高度 = theme.aid.lineHeight + 教具类型;
        const 线段数轴对象 = new Konva.Group({y: 垂向位置, name: 教具id});
        const 分段集对象 = 创建分段集(原始分段集, 位置 && 位置.偏移量 === 0 ? {stroke: theme.aid.mark} : {});
        const 刻度集对象 = 创建刻度集(刻度集, 刻度高度, {lineCap: lineGap[教具类型], 画板: this}, {是否有刻度文字});

        const 标记集对象 = await this.新增标记集(标记集, 教具类型);

        线段数轴对象.add(分段集对象);
        线段数轴对象.add(刻度集对象);
        线段数轴对象.add(标记集对象);
        this.layer.add(线段数轴对象);
        线段数轴对象.zIndex(位置 ? 1 : 0);
        return this.动画(线段数轴对象, 动画, fast);
    }

    /**
     * 新增标记集，包含文字标记、图形标记
     */
    async 新增标记集(标记集数据: 标记定义[], 教具类型: number, x = 0) {
        let 标记集对象 = new Konva.Group();

        for (let 标记 of 标记集数据) {
            let 标记对象 = await 创建标记对象(标记, 教具类型, x);
            标记对象 && 标记集对象.add(标记对象);
        }
        return 标记集对象;
    }

    /**
     * 新增概括集，垂直的花括号加文字
     */
    async 新增概括集(概括集数据: 概括集定义, fast: boolean = false) {
        let {概括集} = 概括集数据;

        概括集 = 概括集.map(概括 => {
            if (概括.左 > 概括.右) {
                let temp = 概括.左;
                概括.左 = 概括.右;
                概括.右 = temp;
            }
            return {...概括, 左: this.xScale(概括.左), 右: this.xScale(概括.右)};
        });
        const 概括高度 = 6 * this.unitY;
        const 概括集对象 = new Konva.Group();
        for (let 概括 of 概括集) {
            let {垂向位置, 偏移量} = this.nodeMap.get(概括.教具id);
            let 概括对象 = await 创建概括对象(概括, 概括高度, 偏移量 >= 0, {fill: theme.aid.mark});
            概括对象.setAttr('y', 垂向位置);
            概括集对象.add(概括对象);
        }

        this.layer.add(概括集对象);

        return this.渐变动画(概括集对象, fast);
    }

    /**
     * 新增竖线，分割线
     */
    新增竖线(竖线数据: 竖线定义, fast: boolean = false) {
        let {上端, 下端, 坐标, 线型, 上露头, 下露头} = 竖线数据;
        let {垂向位置: 上端垂向位置} = this.nodeMap.get(上端);
        let {垂向位置: 下端垂向位置} = this.nodeMap.get(下端);
        let 延伸长度 = 24;

        坐标 = Math.floor(this.xScale(坐标));
        let 定义 = [坐标, 上端垂向位置 + (上露头 ? -延伸长度 : 0), 坐标, 下端垂向位置 + (下露头 ? 延伸长度 : 0)];
        let 竖线对象 = 创建线段({定义, 线型}, {dash: [4, 4], strokeWidth: 2, fill: theme.aid.mark, stroke: theme.aid.mark});

        this.layer.add(竖线对象);
        竖线对象.zIndex(10);
        return this.渐变动画(竖线对象, fast);
    }

    /**
     * 新增折线，用于表示线段、数轴上的集合关系
     */
    async 新增折线(折线数据: 折线定义, fast: boolean = false) {
        let {右, 左, 教具id, 标记集, 方向} = 折线数据;
        let {垂向位置, 高度} = this.nodeMap.get(教具id);
        if (方向 === '左') [左, 右] = [右, 左];

        let 横向 = [左, 右].map(值 => this.xScale(值));
        let 定义 = [横向[0], 0, 横向[0], 0 - 高度, 横向[1], 0 - 高度];
        if (方向 === '闭') 定义 = 定义.concat([横向[1], 0]);

        let 折线对象 = new Konva.Group({name: 教具id, y: 垂向位置});
        let 折线线段 = 创建线段({定义, 线型: '实线', 教具id: 教具id + '折线'}, {stroke: theme.aid.mark});

        折线对象.add(折线线段);

        折线对象.add(await this.新增标记集(标记集, 2));

        this.layer.add(折线对象);

        return this.渐变动画(折线对象, fast);
    }

    /**
     * 更新折线，用于表示线段、数轴上的集合关系
     * 更新内容包括折线、折线上的标识以及折线本身
     */
    async 更新折线(折线数据: 折线定义) {
        let {右, 左, 教具id, 标记集, 方向, 区域, 是否隐藏区域} = 折线数据;
        let {高度, 垂向位置} = this.nodeMap.get(教具id);
        let 折线线段 = this.layer.findOne(`.${教具id}折线`);
        if ((方向 && 方向 === '左') || (右 !== undefined && 方向 !== '闭')) [左, 右] = [右, 左];

        let 原定义 = 折线线段.getAttr('points');
        let 横向 = [左, 右].map(值 => this.xScale(值));
        let 定义 = [横向[0] || 原定义[0], 0, 横向[0] || 原定义[0], 0 - 高度, 横向[1] || 原定义[4], 0 - 高度];
        if (方向 === '闭') 定义 = 定义.concat([横向[1] || 原定义[4], 0]);

        let 标记对象集 = this.layer.find(`.${教具id}标记对象`);
        let animationPromises = [];
        if (区域 && !是否隐藏区域) {
            区域 = 区域.map(值 => (值 ? this.xScale(值) : null)) as any;
            区域 = [区域[0] || 横向[0] || 原定义[0], 区域[1] || 横向[1] || 原定义[4]];

            let 区域对象: Shape = this.layer.findOne(`.${教具id}区域`);
            let 配置 = {x: 区域[0], y: 垂向位置 - 高度, width: 区域[1] - 区域[0], height: 高度};

            if (区域对象) {
                animationPromises.push(this.配置动画(区域对象, 配置));
            } else {
                let 区域对象 = 创建区域(配置, `${教具id}区域`);
                this.layer.add(区域对象);
                animationPromises.push(this.渐变动画(区域对象));
            }
        }

        if (是否隐藏区域) {
            let 区域对象 = this.layer.findOne(`.${教具id}区域`);
            区域对象 && 区域对象.remove();
        }

        标记对象集.each(async (标记对象: any) => {
            animationPromises.push(this.配置动画(标记对象, {x: 横向[0] || 原定义[0]}));
        });

        animationPromises.push(
            new Promise(resolve => {
                new Konva.Tween({node: 折线线段, duration: 0.8, points: 定义, onFinish: resolve}).play();
            })
        );

        return Promise.all(animationPromises);
    }

    /**
     * 强调标记集，对已有的标记进行高亮，不存在的标记则重新生成
     */
    async 强调标记集(标记集数据: 标记集定义, fast: boolean = false) {
        let {强调标记集, 教具id} = 标记集数据;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        //@ts-ignore
        const 教具类型 = aidType[this.nodeMap.get(教具id).类型];

        let 标记集 = (强调标记集 || []).map(item => item);

        for (let 标记 of 标记集) {
            let {文本, 教具id} = 标记;
            let 标记对象: Group = 教具.findOne(`.${教具id}`);

            if (标记对象) {
                强调标记集.splice(强调标记集.indexOf(标记), 1);
                let 标记文本: Text = 标记对象.findOne(`.${文本}`);
                标记文本 && 标记文本.fill(theme.aid.mark);
            }
        }

        if (!强调标记集.length) return;
        let 标记集对象 = await this.新增标记集(强调标记集, 教具类型, this.xScale(0));

        教具.add(标记集对象);
        return this.渐变动画(标记集对象, fast);
    }

    /**
     * 强调折线，对已有的刻度进行高亮，不存在的刻度则重新生成
     * 包含折线，以及折线上的标记
     */
    强调刻度集(刻度集数据: 刻度集定义, fast: boolean = false) {
        let {强调刻度集, 教具id} = 刻度集数据;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        const 刻度高度 = 5;

        const 强调刻度集2 = 强调刻度集.map(值 => ({数字: this.xScale(值), 替换文字: 值 + ''}));
        let 刻度集 = (强调刻度集2 || []).map(item => item);

        for (let 刻度 of 刻度集) {
            let 刻度文本: Text = 教具.findOne(`.${刻度.替换文字}`);

            if (刻度文本) {
                强调刻度集2.splice(强调刻度集2.indexOf(刻度), 1);
                刻度文本 && 刻度文本.fill(theme.aid.mark);
            }
        }

        if (!强调刻度集2.length) return;
        const 刻度集对象 = 创建刻度集(强调刻度集2, 刻度高度, {lineCap: 'round'}, {fill: theme.aid.mark, 是否有刻度文字: true});

        教具.add(刻度集对象);
        return this.渐变动画(刻度集对象, fast);
    }

    隐藏刻度(刻度集数据: 刻度集定义) {
        const {隐藏刻度集 = [], 教具id} = 刻度集数据;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        for (let 刻度 of 隐藏刻度集) {
            let 刻度文本: Text = 教具.findOne(`.${刻度}`);
            刻度文本 && 刻度文本.fill(theme.aid.text);
        }

        this.layer.draw();
    }

    /**
     * 隐藏对应的教具图元
     */
    隐藏教具(教具标记集: string[]) {
        for (let 标记 of 教具标记集) {
            let 教具集 = this.layer.find(`.${标记}`);
            教具集.each(async (教具: any) => await this.渐隐移除(教具 as any));
        }
    }

    /**
     * 移动标记集，对已有的标记进行移动，不存在的标记则重新生成
     */
    async 移动标记集(标记集数据: 标记集定义) {
        let {移动标记集, 动画, 教具id} = 标记集数据;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        //@ts-ignore
        const 教具类型 = aidType[this.nodeMap.get(教具id).类型];

        let 标记集 = (移动标记集 || []).map(item => item);

        for (let 标记 of 标记集) {
            let {教具id} = 标记;
            let 标记对象: any = this.layer.findOne(`.${教具id}`);

            if (标记对象) {
                移动标记集.splice(移动标记集.indexOf(标记), 1);
                await this.移动动画(标记对象, 动画, {x: 标记.坐标[0], y: 标记.坐标[1] || 0});
            }
        }

        if (!移动标记集.length) return;

        let 标记集对象 = await this.新增标记集(移动标记集, 教具类型);

        教具.add(标记集对象);
        return this.渐变动画(标记集对象);
    }

    async 强调线段集(教具指令: 线段集定义, fast: boolean = false) {
        let {强调线段集, 教具id} = 教具指令;
        let 线段集对象 = new Konva.Group();
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        for (let 强调线段 of 强调线段集) {
            let 强调线段对象 = new Konva.Group();
            let 定义 = [];
            let {标记集, 左, 右} = 强调线段;
            for (let 标记 of 标记集) {
                标记.坐标 = 标记.坐标.map(this.xScale);
                定义.push(标记.坐标[0], 标记.坐标[1]);
                const 标记对象 = await 创建标记对象(标记, 1);
                强调线段对象.add(标记对象);
            }
            const 线段对象 = 创建线段({定义, 线型: '', 教具id: 教具id}, {stroke: theme.aid.mark});
            强调线段对象.add(线段对象);
            线段集对象.add(强调线段对象);
        }
        教具.add(线段集对象);
        return this.渐变动画(线段集对象, fast);
    }

    async 新增十字相乘法(教具指令: 十字相乘定义, fast: boolean = false) {
        let {教具id, 方程svg, 二次项系数, 常数项, 十字相乘结果svg} = 教具指令;
        let {垂向位置} = this.nodeMap.get(教具id);
        let 十字相乘对象 = new Konva.Group({x: this.paddingX, y: 垂向位置, name: 教具id});
        const 方程对象 = await 创建方程({文本: 方程svg, 文字方向: '下'});
        十字相乘对象.add(方程对象);
        const 二次项系数对象集: Array<Konva.Shape> = [];
        const 常数项对象集: Array<Konva.Shape> = [];
        二次项系数.map((系数, index) => {
            const 文字对象 = 创建文字(
                {文字: 系数 + '', 文字方向: '下', y: 方程对象.height() * (index + 1) * 1.2 + 8},
                {fill: theme.aid.mark, 不需要偏移: true, fontSize: 18}
            );
            二次项系数对象集.push(文字对象);
            十字相乘对象.add(文字对象);
        });
        常数项.map((系数, index) => {
            const 文字对象 = 创建文字(
                {文字: 系数 + '', 文字方向: '下', y: 方程对象.height() * (index + 1) * 1.2 + 8, x: 方程对象.width() - 40},
                {fill: theme.aid.mark, 不需要偏移: true, fontSize: 18}
            );
            常数项对象集.push(文字对象);
            十字相乘对象.add(文字对象);
        });
        const leftX = 二次项系数对象集[0].x() + 二次项系数对象集[0].width() + 5;
        const rightX = 常数项对象集[1].x() - 5;
        const topY = 二次项系数对象集[0].y() - 二次项系数对象集[0].offsetY() + 二次项系数对象集[0].height() / 2 - 6;
        const bottomY = 二次项系数对象集[1].y() - 二次项系数对象集[1].offsetY() + 二次项系数对象集[1].height() / 2 - 6;
        const 线段对象1 = 创建线段({定义: [leftX, topY, rightX, bottomY], 线型: '实线'});
        const 线段对象2 = 创建线段({定义: [leftX, bottomY, rightX, topY], 线型: '实线'});
        十字相乘对象.add(线段对象1);
        十字相乘对象.add(线段对象2);
        const dividerLineY = 二次项系数对象集[1].y() - 二次项系数对象集[1].offsetY() + 二次项系数对象集[1].height();
        const dividerLineX = 常数项对象集[1].x() + 常数项对象集[1].width();
        const 分割对象 = 创建线段({定义: [0, dividerLineY, dividerLineX, dividerLineY], 线型: '实线'});
        十字相乘对象.add(分割对象);

        const 十字相乘结果 = await 创建方程({文本: 十字相乘结果svg, 文字方向: '下', y: dividerLineY});
        十字相乘对象.add(十字相乘结果);

        this.layer.add(十字相乘对象);
        return this.渐变动画(十字相乘对象, fast);
    }

    async 新增坐标系(教具指令: 坐标系定义, fast: boolean = false) {
        let {教具id, 轴集, 是否有刻度文字, 左, 右, 上, 下, 网格, 刻度间距 = 1, 原点 = true, 轴 = true} = 教具指令;
        const [x轴, y轴] = 轴集;
        let {垂向位置} = this.nodeMap.get(教具id);
        let 坐标系 = new Konva.Group({
            y: 垂向位置
        });
        let 坐标系对象 = new Konva.Group({
            name: 教具id
        });
        let 坐标系函数区域对象 = new Konva.Group({
            name: 教具id + '函数区域',
            clipX: this.xScale(左),
            clipY: this.xScale(0) - this.xScale(上),
            clipWidth: this.viewport.width,
            clipHeight: this.viewport.height
        });
        if (轴) {
            let x轴对象 = this.新增x轴(x轴, 垂向位置, 教具id, 是否有刻度文字, 原点);
            let y轴对象 = this.新增y轴(y轴, 垂向位置, 教具id, 是否有刻度文字, 原点);
            坐标系对象.add(x轴对象);
            坐标系对象.add(y轴对象);
        }
        if (网格) {
            let 网格对象 = this.新增网格(左, 右, 上, 下, 网格, 刻度间距);
            坐标系对象.add(网格对象);
        }
        坐标系.add(坐标系对象);
        坐标系.add(坐标系函数区域对象);
        this.layer.add(坐标系);
        return this.渐变动画(坐标系, fast);
    }

    新增x轴(线段数轴数据: 线段数轴定义, 垂向位置: number, 教具id: string, 是否有刻度文字: boolean, 原点: boolean) {
        let {刻度集, 原始分段集, 右} = 线段数轴数据;

        原始分段集 = 原始分段集.map(分段 => ({...分段, 定义: 分段.定义.map(this.xScale) as any}));
        刻度集 = 刻度集
            .filter(刻度 => 刻度.数字 !== 0)
            .map(刻度 => ({数字: this.xScale(刻度.数字), 替换文字: 刻度.替换文字 || 刻度.数字 + ''}));

        const 刻度高度 = theme.aid.lineHeight;
        const 线段数轴对象 = new Konva.Group({name: 教具id + 'x轴'});
        const 分段集对象 = 创建分段集(原始分段集);
        const 刻度集对象 = 创建刻度集(刻度集, 刻度高度, {lineCap: lineGap[0]}, {是否有刻度文字});
        if (原点) {
            刻度集对象.add(创建文字({文字: 'x', 文字方向: '下', x: this.xScale(右)}, {fill: theme.aid.mark}));
        }

        线段数轴对象.add(分段集对象);
        线段数轴对象.add(刻度集对象);
        return 线段数轴对象;
    }

    新增y轴(线段数轴数据: 线段数轴定义, 垂向位置: number, 教具id: string, 是否有刻度文字: boolean, 原点: boolean) {
        let {刻度集, 原始分段集, 右} = 线段数轴数据;
        const 原点坐标 = this.xScale(0);
        原始分段集 = 原始分段集.map(分段 => ({...分段, 定义: 分段.定义.map(this.xScale).map(y => 原点坐标 - y) as any}));
        刻度集 = 刻度集
            .filter(刻度 => 刻度.数字 !== 0)
            .map(刻度 => ({数字: 原点坐标 - this.xScale(刻度.数字), 替换文字: 刻度.替换文字 || 刻度.数字 + ''}));
        const 刻度高度 = theme.aid.lineHeight;
        const 线段数轴对象 = new Konva.Group({x: this.xScale(0), name: 教具id + 'y轴'});
        const 分段集对象 = 创建分段集(原始分段集, {}, true);
        const 刻度集对象 = 创建刻度集(刻度集, 刻度高度, {lineCap: lineGap[0]}, {是否有刻度文字, 是否垂直: true}, true);
        if (原点) {
            刻度集对象.add(创建文字({文字: 'O', 文字方向: '下', y: 0}, {是否垂直: true}));
            刻度集对象.add(
                创建文字({文字: 'y', 文字方向: '下', y: this.xScale(0) - this.xScale(右)}, {是否垂直: true, fill: theme.aid.mark})
            );
        }
        线段数轴对象.add(分段集对象);
        线段数轴对象.add(刻度集对象);
        return 线段数轴对象;
    }

    新增网格(左: number, 右: number, 上: number, 下: number, 网格: string, 刻度间距: number) {
        let xArray: Array<number> = [];
        let yArray: Array<number> = [];
        for (let x = 左 + 刻度间距; x < 右; x += 刻度间距) {
            xArray.push(this.xScale(x));
        }
        for (let y = 下 + 刻度间距; y < 上; y += 刻度间距) {
            yArray.push(this.scaleY(y));
        }
        let 网格对象 = new Konva.Group();
        xArray.map(x => {
            网格对象.add(
                创建线段({定义: [x, yArray[0], x, yArray[yArray.length - 1]], 线型: 网格}, {strokeWidth: 1, stroke: theme.aid.mark})
            );
        });
        yArray.map(y => {
            网格对象.add(
                创建线段({定义: [xArray[0], y, xArray[xArray.length - 1], y], 线型: 网格}, {strokeWidth: 1, stroke: theme.aid.mark})
            );
        });
        return 网格对象;
    }

    强调函数集(教具指令: 坐标系定义, fast: boolean = false) {
        //debugger
        let {点集, 教具id} = 教具指令;
        let 教具: Group = this.layer.findOne(`.${教具id}函数区域`);
        点集.map(async dotArray => {
            let fLine = new Konva.Line({
                points: flatDeep(dotArray),
                stroke: theme.aid.mark,
                strokeWidth: 2,
                fill: theme.aid.mark,
                tension: 0
            });
            教具.add(fLine);
            await this.渐变动画(fLine, fast);
        });
        return 教具;
    }

    async 强调形状(教具指令: 坐标系定义, fast: boolean = false) {
        let {强调形状, 教具id, 圆} = 教具指令;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        let {点集, 是否强调, 是否填充, 虚线, 教具id: 形状教具id} = 强调形状;
        const 形状对象 = new Konva.Group({name: 形状教具id});
        const config = {
            stroke: 是否强调 ? theme.aid.mark : theme.aid.line,
            strokeWidth: 2,
            dash: [4, 4],
            dashEnabled: 虚线
        };
        if (圆) {
            let 圆心标记 = 点集[0];
            let 半径 = 点集[1].坐标[0];
            let 角度 = (点集[2] && 点集[2].坐标[0]) || 360;
            let 位置 = (点集[3] && 点集[3].坐标[0]) || 0;
            圆心标记.坐标 = [this.xScale(圆心标记.坐标[0]), this.xScale(0) - this.xScale(圆心标记.坐标[1])];
            let 标记对象 = await 创建标记对象(圆心标记, 0);
            形状对象.add(标记对象);
            const 扇形数据 = Object.assign({}, config, {
                x: 圆心标记.坐标[0],
                y: 圆心标记.坐标[1],
                outerRadius: 半径 * this.unitX,
                angle: 角度,
                rotation: 位置 - 90
            });
            const fLine = new Konva.Arc(
                Object.assign({}, 扇形数据, {
                    innerRadius: 半径 * this.unitX
                })
            );
            形状对象.add(fLine);
            if (是否填充) {
                const fFill = new Konva.Arc(
                    Object.assign({}, 扇形数据, {
                        innerRadius: 0,
                        stroke: 'transparent',
                        fill: theme.aid.fill
                    })
                );
                形状对象.add(fFill);
            }
        } else {
            点集 = 点集.map(标记 => {
                let {坐标} = 标记;
                标记.坐标 = [this.xScale(坐标[0]), this.xScale(0) - this.xScale(坐标[1])];
                return 标记;
            });
            点集.map(async 标记 => {
                const 标记对象 = await 创建标记对象(标记, 0);
                形状对象.add(标记对象);
            });
            //当形状是线段时，不要close，不然虚线会重复画
            const fLine = new Konva.Line({
                points: flatDeep(点集.map(dot => dot.坐标)),
                closed: 点集.length !== 2,
                fill: 是否填充 && 点集.length !== 2 ? theme.aid.fill : 'transparent',
                ...config
            });
            形状对象.add(fLine);
        }
        教具.add(形状对象);
        return this.渐变动画(形状对象, fast);
    }

    async 移动形状(教具指令: 坐标系定义) {
        let {移动形状, 教具id, 圆} = 教具指令;
        let 教具: Group = this.layer.findOne(`.${教具id}`);
        let {移动, 旋转, 点集, 教具id: 形状教具id} = 移动形状;
        let 形状: Group = 教具.findOne(`.${形状教具id}`);
        if (形状) {
            const x = 形状.getAttr('x');
            const y = 形状.getAttr('y');
            if (移动) {
                for (let item of 移动) {
                    let {方向, 移动量} = item;
                    移动量 = this.unitX * 移动量;
                    if (方向[0] === '左') {
                        await this.移动动画(形状, null, {x: x - 移动量});
                    } else if (方向[0] === '右') {
                        await this.移动动画(形状, null, {x: x + 移动量});
                    } else if (方向[0] === '上') {
                        await this.移动动画(形状, null, {y: y - 移动量});
                    } else if (方向[0] === '下') {
                        await this.移动动画(形状, null, {y: y + 移动量});
                    }
                }
            } else if (旋转) {
                let {点, 角度} = 旋转;
                形状.offsetX(this.xScale(点[0]));
                形状.setAttr('x', 形状.x() + this.xScale(点[0]));
                形状.offsetY(this.xScale(0) - this.xScale(点[1]));
                形状.setAttr('y', 形状.y() + this.xScale(0) - this.xScale(点[1]));
                await this.旋转动画(形状, 角度);
            } else if (点集) {
                if (圆) {
                    let 圆心标记 = 点集[0];
                    let 半径 = 点集[1].坐标[0];
                    let 角度 = (点集[2] && 点集[2].坐标[0]) || 360;
                    let 位置 = (点集[3] && 点集[3].坐标[0]) || 0;
                    圆心标记.坐标 = [this.xScale(圆心标记.坐标[0]), this.xScale(0) - this.xScale(圆心标记.坐标[1])];
                    let 标记对象 = await 创建标记对象(圆心标记, 0);
                    形状.add(标记对象);
                    let fLine: Konva.Shape = 形状.findOne('Arc');
                    await this.配置动画(fLine, {
                        innerRadius: 半径 * this.unitX,
                        outerRadius: 半径 * this.unitX,
                        angle: 角度,
                        rotation: 位置 - 90
                    });
                } else {
                    点集 = 点集.map(标记 => {
                        let {坐标} = 标记;
                        标记.坐标 = [this.xScale(坐标[0]), this.xScale(0) - this.xScale(坐标[1])];
                        return 标记;
                    });
                    点集.map(async 标记 => {
                        let 标记对象 = await 创建标记对象(标记, 0);
                        形状.add(标记对象);
                    });
                    let fLine: Konva.Shape = 形状.findOne('Line');
                    await this.配置动画(fLine, {
                        points: flatDeep(点集.map(dot => dot.坐标))
                    });
                }
            }
        }
    }

    private 渐隐移除(动画对象: Konva.Shape | Konva.Group) {
        return new Promise(resolve => {
            new Konva.Tween({
                node: 动画对象,
                duration: 0.3,
                opacity: 0,
                onFinish: () => {
                    resolve();
                    动画对象.hide();
                }
            }).play();
        });
    }

    private 渐变动画(动画对象: Konva.Shape | Konva.Group, fast: boolean = false) {
        if (fast) {
            动画对象.draw();
            return;
        }
        return new Promise(resolve => {
            动画对象.setAttr('opacity', 0.1);
            new Konva.Tween({node: 动画对象, duration: 0.3, opacity: 1, onFinish: resolve}).play();
        });
    }

    private 默认移动(动画对象: Konva.Shape | Konva.Group, 位置: {x?: number; y?: number}, fast: boolean = false) {
        return new Promise(resolve => {
            new Konva.Tween({
                node: 动画对象,
                duration: 0.8,
                onFinish: () => {
                    resolve();
                },
                ...位置
            }).play();
        });
    }

    private 动画(动画对象: Konva.Shape | Konva.Group, 动画: 动画定义, fast: boolean = false) {
        if (fast) {
            动画对象.draw();
            return;
        }
        if (动画) {
            if (动画.类型 === '擦除') {
                if (动画对象 instanceof Konva.Group) {
                    const arrow: any = 动画对象.findOne('Arrow');
                    const originPoints = arrow.getAttr('points');
                    arrow.setAttr('points', [originPoints[0], originPoints[1], originPoints[0], originPoints[1]]);
                    return this.配置动画(arrow, {points: originPoints}, 2);
                } else {
                    return this.渐变动画(动画对象);
                }
            }
        }
        return this.渐变动画(动画对象);
    }

    private 配置动画(动画对象: Konva.Shape | Konva.Group, 配置: any, time = 1) {
        return new Promise(resolve => {
            new Konva.Tween({node: 动画对象, duration: 0.8, onFinish: resolve, ...配置}).play();
        });
    }

    private 旋转动画(动画对象: Konva.Shape | Konva.Group, 角度: number) {
        return new Promise(resolve => {
            new Konva.Tween({
                node: 动画对象,
                duration: 1.8,
                onFinish: () => {
                    resolve();
                },
                rotation: 角度
            }).play();
        });
    }

    private 移动动画(动画对象: Konva.Shape | Konva.Group, 动画: 动画定义 | null, 位置: {x?: number; y?: number}) {
        if (动画) {
            if (动画.类型 === '动点') {
                return new Promise(resolve => {
                    //@ts-ignore
                    let tl = new TimelineLite({onComplete: resolve});
                    tl.to(动画对象, 0.5, {
                        konva: {
                            opacity: 0.5
                        }
                    })
                        .to(动画对象, 0.5, {
                            konva: {
                                opacity: 1
                            }
                        })
                        .to(动画对象, 0.5, {
                            konva: {
                                opacity: 0.5
                            }
                        })
                        .to(动画对象, 0.5, {
                            konva: {
                                opacity: 1
                            }
                        })
                        .to(动画对象, 0.8, {
                            konva: {
                                ...位置
                            }
                        });
                });
            }
        }
        return this.默认移动(动画对象, 位置);
    }

    scaleY(坐标: number) {
        return this.xScale(0) - this.xScale(坐标);
    }
}
