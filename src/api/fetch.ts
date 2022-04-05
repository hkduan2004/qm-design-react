/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 15:39:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-28 11:26:27
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, Canceler } from 'axios';
import qs from 'qs';
// import { ElNotification } from 'element-plus';

type IRequestConfig = AxiosRequestConfig & {
  cancelable?: boolean;
  lockable?: boolean;
};

type IAxiosInstance = AxiosInstance & {
  get<T = any, R = AxiosResponse<T>>(url: string, config?: IRequestConfig): Promise<R>;
  post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: IRequestConfig): Promise<R>;
};

type IRequestHeader = {
  jwt?: string;
  lang?: string;
  userAgent: string;
};

// 自定义扩展 header 请求头
const getConfigHeaders = (): IRequestHeader => {
  return {
    userAgent: 'pc', // 设备
  };
};

const pendingRequest: Map<string, Canceler> = new Map();
const lockingRequest: Map<string, boolean> = new Map();

const generateReqKey = (config: IRequestConfig): string => {
  const { method, url } = config;
  return [method, url].join('&');
};

const addPendingRequest = (config: IRequestConfig): void => {
  if (!config.cancelable) return;
  const requestKey: string = generateReqKey(config);
  config.cancelToken = new axios.CancelToken((cancel) => {
    if (!pendingRequest.has(requestKey)) {
      pendingRequest.set(requestKey, cancel);
    }
  });
};

const removePendingRequest = (config: IRequestConfig): void => {
  const requestKey: string = generateReqKey(config);
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey) as Canceler;
    cancelToken('取消请求');
    pendingRequest.delete(requestKey);
  }
};

const addLockingRequest = (config: IRequestConfig): void => {
  if (!config.lockable) return;
  const requestKey: string = generateReqKey(config);
  if (!lockingRequest.has(requestKey)) {
    lockingRequest.set(requestKey, true);
  }
};

const removeLockingRequest = (config: IRequestConfig): void => {
  const requestKey: string = generateReqKey(config);
  if (lockingRequest.has(requestKey)) {
    lockingRequest.delete(requestKey);
  }
};

// 创建 axios 实例
const instance: IAxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000/',
  timeout: 1000 * 20,
  withCredentials: false, // 跨域请求是否携带 cookie
  paramsSerializer: (params): string => {
    // 序列化 GET 请求参数 -> a: [1, 2] => a[0]=1&a[1]=2
    return qs.stringify(params, { arrayFormat: 'indices' });
  },
});

// 异常处理程序
const errorHandler = (error: AxiosError): Promise<AxiosError> => {
  const { config = {} } = error;
  removePendingRequest(config);
  removeLockingRequest(config);
  return Promise.reject(error);
};

// 请求拦截
instance.interceptors.request.use((config: IRequestConfig) => {
  // 锁定当次请求
  if (lockingRequest.has(generateReqKey(config))) {
    return Promise.reject({ message: '锁定请求' });
  }
  // 取消已发请求
  removePendingRequest(config);
  // 请求头信息，token 验证
  config.headers = {
    ...config.headers,
    ...getConfigHeaders(),
  };
  addPendingRequest(config);
  addLockingRequest(config);
  return config;
}, errorHandler);

// 响应拦截
instance.interceptors.response.use((response) => {
  const { config, data } = response;
  removePendingRequest(config);
  removeLockingRequest(config);
  // 请求异常提示信息
  if (data.code !== 200) {
    // data.msg && ElNotification({ title: '提示信息', message: data.msg, type: 'error', duration: 10 * 1000 });
  }
  return data;
}, errorHandler);

export { getConfigHeaders };
export default instance;
