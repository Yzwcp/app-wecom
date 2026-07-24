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

    <!-- 施工列表主体 -->
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
      <view v-for="item in taskList" :key="item.id" class="task-card">
        <view class="card-title-row">
          <text class="customer-name">{{ item.customerName }}</text>
          <text :class="['status-tag', getStatusClass(item.status)]">{{
            getStatusText(item.status)
          }}</text>
        </view>

        <view class="info-row">
          <text class="label">施工编号：</text>
          <text class="value">{{ item.taskNo }}</text>
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
            @click="goToDetail(item)"
            >查看详情</wd-button
          >
        </view>
      </view>

      <!-- 加载更多状态 -->
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
        <wd-icon name="user" size="48px" color="#ccc" />
        <text class="empty-text">暂无相关施工数据</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && taskList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad } from "@dcloudio/uni-app";
import { getConstructionMyPage } from "@/api";
import { useGlobalStore } from "@/store/global";
import { useDict } from "@/hooks/useDict";

const globalStore = useGlobalStore();
const { dictMap, getDictLabel } = useDict();

const searchKey = ref("");
const activeTab = ref("all");
const topHeight = ref(0);

// 分页状态
const taskList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'

const tabsList = computed(() => dictMap["WJ_TASK_STATUS"] || []);

function getStatusText(businessStatus) {
  return getDictLabel("WJ_SUB_TASK_STATUS", businessStatus) || "未知";
}

function getStatusClass(businessStatus) {
  return getDictLabel("WJ_SUB_TASK_STATUS", businessStatus) || "未知";
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

  // 搜索关键词
  if (searchKey.value) {
    params.nameKeyword = searchKey.value;
  }
  // 状态筛选
  if (activeTab.value !== "all") {
    params.businessStatus = activeTab.value;
  }

  try {
    const res = await getConstructionMyPage(params);

    if (isReset || current.value === 1) {
      taskList.value = res.records || [];
    } else {
      taskList.value = [...taskList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;

    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取施工列表失败", error);
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

// 跳转到施工详情页
function goToDetail(item) {
  uni.navigateTo({
    url: `/pages/construction/detail?id=${item.id}`,
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
.task-card {
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

  &.status-pending {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  &.status-progress {
    background-color: #fff7ed;
    color: #f97316;
  }
  &.status-completed {
    background-color: #e6f8ee;
    color: #10b981;
  }
  &.status-other {
    background-color: #f3f4f6;
    color: #6b7280;
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
