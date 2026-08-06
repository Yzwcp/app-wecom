<template>
  <view class="page">
    <wd-navbar
      :title="navTitle"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <view class="form-container">
      <!-- 合同信息 -->
      <view class="section-card">
        <view class="section-header">
          <wd-icon name="file" size="18px" color="#0066ff" />
          <text class="section-title">订单信息</text>
        </view>

        <view class="field-block">
          <view class="field-lbl">关联合同</view>
          <view class="readonly-box">
            <text class="readonly-text">{{ contractName || "-" }}</text>
          </view>
        </view>

        <!-- 订单名称 -->
        <view class="field-block">
          <view class="field-lbl">
            订单名称
            <text class="red">*</text>
          </view>
          <wd-input
            v-model="form.orderName"
            placeholder="请输入订单名称"
            no-border
            :readonly="isDetail"
            custom-class="form-input-bg"
          />
        </view>

        <!-- 订单类型 -->
        <view class="field-block">
          <view class="field-lbl">订单类型</view>
          <DictSelectPicker
            v-model="form.orderType"
            dict-key="CONTRACT_ORDER_TYPE"
            title="选择订单类型"
            placeholder="请选择订单类型"
            :disabled="isDetail"
          />
        </view>

        <!-- 自动同步服务到期 -->
        <view class="field-block switch-row">
          <view class="switch-label">
            <view class="field-lbl">是否自动同步合同服务到期时间</view>
          </view>
          <wd-switch v-model="form.autoSyncService" :disabled="isDetail" />
        </view>
      </view>

      <!-- 产品明细 -->
      <view class="section-card">
        <view class="section-header">
          <wd-icon name="tag" size="18px" color="#0066ff" />
          <text class="section-title">产品明细</text>
          <text class="section-total">合计：¥{{ totalPriceText }}</text>
          <view class="section-action" v-if="!isDetail" @click="addProduct"
            >+ 添加</view
          >
        </view>

        <view
          v-for="(prod, index) in form.productList"
          :key="index"
          class="product-item"
        >
          <view class="product-head">
            <text class="product-index">产品 {{ index + 1 }}</text>
            <text
              v-if="!isDetail"
              class="product-remove"
              @click="removeProduct(index)"
              >删除</text
            >
          </view>

          <view class="field-block">
            <view class="field-lbl">
              产品名称
              <text class="red">*</text>
            </view>
            <wd-input
              v-model="prod.productName"
              placeholder="请输入产品名称"
              no-border
              :readonly="isDetail"
              custom-class="form-input-bg product-input-bg"
            />
          </view>

          <view class="field-block">
            <view class="field-lbl">产品型号</view>
            <wd-input
              v-model="prod.productModel"
              placeholder="请输入产品型号"
              no-border
              :readonly="isDetail"
              custom-class="form-input-bg product-input-bg"
            />
          </view>

          <view class="two-col">
            <view class="field-block flex-1">
              <view class="field-lbl">
                采购数量
                <text class="red">*</text>
              </view>
              <wd-input
                v-model="prod.quantity"
                type="number"
                placeholder="数量"
                no-border
                :readonly="isDetail"
                custom-class="form-input-bg product-input-bg"
              />
            </view>
            <view class="field-block flex-1">
              <view class="field-lbl">
                单品单价
                <text class="red">*</text>
              </view>
              <wd-input
                v-model="prod.unitPrice"
                type="digit"
                placeholder="单价"
                no-border
                :readonly="isDetail"
                custom-class="form-input-bg product-input-bg"
              />
            </view>
          </view>

          <view class="field-block">
            <view class="field-lbl">排序</view>
            <wd-input
              v-model="prod.sort"
              type="number"
              placeholder="排序（选填）"
              no-border
              :readonly="isDetail"
              custom-class="form-input-bg product-input-bg"
            />
          </view>
        </view>

        <view v-if="!form.productList.length" class="product-empty">
          <text class="product-empty-text"
            >暂无产品明细，请点击右上角"添加"</text
          >
        </view>
      </view>

      <!-- 备注 -->
      <view class="section-card">
        <view class="field-block">
          <view class="field-lbl">备注</view>
          <wd-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入订单备注"
            no-border
            :readonly="isDetail"
            custom-class="form-input-bg textarea-h"
          />
        </view>
      </view>
    </view>

    <!-- 底部固定的提交按钮 -->
    <view v-if="!isDetail" class="bottom-action-bar">
      <wd-button
        type="primary"
        class="btn-item"
        :loading="submitLoading"
        @click="submitForm"
        >提交</wd-button
      >
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  addContractOrder,
  editContractOrder,
  getContractOrderDetail,
} from "@/api";
import DictSelectPicker from "@/components/DictSelectPicker.vue";

const navTitle = ref("新增订单");
const orderId = ref("");
const contractId = ref("");
const customerId = ref("");
const contractName = ref("");
const isDetail = ref(false);

const form = ref({
  orderName: "",
  orderType: "",
  autoSyncService: false,
  remark: "",
  productList: [],
});

const submitLoading = ref(false);

