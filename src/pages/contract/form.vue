<template>
  <view class="page">
    <wd-navbar
      title="创建合同"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <view class="form-container">
      <!-- 1. 客户基础信息（静态） -->
      <view class="section-card info-card">
        <view class="section-header">
          <wd-icon name="user" size="18px" color="#0066ff" />
          <text class="section-title">客户信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="l">客户名称</text>
            <text class="v">{{ form.name }}</text>
          </view>
          <!-- <view class="info-row">
                        <text class="l">联系人</text>
                        <text class="v">{{ clientInfo.contact }}</text>
                    </view>
                    <view class="info-row">
                        <text class="l">联系电话</text>
                        <text class="v">{{ clientInfo.phone }}</text>
                    </view> -->
        </view>
      </view>

      <!-- 2. 独立选择模版行 -->
      <view class="template-select-card">
        <view class="lbl">
          选择模版
          <text class="red">*</text>
        </view>
        <view class="val-box">
          <api-select-picker
            v-model="form.templateId"
            :api="getContractTemplateList"
            placeholder="请选择合同模版"
            labelKey="templateName"
            valueKey="id"
            paginated
            :params="{ size: 20 }"
            @confirm="onConfirmTemplate"
            :title="选择合同模版"
          />
        </view>
      </view>

      <!-- 3. 合同详细信息录入 -->
      <view class="section-card">
        <view class="section-header">
          <wd-icon name="edit-1" size="18px" color="#0066ff" />
          <text class="section-title">合同详情</text>
        </view>

        <!-- 合同标题 -->
        <view class="field-block">
          <view class="field-lbl">
            合同标题
            <text class="red">*</text>
          </view>
          <wd-input
            v-model="form.contractName"
            placeholder="请填写或默认合同标题"
            no-border
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
              >{{ form.signDate || "年/月/日" }}</text
            >
            <wd-icon name="calendar" size="16px" color="#999" />
          </view>
        </view>

        <!-- 合同类型 -->
        <view class="field-block">
          <view class="field-lbl">
            合同类型
            <text class="red">*</text>
          </view>
          <DictSelectPicker
            v-model="form.contractType"
            dict-key="WJ_PROJECT_SERVICE"
            title="选择合同类型"
          />
        </view>

        <!-- 选择业务员 -->
        <!-- <view class="field-block">
          <view class="field-lbl">
            选择业务员
            <text class="red">*</text>
          </view>
          <view class="date-input-box" @click="openUserPicker">
            <text
              :class="['dt-txt', form.templateId ? 'text-black' : 'text-gray']"
              >{{ form.salesman || "请选择业务员" }}</text
            >
            <wd-icon name="arrow" size="16px" color="#999" />
          </view>
        </view> -->

        <!-- 生效时间与到期时间并排布局 -->
        <view class="time-range-row">
          <view class="flex-1">
            <view class="field-lbl">生效时间</view>
            <view class="date-input-box" @click="openDatePicker('startTime')">
              <text
                :class="['dt-txt', form.startTime ? 'text-black' : 'text-gray']"
                >{{ form.startTime || "年/月/日" }}</text
              >
              <wd-icon name="calendar" size="16px" color="#999" />
            </view>
          </view>
          <view class="flex-1">
            <view class="field-lbl">到期时间</view>
            <view class="date-input-box" @click="openDatePicker('endTime')">
              <text
                :class="['dt-txt', form.endTime ? 'text-black' : 'text-gray']"
                >{{ form.endTime || "年/月/日" }}</text
              >
              <wd-icon name="calendar" size="16px" color="#999" />
            </view>
          </view>
        </view>

        <!-- 上传合同附件 -->
        <view class="field-block">
          <view class="upload-header">
            <text class="field-lbl">上传合同附件</text>
          </view>
          <ImgUpload category="contract" :limit="3" accept="image/*" />
          <text class="upload-tip"
            >支持 JPG, PNG格式，单个文件不超过 5MB。</text
          >
        </view>

        <!-- 备注 -->
        <view class="field-block">
          <view class="field-lbl">备注</view>
          <wd-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            no-border
            custom-class="form-input-bg textarea-h"
          />
        </view>
      </view>

      <!-- 底部提示区 -->
      <view class="info-alert-bar">
        <wd-icon name="info-circle" size="16px" color="#0066ff" />
        <text class="alert-text"
          >提交后合同将进入"待审核"状态。审核通过后，该客户的状态将自动更新为"已签约"。</text
        >
      </view>
    </view>

    <!-- 底部固定的双操作按钮 -->
    <view class="bottom-action-bar">
      <wd-button type="secondary" plain class="btn-item" @click="editDocBody"
        >编辑合同正文</wd-button
      >
      <wd-button type="primary" class="btn-item" @click="submitForm"
        >提交结果</wd-button
      >
    </view>

    <!-- 弹窗选择器底层支持 -->
    <wd-select-picker
      type="radio"
      v-model="selectedTemplate"
      :columns="templateOptions"
      v-model:visible="tplPickerShow"
      @confirm="confirmTemplate"
      title="选择模版"
    />
    <wd-select-picker
      v-model="form.contractType"
      :columns="contractTypeOptions"
      v-model:visible="typePickerShow"
      type="radio"
      title="选择合同类型"
    />
    <wd-select-picker
      v-model="form.salesman"
      :columns="userOptions"
      v-model:visible="userPickerShow"
      title="选择业务员"
    />
    <wd-datetime-picker
      v-model="currentDateVal"
      type="date"
      v-model:visible="datePickerShow"
      @confirm="confirmDate"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getContractTemplateList, addContract } from "@/api";
