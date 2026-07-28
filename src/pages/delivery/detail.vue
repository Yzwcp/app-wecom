<template>
  <view class="page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-box">
      <text class="loading-text">加载中...</text>
    </view>

    <template v-if="!loading && detail">
      <!-- 状态头部 -->
      <view class="status-header" :class="`header-${statusCls}`">
        <view class="status-icon">
          <wd-icon :name="statusIcon" size="48rpx" color="#fff" />
        </view>
        <view class="status-info">
          <text class="status-text">{{ detail.statusName || getStatusText(detail.status) }}</text>
          <text class="status-desc">{{ statusDesc }}</text>
        </view>
      </view>

      <!-- 发货信息卡片 -->
      <view class="info-card">
        <view class="card-title">发货信息</view>
        <view class="info-row">
          <text class="label">物流单号</text>
          <text class="value">{{ detail.logisticsNo || "-" }}</text>
        </view>
        <view class="info-row">
          <text class="label">关联施工</text>
          <text class="value">{{ detail.constructionTaskId || "-" }}</text>
        </view>
        <view class="info-row">
          <text class="label">备注</text>
          <text class="value">{{ detail.remark || "无" }}</text>
        </view>
      </view>

      <!-- 签收信息卡片 -->
      <view class="info-card">
        <view class="card-title">签收信息</view>
        <view class="info-row">
          <text class="label">收货人</text>
          <text class="value">{{ detail.receiverName || "-" }}</text>
        </view>
        <view class="info-row">
          <text class="label">联系电话</text>
          <text class="value">{{ detail.receiverPhone || "-" }}</text>
        </view>
        <view class="info-row">
          <text class="label">收货地址</text>
          <text class="value address">{{ detail.receiverAddress || "-" }}</text>
        </view>
        <view class="info-row" v-if="detail.needReturnDevice">
          <text class="label">回寄设备</text>
          <text class="value tag-yes">需要回寄</text>
        </view>
      </view>

      <!-- 发货清单卡片 -->
      <view class="info-card" v-if="detail.itemList?.length">
        <view class="card-title">发货清单</view>
        <view
          class="goods-item"
          v-for="(item, idx) in detail.itemList"
          :key="idx"
        >
          <view class="goods-index">{{ idx + 1 }}</view>
          <view class="goods-info">
            <text class="goods-name">{{ item.itemName }}</text>
            <text class="goods-spec" v-if="item.spec">规格：{{ item.spec }}</text>
          </view>
          <text class="goods-qty">{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
    </template>

    <!-- 空状态 -->
    <view v-if="!loading && !detail" class="empty-box">
      <wd-icon name="delivery" size="48px" color="#ccc" />
      <text class="empty-text">暂无数据</text>
    </view>

    <!-- 底部固定操作栏 -->
    <view class="footer-actions" v-if="detail">
      <button class="btn-back" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getDeliveryDetail } from "@/api/delivery";

const detail = ref(null);
const loading = ref(true);
const id = ref("");

const STATUS_MAP = {
  APPLY: { text: "待审核", cls: "audit", icon: "clock", desc: "等待审核中" },
  AUDIT: { text: "待发货", cls: "progress", icon: "delivery", desc: "审核通过，等待发货" },
  DELIVERY: { text: "已发货", cls: "pending", icon: "ship", desc: "货物已在运输途中" },
  RECEIVE: { text: "已完成", cls: "completed", icon: "checked", desc: "已签收完成" },
  REJECTED: { text: "已驳回", cls: "rejected", icon: "close", desc: "申请已被驳回" },
};

const statusCls = ref("");
const statusIcon = ref("");
const statusDesc = ref("");

function getStatusText(status) {
  return STATUS_MAP[status]?.text || "未知";
}

function updateStatusMeta(status) {
  const meta = STATUS_MAP[status];
  if (meta) {
    statusCls.value = meta.cls;
    statusIcon.value = meta.icon;
    statusDesc.value = meta.desc;
  } else {
    statusCls.value = "other";
    statusIcon.value = "info";
    statusDesc.value = "";
  }
}

onLoad(async (options) => {
  id.value = options?.id || "";
  if (!id.value) {
    loading.value = false;
    return;
  }
  try {
    const res = await getDeliveryDetail({ id: id.value });
    detail.value = res;
    updateStatusMeta(res.status);
  } catch (error) {
    console.error("获取发货详情失败", error);
    uni.showToast({ title: "获取详情失败", icon: "none" });
  } finally {
    loading.value = false;
  }
});

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f7f9fc;
  padding-bottom: 140rpx;
}

.loading-box {
  display: flex;
  justify-content: center;
  padding: 200rpx 0;
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

/* 状态头部 */
.status-header {
  display: flex;
  align-items: center;
  padding: 48rpx 40rpx;
  color: #ffffff;

  &.header-audit { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
  &.header-progress { background: linear-gradient(135deg, #f2825b, #fb923c); }
  &.header-pending { background: linear-gradient(135deg, #2979ff, #60a5fa); }
  &.header-completed { background: linear-gradient(135deg, #2ecc71, #4ade80); }
  &.header-rejected { background: linear-gradient(135deg, #ef5350, #f87171); }
  &.header-other { background: linear-gradient(135deg, #9ca3af, #cbd5e1); }

  .status-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .status-info {
    display: flex;
    flex-direction: column;

    .status-text {
      font-size: 36rpx;
      font-weight: bold;
    }
    .status-desc {
      font-size: 26rpx;
      opacity: 0.85;
      margin-top: 6rpx;
    }
  }
}

/* 信息卡片 */
.info-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 24rpx 32rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f3f7;
    margin-bottom: 24rpx;
  }

  .info-row {
    display: flex;
    padding: 16rpx 0;

    .label {
      width: 160rpx;
      font-size: 26rpx;
      color: #999;
      flex-shrink: 0;
    }
    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;

      &.address {
        font-weight: 500;
      }
      &.tag-yes {
        color: #2979ff;
        font-weight: 500;
      }
    }
  }

  /* 发货清单 */
  .goods-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .goods-index {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: #2979ff;
      color: #fff;
      font-size: 22rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;
    }

    .goods-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .goods-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }
      .goods-spec {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }

    .goods-qty {
      font-size: 28rpx;
      color: #2979ff;
      font-weight: 500;
      flex-shrink: 0;
    }
  }
}

/* 空状态 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
  gap: 16rpx;
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

/* 底部固定操作栏 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);

  .btn-back {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 30rpx;
    color: #2979ff;
    background: #ffffff;
    border: 2rpx solid #2979ff;
    border-radius: 16rpx;
    margin: 0;

    &::after {
      border: none;
    }

    &:active {
      background: #f0f5ff;
    }
  }
}
</style>
