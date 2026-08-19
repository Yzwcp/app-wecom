<template>
  <view class="page">
    <!-- <wd-navbar
      :title="navTitle"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    /> -->

    <view class="form-container">
      <!-- 1. 客户基础信息（静态） -->
      <view class="section-card info-card">
        <view class="section-header">
          <image
            class="icon-user"
            style="width: 40rpx; height: 40rpx"
            src="/static/contract/user.png"
          ></image>
          <text class="section-title">客户信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="l">客户名称</text>
            <text class="v">{{ form.customerName }}</text>
          </view>
        </view>
      </view>

      <!-- 2. 合同详细信息录入 -->
      <view class="section-card">
        <view class="section-header">
          <image
            class="icon-user"
            style="width: 40rpx; height: 40rpx"
            src="/static/contract/chapter.png"
          ></image>
          <text class="section-title">合同详情</text>
        </view>

        <!-- 合同编号（只读，新增时预生成） -->
        <view class="field-block">
          <view class="field-lbl">合同编号</view>
          <view class="date-input-box readonly-box">
            <text class="dt-txt">{{ form.contractNo || "-" }}</text>
          </view>
        </view>

        <!-- 合同标题 -->
        <view class="field-block">
          <view class="field-lbl">
            合同标题
            <text class="red">*</text>
          </view>
          <wd-input
            v-model="form.contractName"
            placeholder="请输入合同标题"
            no-border
            :disabled="viewMode"
            custom-class="form-input-bg"
          />
        </view>

        <!-- 签订日期 -->
        <view class="field-block">
          <view class="field-lbl">
            签订日期
            <text class="red">*</text>
          </view>
          <view class="date-input-box" @click="openDatePicker('signDate')">
            <text
              :class="['dt-txt', form.signDate ? 'text-black' : 'text-gray']"
              >{{ form.signDate || "年/月/日 时:分:秒" }}</text
            >
            <wd-icon name="calendar" size="16px" color="#999" />
          </view>
        </view>

        <!-- 合同类型 -->
        <view class="field-block">
          <view class="field-lbl">合同类型</view>
          <DictSelectPicker
            v-model="form.contractType"
            dict-key="WJ_PROJECT_SERVICE"
            title="选择合同类型"
            :disabled="viewMode"
          />
        </view>

        <!-- 签署方式 -->
        <view class="field-block">
          <view class="field-lbl">
            签署方式
            <text class="red">*</text>
          </view>
          <DictSelectPicker
            v-model="form.signWay"
            dict-key="CONTRACT_SIGN_WAY"
            title="选择签署方式"
            placeholder="请选择签署方式"
            :disabled="viewMode"
          />
        </view>

        <!-- 关联外出记录 -->
        <view class="field-block">
          <view class="field-lbl">外出记录</view>
          <ApiSelectPicker
            v-model="form.outworkId"
            :api="getOutworkPage"
            paginated
            :params="{ customerId: form.customerId, status: 'COMPLETED' }"
            label-key="customerName"
            value-key="outworkId"
            :label="form.outworkId ? form.customerName : ''"
            title="选择外出记录"
            placeholder="请选择外出记录"
            :disabled="viewMode"
          />
        </view>

        <!-- 生效时间与到期时间并排布局 -->
        <view class="time-range-row">
          <view class="flex-1">
            <view class="field-lbl">生效开始时间</view>
            <view
              class="date-input-box"
              @click="openDatePicker('effectiveStartTime')"
            >
              <text
                :class="[
                  'dt-txt',
                  form.effectiveStartTime ? 'text-black' : 'text-gray',
                ]"
                >{{ form.effectiveStartTime || "年/月/日 时:分:秒" }}</text
              >
              <wd-icon name="calendar" size="16px" color="#999" />
            </view>
          </view>
          <view class="flex-1">
            <view class="field-lbl">生效结束时间</view>
            <view
              class="date-input-box"
              @click="openDatePicker('effectiveEndTime')"
            >
              <text
                :class="[
                  'dt-txt',
                  form.effectiveEndTime ? 'text-black' : 'text-gray',
                ]"
                >{{ form.effectiveEndTime || "年/月/日 时:分:秒" }}</text
              >
              <wd-icon name="calendar" size="16px" color="#999" />
            </view>
          </view>
        </view>

        <!-- 合同文件（电子签） -->
        <view v-if="form.signWay === 'ESIGN'" class="field-block">
          <view class="field-lbl">
            合同文件
            <text class="red">*</text>
          </view>
          <ImgUpload
            v-model="contractFileUrl"
            @update:fileId="form.contractFileId = $event"
            category="WJ_CONTRACT_FILE"
            :limit="1"
            accept="all"
            :extension="['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']"
            :size-limit="10"
            :readonly="viewMode"
          />
          <text v-if="!viewMode" class="upload-tip"
            >请上传Office软件导出的合同文件，支持 PDF、Word、单个文件不超过
            10MB。</text
          >
        </view>

        <!-- 纸质合同照片（纸质签） -->
        <view v-if="form.signWay === 'PAPER'" class="field-block">
          <view class="field-lbl">
            纸质合同照片
            <text class="red">*</text>
          </view>
          <ImgUpload
            v-model="paperFileUrlList"
            @update:fileId="addPaperFileId"
            category="WJ_CONTRACT_FILE"
            :limit="9"
            accept="image"
            :extension="['.jpg', '.jpeg', '.png']"
            :size-limit="10"
            :readonly="viewMode"
          />
          <text v-if="!viewMode" class="upload-tip"
            >请上传纸质合同照片，支持 JPG、PNG，单个文件不超过 10MB，最多 9
            张。</text
          >
        </view>

        <!-- 签署文件（详情中已电签完成时展示） -->
        <view v-if="signedFileUrl" class="field-block">
          <view class="field-lbl">签署文件</view>
          <view class="sign-file-box">
            <view class="sign-file-url" @click="openSignFile">
              <text class="sign-file-text">{{ signedFileUrl }}</text>
            </view>
            <view class="sign-file-actions">
              <wd-button size="small" plain @click="copySignFile"
                >复制链接</wd-button
              >
              <wd-button size="small" type="primary" @click="openSignFile"
                >打开</wd-button
              >
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="field-block">
          <view class="field-lbl">备注</view>
          <wd-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入合同备注"
            no-border
            :disabled="viewMode"
            custom-class="form-input-bg textarea-h"
          />
        </view>
      </view>

      <!-- 底部提示区 -->
      <view v-if="!viewMode" class="info-alert-bar">
        <wd-icon name="info-circle" size="16px" color="#0066ff" />
        <text class="alert-text"
          >提交后合同将进入"待审核"状态。审核通过后，该客户的状态将自动更新为"已签约"。</text
        >
      </view>
    </view>

    <!-- 底部固定的提交按钮 -->
    <view v-if="!viewMode" class="bottom-action-bar">
      <wd-button
        type="primary"
        class="btn-item"
        :loading="submitLoading"
        @click="submitForm"
        >提交</wd-button
      >
    </view>

    <!-- 日期时间选择器 -->
    <wd-datetime-picker
      v-model="currentDateVal"
      type="datetime"
      use-second
      v-model:visible="datePickerShow"
      @confirm="confirmDate"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import {
  addContract,
  editContract,
  getContractDetail,
  getNextContractNo,
  getOutworkPage,
} from "@/api";
import ImgUpload from "@/components/ImgUpload.vue";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import ApiSelectPicker from "@/components/ApiSelectPicker.vue";
import { onLoad } from "@dcloudio/uni-app";

