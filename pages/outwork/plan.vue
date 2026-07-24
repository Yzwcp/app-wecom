<template>
  <view class="page">
    <wd-navbar title="外出计划" left-arrow @click-left="goBack" />

    <view class="form-container">
      <!-- 基本信息模块 -->
      <view class="form-module">
        <view class="module-header">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">基本信息</text>
          </view>
        </view>
        <view class="module-body">
          <!-- 客户名称（只读展示） -->
          <view class="field-item">
            <view class="field-label">客户名称</view>
            <view class="readonly-value">{{
              customerName || "加载中..."
            }}</view>
          </view>

          <!-- 外出类型 -->
          <view class="field-item">
            <view class="field-label required">外出类型</view>
            <DictSelectPicker
              v-model="formData.outworkType"
              dict-key="WJ_OUTWORK_TYPE"
              title="选择外出类型"
            />
          </view>

          <!-- 外出计划时间 -->
          <view class="field-item">
            <view class="field-label required">外出计划时间</view>
            <wd-input
              v-model="formData.planTime"
              placeholder="请选择计划时间"
              no-border
              suffix-icon="calendar"
              readonly
              @click="openDatePicker"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="fixed-bottom-btns">
      <wd-button
        type="primary"
        block
        class="flex-btn"
        :loading="submitting"
        @click="handleSubmit"
        >创建</wd-button
      >
    </view>

    <!-- 日期选择器 -->
    <wd-datetime-picker
      :visible="datePickerVisible"
      v-model="datePickerModel"
      type="datetime"
      title="选择计划时间"
      @confirm="onDatePickerConfirm"
      @cancel="datePickerVisible = false"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCustomerDetail } from "@/api";
import { addOutworkPlan } from "@/api";
import DictSelectPicker from "../../components/DictSelectPicker.vue";

const customerId = ref("");
const customerName = ref("");

const submitting = ref(false);

const formData = ref({
  outworkType: undefined,
  planTime: "",
});

// 日期选择器
const datePickerVisible = ref(false);
const datePickerModel = ref(Date.now());

function openDatePicker() {
  datePickerModel.value = formData.value.planTime
    ? new Date(formData.value.planTime).getTime()
    : Date.now();
  datePickerVisible.value = true;
}

function onDatePickerConfirm({ value }) {
  const d = new Date(value);
  const padNum = (n) => String(n).padStart(2, "0");
  formData.value.planTime = `${d.getFullYear()}-${padNum(d.getMonth() + 1)}-${padNum(d.getDate())} ${padNum(d.getHours())}:${padNum(d.getMinutes())}:00`;
  datePickerVisible.value = false;
}

function goBack() {
  uni.navigateBack();
}

async function handleSubmit() {
  if (!formData.value.outworkType) {
    return uni.showToast({ title: "请选择外出类型", icon: "none" });
  }
  if (!formData.value.planTime) {
    return uni.showToast({ title: "请选择外出计划时间", icon: "none" });
  }

  submitting.value = true;
  try {
    await addOutworkPlan({
      outworkType: formData.value.outworkType,
      planTime: formData.value.planTime,
      customerId: customerId.value,
    });
    uni.showToast({ title: "创建成功", icon: "success" });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (err) {
    uni.showToast({ title: err.errMsg || "创建失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

onLoad(() => {
  const options = uni.$router.query || {};
  if (options.customerId) {
    customerId.value = options.customerId;
  }
  if (options.customerName) {
    customerName.value = decodeURIComponent(options.customerName);
  }

  // 如果只有 id，自动获取详情回填名称
  if (customerId.value && !customerName.value) {
    getCustomerDetail({ id: customerId.value })
      .then((res) => {
        customerName.value = res?.store?.storeName || "";
      })
      .catch(() => {});
  }
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 180rpx;
}

.form-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 模块卡片 */
.form-module {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 32rpx;
    background-color: #ffffff;
    border-bottom: 1px solid #f6f7f9;

    .title-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
      .blue-dot {
        width: 14rpx;
        height: 14rpx;
        background-color: #0066ff;
        border-radius: 50%;
      }
      .title-text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .module-body {
    padding: 24rpx 32rpx 32rpx;
  }
}

/* 表单字段 */
.field-item {
  margin-bottom: 24rpx;
  &:last-child {
    margin-bottom: 0;
  }

  .field-label {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .required::after {
    content: "*";
    color: #ff4d4f;
    margin-left: 6rpx;
  }

  :deep(.wd-input) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
  }

  .readonly-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    padding: 16rpx 24rpx;
    background-color: #f8f9fa;
    border-radius: 12rpx;
  }
}

/* 底部操作 */
.fixed-bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 1;
  .flex-btn {
    flex: 1;
  }
}
</style>
