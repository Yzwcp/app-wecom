<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="客户回访列表"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <!-- 搜索栏 -->
    <view class="search-box">
      <wd-search
        v-model="searchKey"
        placeholder="搜索客户名称或地址"
        hide-cancel
        @search="handleSearch"
        @clear="handleSearch"
      />
    </view>

    <!-- 状态过滤 Tab -->
    <view class="tabs-box">
      <wd-tabs
        v-model="activeTab"
        color="#0066ff"
        inactive-color="#666"
        @change="handleTabChange"
      >
        <wd-tab title="全部" name="all"></wd-tab>
        <wd-tab title="待回访" name="pending"></wd-tab>
        <wd-tab title="已完成" name="completed"></wd-tab>
      </wd-tabs>
    </view>

    <!-- 列表主体 -->
    <view class="content-container">
      <view v-for="item in filteredList" :key="item.id" class="visit-card">
        <!-- 卡片头部标题与状态 -->
        <view class="card-header">
          <view class="title-left">
            <view class="store-icon-box">
              <wd-icon name="home" size="16px" color="#fff" />
            </view>
            <text class="customer-name">{{ item.customerName }}</text>
          </view>
          <text
            :class="[
              'status-text',
              item.status === '已完成' ? 'text-blue' : 'text-gray',
            ]"
          >
            {{ item.status }}
          </text>
        </view>

        <!-- 卡片明细信息 -->
        <view class="card-body">
          <view class="info-item">
            <text class="label">合同编号</text>
            <text class="val">{{ item.contractNo }}</text>
          </view>
          <view class="info-item">
            <text class="label">完成时间</text>
            <text class="val">{{ item.finishTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">负责人</text>
            <text class="val">{{ item.charger }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="card-footer">
          <wd-button
            type="secondary"
            plain
            block
            class="action-btn"
            @click="goToForm(item)"
            >去回访</wd-button
          >
        </view>
      </view>

      <!-- 空状态兜底 -->
      <view v-if="filteredList.length === 0" class="empty-box">
        <wd-icon name="comment-circle" size="48px" color="#ccc" />
        <text class="empty-text">没有找到相关的回访任务</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const searchKey = ref("");
const activeTab = ref("all");

// 模拟回访列表数据
const visitList = ref([
  {
    id: 1,
    customerName: "星际网吧",
    contractNo: "HT-20260627-0001",
    finishTime: "06-27 09:00 ~ 18:00",
    charger: "李先生",
    status: "已完成",
  },
  {
    id: 2,
    customerName: "星际网吧",
    contractNo: "HT-20260627-0001",
    finishTime: "06-27 09:00 ~ 18:00",
    charger: "李先生",
    status: "已完成",
  },
]);

// 联动过滤筛选
const filteredList = computed(() => {
  return visitList.value.filter((item) => {
    const matchesSearch =
      item.customerName.includes(searchKey.value) ||
      item.contractNo.includes(searchKey.value);
    if (activeTab.value === "all") return matchesSearch;
    if (activeTab.value === "pending")
      return matchesSearch && item.status === "待回访";
    if (activeTab.value === "completed")
      return matchesSearch && item.status === "已完成";
    return matchesSearch;
  });
});

function goBack() {
  uni.navigateBack();
}

function handleTabChange() {}
function handleSearch() {}

// 点击去回访跳转
function goToForm(item) {
  uni.navigateTo({
    url: `/pages/visit/commit?id=${item.id}&name=${encodeURIComponent(item.customerName)}`,
  });
}
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}
.search-box {
  background-color: #ffffff;
  padding: 16rpx 24rpx 8rpx;
}
.tabs-box {
  background-color: #ffffff;
  border-bottom: 1px solid #f2f3f5;
}
.content-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 卡片样式定制 */
.visit-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f5f6f7;
    padding-bottom: 24rpx;
    margin-bottom: 24rpx;

    .title-left {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .store-icon-box {
        width: 44rpx;
        height: 44rpx;
        background-color: #0066ff;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .customer-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .status-text {
      font-size: 26rpx;
      font-weight: 500;
      &.text-blue {
        color: #0066ff;
      }
      &.text-gray {
        color: #999;
      }
    }
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 28rpx;

  .info-item {
    display: flex;
    justify-content: space-between;
    font-size: 28rpx;
    .label {
      color: #666;
    }
    .val {
      color: #333;
      font-weight: 500;
    }
  }
}

.card-footer {
  .action-btn {
    :deep(.wd-button) {
      border-color: #0066ff !important;
      color: #0066ff !important;
      border-radius: 12rpx;
      height: 80rpx;
      font-size: 28rpx;
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
