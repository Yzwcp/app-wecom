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
            <text class="label">实付金额</text>
            <text class="value">{{
              item.actualAmount !== null &&
              item.actualAmount !== undefined &&
              item.actualAmount !== ""
                ? `¥${item.actualAmount}`
                : "-"
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
            v-if="item.payStatus !== '2'"
            @click.stop="openPay(item)"
            >确认支付</wd-button
          >
          <wd-button
            type="success"
            plain
            size="small"
            class="mgr-16"
            v-if="item.payStatus === '2'"
            @click.stop="onSyncExpire(item)"
            >同步到期</wd-button
          >
          <wd-button
            type="primary"
            plain
            size="small"
            class="mgr-16"
            v-if="item.payStatus !== '2'"
            @click.stop="goEdit(item)"
            >编辑</wd-button
          >
          <!-- <wd-button
            type="danger"
            plain
            size="small"
            @click.stop="onDelete(item)"
            >删除</wd-button
          > -->
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

    <!-- 确认支付弹窗 -->
    <wd-popup
      v-model="payConfirmShow"
      position="bottom"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="closePayConfirm"
    >
      <view class="pay-confirm-popup">
        <view class="popup-header">
          <text class="popup-title">确认支付</text>
          <wd-icon
            name="close"
            size="20px"
            color="#999"
            @click="closePayConfirm"
          />
        </view>
        <view class="popup-body">
          <view class="popup-label">实付金额</view>
          <input
            v-model="payForm.actualAmount"
            type="digit"
            placeholder="不填按订单金额"
            placeholder-class="placeholder-style"
            class="popup-input"
          />

          <view class="popup-label">支付方式</view>
          <wd-radio-group v-model="payForm.payType" direction="horizontal">
            <wd-radio value="ONLINE">线上支付</wd-radio>
            <wd-radio value="OFFLINE">线下支付</wd-radio>
          </wd-radio-group>

          <view class="popup-label">备注</view>
          <input
            v-model="payForm.remark"
            placeholder="请输入支付备注（选填）"
            placeholder-class="placeholder-style"
            class="popup-input"
          />

          <!-- 支付截图：仅线下支付展示，必传至少1张 -->
          <template v-if="payForm.payType === 'OFFLINE'">
            <view class="popup-label">
              支付截图
              <text class="required-star">*</text>
            </view>
            <ImgUpload
              v-model="payFileUrlList"
              category="WJ_CONTRACT_ORDER_PAY_IMG"
              :limit="3"
              @update:fileId="onPayFileUploaded"
            />
          </template>
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closePayConfirm">取消</button>
          <button
            class="btn-submit"
            :disabled="paySubmitting"
            @click="confirmPay"
          >
            {{ paySubmitting ? "提交中..." : "确定" }}
          </button>
        </view>
      </view>
    </wd-popup>

    <!-- 支付码弹窗 -->
    <wd-popup
      v-model="payPopupShow"
      position="center"
      custom-style="width: 86%; border-radius: 24rpx; padding: 40rpx 32rpx;"
    >
      <view class="pay-popup">
        <view class="popup-title">订单支付码</view>
        <view class="pay-content">
          <!-- <text class="pay-code-text">{{ payCodeText }}</text> -->
          <ikun-qrcode
            width="400"
            height="400"
            unit="rpx"
            color="#000000"
            :data="payCodeText"
          />
        </view>
        <!-- <view class="pay-tip">点击内容可复制支付码/链接</view> -->
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
import { ref, nextTick, computed, watch } from "vue";
import { getElementHeight } from "@/utils/tools";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  getContractOrderPage,
  deleteContractOrder,
  generateContractOrderFromContract,
  confirmContractOrderPay,
  syncContractOrderServiceExpire,
} from "@/api";
import { useDict } from "@/hooks/useDict";
import ImgUpload from "@/components/ImgUpload.vue";

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

// ========== 确认支付 ==========
const payConfirmShow = ref(false);
const paySubmitting = ref(false);
const currentPayItem = ref(null);
const payForm = ref({ actualAmount: "", payType: "ONLINE", remark: "" });
// 线下支付截图：URL 列表用于展示，fileId 列表用于提交（按下标对齐）
const payFileUrlList = ref([]);
const payFileIdList = ref([]);

// 打开确认支付弹窗
function openPay(item) {
  currentPayItem.value = item;
  payForm.value = { actualAmount: "", payType: "ONLINE", remark: "" };
  payFileUrlList.value = [];
  payFileIdList.value = [];
  payConfirmShow.value = true;
}

function closePayConfirm() {
  payConfirmShow.value = false;
}

// 上传成功记录 fileId（与 URL 列表追加顺序一致）
function onPayFileUploaded(fileId) {
  if (fileId) payFileIdList.value.push(fileId);
}

// 截图被删除时同步移除对应下标的 fileId
watch(payFileUrlList, (val, oldVal) => {
  if (val.length < oldVal.length) {
    const removed = oldVal.find((u) => !val.includes(u));
    const idx = oldVal.indexOf(removed);
    if (idx !== -1) payFileIdList.value.splice(idx, 1);
  }
});

// 提交确认支付
async function confirmPay() {
  if (paySubmitting.value) return;
  const { actualAmount, payType, remark } = payForm.value;

  // 实付金额填了必须大于0
  if (actualAmount !== "" && Number(actualAmount) <= 0) {
    return uni.showToast({ title: "实付金额必须大于0", icon: "none" });
  }
  // 线下支付必传截图
  if (payType === "OFFLINE" && payFileIdList.value.length === 0) {
    return uni.showToast({ title: "请上传支付截图", icon: "none" });
  }

  const payload = {
    orderId: currentPayItem.value.id,
    payType,
    actualAmount: actualAmount !== "" ? Number(actualAmount) : undefined,
    remark: remark || undefined,
    payFileIdList:
      payType === "OFFLINE" ? payFileIdList.value : undefined,
  };

  paySubmitting.value = true;
  try {
    const res = await confirmContractOrderPay(payload);
    if (payType === "ONLINE") {
      // 线上：拿到支付链接展示二维码
      payCodeText.value = res?.payUrl || "";
      payConfirmShow.value = false;
      payPopupShow.value = true;
    } else {
      // 线下：直接支付成功，刷新列表
      uni.showToast({ title: "支付成功", icon: "success" });
      payConfirmShow.value = false;
      fetchList(true);
    }
  } catch (error) {
    console.error("确认支付失败", error);
  } finally {
    paySubmitting.value = false;
  }
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
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  .grid-item {
    flex: 0 0 50%;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-bottom: 16rpx;
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

/* 确认支付弹窗 */
.pay-confirm-popup {
  padding: 32rpx;
  background-color: #ffffff;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .popup-body {
    margin-bottom: 32rpx;

    .popup-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      margin-top: 24rpx;

      &:first-child {
        margin-top: 0;
      }

      .required-star {
        color: #ee0a24;
        margin-left: 4rpx;
      }
    }

    .popup-input {
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 16rpx 24rpx;
      font-size: 28rpx;
      min-height: 48rpx;
    }

    .placeholder-style {
      color: #969799;
    }
  }

  .popup-footer {
    display: flex;
    gap: 24rpx;

    .btn-cancel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      line-height: 1;
      background-color: #f5f5f5;
      color: #666;
      font-size: 12px;
      border-radius: 40rpx;
      border: none;
    }

    .btn-submit {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      line-height: 1;
      background-color: #0066ff;
      color: #ffffff;
      font-size: 12px;
      border-radius: 40rpx;
      border: none;

      &:disabled {
        opacity: 0.6;
      }
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
    display: flex;
    justify-content: center;
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
    display: flex;
    justify-content: center;
    gap: 20rpx;
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
