<template>
  <view class="page">
    <view class="container">
      <view class="card">
        <view class="card-title">
          <image class="title-icon" src="/static/construction/task.png"></image>
          <text class="title-text">{{
            isEdit ? "编辑申请" : "申请施工任务"
          }}</text>
        </view>

        <!-- 客户（门店） -->
        <view class="field-block">
          <view class="field-lbl required">客户（门店）</view>
          <ApiSelectScrollPicker
            v-model="form.customerId"
            :api="getCustomerPage"
            paginated
            remote-search
            search-key="nameKeyword"
            label-key="storeName"
            value-key="id"
            title="选择客户"
            placeholder="请选择客户"
            :z-index="999"
          />
        </view>

        <!-- 执行人 -->
        <view class="field-block">
          <view class="field-lbl required">执行人</view>
          <ApiSelectPicker
            v-model="form.executorIdList"
            :api="getConstructionExecutorList"
            label-key="name"
            value-key="id"
            type="checkbox"
            title="选择执行人"
            placeholder="请选择执行人（可多选）"
            :z-index="999"
          />
        </view>

        <!-- 任务类型 -->
        <view class="field-block">
          <view class="field-lbl required">任务类型</view>
          <DictSelectPicker
            v-model="form.taskType"
            dict-key="WJ_TASK_TYPE"
            title="选择任务类型"
            placeholder="请选择任务类型"
          />
        </view>

        <!-- 计划完工时限 -->
        <view class="field-block">
          <view class="field-lbl required">计划完工时限</view>
          <view class="date-input-box" @click="openDatePicker">
            <text
              :class="[
                'dt-txt',
                form.planFinishTime ? 'text-black' : 'text-gray',
              ]"
            >
              {{ form.planFinishTime || "请选择计划完工时间" }}
            </text>
            <wd-icon name="calendar" size="16px" color="#999" />
          </view>
        </view>

        <!-- 任务要求 -->
        <view class="field-block">
          <view class="field-lbl">任务要求</view>
          <textarea
            v-model="form.taskRequire"
            placeholder="请输入任务要求（选填）"
            placeholder-style="color: #c8c9cc; font-size: 28rpx;"
            class="require-textarea"
          />
        </view>
      </view>
    </view>

    <!-- 底部固定提交栏 -->
    <view class="footer-actions">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? "提交中..." : isEdit ? "重新提交" : "提交申请" }}
      </button>
    </view>

    <!-- 时间选择器 -->
    <wd-datetime-picker
      v-model="datePickerValue"
      type="datetime"
      :visible="showDatePicker"
      title="选择计划完工时间"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  applyConstructionTask,
  editConstructionApply,
  getConstructionTaskDetail,
  getConstructionExecutorList,
} from "@/api/construction";
import { getCustomerPage } from "@/api/customer";
import ApiSelectPicker from "@/components/ApiSelectPicker.vue";
import ApiSelectScrollPicker from "@/components/ApiSelectScrollPicker.vue";
import DictSelectPicker from "@/components/DictSelectPicker.vue";

// 编辑模式：任务ID（已驳回的申请重新编辑提交）
const taskId = ref("");
const isEdit = ref(false);

const submitting = ref(false);

const form = ref({
  id: "",
  customerId: "",
  executorIdList: [],
  taskType: "",
  planFinishTime: "",
  taskRequire: "",
});

// ========== 编辑回显 ==========
async function loadDetail(id) {
  try {
    const res = await getConstructionTaskDetail({ id });
    const task = res?.task;
    if (!task) return;
    // 申请单 = 任务 + 一个子任务，执行人取第一个子任务的执行人列表
    const subTaskList = res?.subTaskList || [];
    form.value = {
      id: task.id || "",
      customerId: task.customerId || "",
      executorIdList: subTaskList[0]?.executorIdList || [],
      taskType: task.taskType || "",
      planFinishTime: task.planFinishTime || "",
      taskRequire: task.taskRequire || "",
    };
  } catch (error) {
    console.error("获取施工任务详情失败", error);
    uni.showToast({ title: "获取详情失败", icon: "none" });
  }
}

onLoad((options) => {
  if (options?.id) {
    taskId.value = options.id;
    isEdit.value = true;
    loadDetail(options.id);
  }
});

// ========== 时间选择器 ==========
const showDatePicker = ref(false);
const datePickerValue = ref(Date.now());

function openDatePicker() {
  datePickerValue.value = form.value.planFinishTime
    ? new Date(form.value.planFinishTime.replace(/-/g, "/")).getTime()
    : Date.now();
  showDatePicker.value = true;
}

function onDateConfirm({ value }) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  // 格式化日期为yyyy-MM-dd HH:mm:ss
  form.value.planFinishTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  showDatePicker.value = false;
}

// ========== 提交 ==========
function handleCancel() {
  uni.navigateBack();
}

async function handleSubmit() {
  if (!form.value.customerId) {
    return uni.showToast({ title: "请选择客户", icon: "none" });
  }
  if (!form.value.executorIdList.length) {
    return uni.showToast({ title: "请选择执行人", icon: "none" });
  }
  if (!form.value.taskType) {
    return uni.showToast({ title: "请选择任务类型", icon: "none" });
  }
  if (!form.value.planFinishTime) {
    return uni.showToast({ title: "请选择计划完工时限", icon: "none" });
  }

  const payload = {
    customerId: form.value.customerId,
    executorIdList: form.value.executorIdList,
    taskType: form.value.taskType,
    planFinishTime: form.value.planFinishTime,
    taskRequire: form.value.taskRequire || undefined,
  };

  submitting.value = true;
  try {
    if (isEdit.value) {
      await editConstructionApply({ ...payload, id: form.value.id });
      uni.showToast({ title: "已重新提交", icon: "success" });
    } else {
      await applyConstructionTask(payload);
      uni.showToast({ title: "申请已提交", icon: "success" });
    }
    setTimeout(() => uni.navigateBack(), 800);
  } catch (error) {
    console.error(isEdit.value ? "编辑申请失败" : "提交申请失败", error);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.container {
  padding: 24rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.card-title {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;

  .title-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 16rpx;
  }
  .title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #1a1a1a;
    flex: 1;
  }
}

.field-block {
  margin-bottom: 28rpx;
  &:last-child {
    margin-bottom: 0;
  }
  .field-lbl {
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 14rpx;
    &.required::before {
      content: "*";
      color: #ee0a24;
      margin-right: 4rpx;
    }
  }
}

.date-input-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  min-height: 48rpx;

  .dt-txt {
    font-size: 28rpx;
  }
  .text-black {
    color: #333;
  }
  .text-gray {
    color: #999;
  }
}

.require-textarea {
  width: 100%;
  height: 140rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

/* 底部固定栏 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
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
    color: #2979ff;
    border: 2rpx solid #2979ff;
  }
  .btn-submit {
    background-color: #2979ff;
    color: #ffffff;
  }
  .btn-submit[disabled] {
    opacity: 0.6;
  }
}
</style>
