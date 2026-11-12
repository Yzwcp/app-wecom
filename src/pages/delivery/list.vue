<template>
  <view class="page">
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
          {{ item.statusName || getStatusText(item.status) }}
        </view>

        <!-- 创建时间 -->
        <view class="create-time">创建时间：{{ item.createTime || "-" }}</view>

        <!-- 物流单号（点击复制） -->
        <view class="task-no" @click="copyLogisticsNo(item.logisticsNo)">
          物流单号：<text style="text-decoration: underline; color: #2979ff">{{
            item.logisticsNo || ""
          }}</text>
        </view>

        <!-- 客户信息 -->
        <view class="customer-info">
          <view
            class="dot"
            :class="`status-dot-${getStatusClass(item.status)}`"
          ></view>
          <text class="customer-name">{{ item.customerName || "-" }}</text>
        </view>

        <!-- 收货信息 -->
        <view class="info-row">
          <view class="field-label label-with-copy">
          
			<text>收货地址</text>
			<view class="copy-btn" @click="handleCopyReceiverInfo(item)">
			  <wd-icon name="copy" size="30rpx" color="#2979ff" />
			</view>
          </view>
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
            <view class="field-label" >联系电话</view>
            <view class="field-value">{{ item.receiverPhone || "-" }}</view>
          </view>
		  <view class="info-cell">
		    <view class="field-label" >PubwinId</view>
		    <view class="field-value"  >{{ item.pubwinId || "-" }}</view>
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

        <!-- 驳回原因 -->
        <view
          class="info-row"
          v-if="item.status === 'REJECTED' && item.rejectReason"
        >
          <view class="field-label">驳回原因</view>
          <view class="field-value reject-reason">{{ item.rejectReason }}</view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="action-bar">
          <div
            v-if="item.status === 'PENDING_AUDIT'"
            class="btn btn-danger"
            @click="handleAction('audit', item)"
          >
            审核
          </div>
          <div
            v-if="item.status === 'PENDING_DELIVERY'"
            class="btn btn-primary"
            @click="handleAction('deliver', item)"
            v-has="'WJ_DELIVERY_PERSON'"
          >
            确认发货
          </div>
          <div
            v-if="
              item.needReturnDevice === '1' &&
              item.returnStatus === 'NOT_RETURNED'
            "
            class="btn btn-primary"
            @click="handleAction('returnDevice', item)"
            v-has="'WJ_DELIVERY_PERSON'"
          >
            确认回寄
          </div>
          <div
            v-if="item.status === 'DELIVERED'"
            class="btn btn-primary"
            @click="handleAction('receive', item)"
            v-has="'WJ_DELIVERY_PERSON'"
          >
            确认签收
          </div>
          <div class="btn btn-outline" @click="goToDetail(item)">查看详情</div>
          <div
            v-if="canWithdraw(item)"
            class="btn btn-outline btn-withdraw"
            @click="handleAction('withdraw', item)"
          >
            撤销申请
          </div>
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
    <view class="fab-add" @click="goToAdd">
      <text class="fab-plus">+</text>
    </view>

    <!-- 审核弹窗 -->
    <wd-popup
      v-model="showAudit"
      position="bottom"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="closeAudit"
    >
      <view class="action-popup">
        <view class="popup-header">
          <text class="popup-title">审核发货单</text>
          <wd-icon name="close" size="20px" color="#999" @click="closeAudit" />
        </view>
        <view class="popup-body">
          <view class="popup-label">审核结果</view>
          <wd-radio-group v-model="auditForm.result" direction="horizontal">
            <wd-radio value="PASS">通过</wd-radio>
            <wd-radio value="REJECT">驳回</wd-radio>
          </wd-radio-group>
          <view class="popup-label" v-if="auditForm.result === 'REJECT'">
            驳回原因
          </view>
          <textarea
            v-if="auditForm.result === 'REJECT'"
            v-model="auditForm.rejectReason"
            placeholder="请输入驳回原因"
            placeholder-class="placeholder-style"
            class="popup-textarea"
          />
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeAudit">取消</button>
          <button
            class="btn-submit"
            :disabled="actionSubmitting"
            @click="confirmAudit"
          >
            {{ actionSubmitting ? "提交中..." : "确定" }}
          </button>
        </view>
      </view>
    </wd-popup>

    <!-- 确认发货弹窗 -->
    <wd-popup
      v-model="showDeliver"
      position="bottom"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="closeDeliver"
    >
      <view class="action-popup">
        <view class="popup-header">
          <text class="popup-title">确认发货</text>
          <wd-icon
            name="close"
            size="20px"
            color="#999"
            @click="closeDeliver"
          />
        </view>
        <view class="popup-body">
          <view class="popup-label">物流公司</view>
          <DictSelectPicker
            v-model="deliverForm.logisticsCompany"
            dict-key="WJ_LOGISTICS_COMPANY"
            title="选择物流公司"
            placeholder="请选择物流公司"
          />
          <view class="popup-label" style="margin-top: 24rpx">物流单号</view>
          <view class="popup-input-row">
            <input
              v-model="deliverForm.logisticsNo"
              placeholder="请输入物流单号"
              placeholder-class="placeholder-style"
              class="popup-logistics-input"
            />
            <view class="scan-btn" @click="handleScanLogisticsNo">
              <wd-icon name="scan" size="22px" color="#0062ff" />
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeDeliver">取消</button>
          <button
            class="btn-submit"
            :disabled="actionSubmitting"
            @click="confirmDeliver"
          >
            {{ actionSubmitting ? "提交中..." : "确定" }}
          </button>
        </view>
      </view>
    </wd-popup>

    <!-- 回寄确认弹窗（滑动验证通过后才能确认） -->
    <wd-popup
      v-model="showReturnConfirm"
      position="center"
      custom-style="width: 600rpx; border-radius: 24rpx;"
      @close="closeReturnConfirm"
      @after-enter="handleReturnPopupShown"
    >
      <view class="action-popup return-confirm-popup">
        <view class="popup-header">
          <text class="popup-title">回寄确认</text>
          <wd-icon
            name="close"
            size="20px"
            color="#999"
            @click="closeReturnConfirm"
          />
        </view>
        <view class="popup-body">
          <view class="return-confirm-tip">
            确定回寄该发货单吗？请确认设备已寄回。
          </view>
          <wd-slide-verify
            ref="slideVerifyRef"
            text="按住滑块，拖动到最右侧"
            success-text="验证通过"
            @success="handleSlideSuccess"
            @fail="handleSlideFail"
          />
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeReturnConfirm">取消</button>
          <button
            class="btn-submit"
            :class="{ 'btn-gray': !canConfirmReturn }"
            :disabled="!canConfirmReturn"
            @click="confirmReturnDevice"
          >
            {{
              !slideVerified
                ? "请滑动验证"
                : actionSubmitting
                  ? "提交中..."
                  : "确定"
            }}
          </button>
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
  getDeliveryPage,
  auditDelivery,
  deliverDelivery,
  receiveDelivery,
  returnDeviceDelivery,
  withdrawDelivery,
} from "@/api/delivery";
import { useDict } from "@/hooks/useDict";
import { useGlobalStore } from "@/store/global";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import { scanQRCode } from "@/utils/wx";

