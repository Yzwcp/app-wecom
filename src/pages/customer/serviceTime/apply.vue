<template>
  <view class="page">
    <view class="form-container">
      <view class="form-module">
        <view class="module-body">
          <!-- 服务类型 -->
          <view class="field-item">
            <view class="field-label">
              服务类型
              <text class="required">*</text>
            </view>
            <DictSelectPicker
              v-model="formData.serviceType"
              dict-key="WJ_PROJECT_SERVICE"
              title="选择服务类型"
              placeholder="请选择服务类型"
            />
          </view>

          <!-- 申请到期时间 -->
          <view class="field-item">
            <view class="field-label">
              申请到期时间
              <text class="required">*</text>
            </view>
            <wd-input
              v-model="formData.newExpiredTime"
              placeholder="请选择申请到期时间"
              no-border
              suffix-icon="calendar"
              readonly
              @click="openDatePicker('newExpiredTime')"
            />
          </view>

          <!-- 申请开始时间 -->
          <view class="field-item">
            <view class="field-label">申请开始时间</view>
            <wd-input
              v-model="formData.newStartTime"
              placeholder="请选择申请开始时间（选填）"
              no-border
              suffix-icon="calendar"
              readonly
              @click="openDatePicker('newStartTime')"
            />
          </view>

          <!-- 门店 -->
          <view class="field-item">
            <view class="field-label">
              门店
              <text class="required">*</text>
            </view>
            <ApiSelectScrollPicker
              v-model="formData.storeIdList"
              type="checkbox"
              :api="getCustomerPage"
              paginated
              remote-search
              search-key="nameKeyword"
              label-key="storeName"
              value-key="id"
              title="选择门店"
              placeholder="请选择门店（可多选）"
              :z-index="999"
            />
          </view>

          <!-- 申请缘由 -->
          <view class="field-item">
            <view class="field-label">
              申请缘由
              <text class="required">*</text>
            </view>
            <wd-input
              v-model="formData.reason"
              type="textarea"
              placeholder="请输入申请缘由"
              no-border
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提交操作区 -->
    <view class="fixed-bottom-btns">
      <wd-button
        type="primary"
        block
        class="flex-btn"
        :loading="submitting"
        @click="handleSubmit"
        >提交申请</wd-button
      >
    </view>

    <!-- 日期选择器 -->
    <wd-datetime-picker
      :visible="datePickerVisible"
      v-model="datePickerModel"
      type="datetime"
      :title="datePickerTitle"
      @confirm="onDatePickerConfirm"
      @cancel="datePickerVisible = false"
    />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { addServiceTimeAdjust, getCustomerPage } from "@/api";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import ApiSelectScrollPicker from "@/components/ApiSelectScrollPicker.vue";

const formData = reactive({
  serviceType: "",
  newExpiredTime: "",
  newStartTime: "",
  storeIdList: [],
  reason: "",
});

const submitting = ref(false);

// ========== 日期选择器 ==========
const datePickerVisible = ref(false);
const datePickerModel = ref(Date.now());
const datePickerTitle = ref("选择日期时间");
let currentDateField = "";

function openDatePicker(field) {
  currentDateField = field;
  datePickerTitle.value =
    field === "newExpiredTime" ? "选择申请到期时间" : "选择申请开始时间";
  datePickerModel.value = formData[field]
    ? new Date(formData[field]).getTime()
    : Date.now();
  datePickerVisible.value = true;
}

function onDatePickerConfirm({ value }) {
  const d = new Date(value);
  const padNum = (n) => String(n).padStart(2, "0");
  // 格式化日期为yyyy-MM-dd HH:mm:ss
  formData[currentDateField] =
    `${d.getFullYear()}-${padNum(d.getMonth() + 1)}-${padNum(d.getDate())} ${padNum(d.getHours())}:${padNum(d.getMinutes())}:00`;
  datePickerVisible.value = false;
}

// ========== 提交 ==========
async function handleSubmit() {
  if (submitting.value) return;

  if (!formData.serviceType) {
    uni.showToast({ title: "请选择服务类型", icon: "none" });
    return;
  }
  if (!formData.newExpiredTime) {
    uni.showToast({ title: "请选择申请到期时间", icon: "none" });
    return;
  }
  if (!formData.storeIdList.length) {
    uni.showToast({ title: "请选择门店", icon: "none" });
    return;
  }
  if (!formData.reason.trim()) {
    uni.showToast({ title: "请输入申请缘由", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    await addServiceTimeAdjust({
      serviceType: formData.serviceType,
      newExpiredTime: formData.newExpiredTime,
      newStartTime: formData.newStartTime || undefined,
      storeIdList: formData.storeIdList,
      reason: formData.reason.trim(),
    });
    uni.showToast({ title: "申请已提交", icon: "success" });
    setTimeout(() => uni.navigateBack(), 1200);
  } catch (error) {
    console.error("提交申请失败", error);
  } finally {
    submitting.value = false;
  }
}
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
}

.form-module {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .module-body {
    padding: 32rpx;
  }
}

.field-item {
  margin-bottom: 28rpx;
  &:last-child {
    margin-bottom: 0;
  }

  .field-label {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;

    .required {
      color: #ee0a24;
      margin-left: 4rpx;
    }
  }

  :deep(.wd-input) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
  }
}

.fixed-bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: center;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 1;
  .flex-btn {
    flex: 1;
  }
}
</style>
