<template>
  <view class="page">
    <view class="content">
      <!-- 按 6 类分组渲染全部字段，均为可选；分组可折叠，默认收起 -->
      <view v-for="type in INFO_TYPES" :key="type.value" class="info-card">
        <view class="card-header" @click="toggleGroup(type.value)">
          <text class="card-title">{{ type.label }}</text>
          <wd-icon
            :name="expanded[type.value] ? 'arrow-up' : 'arrow-down'"
            size="16px"
            color="#999"
          />
        </view>

        <view v-show="expanded[type.value]" class="card-body">
          <view v-for="f in type.fields" :key="f.key" class="field-block">
            <view class="field-lbl">{{ f.label }}</view>
            <textarea
              v-if="f.type === 'textarea'"
              v-model="form[type.value][f.key]"
              :placeholder="`请输入${f.label}`"
              placeholder-style="color: #c8c9cc; font-size: 28rpx;"
              class="field-textarea"
            />
            <input
              v-else
              v-model="form[type.value][f.key]"
              :placeholder="`请输入${f.label}`"
              placeholder-class="placeholder-style"
              class="field-input"
            />
          </view>
        </view>
      </view>

      <view class="safe-bottom"></view>
    </view>

    <!-- 底部固定保存栏 -->
    <view class="footer-actions">
      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? "保存中..." : "保存" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getCustomerExtraInfoAll,
  saveCustomerExtraInfo,
} from "@/api/customerExtraInfo";
import { INFO_TYPES, getByPath, setByPath } from "./config";

const customerId = ref("");
const submitting = ref(false);

// 分组展开状态，默认全部收起
const expanded = ref({});

function toggleGroup(typeValue) {
  expanded.value[typeValue] = !expanded.value[typeValue];
}

// 扁平表单：form[类型值][字段路径]，各类间重名字段天然隔离
const form = ref(initForm());

function initForm() {
  const flat = {};
  for (const t of INFO_TYPES) {
    flat[t.value] = {};
    for (const f of t.fields) flat[t.value][f.key] = "";
  }
  return flat;
}

// infoContent 可能是 JSON 字符串或对象
function parseContent(content) {
  if (!content) return {};
  if (typeof content === "object") return content;
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// 回填：整表查询该客户全部类型数据并拍平到对应分组
async function loadData() {
  if (!customerId.value) return;
  try {
    const res = await getCustomerExtraInfoAll({
      customerId: customerId.value,
    });
    const list = Array.isArray(res) ? res : res?.itemList || res?.records || [];
    const flat = initForm();
    for (const item of list) {
      const group = flat[item.infoType];
      if (!group) continue;
      const content = parseContent(item.infoContent);
      const fields =
        INFO_TYPES.find((t) => t.value === item.infoType)?.fields || [];
      for (const f of fields) {
        group[f.key] = getByPath(content, f.key) ?? "";
      }
    }
    form.value = flat;
  } catch (error) {
    console.error("获取客户信息失败", error);
    uni.showToast({ title: "获取客户信息失败", icon: "none" });
  }
}

onLoad(() => {
  const query = uni.$router.query || {};
  customerId.value = query.customerId || "";
  loadData();
});

async function handleSubmit() {
  // 逐组还原嵌套对象，空字段剔除；整组为空则跳过
  const itemList = [];
  for (const t of INFO_TYPES) {
    const content = {};
    for (const f of t.fields) {
      const v = form.value[t.value]?.[f.key];
      if (v !== undefined && v !== "") setByPath(content, f.key, v);
    }
    if (Object.keys(content).length > 0) {
      itemList.push({
        infoType: t.value,
        infoContent: JSON.stringify(content),
      });
    }
  }

  submitting.value = true;
  try {
    await saveCustomerExtraInfo({
      customerId: customerId.value,
      itemList,
    });
    uni.showToast({ title: "保存成功", icon: "success" });
  } catch (error) {
    console.error("保存客户信息失败", error);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f7f9fc;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.content {
  padding: 24rpx;
  box-sizing: border-box;
}

.info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 0 28rpx;
  margin-bottom: 24rpx;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 0;
  }

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #1a1a1a;
  }

  .card-body {
    border-top: 1rpx solid #f0f3f7;
    padding: 28rpx 0;
  }
}

.field-block {
  margin-bottom: 28rpx;
  &:last-child {
    margin-bottom: 0;
  }
  .field-lbl {
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 14rpx;
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

.safe-bottom {
  height: 40rpx;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);

  .btn-submit {
    height: 88rpx;
    line-height: 88rpx;
    font-size: 30rpx;
    border-radius: 16rpx;
    margin: 0;
    background-color: #2979ff;
    color: #ffffff;
    &::after {
      border: none;
    }
    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
