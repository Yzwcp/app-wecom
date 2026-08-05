<template>
  <view class="page">
    <wd-navbar
      title="发起合同电签"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <!-- 合同信息头 -->
    <view class="header-card" v-if="contractName">
      <view class="header-label">合同</view>
      <view class="header-name">{{ contractName }}</view>
    </view>

    <view class="sign-body">
      <!-- 认证状态提示条 -->
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
        <!-- <text v-if="authStatusLabel" class="auth-status-label">{{
          authStatusLabel
        }}</text> -->
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
        <view class="form-lbl">客户用章人</view>
        <ApiSelectPicker
          v-model="selectedContactId"
          :api="fetchContacts"
          label-key="contactName"
          value-key="id"
          title="选择客户用章人"
          placeholder="请选择客户用章人"
          @confirm="onContactConfirm"
        />
      </view>
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
      <view class="form-item">
        <view class="form-lbl">签署方式</view>
        <DictSelectPicker
          v-model="signForm.signMode"
          dict-key="CONTRACT_SIGN_MODE"
          title="选择签署方式"
          placeholder="请选择签署方式"
        />
      </view>
      <view class="form-item switch-row">
        <view class="switch-label">
          <view class="form-lbl">强制客户手动签</view>
          <view class="switch-desc"
            >默认关闭：已授权静默签的客户自动静默签</view
          >
        </view>
        <wd-switch v-model="signForm.forceManualSign" />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="modal-footer">
      <wd-button class="footer-btn" plain @click="goBack">取消</wd-button>
      <wd-button
        class="footer-btn"
        type="primary"
        :loading="initiating"
        @click="onSignSubmit"
        >发起电签</wd-button
      >
    </view>

    <!-- 发起成功弹窗 -->
    <wd-popup
      v-model="resultShow"
      position="center"
      custom-style="width: 86%; border-radius: 24rpx; padding: 40rpx 32rpx;"
    >
      <view class="result-popup">
        <view class="popup-title">电签发起成功</view>
        <view v-if="signResult.signUrl" class="result-url-box">
          <view class="result-lbl">签署链接（点击复制）</view>
          <view class="result-url" @click="copyText(signResult.signUrl)">
            <text class="result-url-text">{{ signResult.signUrl }}</text>
            <wd-button size="small" type="primary">复制</wd-button>
          </view>
        </view>
        <view v-else class="result-tip">未生成签署链接</view>
        <view class="popup-footer">
          <wd-button class="footer-btn" type="primary" @click="onResultConfirm"
            >完成</wd-button
          >
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getContractDetail,
  getCustomerDetail,
  getContractSignCustomerAuthCheck,
  getContractSignCustomerAuthUrl,
  contractSignInitiate,
} from "@/api";
import { useDict } from "@/hooks/useDict";
import ApiSelectPicker from "../../components/ApiSelectPicker.vue";
import DictSelectPicker from "../../components/DictSelectPicker.vue";

const { getDictLabel } = useDict();

const contractId = ref("");
const contractName = ref("");
const customerId = ref("");
const contractFileId = ref("");

const initiating = ref(false);
const resultShow = ref(false);
const signResult = ref({});
const authed = ref(false);
const authMobile = ref("");
const authUrl = ref("");
const authH5Url = ref("");
const authPcUrl = ref("");
const authStatus = ref("");
const authUrlLoading = ref(false);
const selectedContactId = ref("");
const signForm = ref({
  signerMobile: "",
  signerName: "",
  signMode: "",
  forceManualSign: false,
});

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

onLoad(() => {
  const options = uni.$router.query || {};
  contractId.value = options.id || "";
  contractName.value = decodeURIComponent(options.name || "");
  loadContract();
});

