import {InstructionMessage, PGNode} from '@/types/instruction';
import store from '@/store';
import {emitInstruction} from './pg-client';
import {InfoActions} from '@/store/info';
import {TextContent} from '@/views/tutor-board/@instruction/content';

export class RealTimeUpdate {
    constructor() {
        this.listen();
    }

    get pathMap(): Map<string, PGNode> {
        return store.getState().info.pathMap;
    }

    get structure(): PGNode {
        return store.getState().info.structure;
    }

    private handler(message: {data: {type: string; pathModify: any[]; pathAdded: any[]; pathDeleted: any[]; updateIns: any[]}}) {
        if (message.data.type !== 'update') return;
        let data = message.data || {};
        let pathModify = data.pathModify || [];
        let pathAdded = data.pathAdded || [];
        let pathDeleted = data.pathDeleted || [];
        let updateIns = data.updateIns || [];

        this.changePath(pathModify);
        this.removePath(pathDeleted);
        this.addPath(pathAdded);
        this.runInstruction(updateIns);
    }

    private changePath(pathModify: {newPath: string; oldPath: string}[]) {
        for (let {newPath, oldPath} of pathModify) {
            let node = this.pathMap.get(oldPath);
            this.pathMap.delete(oldPath);
            this.pathMap.set(newPath, node as any);
        }
    }

    private runInstruction(updateIns: InstructionMessage[]) {
        const fn = () => () => {};

        setTimeout(() => {
            for (let instruction of updateIns) emitInstruction(instruction, fn(), fn(), true);
        });
    }

    private addPath(pathAdded: {index: number; parent: string; path: string}[]) {
        for (let {index, parent: parentPath, path} of pathAdded) {
            let parent = this.pathMap.get(parentPath) as PGNode;

            let node = ({
                name: '',
                pathName: path,
                parent: parent,
                visible: true,
                show: true,
                content: null,
                children: []
            } as unknown) as PGNode;

            parent && parent.children.splice(index, 0, node);
            this.pathMap.set(path, node);
        }

        store.dispatch({type: InfoActions.setStructure, payload: this.structure});
    }

    private removePath(pathDeleted: string[]) {
        for (let path of pathDeleted) {
            let node = this.pathMap.get(path);

            if (node && node.kp) {
                const kps = store.getState().info.kps || [];
                let index = kps.findIndex((item: TextContent) => item.node === node);
                ~index && kps.splice(index, 1);

                store.dispatch({type: InfoActions.setKps, payload: [...kps]});
            }
            if (!node || !node.parent) continue;

            const index = node.parent.children.indexOf(node);
            node.parent.children.splice(index, 1);
            // @ts-ignore
            node.parent = null;
        }

        store.dispatch({type: InfoActions.setStructure, payload: this.structure});
    }

    private listen() {
        window.addEventListener('message', this.handler.bind(this));
    }

    remove() {
        window.removeEventListener('message', this.handler.bind(this));
    }
}