const navTitle = ref("创建合同");
// 只读查看模式（详情）
const viewMode = ref(false);
// 编辑模式下的合同ID（为空表示新建）
const contractId = ref("");

const form = ref({
  contractNo: "",
  customerId: "",
  customerName: "",
  contractName: "",
  signDate: "",
  contractType: "",
  signWay: "",
  outworkId: "",
  effectiveStartTime: "",
  effectiveEndTime: "",
  contractFileId: "",
  paperFileIdList: [],
  remark: "",
});

// 合同文件 URL（展示用），ID 通过 update:fileId 回写到 form.contractFileId
const contractFileUrl = ref("");
// 纸质合同照片 URL 列表（展示用），ID 列表维护在 form.paperFileIdList
const paperFileUrlList = ref([]);
// 电签签署文件链接（详情中已签署时展示）
const signedFileUrl = ref("");
const submitLoading = ref(false);

// 日期选择
const datePickerShow = ref(false);
const activeDateKey = ref("");
const currentDateVal = ref(new Date().getTime());

onLoad(() => {
  const op = uni.$router.query;

  if (op.mode === "edit") {
    // 编辑模式：加载合同详情回显
    contractId.value = op.id;
    navTitle.value = "编辑合同";
    loadContractDetail(op.id);
  } else if (op.mode === "view") {
    // 查看详情：只读模式
    contractId.value = op.id;
    viewMode.value = true;
    navTitle.value = "合同详情";
    loadContractDetail(op.id);
  } else {
    // 新建模式：op.id 为客户ID，预生成合同编号，op.outworkId 为关联外出记录
    form.value.customerId = op.id;
    form.value.customerName = decodeURIComponent(op.name || "");
    form.value.outworkId = op.outworkId || "";
    loadNextContractNo();
  }
});

