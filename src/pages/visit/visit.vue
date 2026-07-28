<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="客户回访列表"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <!-- 搜索与Tab头部区域 -->
    <view class="header-box">
      <view class="search-box">
        <wd-search
          v-model="searchKey"
          placeholder="搜索客户名称或地址"
          hide-cancel
          bg-color="#f7f8fa"
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>

      <!-- 状态过滤 Tab -->
      <view class="tabs-box">
        <wd-tabs
          v-model="activeTab"
          color="#0066ff"
          inactive-color="#999999"
          line-width="32rpx"
          @change="handleTabChange"
        >
          <wd-tab title="全部" name="all"></wd-tab>
          <wd-tab title="待回访" name="pending"></wd-tab>
          <wd-tab title="已完成" name="completed"></wd-tab>
        </wd-tabs>
      </view>
    </view>

    <!-- 列表主体 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      :lower-threshold="100"
      @scrolltolower="handleScrollToLower"
    >
      <view class="content-container">
        <view v-for="item in visitList" :key="item.id" class="visit-card">
          <!-- 卡片头部标题与状态 -->
          <view class="card-header">
            <view class="title-left">
              <view class="store-icon-box">
                <wd-icon name="shop" size="18px" color="#fff" />
              </view>
              <text class="customer-name">{{ item.customerName }}</text>
            </view>
            <text
              :class="[
                'status-text',
                isPending(item.status) ? 'text-red' : 'text-blue',
              ]"
            >
              {{ getStatusText(item.status) }}
            </text>
          </view>

          <!-- 卡片明细信息 -->
          <view class="card-body">
            <view class="info-item">
              <text class="label">合同编号</text>
              <text class="val">{{ item.contractNo || "-" }}</text>
            </view>
            <view class="info-item">
              <text class="label">合同标题</text>
              <text class="val">{{ item.contractTitle || "-" }}</text>
            </view>
            <view class="info-item">
              <text class="label">联系人</text>
              <text class="val">{{ item.contactName || "-" }}</text>
            </view>
            <view class="info-item">
              <text class="label">联系电话</text>
              <text class="val">{{ item.contactPhone || "-" }}</text>
            </view>
            <view class="info-item align-top">
              <text class="label">详细地址</text>
              <text class="val address-val">{{ item.address || "-" }}</text>
            </view>
            <view class="info-item">
              <text class="label">完工时间</text>
              <text class="val">{{ item.finishTime || "-" }}</text>
            </view>
          </view>

          <!-- 操作按钮：仅在待回访状态下显示 -->
          <view v-if="isPending(item.status)" class="card-footer">
            <button class="custom-action-btn" @click="goToForm(item)">
              去回访
            </button>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="visitList.length > 0" class="load-more-box">
          <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
            >加载中...</text
          >
          <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
            >没有更多了</text
          >
        </view>

        <!-- 空状态 -->
        <view v-if="visitList.length === 0 && !loading" class="empty-box">
          <wd-icon name="comment-circle" size="48px" color="#ccc" />
          <text class="empty-text">没有找到相关的回访任务</text>
        </view>

        <view v-if="loading && visitList.length === 0" class="empty-box">
          <text class="empty-text">加载中...</text>
        </view>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getVisitPendingPage, getVisitRecordPage } from "@/api";

const searchKey = ref("");
const activeTab = ref("all");

// 分页状态
const visitList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref("");

// 状态判断 & 文本
function isPending(status) {
  return String(status) === "PENDING" || status === "待回访";
}

function getStatusText(status) {
  if (String(status) === "PENDING") return "待回访";
  if (String(status) === "COMPLETED") return "已完成";
  return status || "-";
}

// 获取列表
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
  if (searchKey.value.trim()) {
    params.keyword = searchKey.value.trim();
  }

  try {
    let res;
    if (activeTab.value === "pending") {
      res = await getVisitPendingPage(params);
    } else if (activeTab.value === "completed") {
      res = await getVisitRecordPage({ ...params, status: "COMPLETED" });
    } else {
      res = await getVisitRecordPage(params);
    }

    const records = res.records || [];

    if (isReset || current.value === 1) {
      visitList.value = records;
    } else {
      visitList.value = [...visitList.value, ...records];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;
    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取回访列表失败", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 下拉刷新
function handleRefresh() {
  isRefreshing.value = true;
  fetchList(true);
}

// 触底加载更多
function handleScrollToLower() {
  if (loading.value || loadMoreStatus.value === "nomore") return;
  loadMoreStatus.value = "loading";
  current.value++;
  fetchList();
}

// Tab 切换
function handleTabChange({ name }) {
  activeTab.value = name;
  fetchList(true);
}

// 搜索
function handleSearch() {
  fetchList(true);
}

function goBack() {
  uni.navigateBack();
}

// 点击去回访跳转
function goToForm(item) {
  uni.navigateTo({
    url: `/pages/visit/commit?id=${item.id}&customerId=${item.customerId || ""}&contractId=${item.contractId || ""}&name=${encodeURIComponent(item.customerName || "")}&contact=${encodeURIComponent(item.contactName || "")}&phone=${item.contactPhone || ""}`,
  });
}

// 初始加载
onLoad(() => {
  fetchList(true);
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f9fc;
}
.header-box {
  background-color: #ffffff;
}
.search-box {
  padding: 16rpx 32rpx 8rpx;
}
.tabs-box {
  :deep(.wd-tabs__nav-item) {
    font-size: 30rpx;
    &.is-active {
      font-weight: bold;
      color: #111111 !important;
    }
  }
}

.list-scroll {
  height: calc(100vh - 88rpx - 180rpx - env(safe-area-inset-top));
}

.content-container {
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 卡片样式 */
.visit-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .title-left {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .store-icon-box {
        width: 48rpx;
        height: 48rpx;
        background-color: #0066ff;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .customer-name {
        font-size: 34rpx;
        font-weight: bold;
        color: #111111;
      }
    }

    .status-text {
      font-size: 26rpx;
      font-weight: 500;
      &.text-blue {
        color: #0066ff;
      }
      &.text-red {
        color: #ff3b30;
      }
    }
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 28rpx;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;

    &.align-top {
      align-items: flex-start;
    }

    .label {
      color: #333333;
      min-width: 140rpx;
    }
    .val {
      color: #111111;
      text-align: right;
      font-weight: 400;
    }
    .address-val {
      max-width: 480rpx;
      line-height: 1.4;
    }
  }
}

.card-footer {
  margin-top: 36rpx;

  .custom-action-btn {
    width: 100%;
    height: 84rpx;
    line-height: 82rpx;
    background-color: #ffffff;
    border: 2rpx solid #0066ff;
    color: #0066ff;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    text-align: center;

    &::after {
      border: none;
    }
  }
}

.load-more-box {
  text-align: center;
  padding: 24rpx 0;
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
</style>
