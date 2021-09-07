import {createActions, handleActions} from 'redux-actions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {InstructionDone, InstructionMessage, PGNode} from '@/types/instruction';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {AxisAid} from '@/utils';

const options = {prefix: 'info'};

/**
 * pgType：讲解类型--提示/讲解
 * paused：是否暂停状态
 * currentPath：当前执行指令路径
 * structure：PG结构
 * questionNode；题目内容节点
 * pathMap：节点Map
 * kp：知识点
 */
const stateValue = {
    pgType: '',
    roomId: '',
    questionId: '',
    ended: false,
    paused: true,
    currentPath: '',
    structure: null,
    questionNode: null as {node: PGNode} | null,
    navPoints: [] as PGNode[],
    pathMap: new Map<string, PGNode>(),
    aidMap: new Map<string, AxisAid>(),
    shushiMap: new Map<string, PGNode>(),
    kps: [] as TextContent[],
    instructions: [] as [InstructionMessage, InstructionDone][],
    hilMode: false,
    loadingVisible: false,
    landscapeMode: false,
    introFinished: false,
    guideRead: true,
    netError: false,
    pgId: '',
    isLamp: false,
    globalScroll: false,
    initStructure: null,
    isPhone: false,
    isIos: false,
    tvMode: false,
    tencentMode: false
};

export const InfoActions = {
    setPgType: options.prefix + '/' + 'setPgType',
    setCurrentPath: options.prefix + '/' + 'setCurrentPath',
    setEnded: options.prefix + '/' + 'setEnded',
    setPaused: options.prefix + '/' + 'setPaused',
    setRoomId: options.prefix + '/' + 'setRoomId',
    setQuestionId: options.prefix + '/' + 'setQuestionId',
    setNavPoints: options.prefix + '/' + 'setNavPoints',
    setStructure: options.prefix + '/' + 'setStructure',
    setQuestionNode: options.prefix + '/' + 'setQuestionNode',
    setPathMap: options.prefix + '/' + 'setPathMap',
    setAidMap: options.prefix + '/' + 'setAidMap',
    setShushiMap: options.prefix + '/' + 'setShushiMap',
    setKps: options.prefix + '/' + 'setKps',
    setInstructions: options.prefix + '/' + 'setInstructions',
    setHilMode: options.prefix + '/' + 'setHilMode',
    setLoadingVisible: options.prefix + '/' + 'setLoadingVisible',
    setLandscapeMode: options.prefix + '/' + 'setLandscapeMode',
    setIntroFinished: options.prefix + '/' + 'setIntroFinished',
    setGuideRead: options.prefix + '/' + 'setGuideRead',
    setNetError: options.prefix + '/' + 'setNetError',
    setPgId: options.prefix + '/' + 'setPgId',
    setGlobalScroll: options.prefix + '/' + 'setGlobalScroll',
    setIsLamp: options.prefix + '/' + 'setIsLamp',
    setInitStructure: options.prefix + '/' + 'setInitStructure',
    setIsPhone: options.prefix + '/' + 'setIsPhone',
    setIsIos: options.prefix + '/' + 'setIsIos',
    setTvMode: options.prefix + '/' + 'setTvMode',
    setTencentMode: options.prefix + '/' + 'setTencentMode'
};

export const infoActionCreator = createActions(
    {
        setPgType: (payload: string) => payload,
        setCurrentPath: (payload: string) => payload,
        setEnded: (payload: string) => payload,
        setPaused: (payload: string) => payload,
        setRoomId: (payload: string) => payload,
        setQuestionId: (payload: string) => payload,
        setNavPoints: (payload: string) => payload,
        setStructure: (payload: string) => payload,
        setQuestionNode: (payload: string) => payload,
        setPathMap: (payload: string) => payload,
        setAidMap: (payload: string) => payload,
        setShushiMap: (payload: string) => payload,
        setKps: (payload: string) => payload,
        setInstructions: (payload: string) => payload,
        setHilMode: (payload: string) => payload,
        setLoadingVisible: (payload: string) => payload,
        setLandscapeMode: (payload: string) => payload,
        setIntroFinished: (payload: string) => payload,
        setGuideRead: (payload: string) => payload,
        setNetError: (payload: string) => payload,
        setPgId: (payload: string) => payload,
        setIsLamp: (payload: string) => payload,
        setGlobalScroll: (payload: string) => payload,
        setInitStructure: (payload: string) => payload,
        setIsPhone: (payload: string) => payload,
        setIsIos: (payload: string) => payload,
        setTvMode: (payload: string) => payload,
        setTencentMode: (payload: string) => payload
    },
    options
);

export default handleActions<any>(
    {
        setPgType: (state, action) => ({...state, pgType: action.payload}),
        setCurrentPath: (state, action) => ({...state, currentPath: action.payload}),
        setEnded: (state, action) => ({...state, ended: action.payload}),
        setPaused: (state, action) => ({...state, paused: action.payload}),
        setRoomId: (state, action) => ({...state, roomId: action.payload}),
        setQuestionId: (state, action) => ({...state, questionId: action.payload}),
        setNavPoints: (state, action) => ({...state, navPoints: action.payload}),
        setStructure: (state, action) => ({...state, structure: action.payload}),
        setQuestionNode: (state, action) => ({...state, questionNode: action.payload}),
        setPathMap: (state, action) => ({...state, pathMap: action.payload}),
        setAidMap: (state, action) => ({...state, aidMap: action.payload}),
        setShushiMap: (state, action) => ({...state, shushiMap: action.payload}),
        setKps: (state, action) => ({...state, kps: action.payload}),
        setInstructions: (state, action) => ({...state, instructions: action.payload}),
        setHilMode: (state, action) => ({...state, hilMode: action.payload}),
        setLoadingVisible: (state, action) => ({...state, loadingVisible: action.payload}),
        setLandscapeMode: (state, action) => ({...state, landscapeMode: action.payload}),
        setIntroFinished: (state, action) => ({...state, introFinished: action.payload}),
        setGuideRead: (state, action) => ({...state, guideRead: action.payload}),
        setNetError: (state, action) => ({...state, netError: action.payload}),
        setPgId: (state, action) => ({...state, pgId: action.payload}),
        setIsLamp: (state, action) => ({...state, isLamp: action.payload}),
        setGlobalScroll: (state, action) => ({...state, globalScroll: action.payload}),
        setInitStructure: (state, action) => ({...state, initStructure: action.payload}),
        setIsPhone: (state, action) => ({...state, isPhone: action.payload}),
        setIsIos: (state, action) => ({...state, isIos: action.payload}),
        setTvMode: (state, action) => ({...state, tvMode: action.payload}),
        setTencentMode: (state, action) => ({...state, tencentMode: action.payload})
    },
    stateValue,
    options
);

const mapStateToProps = (state: any) => ({
    info: state.info
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({...infoActionCreator}, dispatch);

export const connectInfoStore = connect(mapStateToProps, mapDispatchToProps);
