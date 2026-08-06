<template>
  <view class="page">
    <!-- <wd-navbar
      title="合同订单列表"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    /> -->

    <view class="list-top" id="listTop">
      <!-- 合同信息头 -->
      <!-- <view v-if="contractName" class="header-card">
        <view class="header-label">合同</view>
        <view class="header-name">{{ contractName }}</view>
      </view> -->

      <view class="search-box">
        <wd-search
          v-model="searchKey"
          placeholder="搜索订单名称"
          hide-cancel
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>

      <!-- 状态切换 Tab（订单支付状态） -->
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

    <!-- 订单列表主体 -->
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
        v-for="item in orderList"
        :key="item.id"
        class="order-card"
        @click="goDetail(item)"
      >
        <!-- 右上角状态标签 -->
        <view :class="['status-badge', getStatusClass(item.payStatus)]">{{
          getDictLabel("ORDER_STATUS", item.payStatus) || item.payStatus || "-"
        }}</view>

        <view class="card-top-info">
          <text class="order-no">订单编号：{{ item.orderNo || "-" }}</text>
          <view class="order-name">{{ item.orderName || "-" }}</view>
        </view>

        <view class="card-grid">
          <view class="grid-item">
            <text class="label">订单类型</text>
            <text class="value">{{
              getDictLabel("CONTRACT_ORDER_TYPE", item.orderType) || "-"
            }}</text>
          </view>
          <view class="grid-item">
            <text class="label">创建时间</text>
            <text class="value">{{ item.createTime || "-" }}</text>
          </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="card-actions">
          <wd-button
            type="warning"
            plain
            size="small"
            class="mgr-16"
            @click.stop="openPay(item)"
            >支付码</wd-button
          >
          <wd-button
            type="success"
            plain
            size="small"
            class="mgr-16"
            @click.stop="onSyncExpire(item)"
            >同步到期</wd-button
          >
          <wd-button
            type="primary"
            plain
            size="small"
            class="mgr-16"
            @click.stop="goEdit(item)"
            >编辑</wd-button
          >
          <wd-button
            type="danger"
            plain
            size="small"
            @click.stop="onDelete(item)"
            >删除</wd-button
          >
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="orderList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && orderList.length === 0" class="empty-box">
        <wd-icon name="file" size="48px" color="#ccc" />
        <text class="empty-text">暂无相关订单数据</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && orderList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <wd-button type="primary" class="btn-item" @click="goCreate"
        >新增订单</wd-button
      >
      <!-- <wd-button
        type="primary"
        plain
        class="btn-item"
        :loading="generating"
        @click="onGenerateFromContract"
        >从合同生成订单</wd-button
      > -->
    </view>

    <!-- 支付码弹窗 -->
    <wd-popup
      v-model="payPopupShow"
      position="center"
      custom-style="width: 86%; border-radius: 24rpx; padding: 40rpx 32rpx;"
    >
      <view class="pay-popup">
        <view class="popup-title">订单支付码</view>
        <view class="pay-content" @click="copyPayCode">
          <text class="pay-code-text">{{ payCodeText }}</text>
        </view>
        <view class="pay-tip">点击内容可复制支付码/链接</view>
        <view class="popup-footer">
          <wd-button
            class="footer-btn"
            type="primary"
            @click="payPopupShow = false"
            >关闭</wd-button
          >
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  getContractOrderPage,
  deleteContractOrder,
  generateContractOrderFromContract,
  createContractOrderPay,
  syncContractOrderServiceExpire,
} from "@/api";
import { useDict } from "@/hooks/useDict";

const { dictMap, getDictLabel } = useDict();

const contractId = ref("");
const customerId = ref("");
const contractName = ref("");
const searchKey = ref("");
const activeTab = ref("all");
const topHeight = ref(0);

// 分页状态
const orderList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'
const generating = ref(false);

// 支付码弹窗
const payPopupShow = ref(false);
const payCodeText = ref("");

const tabsList = computed(() => dictMap["ORDER_STATUS"] || []);

