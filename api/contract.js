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
//add
export function addContract(data) {
  return post("/wjapp/wj/contract/add", data);
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
//checkInRange
