<template>
  <view class="page">
    <!-- 顶部自定义导航栏（按需，若无原生导航可自备） -->
    <uni-nav-bar
      left-icon="left"
      :title="isEdit ? '编辑发货信息' : '发货信息'"
      :border="false"
      background-color="#ffffff"
      status-bar
      fixed
    />

    <view class="container">
      <!-- 1. 智能识别输入框（新建模式显示） -->
      <view class="card auto-recognize" v-if="!isEdit">
        <textarea
          v-model="smartText"
          placeholder="粘贴或输入内容，自动识别姓名、电话和地址"
          placeholder-style="color: #c8c9cc; font-size: 28rpx;"
          class="smart-textarea"
        />
        <view class="recognize-btn-wrap">
          <button class="btn-recognize" @click="handleRecognize">
            粘贴并识别
          </button>
        </view>
      </view>

      <!-- 2. 签收信息表单 -->
      <view class="card form-card">
        <view class="card-title">
          <text class="icon-user">👤</text>
          <text class="title-text">签收信息</text>
        </view>

        <view class="form-row-grid">
          <view class="form-item border-b border-r">
            <input
              v-model="formData.receiverName"
              placeholder="姓名"
              placeholder-class="placeholder-style"
            />
          </view>
          <view class="form-item border-b">
            <input
              v-model="formData.receiverPhone"
              type="number"
              placeholder="电话"
              placeholder-class="placeholder-style"
            />
          </view>
        </view>

        <view class="form-item border-b address-item">
          <input
            v-model="formData.receiverAddress"
            placeholder="详细地址"
            placeholder-class="placeholder-style"
          />
        </view>

        <view class="remark-section">
          <view class="remark-label">备注</view>
          <textarea
            v-model="formData.remark"
            placeholder=""
            class="remark-textarea"
          />
        </view>

        <view
          class="switch-section"
          @click="formData.needReturnDevice = !formData.needReturnDevice"
        >
          <text class="switch-label">是否需要回寄设备</text>
          <view
            class="checkbox-circle"
            :class="{ checked: formData.needReturnDevice }"
          >
            <text v-if="formData.needReturnDevice" class="icon-check">✓</text>
          </view>
        </view>
      </view>

      <!-- 3. 发货清单 -->
      <view class="card list-card">
        <view class="list-card-header">
          <view class="header-left">
            <view class="blue-dot"></view>
            <text class="title-text">发货清单</text>
          </view>
          <view class="header-right">
            <view class="btn-add" @click="addItem">
              <text class="icon-plus">+</text>添加
            </view>
            <view class="btn-toggle" @click="isCollapse = !isCollapse">
              <text>{{ isCollapse ? "展开" : "折叠" }}</text>
              <text class="icon-arrow" :class="{ rotate: isCollapse }">▼</text>
            </view>
          </view>
        </view>

        <!-- 清单列表折叠区域 -->
        <view v-show="!isCollapse" class="list-content">
          <view
            class="goods-item"
            v-for="(item, index) in goodsList"
            :key="index"
          >
            <view class="goods-header">
              <view class="goods-index">{{
                String(index + 1).padStart(2, "0")
              }}</view>
              <input
                class="goods-name-input"
                v-model="item.itemName"
                placeholder="请输入物品名称"
              />
              <view class="goods-actions">
                <text class="icon-edit" @click="editItem(index)">📝</text>
                <text class="icon-delete" @click="deleteItem(index)">🗑️</text>
              </view>
            </view>

            <view class="goods-spec-grid">
              <view class="spec-box">
                <view class="spec-label">规格</view>
                <input
                  v-model="item.spec"
                  class="spec-input"
                  placeholder="请输入"
                />
              </view>
              <view class="spec-box">
                <view class="spec-label">数量</view>
                <input
                  v-model="item.quantity"
                  type="number"
                  class="spec-input"
                  placeholder="请输入"
                />
              </view>
              <view class="spec-box">
                <view class="spec-label">单位</view>
                <input
                  v-model="item.unit"
                  class="spec-input"
                  placeholder="请输入"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定操作栏 -->
    <view class="footer-actions">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? "提交中..." : isEdit ? "提交修改" : "申请提交" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  addDelivery,
  editDelivery,
  getDeliveryDetail,
  extractReceiver,
} from "@/api/delivery";

const query = ref({});
const isEdit = ref(false);

// 页面独有交互数据
const smartText = ref("");
const isCollapse = ref(false);
const submitting = ref(false);

// 表单数据
const formData = ref({
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  remark: "",
  needReturnDevice: true, // true=需要回寄, false=不需要
});

// 发货清单
const goodsList = ref([
  {
    itemName: "",
    spec: "",
    quantity: "",
    unit: "",
  },
]);

