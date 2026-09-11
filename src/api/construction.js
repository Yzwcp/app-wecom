import { get, post } from "@/utils/request";

// export function getConstructionPage(data) {
//   return get("/wjapp/wjMobile/constructionTask/page", { ...data });
// }
export function getConstructionMyPage(data) {
  return get("/wjapp/wjMobile/constructionTask/myPage", data);
}
export function getConstructionDetail(data) {
  return get("/wjapp/wjMobile/constructionTask/detail", data);
}

export function doConstructionCheckIn(data) {
  return post("/wjapp/wjMobile/constructionTask/checkIn", data);
}
export function doConstructionSubmit(data) {
  return post("/wjapp/wjMobile/constructionTask/submit", data);
}
export function doConstructionStart(data) {
  return post("/wjapp/wjMobile/constructionTask/subTask/start", data);
}
export function doConstructionComplete(data) {
  return post("/wjapp/wjMobile/constructionTask/subTask/complete", data);
}
export function doConstructionVisitSave(data) {
  return post("/wjapp/wjMobile/constructionTask/visit/save", data);
}
export function getConstructionVisitDetail(data) {
  return get("/wjapp/wjMobile/constructionTask/visit/detail", data);
}
export function getConstructionMaterialList(data) {
  return get("/wjapp/wjMobile/constructionTask/material/list", data);
}
export function doConstructionMaterialSave(data) {
  return post("/wjapp/wjMobile/constructionTask/material/save", data);
}
export function constructionCheckInRange(data) {
  return get("/wjapp/wjMobile/constructionTask/checkInRange", data);
}

// ==================== 管理员端施工任务 ====================

// 管理员施工任务分页（全部数据，不按执行人过滤）
export function getConstructionTaskPage(data) {
  return get("/wjapp/wjMobile/constructionTask/page", data);
}
// 管理员创建施工任务
export function createConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/create", data);
}
// 任务模板列表（创建时选择模板自动填充）
export function getConstructionTaskTemplateList(data) {
  return get("/wjapp/wjMobile/constructionTask/templateList", data);
}
// 移动端子任务执行人列表（技术服务部成员）
export function getConstructionExecutorList(data) {
  return get("/wjapp/wjMobile/constructionTask/executorList", data);
}
// 施工任务详情
export function getConstructionTaskDetail(data) {
  return get("/wjapp/wjMobile/constructionTask/detail", data);
}
// 施工任务更新
export function updateConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/edit", data);
}
// 施工任务发布
export function publishConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/publish", data);
}
// 转派子任务
export function transferConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/transfer", data);
}
// 删除施工任务（仅未发布可删，仅施工管理员）
export function deleteConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/delete", data);
}

// ==================== 施工人员申请施工任务 ====================

// 申请施工任务
export function applyConstructionTask(data) {
  return post("/wjapp/wjMobile/constructionTask/apply", data);
}

// 审核申请（仅施工管理员，result: PASS-通过 REJECT-驳回）
export function auditConstructionApply(data) {
  return post("/wjapp/wjMobile/constructionTask/auditApply", data);
}

// 编辑申请（仅申请人本人，任务需为已驳回状态）
export function editConstructionApply(data) {
  return post("/wjapp/wjMobile/constructionTask/applyEdit", data);
}

// 货品列表（材料选择）
export function getGoodsList(data) {
  return get("/wjapp/wjMobile/goods/list", data);
}