const { dictMap, getDictLabel } = useDict();
const globalStore = useGlobalStore();

const activeTab = ref("all");
const topHeight = ref(0);

const taskList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref("");

// 字典：实现动态 Tab 列表
const tabsList = computed(() => dictMap["WJ_DELIVERY_TASK_STATUS"] || []);

// 状态值到 CSS 类名的映射（每个状态不同颜色）
const STATUS_VISUAL_MAP = {
  DRAFT: "draft",
  PENDING_AUDIT: "audit",
  PENDING_DELIVERY: "progress",
  DELIVERED: "pending",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

function getStatusClass(status) {
  return STATUS_VISUAL_MAP[status] || "other";
}

function getStatusText(status) {
  return getDictLabel("WJ_DELIVERY_TASK_STATUS", status) || "未知";
}

// 是否发货部人员（管理员）
const isDeliveryPerson = computed(() =>
  (globalStore.userInfo?.roleCodeList || []).includes("WJ_DELIVERY_PERSON"),
);

// 撤销申请显隐：待审核/待发货，且当前用户是申请人或发货部人员
function canWithdraw(item) {
  if (!["PENDING_AUDIT", "PENDING_DELIVERY"].includes(item.status)) {
    return false;
  }
  if (isDeliveryPerson.value) return true;
  const uid = globalStore.userInfo?.id || globalStore.userInfo?.userId;
  const applicantId = item.applicantId || item.createBy;
  return !!uid && !!applicantId && uid === applicantId;
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

  if (activeTab.value !== "all") {
    params.status = activeTab.value;
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

// 点击复制物流单号
function copyLogisticsNo(logisticsNo) {
  if (!logisticsNo) {
    uni.showToast({ title: "暂无物流单号", icon: "none" });
    return;
  }
  uni.setClipboardData({
    data: logisticsNo,
    success: () => {
      uni.showToast({ title: "已复制", icon: "success" });
    },
    fail: () => {
      uni.showToast({ title: "复制失败", icon: "none" });
    },
  });
}

// 一键复制收货人信息
function handleCopyReceiverInfo(item) {
  const text = [item?.receiverName, item?.receiverPhone, item?.receiverAddress]
    .filter(Boolean)
    .join("，");
  if (!text) {
    uni.showToast({ title: "暂无收货信息", icon: "none" });
    return;
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: "已复制", icon: "success" });
    },
    fail: () => {
      uni.showToast({ title: "复制失败", icon: "none" });
    },
  });
}