// 从查询参数中读取 constructionTaskId 或 id（编辑模式）
onLoad(async (options) => {
  query.value = options || {};
  if (options?.constructionTaskId) {
    console.log("constructionTaskId:", options.constructionTaskId);
  }
  if (options?.id) {
    isEdit.value = true;
    uni.setNavigationBarTitle({ title: "编辑发货信息" });
    try {
      uni.showLoading({ title: "加载中..." });
      const res = await getDeliveryDetail({ id: options.id });
      uni.hideLoading();
      if (res) {
        formData.value.receiverName = res.receiverName || "";
        formData.value.receiverPhone = res.receiverPhone || "";
        formData.value.receiverAddress = res.receiverAddress || "";
        formData.value.remark = res.remark || "";
        formData.value.needReturnDevice = res.needReturnDevice !== "2";
        if (res.itemList?.length) {
          goodsList.value = res.itemList.map((i) => ({
            itemName: i.itemName || "",
            spec: i.spec || "",
            quantity: i.quantity != null ? String(i.quantity) : "",
            unit: i.unit || "",
          }));
        }
      }
    } catch (error) {
      uni.hideLoading();
      console.error("加载发货详情失败", error);
      uni.showToast({ title: "加载失败", icon: "none" });
    }
  }
});

// 智能识别文本
const handleRecognize = async () => {
  let text = smartText.value.trim();

  // 如果输入框为空，尝试读取剪贴板
  if (!text) {
    try {
      const res = await uni.getClipboardData();
      if (res.data) {
        text = res.data.trim();
        smartText.value = text;
      } else {
        uni.showToast({ title: "剪贴板为空", icon: "none" });
        return;
      }
    } catch {
      uni.showToast({ title: "读取剪贴板失败", icon: "none" });
      return;
    }
  }

  // 调用后端识别接口
  try {
    uni.showLoading({ title: "识别中..." });
    const res = await extractReceiver({ text });
    uni.hideLoading();

    if (res) {
      if (res.receiverName != null)
        formData.value.receiverName = res.receiverName;
      if (res.receiverPhone != null)
        formData.value.receiverPhone = res.receiverPhone;
      if (res.receiverAddress != null)
        formData.value.receiverAddress = res.receiverAddress;
      uni.showToast({ title: "识别完成", icon: "success" });
    }
  } catch (error) {
    uni.hideLoading();
    console.error("识别失败", error);
    uni.showToast({ title: "识别失败，请手动填写", icon: "none" });
  }
};

// 清单操作
const addItem = () => {
  goodsList.value.push({
    itemName: "",
    spec: "",
    quantity: "",
    unit: "",
  });
  isCollapse.value = false;
};

const deleteItem = (index) => {
  uni.showModal({
    title: "提示",
    content: "确定删除该项物品吗？",
    success: (res) => {
      if (res.confirm) {
        goodsList.value.splice(index, 1);
      }
    },
  });
};

const editItem = (index) => {
  uni.showToast({ title: `编辑第 ${index + 1} 项`, icon: "none" });
};

// 取消
const handleCancel = () => {
  uni.navigateBack();
};

