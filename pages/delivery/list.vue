<template>
  <view class="page">
    <!-- 顶部状态切换 Tabs -->
    <view class="tabs-container" id="listTop">
      <wd-tabs
        v-model="activeTab"
        animated
        color="#2979ff"
        inactive-color="#666"
        @change="handleTabChange"
      >
        <wd-tab title="全部" name="ALL"></wd-tab>
        <wd-tab title="我申请的" name="APPLY"></wd-tab>
        <wd-tab title="待我审核" name="AUDIT"></wd-tab>
        <wd-tab title="待我发货" name="DELIVERY"></wd-tab>
      </wd-tabs>
    </view>

    <!-- 列表区域 -->
    <scroll-view
      scroll-y
      class="list-container"
      :style="{ height: `calc(100vh - ${topHeight}px - 64rpx)` }"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      :lower-threshold="100"
      @scrolltolower="handleScrollToLower"
    >
      <view v-for="item in taskList" :key="item.id" class="task-card">
        <!-- 右上角状态切角标签 -->
        <view
          class="status-badge"
          :class="`status-bg-${getStatusClass(item.status)}`"
        >
          {{ item.statusName }}
        </view>

        <!-- 物流单号 -->
        <view class="task-no">物流单号：{{ item.logisticsNo || "-" }}</view>

        <!-- 客户信息 -->
        <view class="customer-info">
          <view
            class="dot"
            :class="`status-dot-${getStatusClass(item.status)}`"
          ></view>
          <text class="customer-name">{{ item.receiverName || "-" }}</text>
        </view>

        <!-- 收货信息 -->
        <view class="info-row">
          <view class="field-label">收货地址</view>
          <view class="field-value address-value">{{
            item.receiverAddress || "暂无地址"
          }}</view>
        </view>
        <view class="grid-info-row">
          <view class="info-cell">
            <view class="field-label">收货人</view>
            <view class="field-value">{{ item.receiverName || "-" }}</view>
          </view>
          <view class="info-cell">
            <view class="field-label">联系电话</view>
            <view class="field-value">{{ item.receiverPhone || "-" }}</view>
          </view>
        </view>

        <!-- 发货清单简要 -->
        <view class="info-row" v-if="item.itemList?.length">
          <view class="field-label">物品清单</view>
          <view class="item-list-preview">
            <text
              v-for="(sub, idx) in item.itemList.slice(0, 3)"
              :key="idx"
              class="item-tag"
            >
              {{ sub.itemName }}{{ sub.quantity ? ` x${sub.quantity}` : "" }}
            </text>
            <text v-if="item.itemList.length > 3" class="item-more"
              >等{{ item.itemList.length }}件</text
            >
          </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="action-bar">
          <button
            v-if="item.status === 'APPLY'"
            class="btn btn-danger"
            @click="handleAction('audit', item)"
          >
            审核
          </button>
          <button
            v-if="item.status === 'AUDIT'"
            class="btn btn-primary"
            @click="handleAction('deliver', item)"
          >
            确认发货
          </button>
          <button
            v-if="item.status === 'DELIVERY'"
            class="btn btn-primary"
            @click="handleAction('receive', item)"
          >
            签收
          </button>
          <button class="btn btn-outline" @click="goToDetail(item)">
            查看详情
          </button>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="taskList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && taskList.length === 0" class="empty-box">
        <wd-icon name="delivery" size="48px" color="#ccc" />
        <text class="empty-text">暂无发货数据</text>
      </view>

      <view v-if="loading && taskList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 悬浮新建发货按钮 -->
    <!-- <view class="fab-btn" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view> -->
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad } from "@dcloudio/uni-app";
import { getDeliveryPage } from "@/api/delivery";

const activeTab = ref("ALL");
const topHeight = ref(0);

const taskList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref("");

const STATUS_MAP = {
  APPLY: { text: "待审核", cls: "audit" },
  AUDIT: { text: "待发货", cls: "progress" },
  DELIVERY: { text: "已发货", cls: "pending" },
  RECEIVE: { text: "已完成", cls: "completed" },
  REJECTED: { text: "已驳回", cls: "rejected" },
};

function getStatusClass(status) {
  return STATUS_MAP[status]?.cls || "other";
}

