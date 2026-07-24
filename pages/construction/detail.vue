<template>
  <view class="page">
    <!-- 页面滚动内容区域 -->
    <view scroll-y class="detail-scroll-view">
      <!-- 1. 头部核心业务卡片 -->
      <view class="main-info-card">
        <!-- 蓝色标题栏 -->
        <view class="card-header-blue">
          <view class="title-area">
            <wd-icon name="home" size="20px" color="#ffffff" class="mgr-8" />
            <text class="shop-name">{{ task.taskName || "-" }}</text>
          </view>
          <view class="status-badge">{{ getTaskStatusText(task.status) }}</view>
        </view>

        <!-- 地址与联系人信息 -->
        <view class="card-body">
          <view class="label-text">地址</view>
          <view class="address-row">
            <text class="address-detail">{{
              customerBaseInfo.address || "暂无地址"
            }}</text>
            <wd-icon
              name="location"
              size="18px"
              color="#2979ff"
              class="loc-icon"
            />
          </view>

          <view class="contact-grid">
            <view class="contact-cell">
              <view class="label-text">联系人</view>
              <view class="value-text font-bold">{{
                customerBaseInfo.contactName || "-"
              }}</view>
            </view>
            <view class="contact-cell">
              <view class="label-text">电话号码</view>
              <view class="value-text phone-color font-bold">{{
                customerBaseInfo.contactPhone || "-"
              }}</view>
            </view>
          </view>

          <view class="divider-line"></view>

          <!-- 任务信息 -->
          <view class="section-sub-title">
            <wd-icon
              name="assignment"
              size="18px"
              color="#2979ff"
              class="mgr-6"
            />
            <text>任务信息</text>
          </view>
          <view class="info-data-list">
            <view class="data-row">
              <text class="data-label">合同编号</text>
              <text class="data-value">{{ task.contractNo || "-" }}</text>
            </view>
            <view class="data-row">
              <text class="data-label">施工编号</text>
              <text class="data-value">{{ task.taskNo || "-" }}</text>
            </view>
            <view class="data-row">
              <text class="data-label">任务类型</text>
              <text class="data-value">{{
                getTaskTypeText(task.taskType)
              }}</text>
            </view>
            <view class="data-row">
              <text class="data-label">计划时间</text>
              <text class="data-value">{{ task.planFinishTime || "-" }}</text>
            </view>
          </view>

          <view class="divider-line"></view>

          <!-- 施工要求 -->
          <view class="section-sub-title">
            <wd-icon
              name="error-circle"
              size="18px"
              color="#2979ff"
              class="mgr-6"
            />
            <text>施工要求</text>
          </view>
          <view class="requirement-box">
            <view
              v-if="requirementList.length > 0"
              v-for="(req, idx) in requirementList"
              :key="idx"
              class="req-item"
              >{{ idx + 1 }}. {{ req }}</view
            >
            <view v-else class="req-item">暂无要求</view>
          </view>
        </view>
      </view>

      <!-- 2. 子任务进度（时间轴） -->
      <view class="panel-card">
        <view class="panel-card-title">
          <wd-icon
            name="error-circle"
            size="18px"
            color="#2979ff"
            class="mgr-6"
          />
          <text>子任务进度</text>
        </view>

        <view class="timeline-container">
          <view
            v-for="sub in subTaskList"
            :key="sub.id"
            :class="['timeline-item', getSubTaskLineClass(sub.status)]"
          >
            <view
              :class="['timeline-dot', getSubTaskDotClass(sub.status)]"
            ></view>
            <view class="timeline-content">
              <view class="step-header">
                <text :class="['step-status', getSubTaskTextClass(sub.status)]">
                  {{ getSubTaskStatusText(sub.status) }}
                </text>
                <text class="step-name">{{ sub.subTaskName }}</text>
              </view>
              <view v-if="getSubTaskDesc(sub)" class="step-desc">{{
                getSubTaskDesc(sub)
              }}</view>
              <view
                v-if="sub.status === 'PENDING'"
                class="execute-btn"
                @click="goExecute(sub)"
              >
                去执行
              </view>
            </view>
          </view>

          <view v-if="subTaskList.length === 0" class="empty-timeline-text"
            >暂无子任务</view
          >
        </view>
      </view>

      <!-- 3. 施工记录模块 -->
      <view class="panel-card section-margin-bottom">
        <view class="panel-card-title log-title">
          <text>施工记录</text>
        </view>

        <!-- 无记录 -->
        <view v-if="visitList.length === 0" class="empty-record-box">
          <text class="empty-text">暂无记录</text>
          <text class="link-btn" @click="handleAction('create')">去新建</text>
        </view>

        <!-- 有记录 -->
        <view v-else class="record-timeline">
          <view
            v-for="record in visitList"
            :key="record.id"
            class="record-item"
          >
            <view class="record-icon-dot text-blue">
              <wd-icon name="check-circle" size="16px" />
            </view>
            <view class="record-body-content">
              <view class="record-header">
                <text class="record-status text-blue"
                  >施工记录{{ record.subTaskName }}</text
                >
                <text
                  class="record-action-link"
                  @click="handleAction('view', record)"
                  >{{ getVisitAction(record).text }}</text
                >
              </view>
              <view class="record-text">{{
                record.content || record.remark || ""
              }}</view>
              <view class="record-time">{{ record.createTime || "" }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getConstructionDetail, getCustomerBaseInfo } from "@/api";