// 提交
const handleSubmit = async () => {
  // 校验
  if (
    !formData.value.receiverName ||
    !formData.value.receiverPhone ||
    !formData.value.receiverAddress
  ) {
    return uni.showToast({ title: "请完善签收信息", icon: "none" });
  }
  const validItems = goodsList.value.filter((i) => i.itemName);
  if (validItems.length === 0) {
    return uni.showToast({ title: "请至少添加一项发货物品", icon: "none" });
  }

  const payload = {
    receiverName: formData.value.receiverName,
    receiverPhone: formData.value.receiverPhone,
    receiverAddress: formData.value.receiverAddress,
    remark: formData.value.remark || "",
    needReturnDevice: formData.value.needReturnDevice ? "1" : "2",
    itemList: validItems.map((i) => ({
      itemName: i.itemName,
      quantity: Number(i.quantity) || 0,
      spec: i.spec || "",
      unit: i.unit || "",
    })),
  };

  // 如果有 constructionTaskId 则带上
  if (query.value?.constructionTaskId) {
    payload.constructionTaskId = query.value.constructionTaskId;
  }

  // 编辑模式带上 id
  if (isEdit.value && query.value?.id) {
    payload.id = query.value.id;
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      await editDelivery(payload);
      uni.showToast({ title: "修改成功", icon: "success" });
    } else {
      await addDelivery(payload);
      uni.showToast({ title: "提交成功", icon: "success" });
    }
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (error) {
    console.error("提交发货失败", error);
    uni.showToast({ title: error?.message || "提交失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
// 引入基础背景色和全局统一样式
:deep(.wd-tabbar) {
  background: transparent !important;
}

.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa; /* 还原页面的浅灰底色 */
  padding-bottom: 180rpx; /* 为底部悬浮按钮留出空间 */
  box-sizing: border-box;
}

.container {
  padding: 24rpx;
}

/* 卡片通用样式 */
.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

/* 1. 智能识别区 */
.auto-recognize {
  position: relative;
  .smart-textarea {
    width: 100%;
    height: 160rpx;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #323233;
  }
  .recognize-btn-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 10rpx;
    .btn-recognize {
      background-color: #0062ff;
      color: #ffffff;
      font-size: 24rpx;
      padding: 0 28rpx;
      height: 52rpx;
      line-height: 52rpx;
      border-radius: 26rpx;
      margin: 0;
      &::after {
        border: none;
      }
    }
  }
}

/* 2. 签收信息表单 */
.form-card {
  .card-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    .icon-user {
      background-color: #0062ff;
      color: white;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22rpx;
      margin-right: 16rpx;
    }
    .title-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #1a1a1a;
    }
  }

  .form-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .form-item {
    padding: 24rpx 0;
    input {
      font-size: 30rpx;
      color: #323233;
      width: 100%;
    }
  }

  .placeholder-style {
    color: #969799;
  }

  /* 边框辅助线 */
  .border-b {
    border-bottom: 1rpx solid #eeeeee;
  }
  .border-r {
    border-right: 1rpx solid #eeeeee;
    padding-right: 20rpx;
  }

  .address-item {
    margin-bottom: 30rpx;
  }

  .remark-section {
    .remark-label {
      font-size: 28rpx;
      color: #1a1a1a;
      font-weight: 500;
      margin-bottom: 16rpx;
    }
    .remark-textarea {
      width: 100%;
      height: 140rpx;
      background-color: #f7f8fa;
      border-radius: 12rpx;
      padding: 20rpx;
      box-sizing: border-box;
      font-size: 28rpx;
    }
  }

  .switch-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30rpx;
    .switch-label {
      font-size: 28rpx;
      color: #1a1a1a;
    }
    .checkbox-circle {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #c8c9cc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &.checked {
        background-color: #0062ff;
        border-color: #0062ff;
      }
      .icon-check {
        color: #ffffff;
        font-size: 22rpx;
        font-weight: bold;
      }
    }
  }
}

/* 3. 发货清单 */
.list-card {
  .list-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .header-left {
      display: flex;
      align-items: center;
      .blue-dot {
        width: 30rpx;
        height: 30rpx;
        background-color: #0062ff;
        border-radius: 50%;
        margin-right: 16rpx;
      }
      .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #1a1a1a;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      font-size: 28rpx;

      .btn-add {
        color: #0062ff;
        margin-right: 30rpx;
        display: flex;
        align-items: center;
        font-weight: 500;
        .icon-plus {
          font-size: 32rpx;
          margin-right: 4rpx;
        }
      }

      .btn-toggle {
        color: #646566;
        display: flex;
        align-items: center;
        .icon-arrow {
          font-size: 20rpx;
          margin-left: 6rpx;
          transition: transform 0.2s;
          &.rotate {
            transform: rotate(180deg);
          }
        }
      }
    }
  }

  /* 清单单项卡片样式 */
  .goods-item {
    border: 1rpx solid #e5e5e5;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .goods-header {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;

      .goods-index {
        background-color: #0062ff;
        color: #ffffff;
        font-size: 24rpx;
        font-weight: bold;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }

      .goods-name-input {
        flex: 1;
        font-size: 32rpx;
        font-weight: 500;
        color: #1a1a1a;
      }

      .goods-actions {
        display: flex;
        gap: 24rpx;
        font-size: 32rpx;

        .icon-edit {
          color: #0062ff;
        }
        .icon-delete {
          color: #ee0a24;
        }
      }
    }

    /* 三列规格网格布局 */
    .goods-spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20rpx;

      .spec-box {
        background-color: #f7f8fa;
        border-radius: 12rpx;
        padding: 16rpx 20rpx;

        .spec-label {
          font-size: 22rpx;
          color: #969799;
          margin-bottom: 8rpx;
        }

        .spec-input {
          font-size: 30rpx;
          color: #0062ff;
          font-weight: 500;
          height: 40rpx;
        }
      }
    }
  }
}

/* 固定底部栏样式 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom)); /* 适配全面屏底部小黑条 */
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 99;

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 16rpx;
    margin: 0;
    &::after {
      border: none;
    }
  }

  .btn-cancel {
    background-color: #ffffff;
    color: #0062ff;
    border: 2rpx solid #0062ff;
  }

  .btn-submit {
    background-color: #0062ff;
    color: #ffffff;
  }

  .btn-submit[disabled] {
    opacity: 0.6;
  }
}
</style>
