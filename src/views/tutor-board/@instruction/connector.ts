import {tutor} from '@/api';
import {Handler, PGClient} from './index';
import {InstructionDone, InstructionMessage, PGNode} from '@/types/instruction';
import store from '@/store';
import {InfoActions} from '@/store/info';
import {traversal} from '@/utils';
import {STRUCT_TYPE} from '@/const';
import {emitInstruction} from './pg-client';
import {deActivateNavPoints, activateNavPoint, showNode} from './utils';
import {BASE_INSTRUCTIONS} from './instructions';
import {messageEvent} from '@/views/lamp/message.event';
import pageEvent from '@/utils/event';

/**
 * 连接讲题板PG
 */
export async function connector(questionId: any, type: 'explain' | 'tip' = 'explain', room?: string, init: boolean = true) {
    let roomId = '';
    if (store.getState().info.tencentMode) {
        roomId = `${store.getState().info.pgId}-${randomRoomId()}`;
    } else {
        roomId = !room ? await tutor.room({questionId: questionId}) : room;
    }
    // const roomId = !room ? await tutor.room({questionId: questionId}) : room;

    store.dispatch({type: InfoActions.setRoomId, payload: roomId});

    store.dispatch({type: InfoActions.setQuestionId, payload: questionId});
    store.dispatch({type: InfoActions.setPgType, payload: type});
    console.log(store.getState().info);

    if (store.getState().info.isLamp && roomId === 'aaa111') {
        return roomId;
    }

    const pgClient = new PGClient(new Handler(preprocess));
    await pgClient.init(roomId);

    if (store.getState().info.isLamp) {
        const hbId = Math.floor(Math.random() * 100000000).toString();
        let interval = null as any;
        let timeout = null as any;

        const startInterval = () => {
            interval = setInterval(() => {
                pgClient.emit('hb', {id: hbId, time: +new Date()});
                timeout = setTimeout(() => {
                    store.dispatch({type: InfoActions.setNetError, payload: 'netError'});
                }, 3000);
            }, 5000);
        };

        pgClient.on('hb-result', () => {
            clearTimeout(timeout);
            if (store.getState().info.netError) {
                store.dispatch({type: InfoActions.setNetError, payload: false});
            }
        });

        messageEvent.on('start-lamp-hb', () => {
            startInterval();
        });

        messageEvent.on('end-lamp-hb', () => {
            clearInterval(interval);
        });
    }

    if (store.getState().info.tvMode) {
        //大屏模式增加额外的事件监听和消息转发
        pgClient.on('remote-control', message => {
            const {event, questionId} = message;
            switch (event) {
                case 'tv-emit':
                    break;
                case 'tv-start':
                    pageEvent.emit(event, questionId);
                    break;
                case 'tv-stop':
                    pageEvent.emit(event);
                    break;
                default:
                    pageEvent.emit('tv-action', event);
                    break;
            }
        });

        pageEvent.on('tv-emit', data => {
            pgClient.emit('remote-control', {
                ...data,
                event: 'tv-emit'
            });
        });
    }

    pgClient.on(
        'init',
        async ({
            hierarchy,
            naviPoints,
            instructions,
            explainType
        }: {
            hierarchy: PGNode;
            naviPoints: {path: string}[];
            instructions: InstructionMessage[] | null;
            explainType: string;
        }) => {
            initStructure(hierarchy);
            store.dispatch({type: InfoActions.setPgType, payload: explainType === 'EXPLAIN' ? 'explain' : 'tip'});
            store.dispatch({type: InfoActions.setKps, payload: []});

            const pathMap = store.getState().info.pathMap;
            const navPoints = naviPoints.map(({path}) => pathMap.get(path)) as PGNode[];
            store.dispatch({type: InfoActions.setNavPoints, payload: navPoints});

            if (!instructions) return;
            const fn = () => () => {};

            await new Promise(resolve => setTimeout(resolve, 1000));
            for (let instruction of instructions) {
                // await new Promise(resolve => emitInstruction(instruction, fn(), fn(), true));
                if (BASE_INSTRUCTIONS.includes(instruction.instruction) || instruction.instruction === '新增画板') {
                    emitInstruction(instruction, fn(), fn(), true);
                } else if (/隐藏|移动/.test(instruction.instruction)) {
                    //对于移动，隐藏指令，等待最久
                    setTimeout(() => emitInstruction(instruction, fn(), fn(), true), 3000);
                } else {
                    setTimeout(() => emitInstruction(instruction, fn(), fn(), true), 2000);
                }
            }
        }
    );

    pgClient.on('control', (message: {type: string; isAtPgEnd?: boolean; isSuccess?: boolean}) => {
        if (message.type === 'startExecute') {
            store.dispatch({type: InfoActions.setEnded, payload: false});
        }

        if (store.getState().info.isLamp && message.type === 'endExecute' && message.isSuccess === false) {
            //pg异常结束
            store.dispatch({type: InfoActions.setNetError, payload: 'default'});
            messageEvent.emit('end-lamp-hb');
        }

        if (message.type === 'endExecute' && message.isAtPgEnd) {
            store.dispatch({type: InfoActions.setEnded, payload: true});
        }

        if (message.type === 'endExecute' || message.type === 'startExecute') {
            store.dispatch({type: InfoActions.setInstructions, payload: []});

            store.dispatch({type: InfoActions.setPaused, payload: message.type === 'endExecute'});
            deActivateNavPoints();
        }

        if (message.type === 'hilPaused') {
            store.dispatch({type: InfoActions.setLoadingVisible, payload: true});
        }
    });

    pgClient.on('update', ({hierarchy, eid, naviPoints}: {eid: string; hierarchy: PGNode; naviPoints: {path: string}[]}) => {
        updateStructureNew(hierarchy);
        const pathMap = store.getState().info.pathMap;
        const navPoints = naviPoints.map(({path}) => pathMap.get(path)) as PGNode[];
        store.dispatch({type: InfoActions.setNavPoints, payload: navPoints});
        pgClient.emit('update-result', {eid, success: true});
    });

    if (!room && init) {
        !store.getState().info.tencentMode
            ? await tutor
                  .startExplain({
                      questionId: questionId,
                      roomId: roomId,
                      initOnly: true,
                      type: type,
                      hilMode: store.getState().info.hilMode,
                      eaogId: store.getState().info.pgId || undefined
                  })
                  .catch(e => {
                      const message = e?.response?.data?.error || '';
                      const idError = !!message.match('题目不存在');
                      store.dispatch({type: InfoActions.setNetError, payload: idError ? 'idError' : 'default'});
                  })
            : await tutor
                  .startExplainWithPg({
                      questionId: questionId,
                      roomId: roomId,
                      initOnly: true,
                      type: type,
                      hilMode: store.getState().info.hilMode,
                      eaogId: store.getState().info.pgId || undefined
                  })
                  .catch(e => {
                      const message = e?.response?.data?.error || '';
                      const idError = !!message.match('题目不存在');
                      store.dispatch({type: InfoActions.setNetError, payload: idError ? 'idError' : 'default'});
                  });
    }

    return roomId;
}

