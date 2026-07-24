<template>
  <view class="page">
    <wd-navbar title="填写结果" left-arrow @click-left="goBack" />

    <!-- 页面主体卡片 -->
    <view class="form-container">
      <!-- 外出结果选择 -->
      <view class="form-item">
        <view class="item-label required">外出结果选择</view>
        <view class="result-options">
          <view
            class="option-card"
            :class="{ 'active-fail': formData.result === 'fail' }"
            @tap="formData.result = 'fail'"
          >
            <view class="icon-wrapper fail-icon">✕</view>
            <text class="title">未成交</text>
            <text class="desc">未达成合作或未能推进至成交阶段</text>
          </view>
          <view
            class="option-card"
            :class="{ 'active-success': formData.result === 'success' }"
            @tap="formData.result = 'success'"
          >
            <view class="icon-wrapper success-icon">✓</view>
            <text class="title">已成交</text>
            <text class="desc">已达成合作，完成本次拜访目标</text>
          </view>
        </view>
      </view>

      <!-- 满意度 -->
      <view class="form-item">
        <view class="item-label required">满意度</view>
        <view class="satisfaction-options">
          <view
            v-for="item in satisfactionOptions"
            :key="item.value"
            class="satisfaction-btn"
            :class="{
              'satisfaction-btn-active': formData.satisfaction === item.value,
            }"
            @tap="formData.satisfaction = item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <!-- 沟通记录 -->
      <view class="form-item">
        <view class="item-label required">沟通记录</view>
        <textarea
          class="custom-textarea"
          v-model="formData.communicationLog"
          placeholder="请输入沟通记录"
          maxlength="500"
        />
      </view>

      <!-- 客户需求 -->
      <view class="form-item">
        <view class="item-label required">客户需求</view>
        <textarea
          class="custom-textarea"
          v-model="formData.clientDemands"
          placeholder="请输入客户需求"
          maxlength="500"
        />
      </view>

      <!-- 后续跟进计划 -->
      <view class="form-item">
        <view class="item-label required">跟进计划</view>
        <textarea
          class="custom-textarea"
          v-model="formData.followPlan"
          placeholder="请输入跟进计划"
          maxlength="500"
        />
      </view>

      <!-- 拜访图片 -->
      <view class="form-item">
        <view class="item-label">拜访图片</view>
        <ImgUpload v-model="visitImages" category="WJ_VISIT_IMG" :limit="9" />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="footer-bar">
      <button class="submit-btn" @tap="submitResult">提交结果</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useGlobalStore } from "../../store/global";
import { storeToRefs } from "pinia";
import { useDict } from "@/hooks/useDict";
import { outworkSubmitResult } from "@/api/outwork";
import ImgUpload from "@/components/ImgUpload.vue";
import { extractFileIdFromUrl } from "@/utils/tools";

const global = useGlobalStore();
const { systemInfo, userInfo } = storeToRefs(global);
const { dictMap, getDictLabel } = useDict();

// 满意度选项（从字典获取）
const satisfactionOptions = computed(
  () => dictMap["WJ_CUSTOMER_SATISFACTION"] || [],
);

const query = ref({});
const params = ref({});
const outworkId = ref("");

// 表单响应式数据
const formData = ref({
  result: "success", // 默认选中已成交：fail 或 success
  satisfaction: "",
  communicationLog: "", // 沟通记录
  clientDemands: "", // 客户需求
  intentLevel: "B", // 意向等级默认 B
  followPlan: "", // 后续跟进计划
});

// 意向等级配置项
const levelOptions = [
  { label: "A (高)", value: "A" },
  { label: "B (中)", value: "B" },
  { label: "C (低)", value: "C" },
];

// 拜访图片（ImgUpload 双向绑定）
const visitImages = ref("");

function goBack() {
  uni.navigateBack();
}

