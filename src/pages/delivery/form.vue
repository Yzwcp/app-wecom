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
          <image class="icon-user" src="/static/delivery/member.png"></image>

          <text class="title-text">签收信息</text>
        </view>
        <view class="customer-select-row">
          <view class="field-lbl required">客户（门店）</view>
          <ApiSelectScrollPicker
            v-model="formData.customerId"
            :api="getCustomerPage"
            paginated
            remote-search
            search-key="nameKeyword"
            label-key="storeName"
            value-key="id"
            title="选择客户"
            placeholder="选后收货信息未填时自动带出"
            :label="selectedCustomerName"
            :z-index="999"
            @confirm="onCustomerConfirm"
          />
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
          <textarea
            v-model="formData.receiverAddress"
            placeholder="详细地址"
            placeholder-class="placeholder-style"
            class="address-textarea"
            auto-height
          />
        </view>

        <!-- 客户（门店）：传了则收货信息未填时默认从门店带出 -->

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

        <!-- 回收明细（需回寄设备时必填，回收设备可与发出设备不一致） -->
        <view class="return-item-section" v-if="formData.needReturnDevice">
          <view class="return-item-header">
            <text class="return-item-label">回收明细</text>
            <view class="btn-add" @click="addReturnItem">
              <text class="icon-plus">+</text>添加
            </view>
          </view>
          <view
            class="return-item-row"
            v-for="(item, index) in returnItemList"
            :key="index"
          >
            <view class="return-item-picker">
              <ApiSelectPicker
                v-model="item.goodsId"
                :api="getGoodsList"
                label-key="goodsName"
                value-key="id"
                :labelFormat="goodsLabelFormat"
                title="选择回收物品"
                placeholder="选择物品"
                :label="item.goodsName"
                :z-index="999"
              />
            </view>
            <input
              v-model="item.quantity"
              type="number"
              class="return-qty-input"
              placeholder="数量"
            />
            <image
              @click="deleteReturnItem(index)"
              class="return-item-delete"
              src="/static/delivery/delete.png"
            ></image>
          </view>
        </view>
      </view>

      <!-- 2.5 发货人员 -->
      <view class="card form-card">
        <view class="card-title">
          <image class="icon-user" src="/static/delivery/member.png"></image>
          <text class="title-text">发货人员</text>
        </view>
        <ApiSelectPicker
          v-model="formData.deliveryPersonId"
          :api="getDeliveryPersonList"
          label-key="name"
          value-key="id"
          title="选择发货人员"
          placeholder="请选择发货人员"
          :label="selectedDeliveryPersonName"
          :z-index="999"
        />
      </view>

      <!-- 2.6 物流信息（发货人员可见） -->
      <view v-if="isDeliveryPerson" class="card form-card">
        <view class="card-title">
          <image class="icon-user" src="/static/delivery/member.png"></image>
          <text class="title-text">物流信息</text>
        </view>

        <!-- 物流公司：字典选择 -->
        <view class="logistics-item">
          <view class="field-lbl">物流公司</view>
          <DictSelectPicker
            v-model="formData.logisticsCompany"
            dict-key="WJ_LOGISTICS_COMPANY"
            title="选择物流公司"
            placeholder="请选择物流公司"
          />
        </view>

        <!-- 物流单号 + 扫码 -->
        <view class="logistics-item">
          <view class="field-lbl">物流单号</view>
          <view class="logistics-no-row">
            <input
              v-model="formData.logisticsNo"
              placeholder="请输入物流单号"
              placeholder-class="placeholder-style"
              class="logistics-no-input"
            />
            <view class="scan-btn" @click="handleScan">
              <wd-icon name="scan" size="22px" color="#0062ff" />
            </view>
          </view>
        </view>
      </view>

      <!-- 3. 发货清单 -->
      <view class="card list-card">
        <view class="list-card-header">
          <view class="header-left">
            <!-- <view class="blue-dot"></view> -->
            <image class="blue-dot" src="/static/delivery/doc.png"></image>

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
                :disabled="!!item.goodsId"
                :placeholder="
                  item.goodsId ? '以货品档案为准' : '请输入物品名称'
                "
              />
              <view class="goods-actions">
                <!-- <text
                  class="goods-action-btn goods-action-delete"
                 
                  >删除</text
                > -->
                <image
                  @click="deleteItem(index)"
                  class="goods-action-btn"
                  src="/static/delivery/delete.png"
                ></image>
              </view>
            </view>

            <!-- 选择库存货品（选后自动带名称规格） -->
            <view class="goods-picker">
              <ApiSelectPicker
                v-model="item.goodsId"
                :api="getGoodsList"
                label-key="goodsName"
                value-key="id"
                :labelFormat="goodsLabelFormat"
                title="选择货品"
                placeholder="选择货品（选填）"
                :z-index="999"
                @confirm="(row) => onGoodsConfirm(item, row)"
              />
            </view>

            <view class="goods-spec-grid">
              <view class="spec-box">
                <view class="spec-label">规格</view>
                <input
                  v-model="item.spec"
                  class="spec-input"
                  :disabled="!!item.goodsId"
                  :placeholder="item.goodsId ? '以货品档案为准' : '请输入'"
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
                <view class="spec-label">单价</view>
                <input
                  v-model="item.unitPrice"
                  type="digit"
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
        {{ submitting ? "提交中..." : isEdit ? "提交修改" : "提交申请" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useGlobalStore } from "../../store/global";
import {
  addDelivery,
  editDelivery,
  getDeliveryDetail,
  extractReceiver,
  getDeliveryPersonList,
  getGoodsList,
} from "@/api/delivery";
import { getCustomerPage, getCustomerBaseInfo } from "@/api/customer";
import ApiSelectPicker from "@/components/ApiSelectPicker.vue";
import ApiSelectScrollPicker from "@/components/ApiSelectScrollPicker.vue";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import { scanQRCode } from "@/utils/wx";

const globalStore = useGlobalStore();

const isDeliveryPerson = computed(() =>
  globalStore.userInfo?.roleCodeList?.includes("WJ_DELIVERY_PERSON"),
);

const query = ref({});
const isEdit = ref(false);

// 页面独有交互数据
const smartText = ref("");
const isCollapse = ref(false);
const submitting = ref(false);
// 回显文本（选项未加载时展示）
const selectedCustomerName = ref("");
const selectedDeliveryPersonName = ref("");

// 表单数据
const formData = ref({
  customerId: "",
  deliveryPersonId: "",
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  remark: "",
  needReturnDevice: true, // true=需要回寄, false=不需要
  logisticsCompany: "",
  logisticsNo: "",
});

// 发货清单
const goodsList = ref([
  {
    itemName: "",
    spec: "",
    quantity: "",
    unitPrice: "",
  },
]);

// 回收明细（需回寄设备时必填）
const returnItemList = ref([{ goodsId: "", quantity: "" }]);

const addReturnItem = () => {
  returnItemList.value.push({ goodsId: "", quantity: "" });
};

const deleteReturnItem = (index) => {
  returnItemList.value.splice(index, 1);
};

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
        formData.value.customerId = res.customerId || "";
        formData.value.deliveryPersonId = res.deliveryPersonId || "";
        formData.value.receiverName = res.receiverName || "";
        formData.value.receiverPhone = res.receiverPhone || "";
        formData.value.receiverAddress = res.receiverAddress || "";
        formData.value.remark = res.remark || "";
        formData.value.needReturnDevice = res.needReturnDevice !== "2";
        formData.value.logisticsCompany = res.logisticsCompany || "";
        formData.value.logisticsNo = res.logisticsNo || "";
        selectedCustomerName.value = res.customerName || "";
        selectedDeliveryPersonName.value = res.deliveryPersonName || "";
        if (res.itemList?.length) {
          goodsList.value = res.itemList.map((i) => ({
            goodsId: i.goodsId || "",
            itemName: i.itemName || "",
            spec: i.spec || "",
            quantity: i.quantity != null ? String(i.quantity) : "",
            unitPrice: i.unitPrice != null ? String(i.unitPrice) : "",
          }));
        }
        // 回收明细回显（整组替换语义，回传完整列表）
        if (res.returnItemList?.length) {
          returnItemList.value = res.returnItemList.map((i) => ({
            goodsId: i.goodsId || "",
            goodsName: i.goodsName || "",
            quantity: i.quantity != null ? String(i.quantity) : "",
          }));
        } else {
          returnItemList.value = [{ goodsId: "", quantity: "" }];
        }
      }
    } catch (error) {
      uni.hideLoading();
      console.error("加载发货详情失败", error);
      uni.showToast({ title: "加载失败", icon: "none" });
    }
  }
});

