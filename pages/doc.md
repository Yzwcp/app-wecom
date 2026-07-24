发货列表页面
/wjapp/wjMobile/deliveryTask/page

type 类型：APPLY-我申请的，AUDIT-待我审核，DELIVERY-待我发货，ALL-全部 query true
string
logisticsNo 物流单号 query false
string
status 状态 query false
string
新增发货表单页
/wjapp/wjMobile/deliveryTask/add
/wjapp/wjMobile/deliveryTask/edit
constructionTaskId 关联施工任务id false
string
itemList 发货清单 true
array
WjDeliveryTaskItemAddParam
itemName 物品名称 true
string
quantity 数量 true
integer
spec 规格型号 false
string
unit 单位 false
string
needReturnDevice 是否需要回寄设备：1-是，2-否 false
string
receiverAddress 收货地址 true
string
receiverName 收货人姓名 true
string
receiverPhone 收货人电话 true
string
remark 备注 false
string

示例参数
{
"constructionTaskId": "",
"itemList": [
{
"itemName": "",
"quantity": 0,
"spec": "",
"unit": ""
}
],
"needReturnDevice": "",
"receiverAddress": "",
"receiverName": "",
"receiverPhone": "",
"remark": ""
}
/wjapp/wjMobile/deliveryTask/audit 审核发货
id id true
string
rejectReason 驳回原因 false
string
result 审核结果：PASS-通过，REJECT-驳回 true
string
示例参数
"id": "",
"rejectReason": "",
"result": ""
/wjapp/wjMobile/deliveryTask/deliver 确认发货
id id true
string
logisticsCompany 物流公司 true
string
logisticsNo 物流单号 true
string
/wjapp/wjMobile/deliveryTask/receive 签收
参数id
/wjapp/wjMobile/deliveryTask/returnDevice邮寄
参数id
