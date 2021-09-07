import {HandlerTemplate} from './handler-template';
import {解析语义布局} from './axis-helper';
import {AxisAid, goto} from '@/utils';

export class AidsHandler extends HandlerTemplate {
    subscribe(): void {
        /**
         * 新增画板，对画板上的图元进行位置计算
         */
        this.onInstruction('新增画板', async (instruction, done) => {
            const path = instruction.path;
            const node = this.pathMap.get(path);

            if (!node) {
                done.run();
                return;
            }

            this.updateNode();
            let retry = 0;
            //abc从某步执行可能会有节点还没好的问题，通过该判断直到节点初始化好了
            while (!node.$el && retry < 5) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                retry++;
            }
            const {语义布局, 内容} = instruction.params;
            const container = node.$el as HTMLDivElement;
            if (!container) {
                done.run();
                return;
            }
            const {图形字典, 画布高度} = 解析语义布局(语义布局);
            const aid = new AxisAid(container, {
                domainX: [语义布局.左, 语义布局.右],
                domainY: [画布高度, 0],
                nodeMap: 图形字典
            });

            this.aidMap.set(内容, aid);
            await goto(container as HTMLElement, {container: '#tutorBoardContent', offset: 0});

            done.run();
        });

        /**
         * 新增线段，线段数轴是一样的
         */
        this.onInstruction('新增数轴', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增数轴(教具, 2, done.fast));
            done.run();
        });

        /**
         * 新增线段，线段数轴是一样的
         */
        this.onInstruction('新增线段', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增数轴(教具, 1, done.fast));
            done.run();
        });

        /**
         * 更新教具数轴、线段，
         * 目前更新线段，是有则重新渲染，无则新增
         * 更新内容包含数轴上的：刻度集, 原始分段集, 标记集
         */
        this.onInstruction('更新线段', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增数轴(教具, 1, done.fast));
            done.run();
        });

        /**
         * 新增竖线，分割竖线
         */
        this.onInstruction('新增竖线', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增竖线(教具, done.fast));
            done.run();
        });

        /**
         * 表示集合关系的折线
         */
        this.onInstruction('新增折线', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增折线(教具, done.fast));
            done.run();
        });

        /**
         * 更新折线表示集合关系的折线，包含折线上的标记，
         * 折线的位置，以及折线上的区域
         */
        this.onInstruction('更新折线', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            /*if(done.fast){
                done.run()
                return
            }*/
            canvas && (await canvas.更新折线(教具));
            done.run();
        });

        /**
         * 强调包含新增，有则重新渲染显示，无则新增
         */
        this.onInstruction('强调概括集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增概括集(教具, done.fast));
            done.run();
        });

        /**
         * 强调包含新增，有则重新渲染显示，无则新增
         */
        this.onInstruction('强调标记集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.强调标记集(教具, done.fast));
            done.run();
        });

        /**
         * 强调包含新增，有则重新渲染显示，无则新增
         */
        this.onInstruction('强调刻度集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.强调刻度集(教具, done.fast));
            done.run();
        });

        /**
         * 移动包含新增，有则移动，无则新增
         */
        this.onInstruction('移动标记集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            /*if(done.fast){
                done.run()
                return
            }*/
            canvas && (await canvas.移动标记集(教具));
            done.run();
        });

        /**
         * 隐藏概括集
         */
        this.onInstruction('隐藏概括集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            /*if(done.fast){
                done.run()
                return
            }*/
            const {隐藏概括集} = 教具;
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.隐藏教具(隐藏概括集.map((概括: any) => 概括.教具id)));
            done.run();
        });

        /**
         * 隐藏标记集，隐藏对应标记
         */
        this.onInstruction('隐藏标记集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            /*if(done.fast){
                done.run()
                return
            }*/
            const {隐藏标记集} = 教具;
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.隐藏教具(隐藏标记集.map((标记: any) => 标记.教具id)));
            done.run();
        });

        /**
         * 隐藏刻度集，隐藏对应刻度
         * TODO：目前刻度没有id标识
         */
        this.onInstruction('隐藏刻度集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            /*if(done.fast){
                done.run()
                return
            }*/
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.隐藏刻度(教具));
            done.run();
        });

        this.onInstruction('强调线段集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.强调线段集(教具, done.fast));
            done.run();
        });

        this.onInstruction('新增十字相乘法', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增十字相乘法(教具, done.fast));
            done.run();
        });

        this.onInstruction('新增坐标系', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.新增坐标系(教具, done.fast));
            done.run();
        });

        this.onInstruction('强调函数集', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.强调函数集(教具, done.fast));
            done.run();
        });

        this.onInstruction('强调形状', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            canvas && transformAid(教具, canvas);
            canvas && (await canvas.强调形状(教具, done.fast));
            done.run();
        });

        this.onInstruction('移动形状', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            /*if(done.fast){
                done.run()
                return
            }*/
            canvas && (await canvas.移动形状(教具));
            done.run();
        });

        this.onInstruction('隐藏形状', async (instruction, done) => {
            const {教具} = instruction.params;
            const canvas = this.aidMap.get(教具.所属画板);
            /*if(done.fast){
                done.run()
                return
            }*/
            canvas && (await canvas.隐藏教具([教具.隐藏形状.教具id]));
            done.run();
        });
    }
}

function transformAid(教具: any, canvas: AxisAid) {
    教具.强调标记集 = transformMark(教具.强调标记集, canvas);
    教具.移动标记集 = transformMark(教具.移动标记集, canvas);
    教具.标记集 = transformMark(教具.标记集, canvas);
    教具.清除标记集 = transformMark(教具.清除标记集, canvas);
    教具.点集 = transformDot(教具.点集, canvas);
}

function transformMark(标记集: any, canvas: AxisAid) {
    return (
        (标记集 &&
            标记集.length > 0 &&
            标记集.map((标记: any) => {
                if (Array.isArray(标记.坐标)) {
                    标记.坐标 = 标记.坐标.map((坐标: any, index: number) => {
                        if (index === 0) {
                            return canvas.xScale(坐标);
                        } else {
                            return canvas.xScale(0) - canvas.xScale(坐标);
                        }
                    });
                } else {
                    标记.坐标 = [canvas.xScale(标记.坐标)];
                }
                return 标记;
            })) ||
        []
    );
}

function transformDot(点点集: any, canvas: AxisAid) {
    return (
        点点集 &&
        点点集.map((点集: any) => {
            return 点集.map((点: any) => {
                const [x, y] = 点;
                return [canvas.xScale(x), canvas.xScale(0) - canvas.xScale(y)];
            });
        })
    );
}