// 预生成合同编号
async function loadNextContractNo() {
  try {
    const data = await getNextContractNo({});
    form.value.contractNo =
      typeof data === "string" ? data : data?.contractNo || "";
  } catch (e) {
    console.error("预生成合同编号失败", e);
  }
}

// 加载合同详情并回显表单与合同文件
async function loadContractDetail(id) {
  try {
    const data = await getContractDetail({ id });
    const contract = data.contract || data;
    const customer = data.customer || {};

    form.value = {
      contractNo: contract.contractNo || "",
      customerId: contract.customerId || customer.id || "",
      customerName:
        customer.storeName ||
        customer.customerName ||
        contract.customerName ||
        "",
      contractName: contract.contractName || "",
      signDate: contract.signDate || "",
      contractType: contract.contractType || "",
      signWay: contract.signWay || "",
      effectiveStartTime: contract.effectiveStartTime || "",
      effectiveEndTime: contract.effectiveEndTime || "",
      contractFileId: contract.contractFileId || "",
      paperFileIdList: contract.paperFileIdList || [],
      remark: contract.remark || "",
    };
    // 回显合同文件列表
    contractFileUrl.value = contract.contractFileUrl || "";
    // 回显纸质合同照片列表
    paperFileUrlList.value = contract.paperFileUrlList || [];
    // 回显电签签署文件链接
    signedFileUrl.value = contract.signedFileUrl || "";
  } catch (e) {
    uni.showToast({ title: "合同详情加载失败", icon: "none" });
  }
}

// 复制签署文件链接
function copySignFile() {
  if (!signedFileUrl.value) return;
  uni.setClipboardData({
    data: signedFileUrl.value,
    success: () => {
      uni.showToast({ title: "已复制签署链接", icon: "none" });
    },
  });
}

// 打开签署文件链接：H5/App 直接打开，小程序复制后提示浏览器打开
function openSignFile() {
  if (!signedFileUrl.value) return;
  // #ifdef H5
  window.open(signedFileUrl.value, "_blank");
  // #endif
  // #ifdef APP-PLUS
  plus.runtime.openURL(signedFileUrl.value);
  // #endif
  // #ifndef H5 || APP-PLUS
  uni.setClipboardData({
    data: signedFileUrl.value,
    success: () => {
      uni.showToast({ title: "链接已复制，请在浏览器中打开", icon: "none" });
    },
  });
  // #endif
}