// 客户选中：收货信息未填时默认从门店带出（新增覆盖，编辑只填空项）
async function onCustomerConfirm(row) {
  selectedCustomerName.value = row?.storeName || "";
  if (!formData.value.customerId) {
    selectedCustomerName.value = "";
    return;
  }
  try {
    const data = await getCustomerBaseInfo({ id: formData.value.customerId });
    if (!data) return;
    const fill = (key, val) => {
      if (!val) return;
      if (!isEdit.value || !formData.value[key]) {
        formData.value[key] = val;
      }
    };
    fill("receiverName", data.contactName);
    fill("receiverPhone", data.contactPhone);
    fill("receiverAddress", data.address);
  } catch (err) {
    console.error("获取门店基础信息失败", err);
  }
}

// 货品标签格式化：名称 + 规格 + 库存数
function goodsLabelFormat(item) {
  const parts = [item.goodsName || "-"];
  if (item.goodsModel) parts.push(item.goodsModel);
  if (item.stockNum != null) parts.push(`库存:${item.stockNum}`);
  return parts.join(" | ");
}

// 选中货品后回填名称/规格（服务端以货品档案为准）
function onGoodsConfirm(item, row) {
  if (row) {
    item.itemName = row.goodsName || "";
    item.spec = row.goodsModel || "";
  } else {
    item.itemName = "";
    item.spec = "";
  }
}

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
    goodsId: "",
    itemName: "",
    spec: "",
    quantity: "",
    unitPrice: "",
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