// 拉取合同详情，回填客户 ID 与合同文件 ID（对齐 PC 逻辑）
function loadContract() {
  if (!contractId.value) {
    uni.showToast({ title: "缺少合同参数，无法发起电签", icon: "none" });
    setTimeout(() => goBack(), 1000);
    return;
  }
  getContractDetail({ id: contractId.value })
    .then((data) => {
      const contract = data.contract || data;
      customerId.value = contract.customerId || "";
      contractFileId.value = contract.contractFileId || "";
      checkAuth();
      // 合同已有签署文件，弹出结果弹窗展示链接
      if (contract.signedFileUrl) {
        signResult.value = { signUrl: contract.signedFileUrl };
        resultShow.value = true;
      }
    })
    .catch(() => {
      checkAuth();
    });
}

// 获取客户联系人列表（供 ApiSelectPicker 使用）
function fetchContacts() {
  if (!customerId.value) return Promise.resolve([]);
  return getCustomerDetail({ id: customerId.value }).then(
    (res) => res.contactList || [],
  );
}

// 选中联系人后回填用章人手机号与姓名
function onContactConfirm(item) {
  if (!item?.contactPhone) {
    uni.showToast({ title: "该联系人未填写手机号", icon: "none" });
    return;
  }
  signForm.value.signerMobile = item.contactPhone;
  signForm.value.signerName = item.contactName || "";
  uni.showToast({ title: "已回填联系人信息", icon: "none" });
}

function checkAuth() {
  const storeId = customerId.value;
  if (!storeId) {
    uni.showToast({ title: "该合同未关联客户，无法发起电签", icon: "none" });
    return;
  }
  getContractSignCustomerAuthCheck({ storeId })
    .then((data) => {
      authed.value = isAuthed(data);
      if (data && typeof data === "object") {
        authStatus.value = data.authStatus || data.status || "";
      }
    })
    .catch(() => {});
}

function getAuthUrl() {
  if (!authMobile.value) {
    uni.showToast({ title: "请输入经办人手机号", icon: "none" });
    return;
  }
  authUrlLoading.value = true;
  getContractSignCustomerAuthUrl({
    mobile: authMobile.value,
    storeId: customerId.value,
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
      uni.showToast({ title: "已复制", icon: "none" });
    },
  });
}

function onSignSubmit() {
  if (!signForm.value.signerMobile) {
    uni.showToast({ title: "请输入客户用章人手机号", icon: "none" });
    return;
  }
  initiating.value = true;
  contractSignInitiate({
    contractId: contractId.value,
    fileId: contractFileId.value,
    contactId: selectedContactId.value,
    signerMobile: signForm.value.signerMobile,
    signerName: signForm.value.signerName,
    signMode: signForm.value.signMode,
    forceManualSign: signForm.value.forceManualSign,
  })
    .then((data) => {
      signResult.value = data || {};
      resultShow.value = true;
    })
    .finally(() => {
      initiating.value = false;
    });
}

// 成功弹窗点击完成，返回列表并刷新
function onResultConfirm() {
  resultShow.value = false;
  uni.$router.back({
    delta: 1,
    params: { signSuccess: true },
  });
}

function goBack() {
  uni.navigateBack();
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

.sign-body {
  padding: 32rpx 32rpx 200rpx;
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
      background-color: #fff;
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
    background-color: #fff;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    font-size: 28rpx;
  }
}

/* 强制手动签开关行 */
.switch-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;

  .switch-label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }
  .switch-desc {
    font-size: 22rpx;
    color: #999;
  }
}

/* 底部按钮 */
.modal-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 10;
  .footer-btn {
    flex: 1;
    :deep(.wd-button) {
      width: 100%;
      height: 80rpx;
      border-radius: 12rpx;
    }
  }
}

/* 发起成功弹窗 */
.result-popup {
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 32rpx;
  }
  .result-lbl {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  .result-url {
    display: flex;
    align-items: center;
    gap: 16rpx;
    background-color: #f7f8fa;
    border-radius: 12rpx;
    padding: 16rpx 20rpx;
    .result-url-text {
      flex: 1;
      font-size: 24rpx;
      color: #0066ff;
      word-break: break-all;
      min-width: 0;
    }
  }
  .result-tip {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    padding: 20rpx 0;
  }
  .popup-footer {
    margin-top: 40rpx;
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
