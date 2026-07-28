import { get, post } from "@/utils/request";

export function getTaskPage(data) {
  return get("/wjapp/wjMobile/constructionTask/myPage", { ...data });
}

export function taskCheckIn(data) {
  return post("/wjapp/wjMobile/constructionTask/checkIn", data);
}
export function taskSubmitFinish(data) {
  return post("/wjapp/wjMobile/constructionTask/submit", data);
}
export function taskDetail(data) {
  return get("/wjapp/wjMobile/constructionTask/detail", data);
}
export function taskStartSubTask(data) {
  return post("/wjapp/wjMobile/constructionTask/subTask/start", data);
}
export function taskCompleteSubTask(data) {
  return post("/wjapp/wjMobile/constructionTask/subTask/complete", data);
}
export function taskSaveVisit(data) {
  return post("/wjapp/wjMobile/constructionTask/visit/save", data);
}
export function taskGetVisitDetail(data) {
  return post("/wjapp/wjMobile/constructionTask/visit/detail", data);
}

export function taskGetMaterialList(data) {
  return post("/wjapp/wjMobile/constructionTask/material/list", data);
}
export function taskSaveMaterial(data) {
  return post("/wjapp/wjMobile/constructionTask/material/save", data);
}