function getStatusText(status) {
  return STATUS_MAP[status]?.text || "未知";
}

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

  if (activeTab.value !== "ALL") {
    params.type = activeTab.value;
  }

  try {
    const res = await getDeliveryPage(params);

    if (isReset || current.value === 1) {
      taskList.value = res.records || [];
    } else {
      taskList.value = [...taskList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;
    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取发货列表失败", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

function handleScrollToLower() {
  if (loading.value || loadMoreStatus.value === "nomore") return;
  loadMoreStatus.value = "loading";
  current.value++;
  fetchList();
}

function handleRefresh() {
  isRefreshing.value = true;
  fetchList(true);
}

function handleTabChange({ name }) {
  activeTab.value = name;
  fetchList(true);
}

function goToDetail(item) {
  // 待发货或驳回状态可编辑，跳转表单页
  if (item.status === "AUDIT" || item.status === "REJECTED") {
    uni.navigateTo({
      url: `/pages/delivery/form?id=${item.id}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/delivery/detail?id=${item.id}`,
    });
  }
}

function handleAction(actionType, item) {
  console.log(`触发了 ${actionType} 操作，数据为：`, item);
}

// 跳转到新建发货表单
function goToAdd() {
  uni.navigateTo({
    url: "/pages/delivery/form",
  });
}

onLoad(async () => {
  await nextTick();
  topHeight.value = await getElementHeight("#listTop");
  fetchList(true);
});
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  background-color: #f7f9fc;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  background-color: #ffffff;
  :deep(.wd-tabs__nav) {
    background-color: #ffffff;
  }
  :deep(.wd-tabs__slider) {
    width: 40rpx !important;
    height: 6rpx !important;
    border-radius: 4rpx;
    background-color: #2979ff !important;
  }
}

.list-container {
  padding: 32rpx;
  box-sizing: border-box;
}

.task-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 2rpx solid #e5e7eb;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10rpx 40rpx;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
  border-bottom-left-radius: 24rpx;

  &.status-bg-pending {
    background: #2979ff;
  }
  &.status-bg-progress {
    background: #f2825b;
  }
  &.status-bg-completed {
    background: #2ecc71;
  }
  &.status-bg-audit {
    background: #f59e0b;
  }
  &.status-bg-other {
    background: #9ca3af;
  }
  &.status-bg-rejected {
    background: #ef5350;
  }
}

.task-no {
  font-size: 26rpx;
  color: #888888;
  margin-bottom: 28rpx;
}

.customer-info {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;

  .dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }
  .status-dot-pending {
    background-color: #2979ff;
    box-shadow: 0 0 8rpx rgba(41, 121, 255, 0.5);
  }
  .status-dot-progress {
    background-color: #f2825b;
    box-shadow: 0 0 8rpx rgba(242, 130, 91, 0.5);
  }
  .status-dot-completed {
    background-color: #2ecc71;
    box-shadow: 0 0 8rpx rgba(46, 204, 113, 0.5);
  }
  .status-dot-audit {
    background-color: #f59e0b;
    box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.5);
  }
  .status-dot-other {
    background-color: #9ca3af;
    box-shadow: none;
  }
  .status-dot-rejected {
    background-color: #ef5350;
    box-shadow: 0 0 8rpx rgba(239, 83, 80, 0.5);
  }

  .customer-name {
    font-size: 34rpx;
    font-weight: bold;
    color: #333333;
  }
}

.field-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}
.field-value {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.4;
}

.info-row {
  margin-bottom: 24rpx;
  .address-value {
    font-weight: 500;
  }
}

.grid-info-row {
  display: flex;
  margin-bottom: 24rpx;

  .info-cell {
    flex: 1;
  }
}

.item-list-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;

  .item-tag {
    background: #f0f5ff;
    color: #2979ff;
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    line-height: 1.4;
  }
  .item-more {
    font-size: 24rpx;
    color: #999;
    line-height: 1.4;
    padding: 6rpx 0;
  }
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  border-top: 1rpx solid #f0f3f7;
  padding-top: 28rpx;

  .btn {
    margin: 0;
    padding: 0 36rpx;
    height: 64rpx;
    line-height: 60rpx;
    font-size: 26rpx;
    border-radius: 12rpx;
    box-sizing: border-box;
    font-weight: 500;

    &::after {
      border: none;
    }
  }

  .btn-outline {
    background-color: #ffffff;
    color: #666;
    border: 2rpx solid #ddd;

    &:active {
      background-color: #f5f5f5;
    }
  }

  .btn-primary {
    background-color: #2979ff;
    color: #ffffff;

    &:active {
      background-color: #1a65eb;
    }
  }

  .btn-danger {
    background-color: #ff6b6b;
    color: #ffffff;

    &:active {
      background-color: #e55a5a;
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

.safe-bottom {
  height: 60rpx;
}

/* 悬浮新建按钮 */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #2979ff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.4);
  z-index: 99;

  &:active {
    transform: scale(0.92);
  }

  .fab-icon {
    font-size: 52rpx;
    font-weight: 300;
    line-height: 1;
  }
}
</style>
