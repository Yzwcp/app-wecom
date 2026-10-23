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

        <!-- 实付金额 -->
        <view class="field-block">
          <view class="field-lbl">实付金额</view>
          <wd-input
            v-model="form.actualAmount"
            type="digit"
            placeholder="选填，不填按应付金额收款"
            no-border
            :readonly="isDetail"
            custom-class="form-input-bg"
          />
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

          <!-- 物品选择器：新增明细必选，选中后带出名称/型号 -->
          <view v-if="!isDetail" class="field-block">
            <view class="field-lbl">
              物品
              <text v-if="!prod.id" class="red">*</text>
            </view>
            <view class="goods-picker-wrap">
              <ApiSelectPicker
                v-model="prod.goodsId"
                :api="getGoodsList"
                label-key="goodsName"
                value-key="id"
                :label-format="goodsLabelFormat"
                :label="prod.goodsId ? prod.productName : ''"
                title="选择物品"
                placeholder="请选择物品"
                :z-index="999"
                @confirm="(row) => onGoodsConfirm(prod, row)"
              />
            </view>
          </view>

          <view class="field-block">
            <view class="field-lbl">
              产品名称
              <text class="red">*</text>
            </view>
            <wd-input
              v-model="prod.productName"
              :placeholder="prod.goodsId ? '以物品档案为准' : '请输入产品名称'"
              no-border
              :readonly="isDetail || !!prod.goodsId"
              custom-class="form-input-bg product-input-bg"
            />
          </view>

          <view class="field-block">
            <view class="field-lbl">产品型号</view>
            <wd-input
              v-model="prod.productModel"
              :placeholder="prod.goodsId ? '以物品档案为准' : '请输入产品型号'"
              no-border
              :readonly="isDetail || !!prod.goodsId"
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

      <!-- 支付信息（仅详情模式展示） -->
      <view v-if="isDetail && hasPayInfo" class="section-card">
        <view class="section-header">
          <wd-icon name="payment" size="18px" color="#0066ff" />
          <text class="section-title">支付信息</text>
        </view>

        <view class="field-block">
          <view class="field-lbl">支付渠道</view>
          <view class="readonly-box">
            <text class="readonly-text">{{ payChannelText }}</text>
          </view>
        </view>

        <view class="field-block">
          <view class="field-lbl">订单金额</view>
          <view class="readonly-box">
            <text class="readonly-text">¥{{ payTotalAmount }}</text>
          </view>
        </view>

        <view class="field-block">
          <view class="field-lbl">实付金额</view>
          <view class="readonly-box">
            <text class="readonly-text amount-highlight"
              >¥{{ payActualAmount }}</text
            >
          </view>
        </view>

        <view class="field-block" v-if="payTime">
          <view class="field-lbl">支付时间</view>
          <view class="readonly-box">
            <text class="readonly-text">{{ payTime }}</text>
          </view>
        </view>

        <view class="field-block" v-if="payFileUrlList.length">
          <view class="field-lbl">支付截图</view>
          <view class="pay-img-row">
            <image
              v-for="(url, idx) in payFileUrlList"
              :key="idx"
              :src="url"
              class="pay-img"
              mode="aspectFill"
              @click="previewPayImg(idx)"
            />
          </view>
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
  getGoodsList,
} from "@/api/contractOrder";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import ApiSelectPicker from "@/components/ApiSelectPicker.vue";

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
  actualAmount: "",
  remark: "",
  productList: [],
});

const submitLoading = ref(false);

// ========== 支付信息（详情模式回显） ==========
const thirdPayment = ref("");
const payFileUrlList = ref([]);
const payStatus = ref("");
const payTime = ref("");
const payTotalAmount = ref("-");
const payActualAmount = ref("-");

const payChannelText = computed(() => {
  if (thirdPayment.value === "BQBA_PAY") return "线上播钱吧";
  if (thirdPayment.value === "MANUAL") return "线下人工确认";
  return thirdPayment.value || "-";
});

const hasPayInfo = computed(
  () =>
    payStatus.value === "2" ||
    !!thirdPayment.value ||
    payFileUrlList.value.length > 0,
);

// 预览支付截图
function previewPayImg(idx) {
  uni.previewImage({ urls: payFileUrlList.value, current: idx });
}

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
    goodsId: "",
    productName: "",
    productModel: "",
    quantity: "",
    unitPrice: "",
    sort: "",
  };
}

// 物品选项文案：名称 | 型号
function goodsLabelFormat(item) {
  const parts = [item.goodsName || "-"];
  if (item.goodsModel) parts.push(item.goodsModel);
  return parts.join(" | ");
}

// 选中物品后回填名称/型号（以物品档案为准）
function onGoodsConfirm(prod, row) {
  if (row) {
    prod.goodsId = row.id;
    prod.productName = row.goodsName || "";
    prod.productModel = row.goodsModel || "";
  } else {
    prod.goodsId = "";
    prod.productName = "";
    prod.productModel = "";
  }
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
      actualAmount: order.actualAmount ?? "",
      remark: order.remark || "",
      productList: productList.map((p) => ({
        id: p.id || "",
        goodsId: p.goodsId || "",
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
    // 支付信息回显：渠道 + 金额 + 支付时间 + 线下支付截图
    thirdPayment.value = order.thirdPayment || "";
    payStatus.value = order.payStatus || "";
    payTime.value = order.payTime || "";
    payTotalAmount.value = order.totalAmount ?? "-";
    payActualAmount.value = order.actualAmount ?? "-";
    payFileUrlList.value = data.payFileUrlList || order.payFileUrlList || [];
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
    // 存量行（有 id）允许不带物品回显保存，新增行必须选择物品
    if (!p.id && !p.goodsId) {
      uni.showToast({ title: `第${i + 1}条请选择物品`, icon: "none" });
      return;
    }
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
    goodsId: p.goodsId || undefined,
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
    actualAmount:
      form.value.actualAmount === ""
        ? undefined
        : Number(form.value.actualAmount),
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

/* 支付截图 */
.pay-img-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .pay-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    background-color: #f7f8fa;
  }
}

.amount-highlight {
  color: #0066ff;
  font-weight: 600;
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

/* 物品选择器：与产品输入框保持一致的白底描边样式 */
.goods-picker-wrap {
  :deep(.api-select__inner) {
    background-color: #ffffff;
    border: 2rpx solid #dfe2e8;
    padding: 20rpx 24rpx;
    min-height: auto;
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
