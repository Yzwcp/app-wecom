<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="回访录入"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <view class="form-container">
      <!-- 客户信息展示卡片 -->
      <view class="info-card">
        <view class="card-title-row">
          <wd-icon name="user" size="18px" color="#0066ff" />
          <text class="title-text">客户信息</text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">客户名称</text>
            <text class="val">{{ customerInfo.name }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系人</text>
            <text class="val">{{ customerInfo.contact }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系电话</text>
            <text class="val">{{ customerInfo.phone }}</text>
          </view>
        </view>
      </view>

      <!-- 回访时间选择行 -->
      <view
        class="select-cell-card"
        :class="{ disabled: readonly }"
        @click="!readonly && openDatePicker()"
      >
        <view class="left-label">
          回访时间
          <text class="required">*</text>
        </view>
        <view class="right-content">
          <text class="time-text">{{
            formattedVisitTime || "请选择回访时间"
          }}</text>
          <wd-icon name="arrow" size="16px" color="#999" />
        </view>
      </view>

      <!-- 核心录入卡片块 -->
      <view class="form-body-card">
        <!-- 满意度评分自定义单选 -->
        <view class="form-section">
          <view class="section-title">
            满意度评分
            <text class="required">*</text>
          </view>
          <view class="satisfaction-grid" :class="{ readonly: readonly }">
            <view
              v-for="rate in rateOptions"
              :key="rate.value"
              :style="{
                backgroundColor:
                  rateLevel === rate.value ? rate.activeColor : '#f5f6f7',
                color: rateLevel === rate.value ? '#ffffff' : '#666666',
              }"
              class="rate-btn"
              @click="selectRate(rate.value)"
            >
              {{ rate.label }}
            </view>
          </view>
        </view>

        <!-- 回访内容 -->
        <view class="form-section">
          <view class="section-title">
            回访内容
            <text class="required">*</text>
          </view>
          <wd-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入回访内容描述"
            no-border
            custom-class="custom-textarea"
            :disabled="readonly"
          />
        </view>

        <!-- 问题记录 -->
        <view class="form-section">
          <view class="section-title">问题记录</view>
          <wd-input
            v-model="formData.problems"
            type="textarea"
            placeholder="请输入发现的问题记录"
            no-border
            custom-class="custom-textarea"
            :disabled="readonly"
          />
        </view>

        <!-- 后续维护计划 -->
        <view class="form-section">
          <view class="section-title">后续维护计划</view>
          <wd-input
            v-model="formData.plans"
            type="textarea"
            placeholder="请输入后续跟进或维护策略"
            no-border
            custom-class="custom-textarea"
            :disabled="readonly"
          />
        </view>
      </view>
    </view>

    <!-- Wot UI 时间选择器组件抽屉 -->
    <wd-datetime-picker
      v-model="pickerTimeValue"
      type="datetime"
      v-model:visible="datePickerVisible"
      @confirm="handleDateConfirm"
    />

    <!-- 底部提交操作按钮 -->
    <view class="fixed-bottom-box" v-if="!readonly">
      <wd-button
        type="primary"
        block
        size="large"
        class="submit-btn"
        @click="submitVisitForm"
        >提交回访</wd-button
      >
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { addVisitRecord, getVisitRecordDetail } from "@/api";
import { useDict } from "@/hooks/useDict";

const { dictMap } = useDict();

// 客户信息（从列表页传入）
const customerInfo = ref({
  id: "",
  customerId: "",
  contractId: "",
  name: "",
  contact: "",
  phone: "",
});

// 时间选择器控制
const datePickerVisible = ref(false);
const pickerTimeValue = ref(new Date().getTime());
const formattedVisitTime = ref("");

// 只读模式
const readonly = ref(false);

// 满意度颜色映射
const satisfactionColorMap = {
  VERY_SATISFIED: "#f97316",
  SATISFIED: "#fb923c",
  GENERAL: "#fca5a5",
  DISSATISFIED: "#ef4444",
};

// 从 WJ_SATISFACTION 字典动态生成满意度选项
const rateOptions = computed(() =>
  (dictMap["WJ_CUSTOMER_SATISFACTION"] || []).map((item) => ({
    ...item,
    activeColor: satisfactionColorMap[item.value] || "#999",
  })),
);

// 满意度评分当前选中值
const rateLevel = ref("very_satisfied");

// 文本框输入绑定
const formData = ref({
  content: "",
  problems: "",
  plans: "",
});

function goBack() {
  uni.navigateBack();
}

function openDatePicker() {
  datePickerVisible.value = true;
}

// 转换时间格式为 YYYY-MM-DD HH:mm:ss
function handleDateConfirm({ value }) {
  const d = new Date(value);
  const pad = (n) => (n < 10 ? "0" + n : n);
  formattedVisitTime.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function selectRate(val) {
  rateLevel.value = val;
}

async function submitVisitForm() {
  if (!formattedVisitTime.value) {
    uni.showToast({ title: "请选择回访时间", icon: "none" });
    return;
  }
  if (!formData.value.content.trim()) {
    uni.showToast({ title: "请填写回访内容", icon: "none" });
    return;
  }

  const payload = {
    customerId: customerInfo.value.customerId,
    contractId: customerInfo.value.contractId,
    visitTime: formattedVisitTime.value,
    satisfaction: rateLevel.value,
    content: formData.value.content.trim(),
    problems: formData.value.problems.trim() || undefined,
    plans: formData.value.plans.trim() || undefined,
  };

  try {
    await addVisitRecord(payload);
    uni.showToast({
      title: "提交成功",
      icon: "success",
      success: () => {
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      },
    });
  } catch (error) {
    console.error("提交回访失败", error);
    uni.showToast({ title: error?.message || "提交失败", icon: "none" });
  }
}

onLoad(async () => {
  const options = uni.$router.query || {};
  readonly.value = options.readonly === "true";

  if (readonly.value) {
    // 只读模式：加载回访详情
    try {
      const res = await getVisitRecordDetail({ id: options.id });
      const detail = res.record || {};
      // console.log(detail);

      customerInfo.value.id = detail.id || "";
      customerInfo.value.customerId = detail.customerId || "";
      customerInfo.value.contractId = detail.contractId || "";
      customerInfo.value.name = detail.customerName || "";
      customerInfo.value.contact = detail.contact || "";
      customerInfo.value.phone = detail.phone || "";
      formattedVisitTime.value = detail.visitTime || "";
      rateLevel.value = detail.satisfaction || "";
      formData.value.content = detail.content || "";
      formData.value.problems = detail.problems || "";
      formData.value.plans = detail.plans || "";
    } catch (error) {
      console.error("获取回访详情失败", error);
      uni.showToast({ title: "获取详情失败", icon: "none" });
    }
  } else {
    customerInfo.value.id = options.id || "";
    customerInfo.value.customerId = options.customerId || "";
    customerInfo.value.contractId = options.contractId || "";
    customerInfo.value.name = decodeURIComponent(options.name || "");
    customerInfo.value.contact = decodeURIComponent(options.contact || "");
    customerInfo.value.phone = options.phone || "";
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

.required {
  color: #ef4444;
  margin-left: 6rpx;
}

/* 客户基础信息卡片 */
.info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.01);

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    border-bottom: 1px solid #f5f6f7;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    .title-text {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 26rpx;
      .label {
        color: #666;
      }
      .val {
        color: #333;
        font-weight: 500;
      }
    }
  }
}

/* 日期选择单元格卡片 */
.select-cell-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.disabled {
    opacity: 0.7;
  }

  .left-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }
  .right-content {
    display: flex;
    align-items: center;
    gap: 8rpx;
    .time-text {
      font-size: 26rpx;
      color: #333;
    }
  }
}

/* 表单主体区块 */
.form-body-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.form-section {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
}

/* 满意度栅格单选按钮 */
.satisfaction-grid {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;

  &.readonly {
    pointer-events: none;
  }

  .rate-btn {
    flex: 1;
    text-align: center;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: bold;
    transition: all 0.2s ease;
  }
}

/* 覆盖 Wot UI 输入框组件文本域底色 */
:deep(.custom-textarea) {
  background-color: #f8f9fa !important;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  textarea {
    min-height: 140rpx;
    line-height: 1.5;
  }
}

/* 底部吸底 */
.fixed-bottom-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 99;
  .submit-btn {
    :deep(.wd-button) {
      background-color: #0066ff !important;
    }
  }
}
</style>
