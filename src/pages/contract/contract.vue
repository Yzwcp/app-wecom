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
          <wd-tab title="全部" name="all"></wd-tab>
          <wd-tab
            v-for="item in tabsList"
            :key="item.value"
            :title="item.label"
            :name="item.value"
          ></wd-tab>
        </wd-tabs>
      </view>
    </view>

    <!-- 合同列表主体 -->
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
      <view
        v-for="item in contractList"
        @click="goDetail(item)"
        :key="item.id"
        class="contract-card"
      >
        <!-- 右上角状态标签 -->
        <view :class="['status-badge', getStatusClass(item.status)]">
          {{ getStatusText(item.status) }}
        </view>

        <!-- 卡片内容 -->
        <view class="card-top-info">
          <text class="contract-no">合同编号：{{ item.contractNo }}</text>
          <view class="company-name">{{ item.customerName }}</view>
        </view>

        <!-- 详情两列网格布局 -->
        <view class="card-grid">
          <view class="grid-item">
            <text class="label">合同类型</text>
            <text class="value">{{
              getDictLabel("WJ_PROJECT_SERVICE", item.contractType) || "-"
            }}</text>
          </view>
          <view class="grid-item">
            <text class="label">合同标题</text>
            <text class="value text-ellipsis">{{
              item.contractName || "-"
            }}</text>
          </view>
        </view>

        <!-- 签订时间 -->
        <view class="card-time-row">
          <text class="label">签订时间</text>
          <text class="value">{{ item.signDate || "-" }}</text>
        </view>

        <!-- 底部操作按钮 -->
        <view class="card-actions">
          <wd-button
            v-if="item.status === 'DRAFT'"
            size="small"
            plain
            type="info"
            class="mgr-16"
            @click.stop="goEdit(item)"
            >编辑</wd-button
          >
          <wd-button
            type="warning"
            plain
            size="small"
            class="mgr-16"
            @click.stop="goSignRecord(item)"
            v-if="item.signWay === 'ESIGN'"
            >签署记录</wd-button
          >
          <wd-button
            v-if="item.status === 'DRAFT' && item.signWay === 'ESIGN'"
            type="primary"
            size="small"
            class="mgr-16"
            @click.stop="openSignModal(item)"
            >发起电签</wd-button
          >
          <wd-button
            v-if="item.status === 'EFFECTIVE'"
            type="success"
            plain
            size="small"
            class="mgr-16"
            @click.stop="goOrderList(item)"
            >订单列表</wd-button
          >
          <!-- <wd-button type="primary" size="small" 
            >查看详情</wd-button
          > -->
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="contractList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && contractList.length === 0" class="empty-box">
        <wd-icon name="file" size="48px" color="#ccc" />
        <text class="empty-text">暂无相关合同数据</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && contractList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getContractPage } from "@/api";
import { useGlobalStore } from "@/store/global";
import { useDict } from "@/hooks/useDict";

const globalStore = useGlobalStore();
const { dictMap, getDictLabel } = useDict();

const searchKey = ref("");
const activeTab = ref("all");
const topHeight = ref(0);

// 分页状态
const contractList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'

const tabsList = computed(() => dictMap["WJ_CONTRACT_STATUS"] || []);

function getStatusText(status) {
  return getDictLabel("WJ_CONTRACT_STATUS", status) || "未知";
}

function getStatusClass(status) {
  const text = getStatusText(status);
  if (text === "生效中") return "bg-blue";
  if (text === "草稿") return "bg-orange";
  if (text === "已完成") return "bg-green";
  if (text === "已关闭") return "bg-red";
  return "bg-gray";
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
    params.status = activeTab.value;
  }

  try {
    const res = await getContractPage(params);

    if (isReset || current.value === 1) {
      contractList.value = res.records || [];
    } else {
      contractList.value = [...contractList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;

    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取合同列表失败", error);
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

// 查看详情（只读模式）
function goDetail(item) {
  uni.navigateTo({
    url: `/pages/contract/form?id=${item.id}&mode=view&name=${encodeURIComponent(item.customerName || "")}`,
  });
}

// 签署记录
function goSignRecord(item) {
  uni.navigateTo({
    url: `/pages/contract/signRecord?contractId=${item.id}&name=${encodeURIComponent(item.customerName || "")}`,
  });
}

// 合同订单列表
function goOrderList(item) {
  uni.navigateTo({
    url: `/pages/contract/order/orderList?contractId=${item.id}&customerId=${item.customerId || ""}&name=${encodeURIComponent(item.customerName || "")}`,
  });
}

// 发起电签（跳转页面）
function openSignModal(item) {
  uni.$router.push({
    url: "/pages/contract/sign",
    query: {
      id: item.id,
      name: encodeURIComponent(item.customerName || ""),
    },
  });
}

// 从电签页面返回时刷新列表
onShow(() => {
  fetchList(true);
});

// 继续编辑（草稿状态）
function goEdit(item) {
  uni.navigateTo({
    url: `/pages/contract/form?id=${item.id}&mode=edit&name=${encodeURIComponent(item.customerName || "")}`,
  });
}

// 新建合同
function goCreate() {
  uni.navigateTo({
    url: "/pages/contract/form",
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

/* 合同卡片与右上角特殊圆角状态标签 */
.contract-card {
  position: relative;
  background-color: #ffffff;
  margin-top: 30rpx;
  border-radius: 20rpx;
  padding: 36rpx 32rpx 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.01);
  border: 1px solid #f2f3f5;

  .status-badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10rpx 40rpx;
    font-size: 24rpx;
    color: #ffffff;
    font-weight: bold;
    border-bottom-left-radius: 24rpx;

    &.bg-blue {
      background-color: #0066ff;
    }
    &.bg-orange {
      background-color: #e27d53;
    }
    &.bg-green {
      background-color: #2ecc71;
    }
    &.bg-red {
      background-color: #ef4444;
    }
    &.bg-gray {
      background-color: #95a5a6;
    }
  }
}

.card-top-info {
  margin-bottom: 24rpx;
  .contract-no {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 8rpx;
  }
  .company-name {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
}

.card-grid {
  display: flex;
  margin-bottom: 20rpx;
  .grid-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
}

.card-time-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 28rpx;
}

.label {
  font-size: 26rpx;
  color: #999;
}
.value {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320rpx;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx 0;
  .mgr-16 {
    margin-right: 16rpx;
  }

  :deep(.wd-button) {
    border-radius: 12rpx;
    padding: 0 32rpx;
    height: 64rpx;
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

.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 96rpx;
  height: 96rpx;
  font-size: 20px;
  border-radius: 50%;
  color: #fff;
  background-color: #0066ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 102, 255, 0.35);
  z-index: 99;
}
</style>