function goBack() {
  uni.navigateBack();
}

function openDatePicker(key) {
  if (viewMode.value) return;
  activeDateKey.value = key;
  datePickerShow.value = true;
}

function confirmDate({ value }) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  const formatStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  form.value[activeDateKey.value] = formatStr;
}

// 纸质照片多图上传：累加文件 ID 到 paperFileIdList
function addPaperFileId(fileId) {
  if (fileId) {
    form.value.paperFileIdList = [...form.value.paperFileIdList, fileId];
  }
}

function submitForm() {
  if (!form.value.customerId) {
    uni.showToast({ title: "缺少客户信息", icon: "none" });
    return;
  }
  if (!form.value.contractName) {
    uni.showToast({ title: "请填写合同标题", icon: "none" });
    return;
  }
  if (!form.value.signDate) {
    uni.showToast({ title: "请选择签订日期", icon: "none" });
    return;
  }
  if (!form.value.signWay) {
    uni.showToast({ title: "请选择签署方式", icon: "none" });
    return;
  }
  if (form.value.signWay === "ESIGN" && !form.value.contractFileId) {
    uni.showToast({ title: "请上传合同文件", icon: "none" });
    return;
  }
  if (
    form.value.signWay === "PAPER" &&
    form.value.paperFileIdList.length === 0
  ) {
    uni.showToast({ title: "请上传纸质合同照片", icon: "none" });
    return;
  }
  console.log(form.value);

  submitLoading.value = true;
  const params = {
    customerId: form.value.customerId,
    contractNo: form.value.contractNo || undefined,
    contractName: form.value.contractName,
    signDate: form.value.signDate,
    contractType: form.value.contractType || undefined,
    signWay: form.value.signWay,
    outworkId: form.value.outworkId || undefined,
    effectiveStartTime: form.value.effectiveStartTime || undefined,
    effectiveEndTime: form.value.effectiveEndTime || undefined,
    remark: form.value.remark || undefined,
  };
  // 按签署方式携带对应文件
  if (form.value.signWay === "ESIGN") {
    params.contractFileId = form.value.contractFileId;
  } else if (form.value.signWay === "PAPER") {
    params.paperFileIdList = form.value.paperFileIdList;
  }

  // 编辑走编辑接口，新建走新增接口
  const request = contractId.value
    ? editContract({ id: contractId.value, ...params })
    : addContract(params);

  request
    .then(() => {
      uni.showToast({
        title: contractId.value ? "保存成功" : "创建成功",
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
  padding-bottom: 220rpx;
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
.text-black {
  color: #333 !important;
}
.text-gray {
  color: #999 !important;
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
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

/* 客户列表行式只读 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    .l {
      color: #666;
    }
    .v {
      color: #333;
      font-weight: 500;
    }
  }
}

/* 输入表单块排版 */
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

/* 自定义灰底表单控件还原设计图 */
:deep(.form-input-bg) {
  background-color: #f7f8fa !important;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
}
.textarea-h {
  :deep(textarea) {
    min-height: 150rpx !important;
  }
}

.date-input-box {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .dt-txt {
    font-size: 28rpx;
  }
}

/* 只读展示（合同编号） */
.readonly-box {
  .dt-txt {
    color: #333;
    font-weight: 500;
  }
}

.time-range-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

/* 签署文件展示 */
.sign-file-box {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  .sign-file-url {
    .sign-file-text {
      font-size: 26rpx;
      color: #0066ff;
      word-break: break-all;
    }
  }
  .sign-file-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
  }
}

/* 蓝底状态告知提示条 */
.info-alert-bar {
  background-color: #ebf3ff;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  .alert-text {
    font-size: 24rpx;
    color: #0052cc;
    line-height: 1.4;
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
  display: flex;
  justify-content: center;

  .btn-item {
    width: 100%;
    :deep(.wd-button) {
    }
  }
}
</style>
