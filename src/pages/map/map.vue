<template>
  <view class="page">
    <!-- 顶部导航栏（含返回按钮） -->
    <wd-navbar title="拜访地图" left-arrow @click-left="goBack" />

    <!-- 1. 搜索与状态栏 -->
    <view class="header-box">
      <view class="search-bar">
        <text class="uni-icons-search"></text>
        <input
          class="search-input"
          type="text"
          v-model="searchKeyword"
          placeholder="搜索客户名称或地址"
          @input="onSearch"
        />
      </view>
      <view class="status-tags">
        <view
          class="tag-item"
          v-for="(item, index) in statusTypes"
          :key="index"
        >
          <image class="tag-icon" :src="item.icon" mode="aspectFit"></image>
          <text class="tag-text">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 2. 地图区域 -->
    <view class="map-container">
      <map
        id="visitMap"
        class="visit-map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :markers="mapMarkers"
        :scale="14"
        @markertap="onMarkerTap"
        @tap="onMapTap"
      ></map>
    </view>

    <!-- 3. 定位到我的位置（右下角悬浮按钮） -->
    <view class="locate-btn" @tap="relocateToMe">
      <image
        class="locate-icon"
        src="/static/map/map-icon.png"
        mode="aspectFit"
      ></image>
    </view>

    <!-- 4. 底部详细信息弹窗卡片 -->
    <view
      class="detail-card"
      v-if="activeVisit && showCard"
      :class="{ 'card-fade-in': showCard }"
    >
      <view class="card-header">
        <text class="customer-name">{{ activeVisit.title }}</text>
        <view class="status-badge" :class="activeVisit.statusClass">
          {{ activeVisit.statusText }}
        </view>
      </view>

      <view class="info-line">
        <text class="icon-location">📍</text>
        <text class="info-text">{{ activeVisit.address }}</text>
      </view>
      <view class="info-line">
        <text class="icon-time">🕒</text>
        <text class="info-text">计划时间 {{ activeVisit.planTime }}</text>
      </view>

      <!-- 底部操作按钮 -->
      <view class="action-buttons">
        <button class="btn btn-outline" @tap="handleSignIn(activeVisit)">
          签到
        </button>
        <button class="btn btn-primary" @tap="handleFillResult(activeVisit)">
          填写结果
        </button>
        <button class="btn btn-danger" @tap="handleCreateContract(activeVisit)">
          转创建合同
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useGlobalStore } from "../../store/global";
import { storeToRefs } from "pinia";
import { getLocation } from "@/utils/wx";
import { getOutworkMap } from "@/api/outwork";
import { useDict } from "@/hooks/useDict";

const { dictMap, getDictLabel } = useDict();

const global = useGlobalStore();
const { systemInfo, configInfo, userInfo } = storeToRefs(global);

const query = ref({});
const params = ref({});
const searchKeyword = ref("");
const showCard = ref(false); // 控制卡片显示
const activeVisit = ref(null); // 当前选中的拜访点

// 地图中心点（默认定位，如杭州）
const mapCenter = ref({
  latitude: 30.27415,
  longitude: 120.15515,
});

// 我的当前位置
const currentLocation = ref(null);

// 状态标签定义
const statusTypes = ref([
  { label: "待外出", icon: "/static/icons/time.png" },
  { label: "执行中", icon: "/static/icons/play.png" },
  { label: "已成交", icon: "/static/icons/check.png" },
  { label: "未成交", icon: "/static/icons/close.png" },
  { label: "已转合同", icon: "/static/icons/sync.png" },
]);

// 状态对应的标记图标
const markerIcon = "/static/map/map-icon.png";

// 外勤列表数据
const allList = ref([]);

// 状态 CSS class 映射
const STATUS_CLASS_MAP = {
  PENDING: "status-pending",
  PROCESSING: "status-executing",
  COMPLETED: "status-completed",
  FAILED: "status-failed",
  CONTRACTED: "status-contracted",
};

// 加载外勤地图数据
async function loadOutworkMap() {
  try {
    const list = await getOutworkMap();
    allList.value = (list || [])
      .filter((item) => item.latitude && item.longitude)
      .map((item, index) => ({
        id: index + 1,
        outworkId: item.outworkId,
        customerId: item.customerId,
        title: item.customerName,
        customerName: item.customerName,
        address: item.address,
        planTime: item.planTime,
        latitude: item.latitude,
        longitude: item.longitude,
        status: item.status,
        statusText: item.statusName,
        statusClass: STATUS_CLASS_MAP[item.status] || "status-pending",
        outworkType: item.outworkType,
        iconPath: markerIcon,
        width: 32,
        height: 40,
      }));
    console.log(allList.value);
  } catch (err) {
    console.error("获取外勤地图数据失败", err);
  }
}

// 计算属性：渲染到地图上的 markers（含当前位置标记）
const mapMarkers = computed(() => {
  const markers = allList.value.map((item) => ({
    id: item.id,
    latitude: item.latitude,
    longitude: item.longitude,
    iconPath: item.iconPath,
    width: item.width,
    height: item.height,
  }));

  // 追加当前位置标记（蓝色定位点）
  if (currentLocation.value) {
    markers.push({
      id: 0,
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude,
      iconPath: "/static/icons/my-location.png",
      width: 36,
      height: 36,
    });
  }

  return markers;
});

// 搜索逻辑
function onSearch() {
  console.log("搜索关键词:", searchKeyword.value);
  // 实际业务中在此处过滤 allList 或重新请求接口
}

function goBack() {
  uni.navigateBack();
}

