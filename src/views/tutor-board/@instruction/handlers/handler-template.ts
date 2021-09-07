import {InstructionTool} from './index';
import store from '@/store';
import {PGNode} from '@/types/instruction';
import {InfoActions} from '@/store/info';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {AxisAid} from '@/utils';

export abstract class HandlerTemplate {
    private readonly instructionTool: InstructionTool;

    constructor(instructionTool: InstructionTool) {
        this.instructionTool = instructionTool;
    }

    get onInstruction() {
        return this.instructionTool.onInstruction.bind(this.instructionTool);
    }

    abstract subscribe(): void;

    get pathMap(): Map<string, PGNode> {
        return store.getState().info.pathMap;
    }

    get aidMap(): Map<string, AxisAid> {
        return store.getState().info.aidMap;
    }

    get shushiMap(): Map<string, PGNode> {
        return store.getState().info.shushiMap;
    }

    updateShushiMap(shushiMap: Map<string, PGNode>) {
        store.dispatch({type: InfoActions.setShushiMap, payload: shushiMap});
    }

    updateNode() {
        store.dispatch({type: InfoActions.setStructure, payload: {...store.getState().info.structure}});
    }

    updateKps(kps: TextContent[]) {
        store.dispatch({type: InfoActions.setKps, payload: [...kps]});
    }
}
