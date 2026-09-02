<template>
  <view class="page">
    <view class="container">
      <view class="card">
        <view class="card-title">
          <text class="title-text">{{ isEdit ? "编辑" : "新增" }}客户信息</text>
        </view>

        <!-- 信息类型（编辑时不可改） -->
        <view class="field-block">
          <view class="field-lbl required">信息类型</view>
          <view
            :class="['type-select-box', { disabled: isEdit }]"
            @click="openTypePicker"
          >
            <text :class="['dt-txt', infoType ? 'text-black' : 'text-gray']">
              {{ typeConfig.label || "请选择信息类型" }}
            </text>
            <wd-icon name="arrow-right" size="16px" color="#999" />
          </view>
        </view>

        <view v-for="f in typeConfig.fields" :key="f.key" class="field-block">
          <view class="field-lbl">{{ f.label }}</view>
          <textarea
            v-if="f.type === 'textarea'"
            v-model="form[f.key]"
            :placeholder="`请输入${f.label}`"
            placeholder-style="color: #c8c9cc; font-size: 28rpx;"
            class="field-textarea"
          />
          <input
            v-else
            v-model="form[f.key]"
            :placeholder="`请输入${f.label}`"
            placeholder-class="placeholder-style"
            class="field-input"
          />
        </view>
      </view>
    </view>

    <!-- 底部固定提交栏 -->
    <view class="footer-actions">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? "提交中..." : "保存" }}
      </button>
    </view>

    <!-- 类型选择器 -->
    <wd-action-sheet
      v-model="showTypePicker"
      :actions="typeActions"
      @select="onTypeSelect"
    />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getCustomerExtraInfoDetail,
  saveCustomerExtraInfo,
} from "@/api/customerExtraInfo";
import { INFO_TYPES, getByPath, setByPath } from "./config";

const id = ref("");
const customerId = ref("");
const infoType = ref("");
const isEdit = ref(false);
const submitting = ref(false);
const showTypePicker = ref(false);

// 扁平表单：key 为 "a.b" 路径
const form = ref({});

const typeConfig = computed(
  () => INFO_TYPES.find((t) => t.value === infoType.value) || { fields: [] },
);

const typeActions = INFO_TYPES.map((t) => ({ name: t.label, value: t.value }));

function openTypePicker() {
  if (isEdit.value) return;
  showTypePicker.value = true;
}

function onTypeSelect({ item }) {
  infoType.value = item.value;
  initForm();
}

// 按当前类型初始化空表单
function initForm() {
  const flat = {};
  for (const f of typeConfig.value.fields) flat[f.key] = "";
  form.value = flat;
}

// 编辑回显：加载详情并拍平到 form
async function loadDetail() {
  try {
    const res = await getCustomerExtraInfoDetail({
      customerId: customerId.value,
      infoType: infoType.value,
    });
    if (res?.info) infoType.value = res.info.infoType;
    let content = res?.info.infoContent;
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch {
        content = {};
      }
    }
    const flat = {};
    for (const f of typeConfig.value.fields) {
      flat[f.key] = getByPath(content || {}, f.key) ?? "";
    }
    form.value = flat;
  } catch (error) {
    console.error("获取客户信息详情失败", error);
    uni.showToast({ title: "获取详情失败", icon: "none" });
  }
}

onLoad(() => {
  const query = uni.$router.query || {};
  customerId.value = query.customerId || "";
  console.log(customerId.value);
  if (query.infoType) infoType.value = query.infoType;
  initForm();

  if (query.id) {
    id.value = query.id;
    isEdit.value = true;
    loadDetail();
  }
});

function handleCancel() {
  uni.navigateBack();
}

async function handleSubmit() {
  if (!infoType.value) {
    return uni.showToast({ title: "请选择信息类型", icon: "none" });
  }

  // 还原为嵌套对象结构
  const content = {};
  for (const f of typeConfig.value.fields) {
    const v = form.value[f.key];
    if (v !== undefined && v !== "") setByPath(content, f.key, v);
  }

  submitting.value = true;
  try {
    await saveCustomerExtraInfo({
      id: id.value || undefined,
      customerId: customerId.value,
      infoType: infoType.value,
      infoContent: JSON.stringify(content),
    });
    uni.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (error) {
    console.error("保存客户信息失败", error);
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
  box-sizing: border-box;
}

.container {
  padding: 24rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.card-title {
  margin-bottom: 30rpx;
  .title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #1a1a1a;
  }
}

.field-block {
  margin-bottom: 28rpx;
  .field-lbl {
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 14rpx;
    &.required::before {
      content: "*";
      color: #ee0a24;
      margin-right: 4rpx;
    }
  }
}

.type-select-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  min-height: 48rpx;

  &.disabled {
    opacity: 0.6;
  }
  .text-black {
    color: #333;
    font-size: 28rpx;
  }
  .text-gray {
    color: #999;
    font-size: 28rpx;
  }
}

.field-input {
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  min-height: 48rpx;
}

.field-textarea {
  width: 100%;
  height: 140rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.placeholder-style {
  color: #c8c9cc;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 30rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 30rpx;
    border-radius: 16rpx;
    margin: 0;
    &::after {
      border: none;
    }
  }

  .btn-cancel {
    background-color: #ffffff;
    color: #2979ff;
    border: 2rpx solid #2979ff;
  }
  .btn-submit {
    background-color: #2979ff;
    color: #ffffff;
  }
  .btn-submit[disabled] {
    opacity: 0.6;
  }
}
</style>
