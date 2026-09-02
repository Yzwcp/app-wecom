<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <view v-for="item in infoList" :key="item.id" class="info-card">
        <!-- 类型标签 -->
        <view class="type-tag">{{ getInfoTypeLabel(item.infoType) }}</view>

        <view v-for="f in getFields(item)" :key="f.key" class="info-row">
          <text class="label">{{ f.label }}</text>
          <text class="value">{{
            getByPath(parseContent(item), f.key) || "-"
          }}</text>
        </view>

        <view class="card-actions">
          <text class="action-link" @click="goEdit(item)">编辑</text>
          <text class="action-link danger" @click="handleDelete(item)"
            >删除</text
          >
          <text class="action-link" @click="goRecord(item)">变更记录</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && infoList.length === 0" class="empty-box">
        <wd-icon name="file" size="48px" color="#ccc" />
        <text class="empty-text">暂无客户信息</text>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 右下角悬浮新增按钮 -->
    <view class="fab-add" @click="goAdd">
      <text class="fab-plus">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  getCustomerExtraInfoList,
  deleteCustomerExtraInfo,
} from "@/api/customerExtraInfo";
import { getInfoType, getInfoTypeLabel, getByPath } from "./config";

const customerId = ref("");
const infoList = ref([]);
const loading = ref(false);

// infoContent 可能是 JSON 字符串或对象
function parseContent(item) {
  const c = item?.infoContent;
  if (!c) return {};
  if (typeof c === "object") return c;
  try {
    return JSON.parse(c);
  } catch {
    return {};
  }
}

// 按记录的类型取字段配置
function getFields(item) {
  return getInfoType(item.infoType)?.fields || [];
}

async function fetchList() {
  if (!customerId.value) return;
  loading.value = true;
  try {
    const res = await getCustomerExtraInfoList({
      customerId: customerId.value,
    });
    infoList.value = Array.isArray(res) ? res : res?.records || [];
  } catch (error) {
    console.error("获取客户信息失败", error);
  } finally {
    loading.value = false;
  }
}

function goAdd() {
  uni.$router.push({
    url: "/pages/customer/extraInfo/infoForm",
    query: { customerId: customerId.value },
  });
}

function goEdit(item) {
  uni.$router.push({
    url: "/pages/customer/extraInfo/infoForm",
    query: {
      id: item.id,
      customerId: customerId.value,
      infoType: item.infoType,
    },
  });
}

function goRecord(item) {
  uni.$router.push({
    url: "/pages/customer/extraInfo/infoRecord",
    query: {
      customerId: customerId.value,
      infoType: item.infoType,
    },
  });
}

function handleDelete(item) {
  uni.showModal({
    title: "删除确认",
    content: `确定删除该条「${getInfoTypeLabel(item.infoType)}」信息吗？`,
    confirmText: "删除",
    confirmColor: "#ee0a24",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await deleteCustomerExtraInfo({ id: item.id });
        uni.showToast({ title: "删除成功", icon: "success" });
        fetchList();
      } catch (error) {
        console.error("删除客户信息失败", error);
      }
    },
  });
}

// 首次进入 + 从表单页返回时刷新
onShow(() => {
  const query = uni.$router.query;
  if (query?.customerId) customerId.value = query.customerId;
  if (customerId.value) fetchList();
});
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  background-color: #f7f9fc;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

.info-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;

  .type-tag {
    display: inline-block;
    font-size: 24rpx;
    color: #2979ff;
    background-color: #eaf2ff;
    border-radius: 8rpx;
    padding: 6rpx 16rpx;
    margin-bottom: 20rpx;
  }

  .info-row {
    display: flex;
    margin-bottom: 18rpx;

    .label {
      width: 200rpx;
      flex-shrink: 0;
      font-size: 26rpx;
      color: #999999;
    }
    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
      word-break: break-all;
    }
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 36rpx;
    border-top: 1rpx solid #f0f3f7;
    padding-top: 22rpx;
    margin-top: 8rpx;

    .action-link {
      font-size: 26rpx;
      color: #2979ff;
      &.danger {
        color: #ee0a24;
      }
    }
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

.safe-bottom {
  height: 160rpx;
}

/* 右下角悬浮新增按钮 */
.fab-add {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #2979ff;
  box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;

  &:active {
    opacity: 0.85;
  }

  .fab-plus {
    color: #ffffff;
    font-size: 56rpx;
    line-height: 1;
    margin-top: -6rpx;
  }
}
</style>
