import { get, post } from "@/utils/request";

export function login(data) {
  return post("/wjapp/auth/cp/doLogin", { device: "WX_CP", ...data });
}

export function getLoginUser(data) {
  return get("/wjapp/auth/cp/getLoginUser", data);
}

export function getUserMenu(data) {
  return get("/wjapp/wjMobile/home/menu", data);
}

export function getOpenidByCode(data) {
  return get("/wjapp/noLp/wxCpBindCallback", data);
}
export function workHome(data) {
  return get("/wjapp/wjMobile/home/workbench", data);
}

export function getJsapiTicket(data) {
  return get("/webapp/wx/cp/jsapiTicket", data);
}
