import axios from '../axios';
import PG from './pg.json';

const baseURL = '/api/v1/tutor';

export const tutor = {
    room(params: {questionId: string}) {
        return axios
            .get('/room', {params, baseURL})
            .then(({data}) => data)
            .catch(() => 'aaa111');
    },
    startExplain(params: {
        questionId: string;
        appId?: string;
        roomId: string;
        type: 'explain' | 'tip';
        pgStartPath?: string;
        initOnly: boolean;
        skipToPath?: string;
        skipInitProcess?: boolean;
        hilMode?: boolean;
        eaogId?: string;
    }) {
        return axios.post('/start', params, {baseURL}).then(({data}) => data);
    },
    startExplainWithPg(params: {
        questionId: string;
        appId?: string;
        roomId: string;
        type: 'explain' | 'tip';
        pgStartPath?: string;
        initOnly: boolean;
        skipToPath?: string;
        skipInitProcess?: boolean;
        hilMode?: boolean;
        eaogId?: string;
    }) {
        let params2 = {
            roomId: '',
            // eaogData: PG,
            skipInitProcess: false,
            explainType: 'EXPLAIN',
            fastRunning: false,
            eaogIntermediate: false,
            // initOnly: true,
            eaogId: params.eaogId
        };
        params2.roomId = params.roomId;
        return axios.post('/exec', params2, {baseURL: '/api/pg'}).then(({data}) => data);
    },
    getQrCode() {
        return axios
            .get(process.env.NODE_ENV === 'development' ? 'http://ait-cast-svc-ait.dev.dm-ai.cn/api/v1/room/create' : '/room/create', {})
            .then(({data}) => data);
    }
};
