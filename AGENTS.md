# AGENTS.md

本文件面向 AI 编码代理，介绍本项目的架构、约定与常用命令。阅读本文件前无需任何项目背景知识。

## 项目概述

企业微信 H5 移动办公应用（CRM / 施工管理方向），基于 **uni-app + Vue 3 + Vite** 构建，运行环境为企业微信内置浏览器（H5）。业务模块包括：客户管理、施工任务、合同及合同订单（含电签）、发货、外出签到/计划、回访、消息中心、材料明细等。

- 应用入口只针对 H5 打包（`dev:h5` / `build:h5`），但保留了小程序/App 的 manifest 配置。
- 后端接口统一前缀 `/wjapp/wjMobile/...`（见 `src/api/*.js` 与 `src/pages/doc.md` 中的接口文档片段）。

## 技术栈

- **框架**：uni-app 3.0.0-alpha（`@dcloudio/uni-app` / `@dcloudio/vite-plugin-uni`）+ Vue 3（`createSSRApp`），Vite 5.2.8
- **状态管理**：Pinia + `pinia-plugin-persistedstate`（持久化到 `uni.getStorageSync`，见 `src/store/index.js`、`src/store/global.js`）
- **UI 组件库**：wot-ui（`uni_modules/wot-ui`，通过 `pages.json` 的 easycom 规则 `^wd-(.*)` 自动注册）
- **路由**：`zzh-simple-router`（uni_modules 内），挂载为 `uni.$router`，见 `src/router/index.js`
- **企业微信**：`@wecom/jssdk`（封装在 `src/utils/wx.js`，提供 `initWework` / `getLocation` / `openLocation`）
- **其他**：`sm-crypto`（国密加密）、`vconsole`（移动端调试，开关在 `src/utils/config.js` 的 `debugConfig`）、高德地图 SDK（key 配置在 `src/manifest.json` 的 h5.sdkConfigs）
- **样式**：SCSS（`sass`），尺寸单位使用 rpx

## 常用命令

```bash
npm run dev:h5     # 启动 H5 开发服务器（端口 5173，host 0.0.0.0，见 vite.config.js）
npm run build:h5   # 打包 H5 到 dist/build/h5
npm run pub        # 部署到线上（fe-deploy-cli，读取 deploy/deploy.config.js 的 prod 配置）
```

注意：

- **没有测试框架、lint 或格式化工具配置**，不要假设存在 `npm test` / `npm run lint`；验证改动主要靠 `npm run dev:h5` / `npm run build:h5` 能否正常运行。
- `deploy/deploy.config.js` 中的 dev 环境脚本写的是 `npm run build`（该脚本不存在），实际部署用 prod 配置。
- 部署依赖全局安装的 `fe-deploy-cli`（不在 package.json 依赖中）。

## 环境配置

- `.env.development` / `.env.production` 定义 `VITE_BASE_URL`（接口基础地址），在 `src/utils/config.js` 中读取。
- `src/utils/config.js` 是全局配置中心：`baseUrl`、`loginType`（account / openid 登录方式）、企业微信 `corpId`、vconsole 开关、上传地址 `uploadBaseUrl`、应用版本号等。

## 目录结构与模块划分

```
src/
├── main.js            # 入口：createSSRApp，注册 pinia / router / v-has 指令（含 Vue2 条件编译分支）
├── App.vue            # onLaunch 中初始化 vconsole、企业微信 JSSDK、设备信息
├── pages.json         # 页面注册 + easycom 配置（wd-* 自动导入 wot-ui）
├── manifest.json      # uni-app 应用配置（含高德地图 key、各端配置）
├── api/               # 接口层，按业务域分文件（customer/contract/contractOrder/construction/delivery/outwork/message/visitRecord/task/auth/sys），index.js 统一 re-export
├── pages/             # 页面，按业务域分目录（tab/customer/contract/construction/delivery/outwork/visit/message/material/login/bind/map/profile）
├── store/             # Pinia：index.js 创建实例，global.js 为全局 store（userInfo/token/openid/menuList/systemInfo）
├── router/            # zzh-simple-router 实例与全局拦截器（注意：before 拦截器目前直接 next()，登录校验逻辑已被 return 短路）
├── utils/
│   ├── request.js     # 封装 uni.request：自动带 Token 头、统一错误弹窗、401 跳转登录页
│   ├── config.js      # 全局配置（见上）
│   ├── auth.js        # hasAuth() 按钮级权限判断（基于 userInfo.mobileButtonCodeList）
│   ├── wx.js          # 企业微信 JSSDK 封装
│   ├── useUpload.js   # 上传封装
│   └── tools.js       # 工具函数（如 getDeviceInfo）
├── hooks/useDict.js   # 字典 Hook：Proxy 懒加载字典数据，模块级单例缓存
├── directives/has.js  # v-has 权限指令，无权限时移除 DOM 元素
├── components/        # 全局通用组件（navbar、bottom-bar、ImgUpload、ApiSelectPicker、DictSelectPicker 及 hook/）
├── uni_modules/       # 第三方 uni 插件（wot-ui、zzh-simple-router、lime-*、custom-tabbar、mp-html 等）
└── static/            # 静态资源
components/            # 根目录下有一份与 src/components 近似的历史副本，改动以 src/ 为准
deploy/                # fe-deploy-cli 部署配置
```

## 代码约定

- 页面组件使用 `<script setup>` + Composition API，样式用 `<style scoped lang="scss">`。
- API 层每个文件导出多个具名函数，内部调用 `src/utils/request.js` 的 `get/post/put/del`；接口返回拦截后约定 `code === 200` 为成功，直接 resolve `data.data`。
- Token 通过请求头 `Token` 传递（非 Authorization）；401 时清空全局 store 并 `uni.reLaunch` 到 `/pages/login/openid`。
- 持久化只保存 `userInfo` / `token` / `openid` / `menuList`（`src/store/global.js` 的 persist.paths）。
- 字典数据统一走 `useDict()`（`dictMap[key]` 自动拉取并缓存，`getDictLabel(key, value)` 取文案），不要重复写字典请求逻辑。
- 按钮权限用 `v-has="'权限码'"` 指令或 `hasAuth()` 函数。
- 页面导航栏均为自定义（`navigationStyle: "custom"`），用 `src/components/navbar.vue` + `components/hook/navbar.js` 的 `useNavbarHeight()` 计算高度。
- 条件编译注释（`// #ifdef H5` 等）用于区分平台，修改时注意保留。
- 注释与文档主要使用中文，新增代码注释请沿用中文。

## 安全注意事项

- `deploy/deploy.config.js` 含有服务器 IP、SSH 账号密码等敏感信息且已被 `.gitignore` 忽略（`deploy` 条目），不要将其内容写入提交或对外泄露。
- `.env.*` 文件包含接口地址等配置，读取时注意保密；根目录 `.env.*` 未被 gitignore 的本地变体（`.env.local` 已忽略）。
- `src/manifest.json` 中包含高德地图 key、`src/utils/config.js` 中包含企业微信 corpId，属于业务所需的公开配置。