function handleTabChange({ name }) {
  activeTab.value = name;
  fetchList(true);
}

function goToDetail(item) {
  // 待发货或驳回状态可编辑，跳转表单页
  if (item.status === "PENDING_DELIVERY" || item.status === "REJECTED") {
    uni.navigateTo({
      url: `/pages/delivery/form?id=${item.id}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/delivery/detail?id=${item.id}`,
    });
  }
}

// 审核/发货弹窗状态
const showAudit = ref(false);
const showDeliver = ref(false);
const actionSubmitting = ref(false);
const currentItem = ref(null);
const auditForm = ref({ result: "PASS", rejectReason: "" });
const deliverForm = ref({ logisticsCompany: "", logisticsNo: "" });

function closeAudit() {
  showAudit.value = false;
  auditForm.value = { result: "PASS", rejectReason: "" };
}

function closeDeliver() {
  showDeliver.value = false;
  deliverForm.value = { logisticsCompany: "", logisticsNo: "" };
}

// 扫码识别物流单号
async function handleScanLogisticsNo() {
  try {
    const result = await scanQRCode();
    if (result) {
      deliverForm.value.logisticsNo = result;
    }
  } catch (error) {
    console.error("扫码失败", error);
    uni.showToast({ title: "扫码失败", icon: "none" });
  }
}

async function confirmAudit() {
  if (
    auditForm.value.result === "REJECT" &&
    !auditForm.value.rejectReason.trim()
  ) {
    uni.showToast({ title: "请输入驳回原因", icon: "none" });
    return;
  }
  actionSubmitting.value = true;
  try {
    await auditDelivery({
      id: currentItem.value.id,
      result: auditForm.value.result,
      rejectReason:
        auditForm.value.result === "REJECT"
          ? auditForm.value.rejectReason.trim()
          : "",
    });
    uni.showToast({ title: "审核成功", icon: "success" });
    closeAudit();
    fetchList(true);
  } catch (error) {
    console.error("审核失败", error);
  } finally {
    actionSubmitting.value = false;
  }
}

async function confirmDeliver() {
  if (!deliverForm.value.logisticsCompany.trim()) {
    uni.showToast({ title: "请选择物流公司", icon: "none" });
    return;
  }
  if (!deliverForm.value.logisticsNo.trim()) {
    uni.showToast({ title: "请输入物流单号", icon: "none" });
    return;
  }
  actionSubmitting.value = true;
  try {
    await deliverDelivery({
      id: currentItem.value.id,
      logisticsCompany: deliverForm.value.logisticsCompany.trim(),
      logisticsNo: deliverForm.value.logisticsNo.trim(),
    });
    uni.showToast({ title: "发货成功", icon: "success" });
    closeDeliver();
    fetchList(true);
  } catch (error) {
    console.error("确认发货失败", error);
  } finally {
    actionSubmitting.value = false;
  }
}

// 回寄确认弹窗（滑动验证通过后才能确认）
const showReturnConfirm = ref(false);
const slideVerified = ref(false);
const slideVerifyRef = ref(null);

// 是否允许确认：滑动验证通过 + 非提交中
const canConfirmReturn = computed(
  () => slideVerified.value && !actionSubmitting.value,
);

function openReturnConfirm(item) {
  currentItem.value = item;
  showReturnConfirm.value = true;
  slideVerified.value = false;
}

// 弹窗动画结束后重新测量滑块尺寸（wd-popup 懒渲染，隐藏时测量宽度可能为 0）
function handleReturnPopupShown() {
  slideVerifyRef.value?.init?.();
}

function handleSlideSuccess() {
  slideVerified.value = true;
}

function handleSlideFail() {
  slideVerified.value = false;
}