import { useDict } from "@/hooks/useDict";

const { dictMap, getDictLabel } = useDict();

const task = ref({});
const subTaskList = ref([]);
const visitList = ref([]);
const loading = ref(false);
const customerBaseInfo = ref({});

// 拆分施工要求（按换行或中文编号分隔）
const requirementList = computed(() => {
  const req = task.value.taskRequire;
  if (!req) return [];
  // 按换行或中文顿号数字（如 "1、xxx 2、xxx"）分隔
  const parts = req.split(/[\n\r]+|(?=\d+[、.])/).filter(Boolean);
  return parts.map((p) => p.replace(/^\d+[、.]\s*/, "").trim());
});

// ========== 任务状态 ==========
function getTaskStatusText(status) {
  return getDictLabel("WJ_TASK_STATUS", status) || status || "未知";
}

// ========== 子任务状态 ==========
function getSubTaskStatusText(status) {
  return getDictLabel("WJ_SUB_TASK_STATUS", status) || status || "未知";
}

// 时间轴样式映射
function getSubTaskLineClass(status) {
  if (status === "COMPLETED") return "line-green";
  if (status === "EXECUTING" || status === "PROCESSING") return "line-blue";
  return "line-gray";
}
function getSubTaskDotClass(status) {
  if (status === "COMPLETED") return "dot-green";
  if (status === "EXECUTING" || status === "PROCESSING") return "dot-blue";
  return "dot-gray";
}
function getSubTaskTextClass(status) {
  if (status === "COMPLETED") return "text-green";
  if (status === "EXECUTING" || status === "PROCESSING") return "text-blue";
  return "text-gray";
}

function getSubTaskDesc(sub) {
  const parts = [];
  if (sub.actualFinishTime) {
    parts.push(`完成时间：${sub.actualFinishTime}`);
  } else if (sub.actualStartTime) {
    parts.push(`开始时间：${sub.actualStartTime}`);
  }
  if (sub.executorNameList && sub.executorNameList.length > 0) {
    parts.push(sub.executorNameList.join("、"));
  }
  return parts.join(" ");
}

// ========== 任务类型映射 ==========
const TASK_TYPE_MAP = {
  MONITOR: "监控安装",
  NETWORK: "网络施工",
  MAINTENANCE: "现场维护",
  INSTALL: "设备安装",
};

