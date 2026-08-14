<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <wd-navbar
      title="消息中心"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    >
      <template #right>
        <view
          v-if="unreadTotal > 0"
          class="read-all-btn"
          @click="handleMarkAllRead"
        >
          全部已读
        </view>
      </template>
    </wd-navbar>

    <!-- 顶部全部/未读分类 Tab 切换 -->
    <view class="tabs-box">
      <wd-tabs
        v-model="activeTab"
        color="#0066ff"
        inactive-color="#999"
        @change="handleTabChange"
      >
        <wd-tab title="全部" name="all"></wd-tab>
        <wd-tab
          title="未读"
          name="unread"
          :badge-props="{ value: unreadTotal, max: 99, type: 'danger' }"
        ></wd-tab>
      </wd-tabs>
    </view>

    <!-- 消息列表区域 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      :lower-threshold="100"
      @scrolltolower="handleScrollToLower"
    >
      <view class="content-container">
        <view
          v-for="msg in messageList"
          :key="msg.id"
          class="message-card"
          @click="handleMessageClick(msg)"
        >
          <!-- 左侧类型专属图标 -->
          <view class="icon-wrap">
            <view v-if="msg.isRead === 0" class="unread-dot"></view>
            <view class="icon-circle" :class="msg.typeClass || 'bg-blue'">
              <wd-icon
                :name="msg.iconName || 'notification'"
                size="24px"
                color="#fff"
              />
            </view>
          </view>

          <!-- 右侧消息主要文本内容 -->
          <view class="msg-body">
            <view class="msg-title">{{ msg.title }}</view>
            <view class="msg-desc">{{ msg.content || msg.description }}</view>
            <view class="msg-time">{{ msg.createTime || msg.time }}</view>
          </view>
        </view>

        <!-- 加载更多状态 -->
        <view v-if="messageList.length > 0" class="load-more-box">
          <text v-if="loadMoreStatus === 'loading'" class="load-more-text"
            >加载中...</text
          >
          <text v-if="loadMoreStatus === 'nomore'" class="load-more-text"
            >没有更多了</text
          >
        </view>

        <!-- 空状态兜底展示 -->
        <view v-if="messageList.length === 0 && !loading" class="empty-wrap">
          <wd-icon name="comment-circle" size="48px" color="#ccc" />
          <text class="empty-text">暂无相关消息</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getMessagePage, getUnreadCount, markAllAsRead } from "@/api";

// 当前选中的标签：'all' 全部，'unread' 未读
const activeTab = ref("all");

// 分页状态
const messageList = ref([]);
const current = ref(1);
const size = ref(10);
const pages = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref("");

// 未读消息总数（用于红点+全部已读按钮显隐）
const unreadTotal = ref(0);

// 根据后端数据构建前端展示字段
function formatMessage(item) {
  return {
    ...item,
    iconName: item.iconName || getIconByType(item.type),
    typeClass: item.typeClass || getTypeClassByType(item.type),
    createTime: item.createTime || item.time,
    content: item.content || item.description,
  };
}

// 根据消息类型映射图标
function getIconByType(type) {
  const map = {
    task: "notification",
    audit: "text",
    visit: "check",
    system: "sound",
  };
  return map[type] || "notification";
}

// 根据消息类型映射背景色
function getTypeClassByType(type) {
  const map = {
    task: "bg-blue",
    audit: "bg-orange",
    visit: "bg-green",
    system: "bg-light-blue",
  };
  return map[type] || "bg-blue";
}

// 获取分页参数中的 isRead 值
function getIsReadParam() {
  if (activeTab.value === "unread") return 0;
  return undefined; // 全部：不传参
}