import ImgUpload from "@/components/ImgUpload.vue";
import { useDict } from "@/hooks/useDict";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import ApiSelectPicker from "../../components/ApiSelectPicker.vue";
import { onLoad } from "@dcloudio/uni-app";

const { dictMap, getDictLabel } = useDict();

onLoad((op) => {
  form.value.name = op.name;
  form.value.customerId = op.id;
});

// 模版数据与选中自动同步标题效果
const selectedTemplate = ref("");
const tplPickerShow = ref(false);
const templateOptions = ref([]);

const contractTypeOptions = computed(() => dictMap["WJ_PROJECT_SERVICE"] || []);

const form = ref({
  contractName: "",
  signDate: "",
  contractType: "",
  salesman: "",
  startTime: "",
  endTime: "",
  remark: "",
});

// 弹出状态管理
const typePickerShow = ref(false);
const userPickerShow = ref(false);
const datePickerShow = ref(false);
const activeDateKey = ref("");
const currentDateVal = ref(new Date().getTime());

function goBack() {
  uni.navigateBack();
}

// 选中模版后，实现联动：自动填充合同标题
function confirmTemplate({ value }) {
  selectedTemplate.value = value;
  form.value.title = value;
}

function openDatePicker(key) {
  activeDateKey.value = key;
  datePickerShow.value = true;
}

function confirmDate({ value }) {
  const d = new Date(value);
  const formatStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  form.value[activeDateKey.value] = formatStr;
}
function onConfirmTemplate(value) {
  console.log(value);
  form.value.contractName = value.contractTitle;
}
function editDocBody() {
  uni.showToast({ title: "跳转合同正文编辑器", icon: "none" });
}

function submitForm() {
  if (
    !form.value.templateId ||
    !form.value.contractName ||
    !form.value.signDate
  ) {
    uni.showToast({ title: "请填写所有必填红星项", icon: "none" });
    return;
  }
  addContract(form.value).then((res) => {});
}

onMounted(() => {});
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

/* 独立模版项选择卡片 */
.template-select-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .lbl {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }
  .val-box {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
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

.time-range-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

/* 附件计算器头及下部说明 */
.upload-header {
  display: flex;
  justify-content: space-between;
  .upload-counter {
    font-size: 26rpx;
    color: #0066ff;
    font-weight: bold;
  }
}
.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
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

/* 吸底双按钮结构 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 2;

  .btn-item {
    flex: 1;
    :deep(.wd-button) {
      width: 100%;
      height: 88rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
}
</style>
