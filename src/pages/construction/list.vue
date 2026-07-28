<template>
  <view class="page">
    <!-- 搜索框 -->
    <!-- <view class="search-box">
      <wd-search
        v-model="searchKey"
        placeholder="搜索客户名称或地址"
        hide-cancel
        @search="handleSearch"
        @clear="handleSearch"
      />
    </view> -->

    <!-- 顶部状态切换 Tabs -->
    <view class="tabs-container" id="listTop">
      <wd-tabs
        v-if="tabsList?.length > 0"
        v-model="activeTab"
        animated
        color="#2979ff"
        inactive-color="#666"
        @change="handleTabChange"
      >
        <wd-tab title="全部" name="all"></wd-tab>
        <wd-tab
          v-for="item in tabsList"
          :key="item.value"
          :title="item.label"
          :name="item.value"
        ></wd-tab>
      </wd-tabs>
    </view>

    <!-- 任务列表区域 -->
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
      <view
        v-for="item in taskList"
        :key="item.id"
        :class="['task-card', `status-border-${mapStatusClass(item.status)}`]"
      >
        <!-- 右上角状态切角标签 -->
        <view
          :class="['status-badge', `status-bg-${mapStatusClass(item.status)}`]"
        >
          {{ getStatusText(item.status) }}
        </view>

        <!-- 施工编号 -->
        <view class="task-no">施工编号：{{ item.taskNo || "-" }}</view>

        <!-- 客户姓名（带状态圆点） -->
        <view class="customer-info">
          <view
            :class="['dot', `status-dot-${mapStatusClass(item.status)}`]"
          ></view>
          <text class="customer-name">{{ item.customerName || "-" }}</text>
        </view>

        <!-- 地址 -->
        <view class="info-row">
          <view class="field-label">地址</view>
          <view class="field-value address-value">{{
            item.address || "暂无地址"
          }}</view>
        </view>

        <!-- 类型 & 计划时间 -->
        <view class="grid-info-row">
          <view class="info-cell">
            <view class="field-label">类型</view>
            <view class="field-value type-value">{{
              getDictLabel("WJ_TASK_TYPE", item.taskType)
            }}</view>
          </view>
          <view class="info-cell">
            <view class="field-label">计划时间</view>
            <view class="field-value time-value">{{
              item.planFinishTime || "-"
            }}</view>
          </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="action-bar">
          <button
            class="btn btn-outline"
            @click="handleAction('supplement', item)"
          >
            补充资料
          </button>
          <button
            class="btn btn-primary"
            style="background-color: #ff7043"
            @click="goToDelivery(item)"
          >
            发货
          </button>
          <button class="btn btn-primary" @click="goToDetail(item)">
            查看详情
          </button>
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

      <!-- 占位底部隔离 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad } from "@dcloudio/uni-app";
import { getConstructionMyPage } from "@/api/construction";
import { useGlobalStore } from "@/store/global";
import { useDict } from "@/hooks/useDict";
import { getCustomerBaseInfo } from "@/api/customer";

const globalStore = useGlobalStore();
const { dictMap, getDictLabel } = useDict();

// 搜索 & Tab
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

// 字典：实现动态 Tab 列表
const tabsList = computed(() => dictMap["WJ_TASK_STATUS"] || []);

// 状态值到 CSS 类名的映射（根据实际字典值调整）
const STATUS_VISUAL_MAP = {
  pending: "pending",
  progress: "progress",
  audit: "audit",
  completed: "completed",
};

function mapStatusClass(businessStatus) {
  return STATUS_VISUAL_MAP[businessStatus] || "other";
}

function getStatusText(businessStatus) {
  return getDictLabel("WJ_TASK_STATUS", businessStatus) || "未知";
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

// Tab 切换
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
  uni.$router.push({
    url: "/pages/construction/detail",
    query: {
      id: item.id,
    },
  });
}

// 补充资料操作
function handleAction(actionType, item) {
  console.log(`触发了 ${actionType} 操作，数据为：`, item);
  // TODO: 补充资料逻辑
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 跳转到发货表单
function goToDelivery(item) {
  uni.navigateTo({
    url: `/pages/delivery/form?constructionTaskId=${item.id}`,
  });
}

onLoad(async (options) => {
  await nextTick();
  topHeight.value = await getElementHeight("#listTop");
  fetchList(true);
});
</script>

<style scoped lang="scss">
/* 基础页面容器 */
.page {
  height: 100vh;
  background-color: #f7f9fc;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏样式 */
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 88rpx;
  background-color: #ffffff;
  padding-top: var(--status-bar-height);

  .back-icon {
    position: absolute;
    left: 32rpx;
    bottom: 22rpx;
    color: #333333;
  }

  .navbar-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #111111;
  }
}

/* 搜索框 */
.search-box {
  background-color: #ffffff;
  padding: 16rpx 24rpx 8rpx;
}

/* 选项卡容器 */
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

/* 列表滚动容器 */
.list-container {
  padding: 32rpx;
  box-sizing: border-box;
}

/* 施工任务卡片基类 */
.task-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 2rpx solid transparent;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
  overflow: hidden;

  /* 动态状态边框色 */
  &.status-border-pending {
    border-color: #d6e4ff;
  }
  &.status-border-progress {
    border-color: #ffe8d6;
  }
  &.status-border-completed {
    border-color: #d2f4e8;
  }
  &.status-border-audit {
    border-color: #fef3c7;
  }
  &.status-border-other {
    border-color: #e5e7eb;
  }
}

/* 右上角切角状态标签 */
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
}

/* 施工编号 */
.task-no {
  font-size: 26rpx;
  color: #888888;
  margin-bottom: 28rpx;
}

/* 客户信息与左侧小圆点 */
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

  .customer-name {
    font-size: 34rpx;
    font-weight: bold;
    color: #333333;
  }
}

/* 通用标签与值 */
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

/* 单行排列（地址） */
.info-row {
  margin-bottom: 24rpx;
  .address-value {
    font-weight: 500;
  }
}

/* 左右分栏（类型 & 计划时间） */
.grid-info-row {
  display: flex;
  margin-bottom: 32rpx;

  .info-cell {
    flex: 1;

    .type-value {
      color: #2979ff;
      font-weight: 600;
    }
    .time-value {
      font-weight: 500;
    }
  }
}

/* 底部按钮栏 */
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
    color: #ff6b6b;
    border: 2rpx solid #ff6b6b;

    &:active {
      background-color: #fff5f5;
    }
  }

  .btn-primary {
    background-color: #2979ff;
    color: #ffffff;

    &:active {
      background-color: #1a65eb;
    }
  }
}

/* 加载更多 */
.load-more-box {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 40rpx;
  .load-more-text {
    font-size: 24rpx;
    color: #999;
  }
}

/* 空状态 */
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
