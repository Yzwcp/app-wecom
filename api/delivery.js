import { get, post } from "@/utils/request";

// 发货列表分页
export function getDeliveryPage(data) {
  return get("/wjapp/wjMobile/deliveryTask/page", data);
}

// 发货详情
export function getDeliveryDetail(data) {
  return get("/wjapp/wjMobile/deliveryTask/detail", data);
}

// 新增发货
export function addDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/add", data);
}

// 编辑发货
export function editDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/edit", data);
}

// 审核发货
export function auditDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/audit", data);
}

// 确认发货
export function deliverDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/deliver", data);
}

// 签收
export function receiveDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/receive", data);
}

// 回寄设备
export function returnDeviceDelivery(data) {
  return post("/wjapp/wjMobile/deliveryTask/returnDevice", data);
}

// 智能识别地址/收件人信息
export function extractReceiver(data) {
  return post("/wjapp/wjMobile/deliveryTask/extractReceiver", data);
}
