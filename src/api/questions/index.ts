import axios from '../axios';

const baseURL = '/api/v1/questions';

export const questions = {
    getQuestionDetail(params: {id: string}) {
        return axios.get(`/id`, {params, baseURL}).then(({data}) => data);
    },
    submitFeedback(params: {id: string; like?: number; dislike?: number; comment?: string}) {
        return axios.post(`/feedback`, params, {baseURL}).then(({data}) => data);
    },
    availablePgs: async (id: string) => {
        let {
            data: {explanationId}
        } = await axios.get('/id/' + id, {baseURL: '/api/v2/questions'});

        return axios.get('/id/' + explanationId, {baseURL: '/api/v2/explanations'}).then(({data}) => data);
    }
};
