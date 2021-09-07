import {path as d3Path} from 'd3-path';

export function path2Points(path: string, count?: number, popEnd?: boolean) {
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', path);

    const len = pathElement.getTotalLength();
    const points = [];
    const n = count || 50;
    const pieceLen = len / n;
    let x, y;

    for (let i = 0; i <= n; i++) {
        ({x, y} = pathElement.getPointAtLength(pieceLen * i));
        points.push({x: Math.ceil(x), y: Math.ceil(y)});
    }
    popEnd && points.pop();

    return points;
}

export function line2Points(line: [number, number][]) {
    let segmentPaths = [];
    let temp = line[0];
    let point, path, len;
    let totalLen = 0;
    let count = 50;

    for (let i = 1; i < line.length; i++) {
        point = line[i];

        path = d3Path();
        path.moveTo(...temp);
        path.lineTo(...point);

        len = Math.sqrt(Math.pow(point[0] - temp[0], 2) + Math.pow(point[1] - temp[1], 2));
        totalLen += len;

        temp = point;
        segmentPaths.push({path: path.toString(), len});
    }

    let points = segmentPaths.map(({path, len}, index) => path2Points(path, Math.max(Math.ceil((len * count) / totalLen), 2), index === 0));

    return points.flat();
}
