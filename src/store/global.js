import { defineStore } from "pinia";
import { ref } from "vue";
import { getDeviceInfo } from "../utils/tools.js";
import { getOpenidByCode, getJsapiTicket } from "@/api/index";

export const useGlobalStore = defineStore(
  "global",
  () => {
    // 1. 定义响应式状态
    const userInfo = ref({});
    const token = ref("");
    const openid = ref("");
    const menuList = ref([]);
    const systemInfo = ref({});
    // 2. 定义方法：更新用户信息
    const setUserInfo = (data) => {
      if (data && typeof data === "object") {
        userInfo.value = {
          ...userInfo.value,
          ...data,
        }; // 合并更新，保留原有字段
      }
    };

    // 3. 定义方法：初始化/更新设备信息（核心优化）
    const initSystemInfo = async () => {
      try {
        const res = getDeviceInfo(); // 调用你封装的设备信息方法
        if (res.success) {
          systemInfo.value = res.data; // 仅赋值成功的设备信息
        } else {
          console.error("获取设备信息失败：", res.message);
          systemInfo.value = {
            screenWidth: 0,
            screenHeight: 0,
          }; // 兜底默认值
        }
      } catch (error) {
        console.error("初始化设备信息异常：", error);
        systemInfo.value = {
          screenWidth: 0,
          screenHeight: 0,
        }; // 异常兜底
      }
    };

    // 4. 定义方法：设置 openid
    const setOpenid = (val) => {
      openid.value = val || "";
    };

    // 5. 定义方法：更新token
    const setToken = (newToken) => {
      token.value = newToken || ""; // 空值处理
    };

    // 6. 定义方法：清空用户信息（登出时使用）
    const clearUserInfo = () => {
      userInfo.value = {};
      token.value = "";
      openid.value = "";
    };

    // 7. 定义方法：设置菜单列表
    const setMenuList = (list) => {
      menuList.value = list || [];
    };

    // 8. 清除所有缓存（401时使用）
    const clearAll = () => {
      userInfo.value = {};
      token.value = "";
      menuList.value = [];
    };

    const login = async () => {
      if (openid.value) {
        return;
      }
      //   uni.navigateTo({
      //     url: "/pages/login/openid",
      //   });
    };
    return {
      // 导出状态
      userInfo,
      token,
      openid,
      menuList,
      systemInfo,
      // 导出方法
      setUserInfo,
      initSystemInfo,
      setOpenid,
      setToken,
      clearUserInfo,
      setMenuList,
      clearAll,
      login,
    };
  },
  {
    // 持久化配置（修复拼写错误 + 完善配置）
    persist: {
      key: "global-store", // 自定义存储key，避免冲突
      storage: {
        // 适配小程序存储
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, value) => uni.setStorageSync(key, value),
        removeItem: (key) => uni.removeStorageSync(key),
      },
      // 核心：只持久化 userInfo、token、openid 和 menuList，排除 systemInfo
      paths: ["userInfo", "token", "openid", "menuList"],
    },
  },
);
