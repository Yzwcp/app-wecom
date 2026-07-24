import { get, post } from "@/utils/request";
export function getContractOrderPage(data) {
  return get("/wjapp/wjMobile/contractOrder/page", data);
}
export function getContractOrderDetail(data) {
  return get("/wjapp/wjMobile/contractOrder/detail", data);
}
//add
export function addContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/add", data);
}
//edit
export function editContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/edit", data);
}
//delete
export function deleteContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/delete", data);
}
//generateFromContract
export function generateFromContract(data) {
  return post("/wjapp/wjMobile/contractOrder/generateFromContract", data);
}
//createPay
export function createPay(data) {
  return post("/wjapp/wjMobile/contractOrder/createPay", data);
}
