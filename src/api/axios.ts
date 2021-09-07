import Axios, {AxiosInstance} from 'axios';
import interceptors from './interceptors';

const axios: AxiosInstance = Axios.create({
    baseURL: '/api/v1',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'DM-Request',
        'Cache-Control': 'no-cache'
    },
    timeout: 60000
});

interceptors(axios);

const hashQuery = window.location.hash.split('?')[1] || '';
const queries = hashQuery.split('&');
const paramsMap = new Map();

for (let query of queries) {
    let [param, value] = query.split('=');
    paramsMap.set(param, value);
}

export function setAuth(token: string, appId?: string) {
    token && (axios.defaults.headers.common['Authorization'] = `Bearer ${token}`);
    appId && (axios.defaults.headers.common['appKey'] = appId);
}

setAuth(paramsMap.get('token') || '', paramsMap.get('appId') || '');

export {axios};
export default axios;
