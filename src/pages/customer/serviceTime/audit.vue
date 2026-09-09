<template>
  <view class="page">
    <view class="list-top" id="auditTop">
      <!-- 状态切换 Tab -->
      <view class="tabs-box">
        <wd-tabs
          v-model="activeTab"
          color="#0066ff"
          inactive-color="#666"
          custom-class="tabs-style"
          @change="handleTabChange"
        >
          <wd-tab
            v-for="item in statusTabs"
            :key="item.value"
            :title="item.label"
            :name="item.value"
          ></wd-tab>
        </wd-tabs>
      </view>

      <!-- 筛选行：门店 + 只看我的 -->
      <view class="filter-row">
        <view class="filter-store">
          <ApiSelectScrollPicker
            v-model="filterStoreId"
            :api="getCustomerPage"
            paginated
            remote-search
            search-key="nameKeyword"
            label-key="storeName"
            value-key="id"
            title="选择门店"
            placeholder="全部门店"
            search-placeholder="搜索门店名称"
            @confirm="handleStoreChange"
          />
        </view>
        <view class="filter-mine" @click="toggleOnlyMine">
          <wd-icon
            :name="onlyMine ? 'check-circle-fill' : 'circle'"
            size="18px"
            :color="onlyMine ? '#0066ff' : '#999'"
          />
          <text :class="['mine-text', { 'mine-active': onlyMine }]"
            >只看我的申请</text
          >
        </view>
      </view>
    </view>

    <!-- 申请列表主体 -->
    <scroll-view
      class="content-container"
      :scroll-y="true"
      :style="{ height: `calc(100vh - ${topHeight}px)` }"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      :lower-threshold="100"
      @scrolltolower="handleScrollToLower"
    >
      <view v-for="item in recordList" :key="item.id" class="record-card">
        <view class="card-title-row">
          <text class="store-name">{{ item.storeName || "-" }}</text>
          <text :class="['status-tag', getStatusClass(item.status)]">{{
            getStatusText(item.status)
          }}</text>
        </view>

        <view class="info-row">
          <text class="label">服务类型：</text>
          <text class="value">{{
            getDictLabel("WJ_PROJECT_SERVICE", item.serviceType) || "-"
          }}</text>
        </view>

        <view class="info-row">
          <text class="label">原到期时间：</text>
          <text class="value">{{ item.oldExpiredTime || "-" }}</text>
        </view>

        <view class="info-row">
          <text class="label">新到期时间：</text>
          <text class="value value--highlight">{{
            item.newExpiredTime || "-"
          }}</text>
        </view>

        <view v-if="item.newStartTime" class="info-row">
          <text class="label">新开始时间：</text>
          <text class="value">{{ item.newStartTime }}</text>
        </view>

        <view class="info-row align-start">
          <text class="label">申请缘由：</text>
          <text class="value reason-val">{{ item.reason || "-" }}</text>
        </view>

        <view class="info-row">
          <text class="label">申请人：</text>
          <text class="value">{{ item.applicantName || "-" }}</text>
        </view>

        <view v-if="item.approverName" class="info-row">
          <text class="label">审核人：</text>
          <text class="value">{{ item.approverName }}</text>
        </view>

        <view
          v-if="item.status === 'REJECTED' && item.rejectReason"
          class="info-row align-start"
        >
          <text class="label">驳回原因：</text>
          <text class="value reason-val">{{ item.rejectReason }}</text>
        </view>

        <!-- 待审核：审核操作 -->
        <view
          v-if="item.status === 'PENDING'"
          v-has="'WJ_SERVICE_TIME_AUDITOR'"
          class="card-actions"
        >
          <view class="action-btn action-btn--reject" @click="openReject(item)"
            >驳回</view
          >
          <view class="action-btn" @click="handlePass(item)">通过</view>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="recordList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && recordList.length === 0" class="empty-box">
        <wd-icon name="user" size="48px" color="#ccc" />
        <text class="empty-text">暂无相关申请记录</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && recordList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>

    <!-- 驳回原因弹窗 -->
    <wd-popup
      v-model="rejectVisible"
      position="bottom"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 24rpx 24rpx 0 0;"
    >
      <view class="reject-popup">
        <view class="reject-header">
          <text class="reject-title">驳回原因</text>
          <wd-icon
            name="close"
            size="20px"
            color="#999"
            @click="rejectVisible = false"
          />
        </view>
        <view class="reject-body">
          <wd-input
            v-model="rejectReason"
            type="textarea"
            placeholder="请输入驳回原因（必填）"
            no-border
          />
        </view>
        <view class="reject-footer">
          <wd-button
            type="primary"
            block
            :loading="auditing"
            @click="handleRejectConfirm"
            >确认驳回</wd-button
          >
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getElementHeight } from "@/utils/tools";
import {
  getServiceTimeAdjustPage,
  auditServiceTimeAdjust,
  getCustomerPage,
} from "@/api";
import { useDict } from "@/hooks/useDict";
import ApiSelectScrollPicker from "@/components/ApiSelectScrollPicker.vue";

const { getDictLabel } = useDict();

const statusTabs = [
  { value: "all", label: "全部" },
  { value: "PENDING", label: "待审核" },
  { value: "PASS", label: "已通过" },
  { value: "REJECTED", label: "已驳回" },
];

const activeTab = ref("all");
const filterStoreId = ref("");
const onlyMine = ref(false);
const topHeight = ref(0);

