// utils/request.js
import { baseUrl } from "./config";
import { useGlobalStore } from "../store/global";

// 全局默认配置
const DEFAULT_CONFIG = {
  baseURL: baseUrl, // 基础路径（如 'https://api.example.com'）
  timeout: 10000, // 超时时间（毫秒）
  header: {
    "Content-Type": "application/json", // 默认请求头
  },
};

// 请求拦截器（可修改 config）
const requestInterceptor = (config) => {
  const globalStore = useGlobalStore();
  // 示例：自动添加 Token

  // const token = uni.getStorageSync('token');
  if (globalStore.token) {
    config.header = {
      ...config.header,
      Token: `${globalStore.token}`,
    };
  }
  return config;
};

// 响应拦截器（可处理返回数据）
const responseInterceptor = (response) => {
  // 示例：仅返回 data 字段
  return response.data;
};

// 错误拦截器（统一错误处理）
const errorInterceptor = (data, code) => {
  let message = data.errmsg || data.msg || "请求失败";
  console.log(data);

  // 示例：处理 HTTP 错误
  if (data.code === 401) {
    const store = useGlobalStore();
    store.clearAll();
    uni.showModal({
      title: "提示",
      content: "登录过期或未登录，请重新登录",
      success({ confirm }) {
        if (confirm) {
          uni.reLaunch({
            url: "/pages/login/openid",
          });
        }
      },
    });
  } else {
    // if (message.indexOf("当前接口需要认证才能访问") == -1) {
    uni.showModal({
      title: "提示",
      icon: "none",
      content: message,
    });
    // }
  }
  return Promise.reject(data);
};

/**
 * 封装 uni.request
 * @param {Object} config 请求配置
 * @returns {Promise}
 */
export const request = (config) => {
  // 合并全局配置
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    header: {
      ...DEFAULT_CONFIG.header,
      ...config.header,
    },
  };

  // 请求拦截
  const finalConfig = requestInterceptor(mergedConfig) || mergedConfig;
  return new Promise((resolve, reject) => {
    // 发起请求
    uni.request({
      url: finalConfig.baseURL + finalConfig.url,
      method: finalConfig.method || "GET",
      data: finalConfig.data,
      header: finalConfig.header,
      timeout: finalConfig.timeout,
      success: (res) => {
        uni.hideLoading();
        // 响应拦截
        if (res.statusCode !== 200 || res.data.code !== 200) {
          errorInterceptor(res.data, res.statusCode).catch(reject);
        } else {
          const processedData = responseInterceptor(res);
          resolve(processedData.data);
        }
      },
      fail: (err) => {
        // 错误拦截
        errorInterceptor(err).catch(reject);
      },
    });
  });
};

// 导出常用方法（GET/POST/PUT/DELETE）
export const get = (url, data = {}, config = {}) => {
  return request({
    ...config,
    url,
    method: "GET",
    data,
  });
};

export const post = (url, data = {}, config = {}) => {
  return request({
    ...config,
    url,
    method: "POST",
    data,
  });
};

export const put = (url, data = {}, config = {}) => {
  return request({
    ...config,
    url,
    method: "PUT",
    data,
  });
};

export const del = (url, config = {}) => {
  return request({
    ...config,
    url,
    method: "DELETE",
  });
};
