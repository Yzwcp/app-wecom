<template>
  <wd-popup
    v-model="visible"
    position="center"
    custom-style="width: 86%; border-radius: 24rpx; padding: 40rpx 32rpx;"
    @close="onClose"
  >
    <view class="sign-modal">
      <view class="modal-title">发起合同电签</view>

      <!-- 认证状态 -->
      <view
        class="auth-alert"
        :class="authed ? 'auth-alert-success' : 'auth-alert-warning'"
      >
        <wd-icon
          :name="authed ? 'check-circle' : 'warning'"
          size="16px"
          :color="authed ? '#2ecc71' : '#fa9a2f'"
        />
        <text class="auth-alert-text">
          {{
            authed
              ? "该客户已完成放心签认证，可直接发起电签"
              : "该客户尚未完成放心签认证，请先生成认证链接"
          }}
        </text>
        <text v-if="authStatusLabel" class="auth-status-label">{{
          authStatusLabel
        }}</text>
      </view>

      <!-- 未认证：生成认证链接 -->
      <view v-if="!authed" class="auth-section">
        <view class="auth-row">
          <input
            v-model="authMobile"
            class="auth-input"
            type="number"
            placeholder="请输入经办人手机号"
            maxlength="11"
          />
          <view class="auth-btn-group">
            <wd-button
              size="small"
              type="primary"
              :loading="authUrlLoading"
              @click="getAuthUrl"
              >获取认证链接</wd-button
            >
            <wd-button size="small" plain @click="checkAuth"
              >刷新状态</wd-button
            >
          </view>
        </view>

        <view v-if="authH5Url || authPcUrl || authUrl" class="auth-link-box">
          <view class="auth-link-tip"
            >请将下方认证链接发送给客户完成认证：</view
          >
          <view v-if="authStatusLabel" class="auth-status-row">
            当前认证状态：<text class="auth-status-label">{{
              authStatusLabel
            }}</text>
          </view>
          <view v-if="authH5Url" class="auth-link-row">
            <text class="auth-link-label">H5链接：</text>
            <text class="auth-link-text">{{ authH5Url }}</text>
            <text class="auth-link-copy" @click="copyText(authH5Url)"
              >复制</text
            >
          </view>
          <view v-if="authPcUrl" class="auth-link-row">
            <text class="auth-link-label">PC链接：</text>
            <text class="auth-link-text">{{ authPcUrl }}</text>
            <text class="auth-link-copy" @click="copyText(authPcUrl)"
              >复制</text
            >
          </view>
          <view v-if="authUrl" class="auth-link-row">
            <text class="auth-link-text">{{ authUrl }}</text>
            <text class="auth-link-copy" @click="copyText(authUrl)">复制</text>
          </view>
        </view>
      </view>

      <!-- 电签信息 -->
      <view class="divider">电签信息</view>
      <view class="form-item">
        <view class="form-lbl">
          客户用章人手机号
          <text class="red">*</text>
        </view>
        <input
          v-model="signForm.signerMobile"
          class="form-input"
          type="number"
          placeholder="请输入客户用章人手机号"
          maxlength="11"
        />
      </view>
      <view class="form-item">
        <view class="form-lbl">客户用章人姓名</view>
        <input
          v-model="signForm.signerName"
          class="form-input"
          type="text"
          placeholder="请输入客户用章人姓名（选填）"
        />
      </view>

      <!-- 底部按钮 -->
      <view class="modal-footer">
        <wd-button class="footer-btn" plain @click="visible = false"
          >取消</wd-button
        >
        <wd-button
          class="footer-btn"
          type="primary"
          :loading="initiating"
          @click="onSignSubmit"
          >发起电签</wd-button
        >
      </view>
    </view>
  </wd-popup>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  getContractDetail,
  getContractSignCustomerAuthCheck,
  getContractSignCustomerAuthUrl,
  contractSignInitiate,
} from "@/api";
import { useDict } from "@/hooks/useDict";

const emit = defineEmits(["successful"]);

const { getDictLabel } = useDict();

const visible = ref(false);
const initiating = ref(false);
const authChecking = ref(false);
const authed = ref(false);
const authMobile = ref("");
const authUrl = ref("");
const authH5Url = ref("");
const authPcUrl = ref("");
const authStatus = ref("");
const authUrlLoading = ref(false);
const currentSignContract = ref({});
const signForm = ref({ signerMobile: "", signerName: "" });

// authStatus：UNAUTH-未认证 AUTHING-认证中 AUTHED-已认证
const authStatusLabel = computed(() => {
  if (!authStatus.value) return "";
  return (
    getDictLabel("WJ_CUSTOMER_AUTH_STATUS", authStatus.value) ||
    authStatus.value
  );
});

const isAuthed = (data) => {
  if (typeof data === "boolean") return data;
  if (data == null || typeof data !== "object") return false;
  return data.authStatus === "AUTHED";
};

function checkAuth() {
  const storeId = currentSignContract.value.customerId;
  if (!storeId) {
    uni.showToast({ title: "该合同未关联客户，无法发起电签", icon: "none" });
    return;
  }
  authChecking.value = true;
  getContractSignCustomerAuthCheck({ storeId })
    .then((data) => {
      authed.value = isAuthed(data);
      if (data && typeof data === "object") {
        authStatus.value = data.authStatus || data.status || "";
      }
    })
    .finally(() => {
      authChecking.value = false;
    });
}