// 点击标记点展示卡片
function onMarkerTap(e) {
  const markerId = e.detail.markerId;
  const target = allList.value.find((item) => item.id === markerId);
  if (target) {
    activeVisit.value = target;
    showCard.value = true;
    // 让地图中心平移到当前点击的点
    mapCenter.value = {
      latitude: target.latitude,
      longitude: target.longitude,
    };
  }
}

// 点击地图空白处隐藏卡片
function onMapTap() {
  showCard.value = false;
}

// 业务功能按钮跳转
function handleSignIn(item) {
  uni.navigateTo({
    url: `/pages/outwork/signin?outworkId=${item.outworkId}&customerId=${item.customerId}`,
  });
}

function handleFillResult(item) {
  uni.navigateTo({
    url: `/pages/outwork/result?outworkId=${item.outworkId}`,
  });
}

function handleCreateContract(item) {
  uni.navigateTo({
    url: `/pages/contract/create?customerId=${item.customerId}`,
  });
}

/**
 * 获取定位（优先使用 URL 传入的经纬度），更新地图中心，然后加载外勤数据
 */
async function loadLocation() {
  // 如果 URL 上有经纬度参数，直接用，不走 wx 定位
  if (query.value.latitude && query.value.longitude) {
    const lat = Number(query.value.latitude);
    const lng = Number(query.value.longitude);
    mapCenter.value = { latitude: lat, longitude: lng };
    currentLocation.value = { latitude: lat, longitude: lng };
    console.log(mapCenter.value);
  } else {
    try {
      const loc = await getLocation({ type: "gcj02" });
      mapCenter.value = {
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
      currentLocation.value = {
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
    } catch (err) {
      console.warn("获取定位失败，使用默认位置:", err);
    }
  }
  // 加载外勤地图数据
  await loadOutworkMap();
}

/**
 * 浮动按钮：重新定位到我的位置
 */
async function relocateToMe() {
  try {
    const loc = await getLocation({ type: "gcj02" });
    mapCenter.value = {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    currentLocation.value = {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    uni.showToast({ title: "已定位到当前位置", icon: "success" });
  } catch (err) {
    uni.showToast({ title: "定位失败，请检查权限", icon: "none" });
  }
}
onShow(async () => {
  await loadLocation();
  // 刷新后重新匹配当前选中的拜访点，保持卡片数据最新
  if (activeVisit.value) {
    const matched = allList.value.find(
      (item) => item.outworkId === activeVisit.value.outworkId,
    );
    if (matched) {
      activeVisit.value = matched;
    } else {
      activeVisit.value = null;
      showCard.value = false;
    }
  }
});
onLoad(() => {
  query.value = uni.$router.query || {};
  params.value = uni.$router.params || {};
  loadLocation();
});
</script>

<style scoped lang="scss">
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f7f8fa;
}

/* 1. 顶部搜索与状态栏样式 */
.header-box {
  background-color: #ffffff;
  padding: 16rpx 24rpx;
  box-sizing: border-box;

  .search-bar {
    background-color: #f5f6f8;
    border-radius: 40rpx;
    padding: 12rpx 24rpx;
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .search-input {
      font-size: 28rpx;
      color: #333;
      flex: 1;
      margin-left: 12rpx;
    }
  }

  .status-tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4rpx;

    .tag-item {
      display: flex;
      align-items: center;

      .tag-icon {
        width: 28rpx;
        height: 28rpx;
        margin-right: 6rpx;
      }
      .tag-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

/* 2. 地图铺满剩余空间 */
.map-container {
  flex: 1;
  position: relative;

  .visit-map {
    width: 100%;
    height: 100%;
  }
}

/* 3. 底部详细信息卡片样式 */
.detail-card {
  position: absolute;
  bottom: 40rpx;
  left: 4%;
  width: 92%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-sizing: border-box;
  box-shadow: 0px 8rpx 32rpx rgba(0, 0, 0, 0.08);
  z-index: 100;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .customer-name {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
    }

    .status-badge {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;

      &.status-executing {
        background-color: #e8f2ff;
        color: #2f7fff;
      }
      &.status-pending {
        background-color: #fff3e0;
        color: #ff9800;
      }
      &.status-completed {
        background-color: #e8f5e9;
        color: #4caf50;
      }
      &.status-failed {
        background-color: #fce4ec;
        color: #e53935;
      }
      &.status-contracted {
        background-color: #f3e5f5;
        color: #9c27b0;
      }
    }
  }

  .info-line {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .icon-location,
    .icon-time {
      font-size: 28rpx;
      color: #999;
      margin-right: 12rpx;
      margin-top: 2rpx;
    }

    .info-text {
      font-size: 26rpx;
      color: #666666;
      line-height: 1.4;
    }
  }

  /* 底部按钮栏 */
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 32rpx;
    gap: 16rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 16rpx;
      text-align: center;
      border: none;
      padding: 0;

      &::after {
        border: none;
      }
    }

    .btn-outline {
      background-color: #ffffff;
      color: #2f7fff;
      border: 2rpx solid #2f7fff;
    }

    .btn-primary {
      background-color: #0062ff;
      color: #ffffff;
    }

    .btn-danger {
      background-color: #ff8d8d;
      color: #ffffff;
    }
  }
}

/* 右下角悬浮定位按钮 */
.locate-btn {
  position: absolute;
  bottom: 280rpx;
  right: 30rpx;
  width: 88rpx;
  height: 88rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  z-index: 99;

  .locate-icon {
    width: 40rpx;
    height: 40rpx;
  }

  &:active {
    opacity: 0.7;
  }
}

/* 动效 */
.card-fade-in {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
