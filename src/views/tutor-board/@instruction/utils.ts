import store from '@/store';
import {InfoActions} from '@/store/info';
import {PGNode} from '@/types/instruction';
import {goto} from '@/utils';
import {STRUCT_TYPE} from '@/const';

/**
 * 更新store结构数据
 */
export function updateStructure() {
    store.dispatch({type: InfoActions.setStructure, payload: {...store.getState().info.structure}});
}

/**
 * 激活进度节点
 */
export function activateNavPoint(pathName: string, scrollToTarget?: boolean): boolean | void {
    const pathMap = store.getState().info.pathMap;
    const navPoints = store.getState().info.navPoints;

    let node = pathMap.get(pathName);
    let progressNode: PGNode | undefined;

    while (!progressNode && node) {
        if (navPoints.includes(node as PGNode)) progressNode = node;
        node = node.parent;
    }

    if (!progressNode || progressNode.currentStep) return;

    if (!progressNode.currentStep) {
        navPoints.forEach((item: PGNode) => (item.currentStep = false));
    }

    const questionImages = document.querySelectorAll('#questionContent img');
    if (questionImages.length && !progressNode.questionImages) {
        progressNode.questionImages = [];
        questionImages.forEach(img => {
            //@ts-ignore
            progressNode.questionImages.push(img.src);
        });
    }

    progressNode.currentStep = true;
    progressNode.dirty = true;

    store.dispatch({type: InfoActions.setNavPoints, payload: [...navPoints]});
    if (scrollToTarget) {
        progressNode.$el && goto(progressNode.$el as HTMLElement, {container: '#tutorBoardContent', offset: 0});
    }
    return true;
}

/**
 * 清空进度节点激活状态
 */
export function deActivateNavPoints() {
    const navPoints = store.getState().info.navPoints;
    navPoints.forEach((item: PGNode) => (item.currentStep = false));
}

/**
 * 显示指令节点及祖先节点
 */
export function showNode(pathName: string) {
    const pathMap = store.getState().info.pathMap;
    let node = pathMap.get(pathName);

    if (!node) return;

    let parent = node;
    let steps = [];

    while (parent) {
        if (parent.structType === STRUCT_TYPE.Collapse || parent.structType === STRUCT_TYPE.LampCollapse) steps.push(parent);
        parent = parent.parent;
    }

    steps.forEach(item => {
        item.show = true;
        item.$open && item.$open();
    });

    steps.length && updateStructure();
}