/**
 * 初始设置讲题板结构信息
 */
function initStructure(structure: PGNode) {
    store.dispatch({type: InfoActions.setStructure, payload: null});
    const root = structure;
    const eachBefore = traversal().children<PGNode>(node => node.children);
    const pathMap = new Map();

    eachBefore(root, node => {
        node.children && node.children.forEach(n => (n.parent = node));
        node.pathName = node.parent ? node.parent.pathName + '/' + node.name : node.name;

        node.visible = true;
        node.show = true;
        node.content = null;

        pathMap.set(node.pathName, node);
    });

    root.children.forEach(node => {
        node.structType = store.getState().info.isLamp ? STRUCT_TYPE.LampCollapse : STRUCT_TYPE.Collapse;
    });

    let nodes = root.children.filter(node => {
        node.show = false;
        return node.name.match(/题目|初始化|END_OF_PG/);
    });
    for (let node of nodes) {
        node.visible = false;
    }
    store.dispatch({type: InfoActions.setInitStructure, payload: {...root}});
    store.dispatch({type: InfoActions.setStructure, payload: root});
    store.dispatch({type: InfoActions.setPathMap, payload: pathMap});
    store.dispatch({type: InfoActions.setShushiMap, payload: new Map()});
}

/**
 * hilMode更新
 */
function updateStructureNew(root: PGNode) {
    const _root = root;
    const eachBefore = traversal().children<PGNode>(node => node.children);
    const pathMap = store.getState().info.pathMap;
    const structure = store.getState().info.structure;

    eachBefore(_root, node => {
        node.children && node.children.forEach(n => (n.parent = node));
        node.pathName = node.parent ? node.parent.pathName + '/' + node.name : node.name;

        node.visible = true;
        node.show = true;
        node.content = null;
    });

    _root.children.forEach(node => {
        node.structType = STRUCT_TYPE.Collapse;
    });

    const diff = (treeA: PGNode, treeB: PGNode) => {
        const length = treeB.children.length;
        for (let i = 0; i < length; i++) {
            const itemA = treeA.children[i];
            const itemB = treeB.children[i];

            if (!itemA || itemA.pathName !== itemB.pathName) {
                treeA.children.splice(i, 1, itemB);
            } else {
                if (itemB.children && itemB.children.length) {
                    diff(itemA, itemB);
                }
            }
        }
    };

    if (structure) diff(structure, _root);

    eachBefore(structure, node => {
        node.children && node.children.forEach((n: any) => (n.parent = node));
        node.pathName = node.parent ? node.parent.pathName + '/' + node.name : node.name;

        if (!pathMap.get(node.pathName)) {
            pathMap.set(node.pathName, node);
        }
    });

    store.dispatch({type: InfoActions.setStructure, payload: {...structure}});
    store.dispatch({type: InfoActions.setPathMap, payload: pathMap});
    store.dispatch({type: InfoActions.setLoadingVisible, payload: false});
}

/**
 * 指令预处理
 */
function preprocess(instruction: InstructionMessage, done: InstructionDone) {
    showNode(instruction.path);

    activateNavPoint(instruction.path);

    updateInstructions(instruction, done);
}

/**
 * 记录接收的指令信息
 */
export function updateInstructions(instruction: InstructionMessage, done: InstructionDone) {
    const instructions = store.getState().info.instructions as [InstructionMessage, InstructionDone][];
    instructions.push([instruction, done]);
    store.dispatch({type: InfoActions.setInstructions, payload: [...instructions]});
}

function randomRoomId() {
    return Math.random().toString(36).substr(2);
}
