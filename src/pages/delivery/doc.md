# 【前端对接说明】发货回寄接入出入库单 + 手工发货补出货单（2026-09-01）

> 提交给前端同事（PC + 移动端 H5）。后端已改完待发布。

## 一、回收明细录入位置（2026-09-02 调整：在新增/编辑，不在确认发货）

`POST /wj/deliveryTask/add`、`/edit`（移动端同步）

**新增入参 `returnItemList`（回收明细）**：

- 「需回寄设备=是」时必传（漏传则确认发货时拦截：「请先在编辑中填写回收明细」）
- 结构：`[{ "goodsId": "物品ID（物品选择器 /wj/goods/list）", "quantity": 数量 }]`
- 语义：回收设备可能与发出设备不一致，以录入为准；编辑为整组替换语义（回传完整列表）

**回显**：detail 返回 `returnItemList` 即回收明细（含 goodsName/goodsModel），编辑表单直接回显。

**确认发货接口不变**：`POST /wj/deliveryTask/deliver` 不传回收明细（由持久化的回收明细自动建退货单）；确认发货后会给申请人发消息（站内信+企微，含物流信息）。

## 二、行为变化（前端知悉）

1. **手工发货（非合同订单来的任务）**：明细绑了物品的，deliver 后自动补一条 SALE 出货单（已完成的出入库单列表可见），库存流水挂在单据上（单据详情可见流水）
2. **需回寄任务**：新增/编辑录入回收明细 → deliver 后自动建客户退货单（待处理）；确认回寄（returnDevice）时自动入库完成
3. **出入库单来源**新增类型：`DELIVERY_TASK` 发货任务（单据来源字段 sourceBizType）
4. 新增催收：回寄超 N 天（默认 7，dev_config `WJ_DELIVERY_RETURN_OVERDUE_DAYS`）给申请人发消息——前端无需处理

## 三、不变的部分

- 回寄状态字段（needReturnDevice/returnStatus）保留，展示逻辑不变
- 换货（客户换货单）链路不变
- 编辑回寄信息 editReturnInfo 不变
