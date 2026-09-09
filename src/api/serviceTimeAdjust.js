import { get, post } from "@/utils/request";

// 提交服务时间调整申请
export function addServiceTimeAdjust(data) {
  return post("/wjapp/wjMobile/serviceTimeAdjust/add", data);
}

// 服务时间调整申请分页（审核列表）
export function getServiceTimeAdjustPage(data) {
  return get("/wjapp/wjMobile/serviceTimeAdjust/page", { ...data });
}

// 审核服务时间调整申请（result: PASS-通过 REJECT-驳回）
export function auditServiceTimeAdjust(data) {
  return post("/wjapp/wjMobile/serviceTimeAdjust/audit", data);
}
