import { hasAuth } from "@/utils/auth";

/**
 * v-has 权限指令
 * 用法：v-has="'mobileWjConstructionTaskAdd'" 或 v-has="['a','b']"
 * 无权限时移除元素
 */
export const has = {
  mounted(el, binding) {
    if (!hasAuth(binding.value)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
};

export default {
  install(app) {
    app.directive("has", has);
  },
};
