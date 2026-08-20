import { get, post } from "@/utils/request";

export function getOutworkMap(data) {
  return get("/wjapp/wjMobile/outwork/todayMapList", data);
}
export function getOutworkPage(data) {
  return get("/wjapp/wjMobile/outwork/page", data);
}
export function outworkCheckIn(data) {
  return post("/wjapp/wjMobile/outwork/checkIn", data);
}
export function outworkCheckInRange(data) {
  return get("/wjapp/wjMobile/outwork/checkInRange", data);
}
export function outworkSubmitResult(data) {
  return post("/wjapp/wjMobile/outwork/submitResult", data);
}

export function outworkConvertToContract(data) {
  return post("/wjapp/wjMobile/outwork/convertToContract", data);
}
export function outworkCreatePlan(data) {
  return post("/wjapp/wjMobile/outwork/create", data);
}
export function getOutworkDetail(data) {
  return get("/wjapp/wjMobile/outwork/detail", data);
}
export function submitOutworkReturn(data) {
  return post("/wjapp/wjMobile/outwork/submitReturn", data);
}