function getStatusClass(status) {
  const text = getDictLabel("ORDER_STATUS", status);
  if (text === "已支付") return "bg-green";
  if (text === "待支付" || text === "未支付") return "bg-orange";
  if (text === "已退款" || text === "已取消") return "bg-gray";
  return "bg-blue";
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
    contractId: contractId.value,
  };

  if (customerId.value) {
    params.customerId = customerId.value;
  }
  if (searchKey.value) {
    params.orderName = searchKey.value;
  }
  if (activeTab.value !== "all") {
    params.payStatus = activeTab.value;
  }

  try {
    const res = await getContractOrderPage(params);

    if (isReset || current.value === 1) {
      orderList.value = res.records || [];
    } else {
      orderList.value = [...orderList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;
    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取合同订单列表失败", error);
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

function handleSearch() {
  fetchList(true);
}

function goBack() {
  uni.navigateBack();
}

// 新增订单
function goCreate() {
  uni.navigateTo({
    url: `/pages/contract/order/orderForm?contractId=${contractId.value}&customerId=${customerId.value}&name=${encodeURIComponent(contractName.value || "")}`,
  });
}

// 编辑订单
function goEdit(item) {
  uni.navigateTo({
    url: `/pages/contract/order/orderForm?id=${item.id}&contractId=${contractId.value}&customerId=${customerId.value}&name=${encodeURIComponent(contractName.value || "")}`,
  });
}

// 查看订单详情（只读）
function goDetail(item) {
  uni.navigateTo({
    url: `/pages/contract/order/orderForm?id=${item.id}&readonly=1&contractId=${contractId.value}&customerId=${customerId.value}&name=${encodeURIComponent(contractName.value || "")}`,
  });
}

// 删除订单
function onDelete(item) {
  uni.showModal({
    title: "提示",
    content: `确定要删除订单"${item.orderName || item.orderNo || ""}"吗？`,
    success: (res) => {
      if (!res.confirm) return;
      deleteContractOrder({ id: item.id })
        .then(() => {
          uni.showToast({ title: "删除成功", icon: "success" });
          fetchList(true);
        })
        .catch(() => {});
    },
  });
}

// 根据合同生成订单
function onGenerateFromContract() {
  if (!contractId.value) {
    uni.showToast({ title: "缺少合同参数", icon: "none" });
    return;
  }
  uni.showModal({
    title: "提示",
    content: "确定根据当前合同生成订单吗？",
    success: (res) => {
      if (!res.confirm) return;
      generating.value = true;
      generateContractOrderFromContract({ contractId: contractId.value })
        .then(() => {
          uni.showToast({ title: "生成成功", icon: "success" });
          fetchList(true);
        })
        .finally(() => {
          generating.value = false;
        });
    },
  });
}

// 生成支付码
function openPay(item) {
  createContractOrderPay({ orderId: item.id })
    .then((data) => {
      if (typeof data === "string") {
        payCodeText.value = data;
      } else if (data) {
        payCodeText.value =
          data.payCode || data.payUrl || data.code || JSON.stringify(data);
      } else {
        payCodeText.value = "";
      }
      payPopupShow.value = true;
    })
    .catch(() => {});
}

// 复制支付码
function copyPayCode() {
  if (!payCodeText.value) return;
  uni.setClipboardData({
    data: payCodeText.value,
    success: () => {
      uni.showToast({ title: "已复制", icon: "none" });
    },
  });
}

// 手动同步服务到期时间
function onSyncExpire(item) {
  uni.showModal({
    title: "提示",
    content: "确定手动同步该订单的服务到期时间吗？",
    success: (res) => {
      if (!res.confirm) return;
      syncContractOrderServiceExpire({ id: item.id })
        .then(() => {
          uni.showToast({ title: "同步成功", icon: "success" });
        })
        .catch(() => {});
    },
  });
}

// 从订单表单返回时刷新
onShow(() => {
  if (orderList.value.length > 0) {
    fetchList(true);
  }
});

onLoad(async (op) => {
  contractId.value = op.contractId || "";
  customerId.value = op.customerId || "";
  contractName.value = decodeURIComponent(op.name || "");
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

/* 合同信息头 */
.header-card {
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  border-bottom: 1px solid #f2f3f5;

  .header-label {
    font-size: 24rpx;
    color: #999;
  }
  .header-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
  padding: 0 30rpx 160rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 订单卡片 */
.order-card {
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
    &.bg-gray {
      background-color: #95a5a6;
    }
  }
}

.card-top-info {
  margin-bottom: 24rpx;
  .order-no {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 8rpx;
  }
  .order-name {
    font-size: 32rpx;
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

.label {
  font-size: 26rpx;
  color: #999;
}
.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
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
    padding: 0 28rpx;
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

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 10;
  .btn-item {
    flex: 1;
    :deep(.wd-button) {
      width: 100%;
      height: 80rpx;
      border-radius: 12rpx;
    }
  }
}

/* 支付码弹窗 */
.pay-popup {
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 32rpx;
  }
  .pay-content {
    background-color: #f7f8fa;
    border-radius: 12rpx;
    padding: 24rpx;
    .pay-code-text {
      font-size: 28rpx;
      color: #0066ff;
      word-break: break-all;
    }
  }
  .pay-tip {
    font-size: 22rpx;
    color: #999;
    text-align: center;
    margin-top: 12rpx;
  }
  .popup-footer {
    margin-top: 32rpx;
    .footer-btn {
      :deep(.wd-button) {
        width: 100%;
        height: 80rpx;
        border-radius: 12rpx;
      }
    }
  }
}
</style>