// 产品明细合计总价
const totalPriceText = computed(() => {
  const total = form.value.productList.reduce((sum, p) => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  return total.toFixed(2);
});

function newProduct() {
  return {
    id: "",
    productName: "",
    productModel: "",
    quantity: "",
    unitPrice: "",
    sort: "",
  };
}

function addProduct() {
  form.value.productList.push(newProduct());
}

function removeProduct(index) {
  form.value.productList.splice(index, 1);
}

onLoad((op) => {
  contractId.value = op.contractId || "";
  customerId.value = op.customerId || "";
  contractName.value = decodeURIComponent(op.name || "");
  isDetail.value = op.readonly === "1";

  if (op.id) {
    orderId.value = op.id;
    navTitle.value = isDetail.value ? "订单详情" : "编辑订单";
    loadOrderDetail(op.id);
  }
});

// 加载订单详情回显
async function loadOrderDetail(id) {
  try {
    const data = await getContractOrderDetail({ id });
    const order = data.order || data;
    const productList =
      data.productList || order.productList || order.products || [];
    form.value = {
      orderName: order.orderName || "",
      orderType: order.orderType || "",
      autoSyncService:
        order.autoSyncService === true ||
        order.autoSyncService === 1 ||
        order.autoSyncService === "1",
      remark: order.remark || "",
      productList: productList.map((p) => ({
        id: p.id || "",
        productName: p.productName || "",
        productModel: p.productModel || "",
        quantity: p.quantity ?? "",
        unitPrice: p.unitPrice ?? "",
        sort: p.sort ?? "",
      })),
    };
    if (!customerId.value) {
      customerId.value = order.customerId || "";
    }
  } catch (e) {
    uni.showToast({ title: "订单详情加载失败", icon: "none" });
  }
}

function goBack() {
  uni.navigateBack();
}

function submitForm() {
  if (!form.value.orderName) {
    uni.showToast({ title: "请填写订单名称", icon: "none" });
    return;
  }
  if (!form.value.productList.length) {
    uni.showToast({ title: "请至少添加一条产品明细", icon: "none" });
    return;
  }
  for (let i = 0; i < form.value.productList.length; i++) {
    const p = form.value.productList[i];
    if (!p.productName) {
      uni.showToast({ title: `第${i + 1}条产品名称不能为空`, icon: "none" });
      return;
    }
    if (p.quantity === "" || p.quantity === null || p.quantity === undefined) {
      uni.showToast({ title: `第${i + 1}条采购数量不能为空`, icon: "none" });
      return;
    }
    if (
      p.unitPrice === "" ||
      p.unitPrice === null ||
      p.unitPrice === undefined
    ) {
      uni.showToast({ title: `第${i + 1}条单品单价不能为空`, icon: "none" });
      return;
    }
  }

  const productList = form.value.productList.map((p) => ({
    ...p,
    quantity: Number(p.quantity),
    unitPrice: Number(p.unitPrice),
    sort: p.sort === "" ? undefined : Number(p.sort),
  }));

  const params = {
    contractId: contractId.value,
    customerId: customerId.value,
    orderName: form.value.orderName,
    orderType: form.value.orderType || undefined,
    autoSyncService: form.value.autoSyncService ? "1" : "2",
    remark: form.value.remark || undefined,
    productList,
  };

  submitLoading.value = true;
  const request = orderId.value
    ? editContractOrder({ id: orderId.value, ...params })
    : addContractOrder(params);

  request
    .then(() => {
      uni.showToast({
        title: orderId.value ? "保存成功" : "创建成功",
        icon: "success",
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    })
    .finally(() => {
      submitLoading.value = false;
    });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 200rpx;
}
.form-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.red {
  color: #ef4444;
  margin-left: 6rpx;
}
.flex-1 {
  flex: 1;
}

.section-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.01);

  .section-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    border-bottom: 1px solid #f5f6f7;
    padding-bottom: 20rpx;
    margin-bottom: 28rpx;
    .section-title {
      flex: 1;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
    .section-total {
      font-size: 26rpx;
      font-weight: bold;
      color: #e6a23c;
      margin-right: 16rpx;
    }
    .section-action {
      font-size: 26rpx;
      color: #0066ff;
    }
  }
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;
}
.field-lbl {
  font-size: 26rpx;
  font-weight: 500;
  color: #666;
}

:deep(.form-input-bg) {
  background-color: #f7f8fa !important;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
}
/* 产品明细输入框：白底加边框，更明显 */
:deep(.product-input-bg) {
  background-color: #ffffff !important;
  border: 2rpx solid #dfe2e8 !important;
}
.textarea-h {
  :deep(textarea) {
    min-height: 150rpx !important;
  }
}

.readonly-box {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  .readonly-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

/* 自动同步开关行 */
.switch-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  .switch-label {
    flex: 1;
    min-width: 0;
  }
}

/* 产品明细 */
.product-item {
  background-color: #fafbfc;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .product-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    .product-index {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }
    .product-remove {
      font-size: 24rpx;
      color: #ef4444;
    }
  }

  .two-col {
    display: flex;
    gap: 20rpx;
  }
}

.product-empty {
  padding: 40rpx 0;
  text-align: center;
  .product-empty-text {
    font-size: 24rpx;
    color: #999;
  }
}

/* 吸底提交按钮 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 2;

  .btn-item {
    width: 100%;
    :deep(.wd-button) {
      width: 100%;
      height: 80rpx;
      border-radius: 12rpx;
    }
  }
}
</style>
