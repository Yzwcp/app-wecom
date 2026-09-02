# 【前端对接说明】施工管理功能整理（2026-09-01）

> 提交给前端同事（PC + 移动端 H5）。后端已改完待发布。

## 一、权限模型变化（重要）

- 新增角色「施工管理员」code=**`WJ_CONSTRUCTION_MANAGER`**（角色数据由后端/管理员建好，名称已改）
- 施工任务**总操作收权**：新增/编辑/删除/发布/完工确认，只有施工管理员（或系统管理员）可调，其他人调用报「仅施工管理员可操作」
- **按钮显隐建议**：取登录人 roleCodeList 含 `WJ_CONSTRUCTION_MANAGER` 才显示这些操作按钮（PC 用 hasPerm 体系、移动端用 getLoginUser 的 roleCodeList）
- 施工审核员角色废弃：审核人选择器（auditorList 接口）已删除，**新建/编辑任务不再需要传 auditorId**（传了也会被忽略，后端自动存当前操作人）

## 二、接口变动清单

| 变动 | 接口 | 说明 |
|------|------|------|
| 删除 | `GET /wj/constructionTask/auditorList`、`GET /wjMobile/constructionTask/auditorList` | 审核人选择器数据源，已下线 |
| 新增 | `POST /wj/constructionTask/delete`、`POST /wjMobile/constructionTask/delete` | 删除施工任务（仅未发布可删，仅施工管理员） |
| 参数变化 | `/wj/constructionTask/create`/`edit`（及移动端） | **不再需要 `auditorId`**；负责人自动=当前操作人 |
| 行为变化 | 分页 page/mobilePage/myPage | 施工管理员看全部；其他人只看「自己是子任务执行人」的任务（原来按部门区分；移动端我的任务不再含"我派的单"） |
| 行为变化 | 转派 transfer | 施工管理员也可以转派（原来仅负责人/当前执行人） |
| 行为变化 | 完工确认 submit | 负责人或施工管理员可完工；完工后给**合同经理（contract.managerId）**建 7 天内待回访 + 发消息；剩余 5/3/1 天各提醒一次 |

## 三、子任务执行人字段

- 子任务的 `executorId`（旧逗号串单值字段）已下线，只用 `executorIdList`/`executorNameList`（关联表多执行人）
- 前端不要再读写子任务的 executorId 单值字段

## 四、客户信息表（WJ_CUSTOMER_EXTRA_INFO）类型重构

类型换成新 6 类（旧的 5 类废弃）：`NETWORK_DEVICE` 网络设备 / `DISKLESS_SYSTEM` 无盘系统 / `CHARGING_SYSTEM` 收费系统 / `SUPERVISION_SYSTEM` 监管系统 / `CLIENT_MACHINE` 客户机 / `OTHER` 其他。

`infoContent` 为对象 JSON，各类字段结构（缺省项前端可不传或传空）：

```jsonc
// NETWORK_DEVICE 网络设备
{ "publicIp": {"ip":"", "netmask":"", "gateway":""}, "portMapping":"", "routerIp":"",
  "switchIp": {"ip":"", "manageMode":""}, "remark":"" }

// DISKLESS_SYSTEM 无盘系统
{ "serverIp":"", "wwId": {"id":"", "password":""},
  "diskInfo": {"system":"", "image":"", "writeBack":"", "game":""}, "remark":"" }

// CHARGING_SYSTEM 收费系统
{ "serverIp":"", "consoleIp":"", "faceDeviceIp":"", "pubwinId":"", "remark":"" }

// SUPERVISION_SYSTEM 监管系统
{ "policeServerIp":"", "cultureServerIp":"", "remark":"" }

// CLIENT_MACHINE 客户机
{ "ipRange":"", "remark":"" }

// OTHER 其他
{ "monitorIpRange":"", "wirelessIp":"", "remark":"" }
```

接口不变（`/wj/customerExtraInfo/list|detail|save|delete|record/list`），嵌套对象保持对象结构存储，后续加字段向后兼容。

## 五、上线前置（后端/管理员）

1. 角色管理：「施工管理员」code 对齐为 `WJ_CONSTRUCTION_MANAGER` 并加人（不加人则所有人都不能操作任务）
2. 执行 SQL：`lanker_cloud_mysql_wj_subtask_drop_executor_id.sql`（删子任务旧字段）、`lanker_cloud_mysql_wj_customer_extra_info_type_reset.sql`（旧类型数据清理）
3. XXL-Job 调度中心新建 `wjVisitDueRemind`（建议每日 9:00）
4. 负责人自行 DROP 表 `WJ_CONSTRUCTION_TASK_EXECUTOR`（代码已移除引用）
5. 重启 wj-app
