<template>
  <view class="page">
    <!-- 顶部蓝色渐变背景与用户信息区 -->
    <view class="header-section">
      <!-- 用户资料卡片 -->
      <view class="user-info-box">
        <image
          class="avatar"
          src="https://img.yzcdn.cn/vant/cat.jpeg"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <text class="username">{{ userInfo.name }}</text>
          <text class="role">{{ userInfo.positionName }}</text>
          <text class="date">{{ currentDateText }} {{ greeting }}</text>
        </view>
        <view class="clear-cache-btn" @click="handleClearCache">
          <text class="clear-text">清除缓存</text>
        </view>
      </view>
    </view>

    <!-- 内容主体区域（向上负外边距实现叠加效果） -->
    <view class="content-container">
      <!-- 常用功能模块 -->
      <view v-if="commonFeatures.length" class="card-panel">
        <view class="panel-title">常用功能</view>
        <view class="grid-two-columns">
          <view
            v-for="item in commonFeatures"
            :key="item.path"
            class="feature-item"
            :class="item.bg"
            @click="go(item.path)"
          >
            <view class="icon-wrapper" :class="item.iconBox">
              <image
                :src="item.icon"
                style="width: 100%; height: 100%"
                mode="scaleToFill"
              />
            </view>
            <view class="info-wrapper">
              <view class="item-label" :class="item.textColor">
                {{ item.label }}
              </view>
              <view class="item-value" :class="item.textColor">
                <wd-count-to
                  :end-val="workData[item.countKey] || 0"
                  :color="item.countColor"
                  font-size="28px"
                  bold
                />
                <text class="unit">{{ item.unit }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷操作模块 -->
      <view v-if="shortcutFeatures.length" class="shortcut-section">
        <view class="panel-title">快捷操作</view>
        <view class="grid-two-columns">
          <view
            v-for="item in shortcutFeatures"
            :key="item.path"
            class="shortcut-card"
            :class="item.bg"
            @click="go(item.path)"
          >
            <image
              :src="item.icon"
              style="width: 80rpx; height: 80rpx"
              mode="scaleToFill"
            />
            <text class="shortcut-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { workHome, logout } from "@/api/auth";
import { useGlobalStore } from "@/store/global";
import { toRefs, ref, computed } from "vue";
const globalState = useGlobalStore();
const { userInfo, menuList } = toRefs(globalState);

const workData = ref({});

// 当前日期与星期
const currentDateText = computed(() => {
  const now = new Date();
  const pad = (n) => (n < 10 ? "0" + n : n);
  const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 周${weekMap[now.getDay()]}`;
});

// 时间段问候语：6:00-11:00 早上好，11:00-18:00 下午好，其余 晚上好
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "早上好";
  if (hour >= 11 && hour < 18) return "下午好";
  return "晚上好";
});

// 菜单配置表
const menuConfig = {
  "/pages/customer/list": {
    label: "我的客户",
    icon: "/static/index/kehu.png",
    bg: "client-bg",
    iconBox: "client-icon-box",
    textColor: "text-blue",
    countKey: "customerCount",
    countColor: "#0d47a1",
    unit: "位客户",
    section: "common",
  },
  "/pages/message/message": {
    label: "消息中心",
    icon: "/static/index/message.png",
    bg: "message-bg",
    iconBox: "message-icon-box",
    textColor: "text-green",
    countKey: "unreadMessageCount",
    countColor: "#148663",
    unit: "条新消息",
    section: "common",
  },
  "/pages/map/map": {
    label: "今日拜访",
    icon: "/static/index/1.png",
    bg: "bg-orange-light",
    section: "shortcut",
  },
  "/pages/visit/visit": {
    label: "回访列表",
    icon: "/static/index/2.png",
    bg: "bg-yellow-light",
    section: "shortcut",
  },
  "/pages/construction/list": {
    label: "施工列表",
    icon: "/static/index/3.png",
    bg: "bg-blue-light",
    section: "shortcut",
  },
  "/pages/contract/contract": {
    label: "合同列表",
    icon: "/static/index/4.png",
    bg: "bg-purple-light",
    section: "shortcut",
  },
  "/pages/delivery/list": {
    label: "发货管理",
    icon: "/static/index/5.png",
    bg: "bg-blue-light",
    section: "shortcut",
  },
};

// 判断是否在开发模式下显示全部菜单
const showAllMenu = computed(() => {
  return import.meta.env.VITE_SHOW_ALL_MENU === "true";
});

// 递归获取菜单列表中的所有菜单路径
function extractMenuPaths(menus) {
  const paths = [];
  const traverse = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item.menuType === "MENU" && item.path) {
        paths.push(item.path);
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  traverse(menus);
  return paths;
}

// 计算允许显示的菜单路径
const allowedPaths = computed(() => {
  if (showAllMenu.value) {
    return Object.keys(menuConfig);
  }
  return extractMenuPaths(menuList.value);
});

// 常用功能列表
const commonFeatures = computed(() => {
  return allowedPaths.value
    .filter((path) => menuConfig[path]?.section === "common")
    .map((path) => ({ path, ...menuConfig[path] }));
});

// 快捷操作列表
const shortcutFeatures = computed(() => {
  return allowedPaths.value
    .filter((path) => menuConfig[path]?.section === "shortcut")
    .map((path) => ({ path, ...menuConfig[path] }));
});

async function init() {
  const data = await workHome({});
  workData.value = data;
}

function go(url) {
  uni.$router.push({
    url: url,
  });
}

// 清除缓存并重新登录
function handleClearCache() {
  uni.showModal({
    title: "提示",
    content: "确定要清除缓存吗？",
    success({ confirm }) {
      if (confirm) {
        logout({})
          .then(() => {
            globalState.clearAll();
            uni.reLaunch({
              url: "/pages/login/openid",
            });
          })
          .catch(() => {
            uni.showToast({
              title: "清除缓存失败",
              icon: "none",
            });
          });
      }
    },
  });
}

onLoad(() => {
  init();
});
</script>

<style scoped lang="scss">
:deep(.wd-tabbar) {
  background: transparent !important;
}
:deep(.wd-count-to__main-text) {
  font-size: 50rpx !important;
  font-weight: 700;
}

.page {
  min-height: 100vh;
  background-color: #f7f9fc;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

/* 顶部蓝色渐变背景 */
.header-section {
  background: linear-gradient(to bottom, #2998ff 0%, #94cfff 70%, #f7f9fc 100%);
  padding: 80rpx 40rpx 120rpx 40rpx;

  .page-title {
    text-align: center;
    font-size: 36rpx;
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 40rpx;
  }
}

/* 用户信息 */
.user-info-box {
  display: flex;
  align-items: center;

  .clear-cache-btn {
    margin-left: auto;
    border: 1rpx solid rgba(255, 255, 255, 0.7);
    border-radius: 999rpx;
    height: 50rpx;
    width: 150rpx;
    line-height: 50rpx;
    text-align: center;
    padding-bottom: 6rpx;
    .clear-text {
      font-size: 24rpx;
      color: #ffffff;
    }
  }

  .avatar {
    width: 130rpx;
    height: 130rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .user-details {
    display: flex;
    flex-direction: column;
    margin-left: 24rpx;
    color: #ffffff;

    .username {
      font-size: 38rpx;
      font-weight: bold;
      letter-spacing: 1rpx;
    }

    .role {
      font-size: 28rpx;
      font-weight: 600;
      margin-top: 6rpx;
      opacity: 0.9;
    }

    .date {
      font-size: 24rpx;
      margin-top: 6rpx;
      opacity: 0.7;
    }
  }
}

/* 主体内容包裹 */
.content-container {
  margin-top: -60rpx;
  padding: 0 32rpx;
}

/* 通用面板标题 */
.panel-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

/* 白底卡片面板 */
.card-panel {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  margin-bottom: 36rpx;
}

/* 两列网格通用布局 */
.grid-two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

/* 常用功能卡片单项 */
.feature-item {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;

  &.client-bg {
    background-color: #abd5fc;
  }
  &.message-bg {
    background-color: #6ad9b3;
  }

  .icon-wrapper {
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    // background-color: #ffffff;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  .info-wrapper {
    margin-left: 16rpx;
    overflow: hidden;

    .item-label {
      font-size: 26rpx;
      font-weight: 600;
    }

    .item-value {
      display: flex;
      align-items: baseline;
      margin-top: 4rpx;

      .unit {
        font-size: 20rpx;
        margin-left: 6rpx;
        opacity: 0.8;
      }
    }
  }
}

/* 文本与主题色匹配细节 */
.text-blue {
  color: #1565c0;
}
.text-green {
  color: #2e7d32;
}

/* 快捷操作模块 */
.shortcut-section {
  .shortcut-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 180rpx;
    border-radius: 16rpx;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
    transition: transform 0.1s ease;

    &:active {
      transform: scale(0.98);
    }

    .shortcut-label {
      font-size: 26rpx;
      color: #444444;
      font-weight: 500;
      margin-top: 16rpx;
    }
  }

  /* 快捷卡片背景色微调 */
  .bg-orange-light {
    background-color: #fff3e0;
  }
  .bg-yellow-light {
    background-color: #fffde7;
  }
  .bg-blue-light {
    background-color: #e1f5fe;
  }
  .bg-purple-light {
    background-color: #f3e5f5;
  }
  .bg-red-light {
    background-color: #ffebee;
  }
}
</style>
