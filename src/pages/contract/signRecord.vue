<template>
  <view class="page">
    <!-- 合同信息头 -->
    <view class="header-card" id="headerTop" v-if="contractName">
      <view class="header-label">合同</view>
      <view class="header-name">{{ contractName }}</view>
    </view>

    <!-- 签署记录列表 -->
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
      <view v-for="item in signList" :key="item.id" class="sign-card">
        <!-- 右上角状态标签 -->
        <view class="status-badge">{{
          getDictLabel("CONTRACT_SIGN_RECORD_STATUS", item.status) || "-"
        }}</view>

        <view class="card-row">
          <text class="label">合同编号</text>
          <text class="value">{{ item.contractNo || "-" }}</text>
        </view>
        <view class="card-grid">
          <view class="grid-item">
            <text class="label">用章人姓名</text>
            <text class="value">{{ item.signerName || "-" }}</text>
          </view>
          <view class="grid-item">
            <text class="label">用章人手机号</text>
            <text class="value">{{ item.signerMobile || "-" }}</text>
          </view>
        </view>
        <view class="card-grid">
          <view class="grid-item">
            <text class="label">签署时间</text>
            <text class="value">{{ item.finishTime || "-" }}</text>
          </view>
          <view class="grid-item">
            <text class="label">签署方式</text>
            <text class="value">{{
              getDictLabel("CONTRACT_SIGN_MODE", item.signMode) || "-"
            }}</text>
          </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="card-actions" v-if="item.status !== 'COMPLETED'">
          <wd-button
            type="danger"
            plain
            size="small"
            class="mgr-16"
            @click="openVoid(item)"
            >作废</wd-button
          >
          <wd-button
            type="primary"
            plain
            size="small"
            class="mgr-16"
            @click="onUrgeSign(item)"
            >催签</wd-button
          >
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="signList.length > 0" class="load-more-box">
        <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
          >加载中...</text
        >
        <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
          >没有更多了</text
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && signList.length === 0" class="empty-box">
        <wd-icon name="file" size="48px" color="#ccc" />
        <text class="empty-text">暂无签署记录</text>
      </view>

      <!-- 首次加载状态 -->
      <view v-if="loading && signList.length === 0" class="empty-box">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>

    <!-- 作废原因弹窗 -->
    <wd-popup
      v-model="voidPopupShow"
      position="center"
      custom-style="width: 80%; border-radius: 24rpx; padding: 40rpx 32rpx;"
    >
      <view class="void-popup">
        <view class="popup-title">作废（撤回）合同电签</view>
        <view class="popup-lbl">作废原因</view>
        <wd-textarea
          v-model="voidReason"
          placeholder="请输入作废原因（选填）"
          :maxlength="200"
          no-border
          custom-class="void-textarea"
        />
        <view class="popup-footer">
          <wd-button class="footer-btn" plain @click="voidPopupShow = false"
            >取消</wd-button
          >
          <wd-button
            class="footer-btn"
            type="primary"
            :loading="voidLoading"
            @click="onVoidSubmit"
            >确定</wd-button
          >
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getElementHeight } from "@/utils/tools";
import { getContractSignPage, contractSignVoid, contractSignUrge } from "@/api";
import { useDict } from "@/hooks/useDict";

const { getDictLabel } = useDict();

const contractId = ref("");
const contractName = ref("");
const topHeight = ref(0);

// 分页状态
const signList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref(""); // '' | 'loading' | 'nomore'

// 作废弹窗
const voidPopupShow = ref(false);
const voidReason = ref("");
const voidLoading = ref(false);
const currentVoidRecord = ref({});

onLoad(async (op) => {
  contractId.value = op.contractId || "";
  contractName.value = decodeURIComponent(op.name || "");
  await nextTick();
  topHeight.value = await getElementHeight("#headerTop");
  fetchList(true);
});

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

  try {
    const res = await getContractSignPage(params);

    if (isReset || current.value === 1) {
      signList.value = res.records || [];
    } else {
      signList.value = [...signList.value, ...(res.records || [])];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;
    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取签署记录失败", error);
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

function goBack() {
  uni.navigateBack();
}

// 作废
function openVoid(item) {
  currentVoidRecord.value = item;
  voidReason.value = "";
  voidPopupShow.value = true;
}

function onVoidSubmit() {
  voidLoading.value = true;
  contractSignVoid({
    id: currentVoidRecord.value.id,
    reason: voidReason.value,
  })
    .then(() => {
      uni.showToast({ title: "作废成功", icon: "success" });
      voidPopupShow.value = false;
      fetchList(true);
    })
    .finally(() => {
      voidLoading.value = false;
    });
}

// 催签
function onUrgeSign(item) {
  uni.showModal({
    title: "提示",
    content: "确定要催签该合同电签吗？",
    success: (res) => {
      if (!res.confirm) return;
      contractSignUrge({ id: item.id }).then(() => {
        uni.showToast({ title: "催签成功", icon: "success" });
      });
    },
  });
}
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

.content-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 签署记录卡片 */
.sign-card {
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
    background-color: #0066ff;
  }

  .card-row {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-bottom: 20rpx;
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
    font-size: 22rpx;
    color: #999;
  }
  .value {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .mgr-16 {
      margin-right: 16rpx;
    }
    :deep(.wd-button) {
      border-radius: 12rpx;
      padding: 0 32rpx;
      height: 64rpx;
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

/* 作废弹窗 */
.void-popup {
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 32rpx;
  }
  .popup-lbl {
    font-size: 26rpx;
    font-weight: 500;
    color: #666;
    margin-bottom: 12rpx;
  }
  :deep(.void-textarea) {
    background-color: #f7f8fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    min-height: 160rpx;
  }
  .popup-footer {
    display: flex;
    gap: 20rpx;
    margin-top: 40rpx;
    .footer-btn {
      flex: 1;
      :deep(.wd-button) {
        width: 100%;
        height: 80rpx;
        border-radius: 12rpx;
      }
    }
  }
}
</style>
