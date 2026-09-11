//api接口（按环境区分：开发读取 .env.development，打包读取 .env.production）
export const baseUrl = import.meta.env.VITE_BASE_URL;

export const imageUrl = "https://tbwork.shengdajia.cn/public";
// export const requestType = 'client'
//空: openid登录 account账号密码
export const loginType = "account";
// export const
// 企业微信配置
export const weworkConfig = {
  corpId: "wxe7e2fa35ea164594", // TODO: 填写企业微信的企业ID（corpId）
  agentId: "", // TODO: 填写应用的AgentId（如需要）
};
// vconsole 远程调试工具配置
export const debugConfig = {
  enabled: import.meta.env.VITE_BASE_DEBUG === "true", // 是否启用 vconsole，线上环境建议改为 false
};
//首页组件数据展示组件 ITextList  ICard  IImage
export const indexPageCompoent = "ICard";
//阿里oss地址
export const uploadBaseUrl = true ? baseUrl + "/pub/local/upload" : "-";
// 应用版本号（构建时由 vite define 注入，对应 package.json 的 version，打包自动递增）
export const appVersion =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
