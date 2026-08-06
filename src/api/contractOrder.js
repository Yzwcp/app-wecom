import { get, post } from "@/utils/request";

// ==================== 移动端合同订单 ====================

// 合同订单分页
export function getContractOrderPage(data) {
  return get("/wjapp/wjMobile/contractOrder/page", data);
}

// 合同订单详情
export function getContractOrderDetail(data) {
  return get("/wjapp/wjMobile/contractOrder/detail", data);
}

// 新增合同订单
export function addContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/add", data);
}

// 编辑合同订单
export function editContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/edit", data);
}

// 删除合同订单
export function deleteContractOrder(data) {
  return post("/wjapp/wjMobile/contractOrder/delete", data);
}

// 根据合同生成订单
export function generateContractOrderFromContract(data) {
  return post("/wjapp/wjMobile/contractOrder/generateFromContract", data);
}

// 生成合同订单支付码
export function createContractOrderPay(data) {
  return post("/wjapp/wjMobile/contractOrder/createPay", data);
}

// 手动同步服务到期时间
export function syncContractOrderServiceExpire(data) {
  return post("/wjapp/wjMobile/contractOrder/syncServiceExpire", data);
}
