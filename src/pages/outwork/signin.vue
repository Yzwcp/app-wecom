<template>
  <view class="page">
    <wd-navbar title="外出签到" left-arrow @click-left="goBack" />

    <view class="content-container">
      <!-- 1. 定位详情模块 -->
      <view class="card-module">
        <view class="card-header" @click="toggleSection('location')">
          <text class="title">定位详情</text>
          <view class="collapse-btn">
            <text class="status-text">{{
              isCollapse.location ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="isCollapse.location ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>

        <!-- 定位内容区域 -->
        <view v-show="!isCollapse.location" class="card-body">
          <!-- 签到状态条 -->
          <view
            :class="[
              'sign-status-bar',
              checkInRange.inRange ? 'status-signed' : 'status-unsigned',
            ]"
          >
            <wd-icon name="info-circle" size="16px" color="#fff"></wd-icon>
            <text class="status-msg">{{
              checkInRange.inRange ? "已在签到范围内" : "未在签到范围内"
            }}</text>
          </view>

          <view class="info-row">
            <view class="info-label">定位信息</view>
            <view class="info-distance">
              距客户
              <text class="distance-num">{{ distanceText }}</text>
            </view>
          </view>
          <view class="sub-label">客户位置</view>
          <view class="address-text">{{ customerBaseInfo.address }}</view>

          <!-- 地图区域 -->
          <view class="map-container">
            <map
              id="outworkMap"
              class="visit-map"
              :latitude="mapCenter.latitude"
              :longitude="mapCenter.longitude"
              :markers="mapMarkers"
              :scale="16"
            ></map>
          </view>

          <!-- 底部操作栏（仅重新定位） -->
          <view class="btn-single-row">
            <wd-button type="primary" size="medium" block @click="reLocation"
              >重新定位</wd-button
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定签到按钮 -->
    <view class="fixed-bottom-bar">
      <button class="btn-signin" :disabled="isSigned" @click="handleSign">
        {{ isSigned ? "已签到" : "签到" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getLocation } from "@/utils/wx";
import { getCustomerBaseInfo } from "@/api/customer";
import { outworkCheckIn, outworkCheckInRange } from "@/api/outwork";

const customerBaseInfo = ref({
  latitude: 0,
  longitude: 0,
});

// 地图状态
const currentLocation = ref(null);
const mapCenter = ref({ latitude: 30.27415, longitude: 120.15515 });
const checkInRange = reactive({
  distance: 0,
  inRange: false,
});
const distance = ref(0);

// 地图标记
const customerMarkerIcon = "/static/map/map-icon.png";
const myLocationIcon = "/static/icons/my-location.png";

const mapMarkers = computed(() => {
  const markers = [];

  if (customerBaseInfo.value.latitude && customerBaseInfo.value.longitude) {
    markers.push({
      id: 1,
      latitude: customerBaseInfo.value.latitude,
      longitude: customerBaseInfo.value.longitude,
      iconPath: customerMarkerIcon,
      width: 32,
      height: 40,
    });
    mapCenter.value = {
      latitude: customerBaseInfo.value.latitude,
      longitude: customerBaseInfo.value.longitude,
    };
  }

  if (currentLocation.value) {
    markers.push({
      id: 0,
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude,
      iconPath: myLocationIcon,
      width: 36,
      height: 36,
    });
  }

  return markers;
});

// 距离文字
const distanceText = computed(() => {
  if (distance.value <= 0) return "计算中...";
  if (distance.value < 1000) return `${distance.value}m`;
  return `${(distance.value / 1000).toFixed(1)}km`;
});

// 使用 API 更新签到范围
async function updateDistance(lat, lng) {
  try {
    const res = await outworkCheckInRange({
      checkInLatitude: lat,
      checkInLongitude: lng,
      id: outworkId.value,
    });
    Object.assign(checkInRange, res);
    distance.value = res.distance || 0;
  } catch (err) {
    console.warn("获取签到范围失败", err);
  }
}

const isCollapse = ref({
  location: false,
});

const isSigned = ref(false);

// 路由参数
const outworkId = ref("");
const customerId = ref("");

// 切换折叠与展开
function toggleSection(key) {
  isCollapse.value[key] = !isCollapse.value[key];
}

// 签到
async function handleSign() {
  uni.showLoading({ title: "签到中..." });
  try {
    const loc = await getLocation({ type: "gcj02" });
    currentLocation.value = {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    await updateDistance(loc.latitude, loc.longitude);
    await outworkCheckIn({
      checkInLatitude: loc.latitude,
      checkInLongitude: loc.longitude,
      id: outworkId.value,
    });
    isSigned.value = true;
    uni.hideLoading();
    uni.showToast({ title: "签到成功", icon: "success" });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: err.errMsg || "签到失败", icon: "none" });
  }
}

// 重新定位
async function reLocation() {
  uni.showLoading({ title: "正在重新定位..." });
  try {
    const loc = await getLocation({ type: "gcj02" });
    currentLocation.value = {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    await updateDistance(loc.latitude, loc.longitude);
    uni.hideLoading();
    uni.showToast({ title: "定位已更新", icon: "none" });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: err.errMsg || "定位失败", icon: "none" });
  }
}

function goBack() {
  uni.navigateBack();
}

onLoad(() => {
  const query = uni.$router.query;
  if (query?.outworkId) outworkId.value = query.outworkId;
  if (query?.customerId) customerId.value = query.customerId;

  if (query.customerId) {
    getCustomerBaseInfo({
      id: query.customerId,
    }).then((res) => {
      customerBaseInfo.value = res || {};
      if (currentLocation.value) {
        updateDistance(
          currentLocation.value.latitude,
          currentLocation.value.longitude,
        );
      }
    });
  }

  getLocation({ type: "gcj02" })
    .then((loc) => {
      currentLocation.value = {
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
      updateDistance(loc.latitude, loc.longitude);
    })
    .catch((err) => {
      console.warn("获取定位失败", err);
    });
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 160rpx;
}

.content-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card-module {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 32rpx;
    background-color: #fcfcfc;
    border-bottom: 1px solid #f2f3f5;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .collapse-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .status-text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .card-body {
    padding: 32rpx;
  }
}

.sign-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 24rpx;

  &.status-signed {
    background-color: #4cd964;
  }

  &.status-unsigned {
    background-color: #f08164;
  }

  .status-msg {
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;

  .info-label {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
  .info-distance {
    font-size: 24rpx;
    color: #666;
    .distance-num {
      font-weight: bold;
      color: #333;
      margin-left: 6rpx;
    }
  }
}

.sub-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.address-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 24rpx;
}

.map-container {
  width: 100%;
  height: 320rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 32rpx;

  .visit-map {
    width: 100%;
    height: 100%;
  }
}

.btn-single-row {
  display: flex;

  :deep(.wd-button--primary) {
    background-color: #2979ff;
  }
}

/* 底部固定签到按钮 */
.fixed-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: #ffffff;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)) 30rpx;
  border-top: 1px solid #f2f3f5;

  .btn-signin {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    text-align: center;
    border: none;
    padding: 0;
    background-color: #0066ff;
    color: #ffffff;

    &::after {
      border: none;
    }

    &[disabled] {
      background-color: #b8b8b8;
      color: #ffffff;
    }

    &:active:not([disabled]) {
      opacity: 0.8;
    }
  }
}
</style>