// 获取消息列表
async function fetchList(isReset = false) {
  if (loading.value) return;
  loading.value = true;

  if (isReset) {
    current.value = 1;
  }

  const params = {
    current: current.value,
    size: size.value,
  };
  const isRead = getIsReadParam();
  if (isRead !== undefined) {
    params.isRead = isRead;
  }

  try {
    const res = await getMessagePage(params);
    const records = (res.records || []).map(formatMessage);

    if (isReset || current.value === 1) {
      messageList.value = records;
    } else {
      messageList.value = [...messageList.value, ...records];
    }

    pages.value = res.pages || 0;
    current.value = res.current || current.value;
    loadMoreStatus.value = current.value >= pages.value ? "nomore" : "";
  } catch (error) {
    console.error("获取消息列表失败", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 获取未读消息数
async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount();
    unreadTotal.value = res || 0;
  } catch (error) {
    console.error("获取未读数失败", error);
  }
}

// 下拉刷新
function handleRefresh() {
  isRefreshing.value = true;
  fetchList(true);
  fetchUnreadCount();
}

// 触底加载更多
function handleScrollToLower() {
  if (loading.value || loadMoreStatus.value === "nomore") return;
  loadMoreStatus.value = "loading";
  current.value++;
  fetchList();
}

// Tab 切换
function handleTabChange({ name }) {
  activeTab.value = name;
  fetchList(true);
}

// 点击消息卡片跳转详情
function handleMessageClick(msg) {
  // 记录原始已读状态，用于详情页判断是否需要调用已读接口
  const originIsRead = msg.isRead;

  // 点击时立即本地标记为已读，避免返回列表时红点残留
  if (msg.isRead === 0) {
    msg.isRead = 1;
    if (unreadTotal.value > 0) {
      unreadTotal.value -= 1;
    }
  }
  uni.$router.push({
    url: "/pages/message/detail",
    query: {
      id: msg.id,
      title: msg.title,
      content: msg.content || msg.description,
      createTime: msg.createTime || msg.time,
      type: msg.type,
      isRead: originIsRead,
    },
  });
}

// 全部标记已读
async function handleMarkAllRead() {
  try {
    await markAllAsRead();
    messageList.value.forEach((msg) => {
      msg.isRead = 1;
    });
    unreadTotal.value = 0;
    uni.showToast({
      title: "已全部标记已读",
      icon: "success",
    });
  } catch (error) {
    console.error("全部标记已读失败", error);
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  }
}

function goBack() {
  uni.navigateBack();
}

onMounted(() => {
  fetchList(true);
  fetchUnreadCount();
});

// 从详情页返回时刷新列表和未读数，确保状态同步
onShow(() => {
  // fetchList(true);
  // fetchUnreadCount();
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 全部已读按钮 */
.read-all-btn {
  font-size: 26rpx;
  color: #0066ff;
  padding: 0 16rpx;
}

/* 顶部 Tab 容器定制 */
.tabs-box {
  background-color: #ffffff;
  border-bottom: 1px solid #f2f3f5;

  :deep(.wd-tabs__nav) {
    padding: 0 40rpx;
  }
}

/* 滚动容器 */
.content-scroll {
  height: calc(100vh - 88rpx - 88rpx - env(safe-area-inset-top));
}

.content-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 消息卡片基础样式 */
.message-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.015);
  transition: all 0.2s ease;
  position: relative;

  &:active {
    background-color: #f5f6f7;
  }
}

/* 左侧图标与外层 Badge 包裹 */
.icon-wrap {
  margin-right: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ee0a24;
  border: 2px solid #ffffff;
  z-index: 1;
}

.icon-circle {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-blue {
    background-color: #3b82f6;
  }
  &.bg-orange {
    background-color: #f97316;
  }
  &.bg-green {
    background-color: #10b981;
  }
  &.bg-light-blue {
    background-color: #2563eb;
  }
}

/* 右侧文本排版 */
.msg-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .msg-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .msg-desc {
    font-size: 26rpx;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .msg-time {
    font-size: 24rpx;
    color: #999999;
  }
}

/* 加载更多 */
.load-more-box {
  text-align: center;
  padding: 24rpx 0;

  .load-more-text {
    font-size: 24rpx;
    color: #999;
  }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 16rpx;

  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
