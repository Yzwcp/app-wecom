import { get, post } from "@/utils/request";

export function getCustomerPage(data) {
  return get("/wjapp/wjMobile/customer/page", { ...data });
}
export function getCustomerDetail(data) {
  return get("/wjapp/wjMobile/customer/detail", data);
}
export function getCustomerBaseInfo(data) {
  return get("/wjapp/wjMobile/customer/baseInfo", data);
}
export function editCustomer(data) {
  return post("/wjapp/wjMobile/customer/edit", data);
}
export function addOutworkPlan(data) {
  return post("/wjapp/wjMobile/outwork/add", data);
}
