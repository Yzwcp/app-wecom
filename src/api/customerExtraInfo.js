import { get, post } from "@/utils/request";

// 客户信息列表（按客户/类型查询）
export function getCustomerExtraInfoList(data) {
  return get("/wjapp/wjMobile/customerExtraInfo/list", data);
}
// 客户信息详情
export function getCustomerExtraInfoDetail(data) {
  return get("/wjapp/wjMobile/customerExtraInfo/detail", data);
}
// 客户信息保存（新增/编辑，infoContent 为 JSON）
export function saveCustomerExtraInfo(data) {
  return post("/wjapp/wjMobile/customerExtraInfo/save", data);
}
// 客户信息删除
export function deleteCustomerExtraInfo(data) {
  return post("/wjapp/wjMobile/customerExtraInfo/delete", data);
}
// 客户信息变更记录
export function getCustomerExtraInfoRecordList(data) {
  return get("/wjapp/wjMobile/customerExtraInfo/record/list", data);
}
