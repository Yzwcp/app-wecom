import { useGlobalStore } from "@/store/global";

/**
 * 判断当前用户是否拥有指定按钮权限
 * @param {string|string[]} codes 权限编码或编码数组
 * @returns {boolean}
 */
export function hasAuth(codes) {
  const globalStore = useGlobalStore();
  const btnList = globalStore.userInfo?.mobileButtonCodeList || [];

  if (!codes || (Array.isArray(codes) && codes.length === 0)) {
    return true;
  }

  const codeList = Array.isArray(codes) ? codes : [codes];
  return codeList.some((code) => btnList.includes(code));
}
