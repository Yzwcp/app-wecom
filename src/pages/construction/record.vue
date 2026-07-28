<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <!-- <wd-navbar title="施工记录" left-arrow fixed placeholder @click-left="goBack" /> -->

    <view class="content-container">
      <!-- 1. 定位详情模块（签到后折叠） -->
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
          <!-- 签到状态条：根据 isSigned 切换绿色/橙色状态 -->
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
              id="constructionMap"
              class="visit-map"
              :latitude="mapCenter.latitude"
              :longitude="mapCenter.longitude"
              :markers="mapMarkers"
              :scale="16"
            ></map>
          </view>

          <!-- 底部签到操作按钮 -->
          <view class="btn-group-row">
            <wd-button
              type="primary"
              size="medium"
              block
              class="flex-btn"
              @click="reLocation"
              >重新定位</wd-button
            >
            <wd-button
              type="warning"
              :disabled="isSigned"
              size="medium"
              block
              class="flex-btn sign-btn"
              @click="handleSign"
            >
              {{ isSigned ? "已签到" : "现场签到" }}
            </wd-button>
          </view>
        </view>
      </view>

      <!-- 2. 施工详情模块 -->
      <view class="card-module">
        <view class="card-header" @click="toggleSection('construction')">
          <text class="title">施工详情</text>
          <view class="collapse-btn">
            <text class="status-text">{{
              isCollapse.construction ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="isCollapse.construction ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>

        <!-- 施工详情内容 -->
        <view v-show="!isCollapse.construction" class="card-body">
          <!-- 上门/签收时间 -->
          <view
            class="time-picker-row"
            :class="{ 'picker-disabled': pageMode === 'view' }"
            @click="pageMode !== 'view' && openTimePicker('startTime')"
          >
            <view class="label"> 上门开始时间 </view>
            <view class="time-value-wrap">
              <text class="time-text">{{ startTime || "请选择上门时间" }}</text>
              <wd-icon name="arrow" size="16px" color="#666" />
            </view>
          </view>

          <!-- 上门结束时间 -->
          <view
            class="time-picker-row"
            :class="{ 'picker-disabled': pageMode === 'view' }"
            @click="pageMode !== 'view' && openTimePicker('endTime')"
          >
            <view class="label"> 上门结束时间 </view>
            <view class="time-value-wrap">
              <text class="time-text">{{ endTime || "请选择结束时间" }}</text>
              <wd-icon name="arrow" size="16px" color="#666" />
            </view>
          </view>

          <!-- 施工记录 -->
          <view class="form-item-label"> 施工记录 </view>
          <textarea
            v-model="constructionRecord"
            class="custom-textarea"
            placeholder="请输入施工记录"
            :maxlength="-1"
            :disabled="pageMode === 'view'"
          />

          <!-- 签收备注 -->
          <!-- <view class="form-item-label"> 签收备注 </view>
          <textarea
            v-model="receiveRemark"
            class="custom-textarea"
            placeholder="请输入签收备注"
            :maxlength="-1"
          /> -->

          <!-- 完工时间 -->
          <!-- <view class="time-picker-row" @click="openTimePicker('finishTime')">
            <view class="label"> 完工时间 </view>
            <view class="time-value-wrap">
              <text class="time-text">{{
                finishTime || "请选择完工时间"
              }}</text>
              <wd-icon name="arrow" size="16px" color="#666" />
            </view>
          </view> -->

          <!-- 施工前照片 -->
          <view class="upload-section">
            <view class="upload-header">
              <text class="label">
                施工前照片
                <text class="hint">（最多 9 张）</text>
              </text>
            </view>
            <ImgUpload
              v-model="beforePhotos"
              category="WJ_TASK_IMG"
              :limit="9"
              :readonly="pageMode === 'view'"
            />
          </view>

          <!-- 施工后照片 -->
          <view class="upload-section">
            <view class="upload-header">
              <text class="label">
                施工后照片
                <text class="hint">（最多 9 张）</text>
              </text>
            </view>
            <ImgUpload
              v-model="afterPhotos"
              category="WJ_TASK_IMG"
              :limit="9"
              :readonly="pageMode === 'view'"
            />
          </view>
        </view>
      </view>

      <!-- 3. 材料明细模块 -->
      <view class="card-module">
        <view class="card-header" @click="toggleSection('material')">
          <text class="title">材料明细</text>
          <view class="collapse-btn">
            <text class="status-text">{{
              isCollapse.material ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="isCollapse.material ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>

        <!-- 材料明细内容 -->
        <view v-show="!isCollapse.material" class="card-body">
          <!-- 材料预览列表 -->
          <view v-if="materialList.length > 0" class="material-preview-list">
            <view
              v-for="(item, index) in materialList"
              :key="item.id || index"
              class="preview-row"
              @click="goMaterialList"
            >
              <text class="preview-sn">{{ index + 1 }}</text>
              <view class="preview-info">
                <text class="preview-name">{{ item.materialName }}</text>
                <text class="preview-remark" v-if="item.remark">{{
                  item.remark
                }}</text>
              </view>
              <text class="preview-qty"
                >{{ item.quantity }}{{ item.unit }}</text
              >
            </view>
          </view>
          <view v-else class="preview-empty" @click="goMaterialList">
            <text>暂无材料数据</text>
          </view>
          <view
            v-if="pageMode !== 'view'"
            class="nav-link"
            @click="goMaterialList"
          >
            <text>编辑材料明细</text>
            <wd-icon name="arrow" size="14px" color="#0066ff" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定暂存/完工按钮 -->
    <view v-if="pageMode !== 'view'" class="fixed-bottom-bar">
      <button class="btn-save" @click="handleSave('SAVE')">保存</button>
      <button class="btn-complete" @click="handleComplete('SUBMIT')">
        提交
      </button>
    </view>

    <!-- Wot UI 时间选择器组件 -->
    <wd-datetime-picker
      v-model="datePickerValue"
      type="datetime"
      :visible="showDatePicker"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
    />
  </view>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  doConstructionCheckIn,
  doConstructionVisitSave,
  constructionCheckInRange,
  getConstructionMaterialList,
  getConstructionVisitDetail,
} from "@/api/construction";
import { getLocation } from "@/utils/wx";
import ImgUpload from "@/components/ImgUpload.vue";
import { getCustomerBaseInfo } from "@/api/customer";
import { extractFileIdFromUrl } from "@/utils/tools";

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
  message: "",
  range: 0,
});

// 地图标记
const customerMarkerIcon = "/static/map/map-icon.png";
const myLocationIcon = "/static/icons/my-location.png";

const mapMarkers = computed(() => {
  const markers = [];

  // 客户位置标记
  if (customerBaseInfo.value.latitude && customerBaseInfo.value.longitude) {
    markers.push({
      id: 1,
      latitude: customerBaseInfo.value.latitude,
      longitude: customerBaseInfo.value.longitude,
      iconPath: customerMarkerIcon,
      width: 32,
      height: 40,
    });
    // 地图中心取客户位置
    mapCenter.value = {
      latitude: customerBaseInfo.value.latitude,
      longitude: customerBaseInfo.value.longitude,
    };
  }

  // 我的位置标记
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
  if (checkInRange.distance <= 0) return "计算中...";
  if (checkInRange.distance < 1000) return `${checkInRange.distance}m`;
  return `${(checkInRange.distance / 1000).toFixed(1)}km`;
});

// 更新距离
async function updateDistance(lat, lng) {
  try {
    const res = await constructionCheckInRange({
      checkInLatitude: lat,
      checkInLongitude: lng,
      taskId: taskId.value,
    });
    Object.assign(checkInRange, res);
  } catch (err) {
    console.warn("获取签到范围失败", err);
  }
}

// 1. 控制各个模块折叠/展开的状态对象
const isCollapse = ref({
  location: false, // 定位详情是否折叠
  construction: false, // 施工详情是否折叠
  material: false, // 材料明细是否折叠
});

// 2. 签到状态控制 (true = 已签到 [绿色风格], false = 未签到 [橙色风格])
const isSigned = ref(false);

// 路由参数
const taskId = ref("");
const subTaskId = ref("");
const visitId = ref("");

// 定位信息
const latitude = ref("");
const longitude = ref("");

// 3. 时间选择器状态
const showDatePicker = ref(false);
const currentTimeField = ref(""); // 当前正在编辑的时间字段: startTime | endTime | finishTime
const datePickerValue = ref(new Date());

// 表单数据
const startTime = ref(""); // 上门/签收时间
const receiveRemark = ref(""); // 签收备注
const endTime = ref(""); // 上门结束时间
const constructionRecord = ref(""); // 施工记录
const finishTime = ref(""); // 完工时间
const checkInTime = ref(""); // 签到时间

// 图片（支持字符串单图或字符串数组多图）
const beforePhotos = ref("");
const afterPhotos = ref("");

// 材料明细数据
const materialList = ref([]);

// 页面模式：create / edit / view
const pageMode = ref("create");

// 获取材料列表
async function fetchMaterialList() {
  try {
    const res = await getConstructionMaterialList({
      id: subTaskId.value,
    });
    if (res && res.length > 0) {
      materialList.value = res;
    }
  } catch (err) {
    console.error("获取材料列表失败", err);
  }
}

// 加载已有详情（回填表单）
async function fetchVisitDetail() {
  try {
    const res = await getConstructionVisitDetail({ id: visitId.value });
    if (!res) return;

    startTime.value = res.startTime || "";
    endTime.value = res.endTime || "";
    finishTime.value = res.submitTime || "";
    constructionRecord.value = res.constructionRecord || "";
    beforePhotos.value = res.beforeImageUrlList || [];
    afterPhotos.value = res.afterImageUrlList || [];
    isSigned.value = res.checkInTime ? true : false;
    if (res.checkInTime) {
      toggleSection("location");
    }
    if (res.materialList && res.materialList.length > 0) {
      materialList.value = res.materialList;
    } else {
      // fetchMaterialList();
    }
  } catch (err) {
    console.error("获取详情失败", err);
  }
}

// 切换折叠与展开
function toggleSection(key) {
  isCollapse.value[key] = !isCollapse.value[key];
}

// 点击现场签到
async function handleSign() {
  uni.showLoading({ title: "签到中..." });
  try {
    const loc = await getLocation({ type: "gcj02" });
    currentLocation.value = {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    await updateDistance(loc.latitude, loc.longitude);
    const res = await doConstructionCheckIn({
      checkInLatitude: loc.latitude,
      checkInLongitude: loc.longitude,
      subTaskId: subTaskId.value,
      taskId: taskId.value,
    });

    // 签到成功后获取 visitId，切换为编辑模式
    const newVisitId = res;
    if (newVisitId) {
      visitId.value = newVisitId;
      pageMode.value = "edit";
      isSigned.value = true;
      // 签到完成后折叠定位模块
      isCollapse.value.location = true;

      // 加载已创建的详情数据
      // fetchVisitDetail();
    }

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
}

// 时间确定回调
function onDateConfirm({ value }) {
  const d = new Date(value);
  const formatNum = (n) => (n < 10 ? "0" + n : n);
  const formatted = `${d.getFullYear()}-${formatNum(d.getMonth() + 1)}-${formatNum(d.getDate())} ${formatNum(d.getHours())}:${formatNum(d.getMinutes())}:${formatNum(d.getSeconds())}`;
  if (currentTimeField.value === "startTime") {
    startTime.value = formatted;
  } else if (currentTimeField.value === "endTime") {
    endTime.value = formatted;
  } else {
    finishTime.value = formatted;
  }
  showDatePicker.value = false;
}

// 打开时间选择器
function openTimePicker(field) {
  currentTimeField.value = field;
  showDatePicker.value = true;
}

function goBack() {
  uni.navigateBack();
}

async function handleSave(saveType) {
  uni.showLoading({ title: "保存中..." });

  // beforePhotos/afterPhotos 可能是 string（单图）或 string[]（多图）
  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  };
  const beforeImageUrl = toArray(beforePhotos.value).map((url) =>
    extractFileIdFromUrl(url),
  );
  const afterImageUrl = toArray(afterPhotos.value).map((url) =>
    extractFileIdFromUrl(url),
  );
  let p = {
    taskId: taskId.value,
    subTaskId: subTaskId.value,
    startTime: startTime.value || undefined,
    receiveRemark: receiveRemark.value || undefined,
    endTime: endTime.value || undefined,
    constructionRecord: constructionRecord.value || undefined,
    materialList: materialList.value,
    beforeImageFileIdList: beforeImageUrl,
    afterImageFileIdList: afterImageUrl,
    saveType,
  };
  if (visitId.value && pageMode.value === "edit") {
    p.id = visitId.value;
  }
  try {
    await doConstructionVisitSave(p);
    uni.showModal({
      title: "提示",
      content: "操作成功",
      showCancel: true,
      success: ({ confirm, cancel }) => {
        if (confirm) {
          goBack();
        }
      },
    });
  } catch (err) {
    uni.hideLoading();
  }
}

function handleComplete() {
  uni.showModal({
    title: "提示",
    content: "提交后不可编辑",
    showCancel: true,
    confirmText: "确认提交",
    cancelText: "取消",
    success: ({ confirm, cancel }) => {
      if (confirm) {
        handleSave("SUBMIT");
      }
    },
  });
}

function goMaterialList() {
  uni.$router.push({
    url: "/pages/construction/material/material",
    params: {
      id: taskId.value,
      subTaskId: subTaskId.value,
      materialList: JSON.parse(JSON.stringify(materialList.value)),
    },
  });
}

onLoad(() => {
  const query = uni.$router.query;
  if (query?.taskId) taskId.value = query.taskId;
  if (query?.subTaskId) subTaskId.value = query.subTaskId;
  if (query?.visitId) visitId.value = query.visitId;
  if (query?.mode) pageMode.value = query.mode;

  if (visitId.value) {
    // 有 visitId 时加载已有详情，不调用定位
    fetchVisitDetail();
  } else {
    // 无 visitId 时获取客户信息与当前位置
    if (query.customerId) {
      getCustomerBaseInfo({
        id: query.customerId,
      }).then((res) => {
        customerBaseInfo.value = res || {};
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

    // fetchMaterialList();
  }
});

// 从材料页面返回时接收保存的数据
onShow(() => {
  const result = uni.$router.params;
  if (result?.action === "updateMaterial" && result?.materialList) {
    materialList.value = result.materialList;
  }
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 160rpx; /* 为底部固定按钮栏留出空间 */
}

.content-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 卡片模块通用样式 */
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

/* 1. 定位详情特有样式 */
.sign-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 24rpx;

  &.status-signed {
    background-color: #4cd964; /* 绿色状态 */
  }

  &.status-unsigned {
    background-color: #f08164; /* 橙色状态 */
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

/* 通用行按钮组 */
.btn-group-row {
  display: flex;
  gap: 20rpx;

  .flex-btn {
    flex: 1;
  }

  /* 已签到按钮样式定制为灰色不可点击态 */
  :deep(.wd-button--transparent) {
    background-color: #b8b8b8 !important;
    color: #ffffff !important;
    border: none !important;
    opacity: 1 !important;
  }

  /* 现场签到使用橙色按钮 */
  :deep(.wd-button--error) {
    background-color: #f08164 !important;
    border-color: #f08164 !important;
  }
}

/* 2. 施工详情特有样式 */
.required {
  color: #ee0a24;
  margin-left: 6rpx;
}

.form-item-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  margin-top: 24rpx;
  &:first-child {
    margin-top: 0;
  }
}

.textarea-mock {
  width: 100%;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;

  &.empty-bg {
    background-color: #f8f9fa;
    height: 120rpx;
  }

  &.content-bg {
    background-color: #f8f9fa;
  }
}

.time-picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f2f3f5;
  margin-top: 20rpx;

  &.picker-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .label {
    font-size: 28rpx;
    color: #333;
  }

  .time-value-wrap {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .time-text {
      font-size: 26rpx;
      color: #333;
    }
  }
}

.upload-section {
  margin-top: 28rpx;

  .upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .label {
      font-size: 28rpx;
      color: #333;
      .hint {
        color: #999;
        font-size: 24rpx;
      }
    }
    .count {
      font-size: 26rpx;
      color: #0066ff;
      font-weight: 500;
    }
  }
}

.img-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .upload-img {
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    background-color: #eaeaea;
  }

  .upload-add-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ccc;
    border-radius: 12rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.margin-top-lg {
  margin-top: 40rpx;
}

.custom-textarea {
  width: 100%;
  min-height: 160rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

/* 3. 材料明细预览样式 */
.material-preview-list {
  .preview-row {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .preview-sn {
      width: 40rpx;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      background-color: #0066ff;
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
      border-radius: 8rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .preview-info {
      flex: 1;
      min-width: 0;

      .preview-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        display: block;
      }

      .preview-remark {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
    }

    .preview-qty {
      font-size: 28rpx;
      color: #0066ff;
      font-weight: bold;
      flex-shrink: 0;
      margin-left: 16rpx;
    }
  }
}

.preview-empty {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
  cursor: pointer;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0 8rpx;
  border-top: 1rpx solid #f2f3f5;
  margin-top: 8rpx;
  cursor: pointer;

  text {
    font-size: 26rpx;
    color: #0066ff;
  }
}

/* 4. 底部固定暂存/完工按钮 */
.fixed-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: #ffffff;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)) 30rpx;
  display: flex;
  gap: 24rpx;
  border-top: 1px solid #f2f3f5;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    text-align: center;
    box-sizing: border-box;
    border: none;
    padding: 0;

    &::after {
      border: none;
    }

    &.btn-save {
      background-color: #fff;
      color: #0066ff;
      border: 2rpx solid #0066ff;
    }

    &.btn-complete {
      background-color: #0066ff;
      color: #ffffff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