// 分页状态
const recordList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'

function getStatusText(status) {
  const tab = statusTabs.find((t) => t.value === status);
  return tab ? tab.label : status || "未知";
}

function getStatusClass(status) {
  if (status === "PENDING") return "status-pending";
  if (status === "PASS") return "status-pass";
  if (status === "REJECTED") return "status-rejected";
  return "";
}

// 获取列表数据
async function fetchList(isReset = false) {
  if (loading.value) return;
  loading.value = true;

  if (isReset) {
    current.value = 1;
  }

  const params = {
    current: current.value,
    size: size.value,
  };
  if (activeTab.value !== "all") {
    params.status = activeTab.value;
  }
  if (filterStoreId.value) {
    params.storeId = filterStoreId.value;
  }
  if (onlyMine.value) {
    params.onlyMine = 1;
  }

  try {
    const res = await getServiceTimeAdjustPage(params);

    if (isReset || current.value === 1) {
      recordList.value = res.records || [];
    } else {
      recordList.value = [...recordList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;

    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取申请列表失败", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 触底加载更多
function handleScrollToLower() {
  if (loading.value || loadMoreStatus.value === "nomore") return;
  loadMoreStatus.value = "loading";
  current.value++;
  fetchList();
}

// 下拉刷新
function handleRefresh() {
  isRefreshing.value = true;
  fetchList(true);
}

// Tab 切换：接收事件参数避免 v-model 更新滞后
function handleTabChange({ name }) {
  activeTab.value = name;
  fetchList(true);
}

// 门店筛选
function handleStoreChange() {
  fetchList(true);
}

// 只看我的申请
function toggleOnlyMine() {
  onlyMine.value = !onlyMine.value;
  fetchList(true);
}

// ========== 审核操作 ==========
const auditing = ref(false);

// 通过
function handlePass(item) {
  uni.showModal({
    title: "提示",
    content: `确认通过「${item.storeName || ""}」的时间调整申请？`,
    success: async (res) => {
      if (!res.confirm) return;
      await doAudit({ id: item.id, result: "PASS" });
    },
  });
}

// 驳回
const rejectVisible = ref(false);
const rejectReason = ref("");
let rejectTargetId = "";

function openReject(item) {
  rejectTargetId = item.id;
  rejectReason.value = "";
  rejectVisible.value = true;
}

async function handleRejectConfirm() {
  if (!rejectReason.value.trim()) {
    uni.showToast({ title: "请输入驳回原因", icon: "none" });
    return;
  }
  await doAudit({
    id: rejectTargetId,
    result: "REJECT",
    rejectReason: rejectReason.value.trim(),
  });
  rejectVisible.value = false;
}

async function doAudit(data) {
  if (auditing.value) return;
  auditing.value = true;
  try {
    await auditServiceTimeAdjust(data);
    uni.showToast({ title: "操作成功", icon: "success" });
    fetchList(true);
  } catch (error) {
    console.error("审核操作失败", error);
  } finally {
    auditing.value = false;
  }
}

onLoad(async () => {
  await nextTick();
  topHeight.value = await getElementHeight("#auditTop");
  fetchList(true);
});
</script>

<style scoped lang="scss">
.tabs-style {
  font-size: 22rpx;
}
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}
.tabs-box {
  background-color: #ffffff;
  min-height: 90rpx;
  border-bottom: 1px solid #f2f3f5;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #f2f3f5;

  .filter-store {
    flex: 1;
    min-width: 0;
  }

  .filter-mine {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-shrink: 0;

    .mine-text {
      font-size: 26rpx;
      color: #999;

      &.mine-active {
        color: #0066ff;
      }
    }
  }
}
.content-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.record-card {
  background-color: #ffffff;
  margin-top: 30rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .store-name {
      width: 70%;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

/* 状态标签定制 */
.status-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  background-color: #f5f5f5;
  color: #999;

  &.status-pending {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  &.status-pass {
    background-color: #e6f8ee;
    color: #10b981;
  }
  &.status-rejected {
    background-color: #fee2e2;
    color: #ef4444;
  }
}

.info-row {
  display: flex;
  font-size: 28rpx;
  margin-bottom: 16rpx;

  &.align-start {
    align-items: flex-start;
  }

  .label {
    color: #999;
    flex-shrink: 0;
    width: 170rpx;
  }
  .value {
    color: #333;
    &.value--highlight {
      color: #0066ff;
      font-weight: 500;
    }
    &.reason-val {
      line-height: 1.4;
    }
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  gap: 12rpx;
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0066ff;
    color: #ffffff;
    padding: 0 32rpx;
    border-radius: 8rpx;
    height: 28px;
    line-height: 1;
    font-size: 12px;
    box-sizing: border-box;

    &--reject {
      background-color: #ffffff;
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    &:active {
      opacity: 0.85;
    }
  }
}

.load-more-box {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 40rpx;
  .load-more-text {
    font-size: 24rpx;
    color: #999;
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  gap: 16rpx;
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

/* 驳回弹窗 */
.reject-popup {
  background-color: #ffffff;

  .reject-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .reject-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  .reject-body {
    padding: 24rpx 32rpx;

    :deep(.wd-input) {
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 20rpx 24rpx;
    }
  }

  .reject-footer {
    padding: 0 32rpx 32rpx;
  }
}
</style>
