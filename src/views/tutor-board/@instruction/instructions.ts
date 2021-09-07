export const BASE_INSTRUCTIONS = ['显示题目', '显示元信息', '显示步骤', '显示内容', '强调', '清除', '解说'];
type BASE_INSTRUCTIONS = '显示题目' | '显示元信息' | '显示步骤' | '显示内容' | '强调' | '清除' | '解说';

const AID_INSTRUCTIONS = [
    '新增画板svga',
    '新增画板',
    '新增数轴',
    '新增竖线',
    '新增线段',
    '新增折线',

    '更新折线',
    '更新线段',

    '强调概括集',
    '强调刻度集',
    '强调标记集',

    '隐藏标记集',
    '隐藏刻度集',
    '隐藏概括集',

    '移动标记集',
    '强调线段集',

    '新增十字相乘法',
    '新增坐标系',
    '强调函数集',
    '强调形状',
    '隐藏形状',
    '移动形状'
];
type AID_INSTRUCTIONS =
    | '新增画板svga'
    | '新增画板'
    | '新增数轴'
    | '新增竖线'
    | '新增线段'
    | '新增折线'
    | '更新折线'
    | '更新线段'
    | '强调概括集'
    | '强调刻度集'
    | '强调标记集'
    | '隐藏标记集'
    | '隐藏刻度集'
    | '隐藏概括集'
    | '移动标记集'
    | '强调线段集'
    | '新增十字相乘法'
    | '新增坐标系'
    | '强调函数集'
    | '强调形状'
    | '隐藏形状'
    | '移动形状';

const INSTRUCTIONS = [...BASE_INSTRUCTIONS, ...AID_INSTRUCTIONS];
type INSTRUCTIONS = BASE_INSTRUCTIONS | AID_INSTRUCTIONS;

export {INSTRUCTIONS};