// 扫码识别物流单号
const handleScan = async () => {
  try {
    const result = await scanQRCode();
    if (result) {
      formData.value.logisticsNo = result;
    }
  } catch (error) {
    console.error("扫码失败", error);
    uni.showToast({ title: "扫码失败", icon: "none" });
  }
};

// 取消
const handleCancel = () => {
  uni.navigateBack();
};

// 提交
const handleSubmit = async () => {
  // 校验
  if (!formData.value.customerId) {
    return uni.showToast({ title: "请选择客户（门店）", icon: "none" });
  }
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

  // 需回寄设备时回收明细必传
  const validReturnItems = returnItemList.value.filter(
    (i) => i.goodsId && Number(i.quantity) > 0,
  );
  if (formData.value.needReturnDevice && validReturnItems.length === 0) {
    return uni.showToast({ title: "请填写回收明细", icon: "none" });
  }

  const payload = {
    customerId: formData.value.customerId,
    receiverName: formData.value.receiverName,
    receiverPhone: formData.value.receiverPhone,
    receiverAddress: formData.value.receiverAddress,
    remark: formData.value.remark || "",
    needReturnDevice: formData.value.needReturnDevice ? "1" : "2",
    itemList: validItems.map((i) => ({
      goodsId: i.goodsId || undefined,
      itemName: i.itemName,
      quantity: Number(i.quantity) || 0,
      spec: i.spec || "",
      unitPrice:
        i.unitPrice != null && i.unitPrice !== "" ? Number(i.unitPrice) : 0,
    })),
  };

  if (formData.value.deliveryPersonId) {
    payload.deliveryPersonId = formData.value.deliveryPersonId;
  }

  // 需回寄设备时携带回收明细（编辑为整组替换语义）
  if (formData.value.needReturnDevice) {
    payload.returnItemList = validReturnItems.map((i) => ({
      goodsId: i.goodsId,
      quantity: Number(i.quantity),
    }));
  }

  // 发货人员提交物流信息
  if (isDeliveryPerson.value) {
    payload.logisticsCompany = formData.value.logisticsCompany || "";
    payload.logisticsNo = formData.value.logisticsNo || "";
  }

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
    padding-left: 10px;
  }
  .border-r {
    border-right: 1rpx solid #eeeeee;
    padding-right: 20rpx;
  }

  .address-item {
    margin-bottom: 30rpx;

    .address-textarea {
      width: 100%;
      min-height: 48rpx;
      font-size: 30rpx;
      color: #323233;
      line-height: 1.5;
      box-sizing: border-box;
    }
  }

  .customer-select-row {
    margin-bottom: 30rpx;
    .field-lbl {
      font-size: 28rpx;
      color: #1a1a1a;
      font-weight: 500;
      margin-bottom: 16rpx;
      &.required::before {
        content: "*";
        color: #ee0a24;
        margin-right: 4rpx;
      }
    }
  }

  /* 物流信息：上下排列 */
  .logistics-item {
    margin-bottom: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
    .field-lbl {
      font-size: 28rpx;
      color: #1a1a1a;
      font-weight: 500;
      margin-bottom: 16rpx;
    }
  }

  .logistics-no-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    min-height: 80rpx;

    .logistics-no-input {
      flex: 1;
      font-size: 28rpx;
      color: #323233;
    }

    .scan-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12rpx;
    }
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

  /* 回收明细 */
  .return-item-section {
    margin-top: 30rpx;
    border-top: 1rpx solid #eeeeee;
    padding-top: 24rpx;

    .return-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .return-item-label {
        font-size: 28rpx;
        color: #1a1a1a;
        font-weight: 500;
      }

      .btn-add {
        color: #0062ff;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        font-weight: 500;
        .icon-plus {
          font-size: 32rpx;
          margin-right: 4rpx;
        }
      }
    }

    .return-item-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .return-item-picker {
        flex: 1;
      }

      .return-qty-input {
        width: 140rpx;
        height: 80rpx;
        background-color: #f7f8fa;
        border-radius: 12rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #323233;
        box-sizing: border-box;
      }

      .return-item-delete {
        width: 32rpx;
        height: 32rpx;
        flex-shrink: 0;
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
        width: 40rpx;
        height: 40rpx;
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
        font-size: 30rpx;
        font-weight: 500;
        color: #1a1a1a;
        background-color: #f7f8fa;
        border-radius: 12rpx;
        padding: 12rpx 20rpx;
        height: 64rpx;
        box-sizing: border-box;
      }

      .goods-actions {
        display: flex;
        align-items: center;
        gap: 16rpx;
        flex-shrink: 0;

        .goods-action-btn {
          width: 30rpx;
          height: 30rpx;
        }
        .goods-action-delete {
          color: #ee0a24;
          border-color: #ee0a24;
        }
      }
    }

    /* 三列规格网格布局 */
    .goods-picker {
      margin-bottom: 20rpx;
    }

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
  z-index: 1;

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