function getTaskTypeText(type) {
  return TASK_TYPE_MAP[type] || type || "-";
}

// ========== 操作 ==========
// 根据子任务状态，决定操作文案和模式
function getVisitAction(visit) {
  const sub = subTaskList.value.find((s) => s.id === visit.subTaskId);
  const status = sub?.status;
  if (status === "PENDING") return { text: "去编辑", mode: "edit" };
  return { text: "去查看", mode: "view" };
}

function handleAction(type, record) {
  if (type === "create") {
    uni.navigateTo({
      url: "/pages/construction/record",
    });
  } else {
    uni.$router.push({
      url: "/pages/construction/record",
      query: {
        visitId: record.id,
        customerId: task.value.customerId,
        taskId: record.taskId,
        subTaskId: record.subTaskId,
        mode: getVisitAction(record).mode,
      },
    });
  }
}

function goExecute(sub) {
  //   uni.navigateTo({
  //     url: `/pages/construction/record?id=${task.value.id}&subTaskId=${sub.id}`,
  //   });
  uni.$router.push({
    url: "/pages/construction/record",
    query: {
      taskId: task.value.id,
      subTaskId: sub.id,
      customerId: task.value.customerId,
      mode: "create",
    },
  });
}

// ========== 加载数据 ==========
async function fetchDetail(id) {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await getConstructionDetail({ id });
    task.value = res.task || {};
    subTaskList.value = res.subTaskList || [];
    visitList.value = res.visitList || [];
    loadCustomerInfo();
  } catch (error) {
    console.error("获取施工详情失败", error);
  } finally {
    loading.value = false;
  }
}

// ========== 加载客户信息 ==========
function loadCustomerInfo() {
  getCustomerBaseInfo({ id: task.value.customerId }).then((res) => {
    console.log(res);

    customerBaseInfo.value = res || {};
  });
}

onLoad((query) => {
  if (query?.id) {
    fetchDetail(query.id);
  }
});
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f9fc;
}

/* 独立可滚动区域 */
.detail-scroll-view {
  flex: 1;
  padding: 24rpx 24rpx 0 24rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 基础通用卡片 */
.panel-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.01);
}
.panel-card-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 32rpx;
}

/* 1. 头部蓝色核心特制卡片 */
.main-info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.01);

  .card-header-blue {
    background-color: #2979ff;
    padding: 24rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-area {
      display: flex;
      align-items: center;
    }
    .shop-name {
      font-size: 34rpx;
      font-weight: bold;
      color: #ffffff;
    }
    .status-badge {
      background-color: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      border-radius: 40rpx;
    }
  }

  .card-body {
    padding: 32rpx;
  }
}

/* 地址展现形态 */
.address-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 8rpx;
  margin-bottom: 24rpx;

  .address-detail {
    font-size: 30rpx;
    color: #333333;
    font-weight: 500;
    flex: 1;
    line-height: 1.4;
  }
  .loc-icon {
    margin-left: 20rpx;
    margin-top: 4rpx;
  }
}

/* 联系人平行排版 */
.contact-grid {
  display: flex;
  margin-bottom: 12rpx;

  .contact-cell {
    flex: 1;
  }
}

/* 细体表单公用文本标签 */
.label-text {
  font-size: 24rpx;
  color: #999999;
}
.value-text {
  font-size: 28rpx;
  color: #333333;
  margin-top: 6rpx;
}
.phone-color {
  color: #2979ff;
}
.font-bold {
  font-weight: bold;
}

/* 分割线 */
.divider-line {
  height: 1rpx;
  background-color: #f1f3f7;
  margin: 28rpx 0;
}

/* 副标题小修饰 */
.section-sub-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

/* 纯文本对齐信息组 */
.info-data-list {
  .data-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    font-size: 26rpx;

    .data-label {
      color: #888888;
    }
    .data-value {
      color: #333333;
      font-weight: 500;
    }
  }
}

