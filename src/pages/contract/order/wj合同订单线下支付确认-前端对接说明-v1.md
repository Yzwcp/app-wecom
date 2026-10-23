# 【前端对接说明】合同订单确认支付（线上/线下）（2026-10-20）

> 提交给前端同事（企微 H5 移动端为主，PC 管理端接口也已就绪）。
> 后端已改完并全量编译通过。**生效前置：测试/生产库执行 SQL `lanker_cloud_mysql_wj_contract_order_offline_pay.sql` + 重启 wj-app。**

## 需求背景

合同订单原仅支持"线上支付生成支付码"（播钱吧扫码）。现支持线下收款场景：填实付金额、选支付方式（线上/线下）、线下需上传支付截图，点"确认支付"。

## 新接口：确认支付

| 端 | 接口 | 鉴权 |
|---|---|---|
| 移动端 | `POST /wjMobile/contractOrder/confirmPay` | 企微登录 |
| PC 端 | `POST /wj/contractOrder/confirmPay` | `wjContractOrder.*` 权限 |

**入参：**

| 参数 | 必填 | 说明 |
|------|------|------|
| orderId | 是 | 合同订单ID |
| payType | 是 | 支付方式：`ONLINE`-线上支付 / `OFFLINE`-线下支付（字典 `WJ_CONTRACT_ORDER_PAY_TYPE`，可做下拉翻译） |
| actualAmount | 否 | 实付金额（元）。传入则覆盖订单实付金额并作为本次收款金额；不传按订单实付/应付金额 |
| remark | 否 | 支付备注（写入支付流水） |
| payFileIdList | **线下必传** | 支付截图 fileId 列表（先调文件上传接口获取，见下） |

**返回：** `WjContractOrderPayResult`

| 字段 | 说明 |
|------|------|
| payId | 支付流水ID |
| payOrderNo | 支付流水号 |
| payAmount | 本次收款金额 |
| payUrl | **仅线上返回**：播钱吧支付码链接（前端生成二维码展示，用户扫码支付） |
| payStatus | 支付状态：线上=`3`支付中；线下=`2`支付成功 |

## 交互流程建议

```
点击"确认支付" → 弹窗：
  ├─ 实付金额（输入框，可空=按订单金额）
  ├─ 支付方式（单选：线上支付/线下支付）
  ├─ 备注（输入框，可空）
  └─ 支付截图（仅选"线下支付"时展示，图片上传，必传至少1张）
        ↓ 确定
  线上 → 调 confirmPay → 拿到 payUrl → 展示支付二维码（同原 createPay 的玩法）
  线下 → 先上传截图拿 fileIdList → 调 confirmPay → 直接支付成功 → 刷新详情
```

## 支付截图上传（线下）

复用既有文件上传接口：

- 移动端：`POST /wjMobile/file/upload`；PC 端：`POST /wj/file/upload`
- 参数：`category=WJ_CONTRACT_ORDER_PAY_IMG`（**新增分类**）+ 文件
- 返回 fileId 列表 → 作为 `payFileIdList` 传给 confirmPay

## 订单详情回显

`GET /wj(Mobile)/contractOrder/detail` 返回新增字段：

| 字段 | 说明 |
|------|------|
| payFileUrlList | 线下支付截图 URL 列表（无则空数组） |

订单 `thirdPayment` 字段可区分支付渠道：`BQBA_PAY`=线上播钱吧 / `MANUAL`=线下人工确认。

## 校验与异常提示（后端拦截，前端直接展示 message）

- 订单已支付 →「订单已支付」
- 实付金额 ≤ 0 →「实付金额必须大于0」
- 线下未传截图 →「线下支付请上传支付截图」
- 金额为 0（无实付且无产品明细）→「订单金额为零，请填写实付金额或添加产品明细」
- payType 非法 →「不支持的支付方式：xxx」

## 其他说明

- 线上链路行为不变：每次确认生成新支付码，旧支付码作废（防误扫）；支付结果仍由播钱吧回调驱动。
- 线下确认后立即支付成功，并触发与线上一致的后续动作：同步门店服务到期时间（订单开启自动同步时）、通知业务经理、自动建出货单+发货单。
- 原 `POST /wj(Mobile)/contractOrder/createPay` 接口保留可用，新页面建议统一走 confirmPay。
- 附带变更：发货任务审核报错文案由「仅允许指定上级主管审核」改为「仅允许指定上级主管或发货员审核」（发货员角色 `WJ_DELIVERY_PERSON` 现在也可审核，无接口结构变化）。
