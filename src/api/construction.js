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
