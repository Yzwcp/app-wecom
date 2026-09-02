<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <view v-for="item in recordList" :key="item.id" class="record-card">
        <view class="record-header">
          <text class="record-type">{{ getInfoTypeLabel(item.infoType) }}</text>
          <text class="record-time">{{ item.createTime || "" }}</text>
        </view>
        <view class="record-operator"
          >操作人：{{ item.operatorName || "-" }}</view
        >
        <view v-for="f in getFields(item)" :key="f.key" class="record-row">
          <text class="label">{{ f.label }}</text>
          <text class="value">{{
            getByPath(parseContent(item), f.key) || "-"
          }}</text>
        </view>
      </view>

      <view v-if="!loading && recordList.length === 0" class="empty-box">
        <wd-icon name="file" size="48px" color="#ccc" />
        <text class="empty-text">暂无变更记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCustomerExtraInfoRecordList } from "@/api/customerExtraInfo";
import { getInfoType, getInfoTypeLabel, getByPath } from "./config";

const customerId = ref("");
const infoType = ref("");
const recordList = ref([]);
const loading = ref(false);

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
  loading.value = true;
  try {
    const params = { customerId: customerId.value };
    if (infoType.value) params.infoType = infoType.value;
    const res = await getCustomerExtraInfoRecordList(params);
    recordList.value = Array.isArray(res) ? res : res?.records || [];
  } catch (error) {
    console.error("获取变更记录失败", error);
  } finally {
    loading.value = false;
  }
}

onLoad(() => {
  const query = uni.$router.query || {};
  customerId.value = query.customerId || "";
  infoType.value = query.infoType || "";
  fetchList();
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

.record-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .record-type {
      font-size: 28rpx;
      font-weight: bold;
      color: #2979ff;
    }
    .record-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .record-operator {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .record-row {
    display: flex;
    margin-bottom: 14rpx;

    .label {
      width: 200rpx;
      flex-shrink: 0;
      font-size: 26rpx;
      color: #999999;
    }
    .value {
      flex: 1;
      font-size: 26rpx;
      color: #333333;
      word-break: break-all;
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
</style>