function closeReturnConfirm() {
  showReturnConfirm.value = false;
  slideVerified.value = false;
  slideVerifyRef.value?.reset?.();
}

async function confirmReturnDevice() {
  if (!canConfirmReturn.value || !currentItem.value) return;
  actionSubmitting.value = true;
  try {
    await returnDeviceDelivery({ id: currentItem.value.id });
    uni.showToast({ title: "操作成功", icon: "success" });
    closeReturnConfirm();
    fetchList(true);
  } catch (error) {
    console.error("回寄失败", error);
  } finally {
    actionSubmitting.value = false;
  }
}

async function handleAction(actionType, item) {
  if (actionType === "audit") {
    currentItem.value = item;
    auditForm.value = { result: "PASS", rejectReason: "" };
    showAudit.value = true;
    return;
  }
  if (actionType === "deliver") {
    currentItem.value = item;
    deliverForm.value = {
      logisticsCompany: item.logisticsCompany || "",
      logisticsNo: item.logisticsNo || "",
    };
    showDeliver.value = true;
    return;
  }
  if (actionType === "withdraw") {
    uni.showModal({
      title: "撤销申请",
      content: "确定撤销该发货申请吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await withdrawDelivery({ id: item.id });
          uni.showToast({ title: "撤销成功", icon: "success" });
          fetchList(true);
        } catch (error) {
          console.error("撤销申请失败", error);
        }
      },
    });
  }
  if (actionType === "receive") {
    uni.showModal({
      title: "签收确认",
      content: "确定签收该发货单吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await receiveDelivery({ id: item.id });
          uni.showToast({ title: "签收成功", icon: "success" });
          fetchList(true);
        } catch (error) {
          console.error("签收失败", error);
        }
      },
    });
  }
  if (actionType === "returnDevice") {
    openReturnConfirm(item);
  }
}

// 跳转到新建发货表单
function goToAdd() {
  uni.navigateTo({
    url: "/pages/delivery/form",
  });
}

onShow(async () => {
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

  &.status-bg-draft {
    background: #9ca3af;
  }
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

.create-time {
  font-size: 24rpx;
  color: #aaaaaa;
  margin-bottom: 12rpx;
}

.task-no {
  font-size: 26rpx;
  color: #888888;
  margin-bottom: 28rpx;

  &:active {
    opacity: 0.6;
  }
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
  .status-dot-draft {
    background-color: #9ca3af;
    box-shadow: 0 0 8rpx rgba(156, 163, 175, 0.5);
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

  &.label-with-copy {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
      }
    }
  }
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
  .reject-reason {
    color: #ef5350;
    background: #fff1f0;
    padding: 12rpx 16rpx;
    border-radius: 8rpx;
    font-size: 26rpx;
    line-height: 1.5;
  }
}

.grid-info-row {
  display: flex;
  margin-bottom: 24rpx;
	justify-content: space-between;
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
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0 36rpx;
    height: 32px;
    line-height: 1;
    font-size: 12px;
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

  .btn-withdraw {
    color: #ef5350;
    border-color: #ef5350;

    &:active {
      background-color: #fff1f0;
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
  height: 140rpx;
}

/* 审核/发货弹窗 */
.action-popup {
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
    }

    .popup-textarea {
      width: 100%;
      min-height: 160rpx;
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 20rpx 24rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }

    :deep(.popup-input) {
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 20rpx 24rpx;
      font-size: 28rpx;
    }

    .popup-input-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      min-height: 80rpx;

      .popup-logistics-input {
        flex: 1;
        font-size: 28rpx;
        color: #323233;
      }

      .scan-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12rpx;
      }
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
      background-color: #2979ff;
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

/* 回寄确认（滑动验证）居中弹窗 */
.return-confirm-popup {
  border-radius: 24rpx;

  .return-confirm-tip {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    text-align: center;
    padding: 24rpx 0 8rpx;
  }

  /* 滑动验证组件与提示文案的间距 */
  :deep(.wd-slide-verify) {
    margin-top: 24rpx;
  }

  /* 未通过滑动验证时确认按钮置灰，通过后恢复高亮 */
  .popup-footer {
    .btn-submit.btn-gray {
      background-color: #c8c9cc;
      opacity: 1;
    }
  }
}

/* 悬浮新建按钮 */
.fab-add {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #2979ff;
  box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  &:active {
    opacity: 0.85;
  }

  .fab-plus {
    color: #ffffff;
    font-size: 56rpx;
    line-height: 1;
    margin-top: -6rpx;
  }
}
</style>
