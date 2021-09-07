import {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import eventemitter from '@/utils/event';
import {messageEvent} from '@/views/lamp/message.event';

const RETRY_MAX = 1;
const RETRY_DELAY = 100;

export default function (axios: AxiosInstance) {
    // Add a request interceptor
    axios.interceptors.request.use(
        function (config: AxiosRequestConfig) {
            // Do something before request is sent
            if (!config.retryOptions) {
                config.retryOptions = {count: RETRY_MAX, delay: RETRY_DELAY};
            }

            return config;
        },
        function (error: AxiosError) {
            // Do something with request error
            return Promise.reject(error);
        }
    );

    // Add a response interceptor
    axios.interceptors.response.use(
        function (response: AxiosResponse) {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            return response.data;
        },
        function (error: AxiosError) {
            console.log(error);
            console.log(error.response);
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        messageEvent.emit('refreshToken');
                        return;
                    // break
                    default:
                        break;
                }
            } else {
                console.log('Network Error');
                messageEvent.emit('NetworkError');
            }
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            // console.dir(error.config);
            const {config, response} = error || {};
            const {data} = response || {data: {code: 'failed', error: 'net error'}};

            if (!config.retryOptions!.count) {
                if (data && data.code !== 0 && process.env.NODE_ENV !== 'production')
                    eventemitter.emit('snackbar', `${data.code}: ${data.error}`, 'error');
                return Promise.reject(error);
            }

            config.retryOptions!.count -= 1;
            return retry(config);
        }
    );

    async function retry(config: AxiosRequestConfig) {
        await new Promise(resolve => setTimeout(resolve, config.retryOptions!.delay || 1));

        // Return the promise in which recalls axios to retry the request
        return axios.request(config);
    }
}

declare module 'axios' {
    interface AxiosRequestConfig {
        retryOptions?: {delay?: number; count?: number};
    }
}
