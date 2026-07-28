<template>
  <view class="page">
    <view class="list-top" id="listTop">
      <view class="search-box">
        <wd-search
          v-model="searchKey"
          placeholder="搜索客户名称或地址"
          hide-cancel
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>

      <!-- 状态切换 Tab -->
      <view class="tabs-box">
        <wd-tabs
          v-if="tabsList?.length > 0"
          v-model="activeTab"
          color="#0066ff"
          inactive-color="#666"
          @change="handleTabChange"
        >
          <!-- 全部状态 -->
          <wd-tab title="全部" name="all"></wd-tab>
          <!-- 其他状态 -->
          <wd-tab
            v-for="item in tabsList"
            :key="item.value"
            :title="item.label"
            :name="item.value"
          ></wd-tab>
        </wd-tabs>
      </view>
    </view>

    <!-- 客户列表主体 -->
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
      <view v-for="item in customerList" :key="item.id" class="customer-card">
        <view class="card-title-row">
          <text class="customer-name">{{ item.storeName }}</text>
          <text :class="['status-tag', getStatusClass(item.businessStatus)]">{{
            getStatusText(item.businessStatus)
          }}</text>
        </view>

        <view class="info-row">
          <text class="label">注册号：</text>
          <text class="value">{{ item.id }}</text>
        </view>

        <view class="info-row align-start">
          <text class="label">详细地址：</text>
          <text class="value address-val">{{
            item.address || "暂无地址"
          }}</text>
        </view>

        <view class="card-actions">
          <wd-button
            type="primary"
            size="small"
            class="action-btn"
            @click="goToEdit(item)"
            >修改信息</wd-button
          >
          <!-- 创建外出计划 -->
          <wd-button
            type="primary"
            size="small"
            class="action-btn"
            @click="goOutworkPlan(item)"
            >外出计划</wd-button
          >
          <!-- 创建合同 -->
          <wd-button
            type="primary"
            size="small"
            class="action-btn"
            @click="goCreate(item)"
            >创建合同</wd-button
          >
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="customerList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && customerList.length === 0" class="empty-box">
        <wd-icon name="user" size="48px" color="#ccc" />
        <text class="empty-text">暂无相关客户数据</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && customerList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad } from "@dcloudio/uni-app";
import { getCustomerPage } from "@/api";
import { useGlobalStore } from "@/store/global";
import { useDict } from "@/hooks/useDict";

const globalStore = useGlobalStore();
const { dictMap, getDictLabel } = useDict();

const searchKey = ref("");
const activeTab = ref("all");
const topHeight = ref(0);

// 分页状态
const customerList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'

const tabsList = computed(() => dictMap["WJ_BUSINESS_STATUS"] || []);

function getStatusText(businessStatus) {
  return getDictLabel("WJ_BUSINESS_STATUS", businessStatus) || "未知";
}

function goCreate(item) {
  uni.$router.push({
    url: "/pages/contract/form",
    query: {
      id: item.id,
      name: encodeURIComponent(item.storeName),
    },
  });
}

// 跳转到外出计划页面
function goOutworkPlan(item) {
  uni.$router.push({
    url: "/pages/outwork/plan",
    query: {
      customerId: item.id,
      customerName: encodeURIComponent(item.storeName),
    },
  });
}

function getStatusClass(businessStatus) {
  const text = getStatusText(businessStatus);
  if (text === "正常营业") return "status-normal";
  if (text === "预开业") return "status-pre";
  return "status-close";
}

// 获取列表数据
async function fetchList(isReset = false, businessStatus = null) {
  if (loading.value) return;
  loading.value = true;

  if (isReset) {
    current.value = 1;
  }

  const params = {
    current: current.value,
    size: size.value,
  };

  // 搜索关键词
  if (searchKey.value) {
    params.nameKeyword = searchKey.value;
  }
  if (activeTab.value !== "all") {
    params.businessStatus = activeTab.value;
  }
  // 状态筛选

  try {
    const res = await getCustomerPage(params);

    if (isReset || current.value === 1) {
      customerList.value = res.records || [];
    } else {
      customerList.value = [...customerList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;

    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取客户列表失败", error);
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

// 搜索
function handleSearch() {
  fetchList(true);
}

// 跳转到编辑修改页面
function goToEdit(item) {
  uni.navigateTo({
    url: `/pages/customer/form?id=${item.id}&name=${encodeURIComponent(item.storeName)}`,
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
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}
.search-box {
  background-color: #ffffff;
  padding: 16rpx 24rpx 8rpx;
}
.tabs-box {
  background-color: #ffffff;
  min-height: 90rpx;
  border-bottom: 1px solid #f2f3f5;
}
.content-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.customer-card {
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

    .customer-name {
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

  &.status-normal {
    background-color: #e6f8ee;
    color: #10b981;
  }
  &.status-pre {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  &.status-close {
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
    width: 140rpx;
  }
  .value {
    color: #333;
    &.address-val {
      line-height: 1.4;
      font-weight: 500;
    }
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
  gap: 12rpx;
  .action-btn {
    :deep(.wd-button) {
      background-color: #0066ff !important;
      padding: 0 32rpx;
      border-radius: 8rpx;
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
</style>