function getAuthUrl() {
  if (!authMobile.value) {
    uni.showToast({ title: "请输入经办人手机号", icon: "none" });
    return;
  }
  authUrlLoading.value = true;
  getContractSignCustomerAuthUrl({
    mobile: authMobile.value,
    storeId: currentSignContract.value.customerId,
  })
    .then((data) => {
      if (typeof data === "string") {
        authUrl.value = data;
        authH5Url.value = "";
        authPcUrl.value = "";
      } else {
        authUrl.value = "";
        authH5Url.value = data?.h5Url || "";
        authPcUrl.value = data?.pcUrl || "";
        authStatus.value = data?.authStatus || "";
      }
      if (!authUrl.value && !authH5Url.value && !authPcUrl.value) {
        uni.showToast({ title: "认证链接获取成功", icon: "none" });
      }
    })
    .finally(() => {
      authUrlLoading.value = false;
    });
}

function copyText(text) {
  if (!text) return;
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: "已复制认证链接", icon: "none" });
    },
  });
}

function onOpen(record) {
  currentSignContract.value = { ...record };
  signForm.value = { signerMobile: "", signerName: "" };
  authed.value = false;
  authMobile.value = "";
  authUrl.value = "";
  authH5Url.value = "";
  authPcUrl.value = "";
  authStatus.value = "";
  visible.value = true;

  // 拉取详情，回填合同文件与客户 ID（对齐 PC 逻辑）
  getContractDetail({ id: record.id })
    .then((data) => {
      const contract = data.contract || data;
      currentSignContract.value.customerId =
        contract.customerId ||
        record.customerId ||
        currentSignContract.value.customerId;
      currentSignContract.value.contractFileId =
        contract.contractFileId ||
        record.contractFileId ||
        currentSignContract.value.contractFileId;
      checkAuth();
    })
    .catch(() => {
      checkAuth();
    });
}

function onSignSubmit() {
  if (!signForm.value.signerMobile) {
    uni.showToast({ title: "请输入客户用章人手机号", icon: "none" });
    return;
  }
  initiating.value = true;
  contractSignInitiate({
    contractId: currentSignContract.value.id,
    fileId: currentSignContract.value.contractFileId,
    signerMobile: signForm.value.signerMobile,
    signerName: signForm.value.signerName,
  })
    .then(() => {
      uni.showToast({ title: "电签发起成功", icon: "success" });
      visible.value = false;
      emit("successful");
    })
    .finally(() => {
      initiating.value = false;
    });
}

function onClose() {
  visible.value = false;
}

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 32rpx;
}

.red {
  color: #ef4444;
  margin-left: 4rpx;
}

/* 认证状态提示条 */
.auth-alert {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  margin-bottom: 24rpx;

  &.auth-alert-warning {
    background-color: #fff7e8;
    color: #8a5300;
  }
  &.auth-alert-success {
    background-color: #e9f9f0;
    color: #1d7a4f;
  }

  .auth-alert-text {
    flex: 1;
  }
  .auth-status-label {
    padding: 2rpx 16rpx;
    line-height: 36rpx;
    font-size: 22rpx;
    color: #0066ff;
    background: #e6f0ff;
    border: 1px solid #a6c8ff;
    border-radius: 8rpx;
  }
}

/* 未认证：认证链接区域 */
.auth-section {
  margin-bottom: 8rpx;
  .auth-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    .auth-input {
      flex: 1;
      background-color: #f7f8fa;
      border-radius: 12rpx;
      padding: 16rpx 24rpx;
      font-size: 28rpx;
      min-width: 0;
    }
    .auth-btn-group {
      display: flex;
      gap: 12rpx;
      flex-shrink: 0;
    }
  }

  .auth-link-box {
    background-color: #f2f6ff;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 16rpx;
    .auth-link-tip {
      font-size: 24rpx;
      color: #0052cc;
      margin-bottom: 8rpx;
    }
    .auth-status-row {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
      .auth-status-label {
        padding: 0 12rpx;
        line-height: 32rpx;
        font-size: 22rpx;
        color: #0066ff;
        background: #e6f0ff;
        border: 1px solid #a6c8ff;
        border-radius: 8rpx;
      }
    }
    .auth-link-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8rpx;
      &:last-child {
        margin-bottom: 0;
      }
      .auth-link-label {
        flex-shrink: 0;
        font-size: 24rpx;
        color: #666;
      }
      .auth-link-text {
        flex: 1;
        font-size: 24rpx;
        color: #0066ff;
        word-break: break-all;
        min-width: 0;
      }
      .auth-link-copy {
        flex-shrink: 0;
        font-size: 24rpx;
        color: #0066ff;
        margin-left: 12rpx;
      }
    }
  }
}

.divider {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 24rpx;
  margin: 8rpx 0 24rpx;
  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: #eee;
  }
  &::before {
    margin-right: 16rpx;
  }
  &::after {
    margin-left: 16rpx;
  }
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
  .form-lbl {
    font-size: 26rpx;
    font-weight: 500;
    color: #666;
  }
  .form-input {
    background-color: #f7f8fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    font-size: 28rpx;
  }
}

.modal-footer {
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
</style>
