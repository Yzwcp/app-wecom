<template>
  <view class="page">
    <view class="content-container">
      <wd-form>
        <!-- 表单卡片包裹器 -->
        <view class="form-card">
          <wd-cell-group>
            <!-- 材料名称 -->
            <view class="custom-form-item border-bottom">
              <view class="custom-label required">材料名称</view>
              <view class="custom-value">
                <wd-input
                  clearable
                  v-model="model.materialName"
                  placeholder="请输入材料名称"
                  :no-border="true"
                />
              </view>
            </view>

            <!-- 数量 -->
            <view class="custom-form-item border-bottom">
              <view class="custom-label required">数量</view>
              <view class="custom-value">
                <wd-input
                  type="number"
                  clearable
                  v-model="model.quantity"
                  placeholder="请输入数量"
                  :no-border="true"
                />
              </view>
            </view>

            <!-- 单位 -->
            <view class="custom-form-item border-bottom">
              <view class="custom-label required">单位</view>
              <view class="custom-value">
                <wd-input
                  clearable
                  v-model="model.unit"
                  placeholder="请输入单位，如：米、个"
                  :no-border="true"
                />
              </view>
            </view>

            <!-- 描述 -->
            <view class="custom-form-item vertical">
              <view class="custom-label">描述</view>
              <view class="custom-value textarea-box">
                <wd-textarea
                  v-model="model.remark"
                  placeholder="请输入材料明细描述或备注信息"
                  :maxlength="200"
                  show-word-limit
                  clearable
                  :no-border="true"
                />
              </view>
            </view>
          </wd-cell-group>
        </view>

        <!-- 底部按钮区域配合设计稿风格 -->
        <view class="footer-btn-group">
          <wd-button type="primary" size="large" block @click="handleSubmit"
            >提交</wd-button
          >
        </view>
      </wd-form>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const pageMode = ref("add");
const editIndex = ref(-1);

const model = reactive({
  materialName: "",
  quantity: "",
  unit: "",
  remark: "",
});

function goBack() {
  uni.navigateBack();
}

function handleSubmit() {
  // 手动验证
  if (!model.materialName) {
    uni.showToast({ title: "请填写材料名称", icon: "none" });
    return;
  }
  if (!model.quantity) {
    uni.showToast({ title: "请填写数量", icon: "none" });
    return;
  }
  if (Number(model.quantity) <= 0) {
    uni.showToast({ title: "数量必须大于0", icon: "none" });
    return;
  }
  if (!model.unit) {
    uni.showToast({ title: "请填写单位", icon: "none" });
    return;
  }

  const payload = {
    action: pageMode.value === "add" ? "add" : "edit",
    index: editIndex.value,
    data: {
      ...model,
      id: pageMode.value === "add" ? String(Date.now()) : "",
      quantity: Number(model.quantity),
    },
  };

  uni.showToast({
    title: pageMode.value === "add" ? "添加成功" : "修改成功",
    icon: "success",
  });

  setTimeout(() => {
    uni.$router.back({ delta: 1, params: payload });
  }, 1000);
}

onLoad(() => {
  const params = uni.$router.params;
  if (params?.mode) pageMode.value = params.mode;
  if (params?.index !== undefined) editIndex.value = Number(params.index);
  if (params?.mode === "edit" && params?.data) {
    Object.assign(model, params.data);
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

.content-container {
  padding: 24rpx;
}

/* 表单卡片化，契合材料列表卡片的设计语言 */
.form-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  padding: 0 32rpx;
}

/* 手写 Flex 容器保证 Label 100% 出现且完美左对齐 */
.custom-form-item {
  display: flex;
  align-items: center;
  min-height: 112rpx;
  box-sizing: border-box;

  .custom-label {
    width: 160rpx;
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    position: relative;
    padding-left: 16rpx;

    &.required::before {
      content: "*";
      color: #ee0a24;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 28rpx;
    }
  }

  .custom-value {
    flex: 1;

    /* 样式穿透：清除 Wot UI 默认多余边距，让其与手写容器无缝融合 */
    :deep(.wd-input),
    :deep(.wd-textarea) {
      padding: 0;
      background-color: transparent;
    }

    /* 修正错误校验提示信息的定位 */
    :deep(.wd-input__error-message) {
      position: relative;
      padding-top: 4rpx;
    }
  }

  /* 描述文本域（变为上下排版） */
  &.vertical {
    flex-direction: column;
    align-items: flex-start;
    padding: 32rpx 0;

    .custom-label {
      margin-bottom: 20rpx;
    }

    .textarea-box {
      width: 100%;
    }
  }
}

.border-bottom {
  border-bottom: 1rpx solid #f2f3f5;
}

/* 底部吸底按钮区域：风格完全同步列表页 */
.footer-btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: #ffffff;
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom)) 30rpx;
  border-top: 1px solid #f2f3f5;

  :deep(.wd-button) {
    height: 88rpx;
    border-radius: 44rpx;
    background-color: #0066ff !important;
    border-color: #0066ff !important;
    font-size: 30rpx;
    font-weight: bold;
  }
}
</style>
