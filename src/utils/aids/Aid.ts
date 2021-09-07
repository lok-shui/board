import Konva from 'konva';
import {scaleLinear, ScaleLinear} from 'd3-scale';

export abstract class Aid {
    stage: Konva.Stage;
    layer: Konva.Layer;
    viewport: {width: number; height: number};

    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;

    //上下安全距离为15
    paddingX: number = 15;
    paddingY: number = 20;

    unitX!: number;
    unitY!: number;

    nodeMap: Map<string, any>;

    constructor(
        container: HTMLDivElement,
        {domainX, domainY, nodeMap}: {domainX: [number, number]; domainY: [number, number]; nodeMap: Map<string, any>}
    ) {
        container.style.maxWidth = '600px';
        let {width, height} = container.getBoundingClientRect();
        let canvasHeight = Math.abs(domainY[1] - domainY[0]);
        container.style.height = canvasHeight + this.paddingY * 2 + 'px';
        ({width, height} = container.getBoundingClientRect());
        const 坐标系 = Array.from(nodeMap.values()).find(aid => aid.类型 === '坐标系');
        if (坐标系) {
            if (width > 275) {
                container.style.width = 坐标系.width + 30 + 'px';
            }
        } else {
            if (width > 345) {
                container.style.width = 345 + 'px';
            }
        }
        ({width, height} = container.getBoundingClientRect());

        this.viewport = {width: width - this.paddingX * 2, height: height - this.paddingY * 2};

        this.stage = new Konva.Stage({
            container: container,
            width: width,
            height: height
        });

        this.nodeMap = nodeMap;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.xScale = scaleLinear()
            .range([this.paddingX, this.viewport.width + this.paddingX])
            .domain(domainX);

        this.yScale = scaleLinear()
            .range([this.viewport.height + this.paddingY, this.paddingY])
            .domain(domainY);

        this.unitX = this.viewport.width / Math.abs(domainX[1] - domainX[0]);
        this.unitY = this.viewport.height / Math.abs(domainY[1] - domainY[0]);

        this.nodeMap.forEach(node => {
            node.垂向位置 = this.yScale(node.垂向位置);
            node.高度 = node.高度 * this.unitY;
        });
    }
}