// 提交表单
async function submitResult() {
  // 基础表单验证
  if (!formData.value.result) {
    return uni.showToast({ title: "请选择外出结果", icon: "none" });
  }
  if (!formData.value.satisfaction) {
    return uni.showToast({ title: "请选择满意度", icon: "none" });
  }
  if (!formData.value.communicationLog.trim()) {
    return uni.showToast({ title: "请输入沟通记录", icon: "none" });
  }
  if (!formData.value.clientDemands.trim()) {
    return uni.showToast({ title: "请输入客户需求", icon: "none" });
  }
  if (!formData.value.intentLevel) {
    return uni.showToast({ title: "请选择意向等级", icon: "none" });
  }
  if (!formData.value.followPlan.trim()) {
    return uni.showToast({ title: "请输入跟进计划", icon: "none" });
  }

  // 提取图片文件ID
  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  };
  const visitAttachmentFileIdList = toArray(visitImages.value).map((url) =>
    extractFileIdFromUrl(url),
  );

  // 映射外出结果
  const outworkResultMap = {
    fail: "FAILED",
    success: "COMPLETED",
  };

  const submitData = {
    communicationRecord: formData.value.communicationLog,
    customerDemand: formData.value.clientDemands,
    followUpPlan: formData.value.followPlan,
    id: outworkId.value,
    intentLevel: formData.value.intentLevel,
    outworkResult: outworkResultMap[formData.value.result] || "COMPLETED",
    visitAttachmentFileIdList,
  };

  uni.showLoading({ title: "提交中..." });
  try {
    await outworkSubmitResult(submitData);
    uni.hideLoading();
    uni.showToast({ title: "提交成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err) {
    uni.hideLoading();
  }
}

onLoad(() => {
  query.value = uni.$router.query || {};
  params.value = uni.$router.params || {};
  if (query.value?.outworkId) {
    outworkId.value = query.value.outworkId;
  }
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  box-sizing: border-box;
  padding: 30rpx 30rpx 180rpx 30rpx;
}

/* 表单容器卡片 */
.form-container {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 标签样式与必填星号 */
.item-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: inline-block;
}

.required::after {
  content: "*";
  color: #ff4d4f;
  margin-left: 8rpx;
}

/* 外出结果选择卡片 */
.result-options {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.option-card {
  flex: 1;
  border: 2rpx solid #e2e2e2;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #ffffff;
  transition: all 0.2s ease;

  .icon-wrapper {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    margin-bottom: 20rpx;
  }

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .desc {
    font-size: 22rpx;
    color: #999999;
    line-height: 1.4;
  }
}

/* 未成交激活态 */
.active-fail {
  border-color: #999999;
  background-color: #fafafa;
  .fail-icon {
    background-color: #999999;
    color: #ffffff;
  }
}
.fail-icon {
  border: 2rpx solid #999999;
  color: #999999;
}

/* 已成交激活态 */
.active-success {
  border-color: #2f77ff;
  background-color: #eef4ff;
  .success-icon {
    background-color: #0062ff;
    color: #ffffff;
  }
  .title {
    color: #0062ff;
  }
  .desc {
    color: #0062ff;
  }
}
.success-icon {
  border: 2rpx solid #0062ff;
  color: #0062ff;
}

/* 满意度选择 */
.satisfaction-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.satisfaction-btn {
  flex: 1;
  min-width: 120rpx;
  height: 80rpx;
  background-color: #e8e8e8;
  color: #333333;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.2s ease;
}

.satisfaction-btn-active {
  background-color: #0062ff;
  color: #ffffff;
  font-weight: bold;
}

/* 自定义输入框 */
.custom-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

/* 意向等级按钮组 */
.level-options {
  display: flex;
  gap: 20rpx;
}

.level-btn {
  flex: 1;
  height: 80rpx;
  background-color: #e8e8e8;
  color: #333333;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.2s ease;
}

.level-btn-active {
  background-color: #0062ff;
  color: #ffffff;
  font-weight: bold;
}

/* 底部固定按钮 */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f7f8fa;
  padding: 30rpx;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  z-index: 99;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #0062ff;
  color: #ffffff;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &:active {
    opacity: 0.8;
  }
}

/* 拜访图片的 ImgUpload 容器间距 */
:deep(.wd-upload) {
  margin-top: 0;
}
</style>