/* 施工要求灰色区域 */
.requirement-box {
  background-color: #f7f9fc;
  border-radius: 12rpx;
  padding: 24rpx;

  .req-item {
    font-size: 26rpx;
    color: #444444;
    line-height: 1.6;
  }
}

/* 2. 时间轴时间节点模块样式 */
.timeline-container {
  padding-left: 10rpx;
}
.timeline-item {
  position: relative;
  padding-left: 44rpx;
  padding-bottom: 40rpx;

  &::before {
    content: "";
    position: absolute;
    left: 10rpx;
    top: 24rpx;
    bottom: -12rpx;
    width: 4rpx;
  }

  &.line-green::before {
    background-color: #2ecc71;
  }
  &.line-blue::before {
    background-color: #2979ff;
  }
  &.line-gray::before {
    background-color: #d8d8d8;
  }
  &:last-child::before {
    display: none;
  }
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 10rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  z-index: 2;

  &.dot-green {
    background-color: #2ecc71;
    box-shadow: 0 0 0 6rpx rgba(46, 204, 113, 0.2);
  }
  &.dot-blue {
    background-color: #2979ff;
    box-shadow: 0 0 0 6rpx rgba(41, 121, 255, 0.2);
  }
  &.dot-gray {
    background-color: #c8c8c8;
  }
}

.timeline-content {
  .step-header {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
  }
  .step-status {
    margin-right: 24rpx;
    min-width: 110rpx;
  }
  .step-name {
    color: #333333;
  }
  .step-desc {
    font-size: 24rpx;
    color: #999999;
    margin-top: 8rpx;
  }
}

.execute-btn {
  display: inline-block;
  margin-top: 12rpx;
  padding: 8rpx 28rpx;
  font-size: 24rpx;
  color: #2979ff;
  background-color: #ecf5ff;
  border-radius: 30rpx;
  font-weight: 500;
}

.empty-timeline-text {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 40rpx 0;
}

/* 3. 施工记录专属样式 */
.log-title {
  justify-content: space-between;
}

/* 空白态样式 */
.empty-record-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  font-size: 28rpx;

  .empty-text {
    color: #333333;
    font-weight: 500;
  }
  .link-btn {
    color: #2979ff;
    margin-left: 12rpx;
    font-weight: bold;
  }
}

/* 有数据时的时间轴样式 */
.record-timeline {
  padding-left: 10rpx;
}
.record-item {
  position: relative;
  padding-left: 44rpx;
  padding-bottom: 32rpx;

  &::before {
    content: "";
    position: absolute;
    left: 14rpx;
    top: 28rpx;
    bottom: -10rpx;
    width: 2rpx;
  }
  &.line-gray::before {
    background-color: #d8d8d8;
  }
  &:last-child::before {
    display: none;
  }
}

.record-icon-dot {
  position: absolute;
  left: 0;
  top: 2rpx;
  z-index: 2;
  background-color: #ffffff;
}

.record-body-content {
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .record-status {
    font-size: 28rpx;
    font-weight: bold;
  }
  .record-action-link {
    font-size: 26rpx;
    color: #2979ff;
    font-weight: 500;

    &.link-edit {
      color: #2979ff;
    }
  }
  .record-text {
    font-size: 26rpx;
    color: #444444;
    margin-top: 10rpx;
  }
  .record-time {
    font-size: 24rpx;
    color: #999999;
    margin-top: 6rpx;
  }
}

/* 文本公共状态颜色定义 */
.text-green {
  color: #2ecc71;
}
.text-blue {
  color: #2979ff;
}
.text-gray {
  color: #999999;
}
.mgr-6 {
  margin-right: 12rpx;
}
.mgr-8 {
  margin-right: 16rpx;
}
.mgt-8 {
  margin-top: 16rpx;
}
.section-margin-bottom {
  margin-bottom: 160rpx;
}
</style>
