import { get, post } from "@/utils/request";

// 客户附加信息整表查询（全部类型，有数据带数据、无数据空骨架）
export function getCustomerExtraInfoAll(data) {
  return get("/wjapp/wjMobile/customerExtraInfo/all", data);
}
// 客户信息保存（全类型统一提交，itemList 为各类型数组）
export function saveCustomerExtraInfo(data) {
  return post("/wjapp/wjMobile/customerExtraInfo/saveAll", data);
}
