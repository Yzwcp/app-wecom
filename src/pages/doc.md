移动端合同订单分页
/wjapp/wjMobile/contractOrder/page

contractId 合同ID query false
string
customerId 客户ID query false
string
orderName 订单名称 query false
string
orderNo 订单编号 query false
string
orderType 订单类型 query false
string
payStatus 支付状态 query false
string

移动端新增合同订单
/wjapp/wjMobile/contractOrder/add

autoSyncService 支付成功后是否自动同步服务到期时间 false
string
contractId 合同ID true
string
customerId 客户ID true
string
orderName 订单名称 false
string
orderType 订单类型 false
string
productList 产品明细 false
array
WjContractOrderProductParam
id ID false
string
productModel 产品型号 false
string
productName 产品名称 true
string
quantity 采购数量 true
integer
sort 排序 false
integer
unitPrice 单品单价 true
number
remark 备注 false
string

请求示例
{
"autoSyncService": "",
"contractId": "",
"customerId": "",
"orderName": "",
"orderType": "",
"productList": [
{
"id": "",
"productModel": "",
"productName": "",
"quantity": 0,
"sort": 0,
"unitPrice": 0
}
],
"remark": ""
}

移动端编辑合同订单
/wjapp/wjMobile/contractOrder/edit
参数同上 多一个id参数

移动端删除合同订单
/wjapp/wjMobile/contractOrder/delete
id ID true
string

移动端合同订单详情
/wjapp/wjMobile/contractOrder/detail
id ID true
string

移动端根据合同生成订单
/wjapp/wjMobile/contractOrder/generateFromContract
contractId 合同ID true
string

移动端生成合同订单支付码
/wjapp/wjMobile/contractOrder/createPay
orderId 合同订单ID true
string

移动端手动同步服务到期时间
/wjapp/wjMobile/contractOrder/syncServiceExpire
id 合同订单ID true
string

CONTRACT_ORDER_TYPE 合同订单类型字典
ORDER_STATUS 订单支付状态字典
