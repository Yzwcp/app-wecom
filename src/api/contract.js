import { get, post } from "@/utils/request";

// export function getConstructionPage(data) {
//   return get("/wjapp/wj/constructionTask/page", { ...data });
// }
export function getContractPage(data) {
  return get("/wjapp/wj/contract/page", data);
}
export function getContractDetail(data) {
  return get("/wjapp/wj/contract/detail", data);
}
//add（移动端：/wjapp/wjMobile/contract）
export function addContract(data) {
  return post("/wjapp/wjMobile/contract", data);
}
// 预生成合同编号（移动端）
export function getNextContractNo(data) {
  return get("/wjapp/wjMobile/contract/nextContractNo", data);
}
//edit
export function editContract(data) {
  return post("/wjapp/wj/contract/edit", data);
}
//sign
export function signContract(data) {
  return post("/wjapp/wj/contract/sign", data);
}
//close
export function closeContract(data) {
  return post("/wjapp/wj/contract/close", data);
}
//effectivePage
export function effectivePage(data) {
  return get("/wjapp/wj/contract/effectivePage", data);
}
//editContent
export function editContent(data) {
  return post("/wjapp/wj/contract/editContent", data);
}

export function getContractTemplateList(data) {
  return get("/wjapp/wjMobile/contract/template/list", data);
}

// ==================== 移动端合同电签 ====================

// 移动端客户放心签认证状态检查
export function getContractSignCustomerAuthCheck(data) {
  return get("/wjapp/wjMobile/contractSign/customerAuthCheck", data);
}
// 移动端获取客户放心签认证链接
export function getContractSignCustomerAuthUrl(data) {
  return post("/wjapp/wjMobile/contractSign/customerAuthUrl", data);
}
// 移动端获取客户放心签静默签授权链接
export function getContractSignCustomerSilentAuthUrl(data) {
  return get("/wjapp/wjMobile/contractSign/customerSilentAuthUrl", data);
}
// 移动端发起合同电签
export function contractSignInitiate(data) {
  return post("/wjapp/wjMobile/contractSign/initiate", data);
}
// 移动端合同签署记录分页
export function getContractSignPage(data) {
  return get("/wjapp/wjMobile/contractSign/page", data);
}
// 移动端作废（撤回）合同电签
export function contractSignVoid(data) {
  return post("/wjapp/wjMobile/contractSign/void", data);
}
// 移动端催签合同电签
export function contractSignUrge(data) {
  return post("/wjapp/wjMobile/contractSign/urge", data);
}
//checkInRange
