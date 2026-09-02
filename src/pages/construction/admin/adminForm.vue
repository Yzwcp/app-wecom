<template>
  <view class="page">
    <view class="container">
      <!-- 基本信息 -->
      <view class="card">
        <view class="card-title">
          <image class="title-icon" src="/static/construction/task.png"></image>
          <text class="title-text">基本信息</text>
        </view>

        <!-- 来源合同 -->
        <view class="field-block">
          <view class="field-lbl">来源合同</view>
          <ApiSelectScrollPicker
            v-model="form.contractId"
            :api="effectivePage"
            paginated
            :labelFormat="contractLabelFormat"
            value-key="id"
            title="选择来源合同"
            placeholder="请选择生效中的合同（可选）"
            :z-index="999"
            @confirm="onContractConfirm"
          />
        </view>

        <!-- 客户（未选合同时必填） -->
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

        <!-- 任务模板 -->
        <view class="field-block">
          <view class="field-lbl">任务模板</view>
          <ApiSelectScrollPicker
            v-model="form.templateId"
            :api="getConstructionTaskTemplateList"
            label-key="templateName"
            value-key="id"
            title="选择任务模板"
            placeholder="请选择任务模板（可选，选择后自动填充）"
            :z-index="999"
            @confirm="onTemplateConfirm"
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
          <view class="field-lbl">计划完工时限</view>
          <view class="date-input-box" @click="openDatePicker('main')">
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
            placeholder="请输入任务要求"
            placeholder-style="color: #c8c9cc; font-size: 28rpx;"
            class="require-textarea"
          />
        </view>
      </view>

      <!-- 子任务流程 -->
      <view class="card">
        <view class="card-title">
          <image
            class="title-icon"
            src="/static/construction/requirement.png"
          ></image>
          <text class="title-text">子任务流程</text>
          <view class="btn-add" @click="addSubTask">
            <text class="icon-plus">+</text>添加子任务
          </view>
        </view>

        <view
          v-for="(item, index) in form.subTaskList"
          :key="index"
          class="subtask-item"
        >
          <view class="subtask-header">
            <view class="subtask-index">{{
              String(index + 1).padStart(2, "0")
            }}</view>
            <input
              v-model="item.subTaskName"
              placeholder="子任务名称"
              placeholder-class="placeholder-style"
              class="subtask-name-input"
            />
            <image
              class="subtask-delete"
              src="/static/delivery/delete.png"
              @click="removeSubTask(index)"
            ></image>
          </view>

          <!-- 执行人 -->
          <view class="subtask-field">
            <view class="subtask-lbl required">执行人</view>
            <ApiSelectPicker
              v-model="item.executorIdList"
              :api="getConstructionExecutorList"
              label-key="name"
              value-key="id"
              type="checkbox"
              title="选择执行人"
              placeholder="请选择执行人（可多选）"
              :z-index="999"
            />
          </view>

          <!-- 计划完成时间 -->
          <view class="subtask-field">
            <view class="subtask-lbl">计划完成</view>
            <view class="date-input-box small" @click="openDatePicker(index)">
              <text
                :class="[
                  'dt-txt',
                  item.planFinishTime ? 'text-black' : 'text-gray',
                ]"
              >
                {{ item.planFinishTime || "请选择时间" }}
              </text>
              <wd-icon name="calendar" size="14px" color="#999" />
            </view>
          </view>

          <!-- 子任务要求 -->
          <view class="subtask-field">
            <view class="subtask-lbl">要求</view>
            <input
              v-model="item.subTaskRequire"
              placeholder="子任务要求"
              placeholder-class="placeholder-style"
              class="subtask-require-input"
            />
          </view>
        </view>

        <view v-if="!form.subTaskList.length" class="subtask-empty">
          <text class="subtask-empty-text"
            >暂无子任务，请点击右上角"添加子任务"</text
          >
        </view>
      </view>
    </view>

    <!-- 底部固定提交栏 -->
    <view class="footer-actions">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? "提交中..." : isEdit ? "保存" : "创建任务" }}
      </button>
    </view>

    <!-- 时间选择器 -->
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
import { ref } from "vue";
import {
  createConstructionTask,
  updateConstructionTask,
  getConstructionTaskDetail,
  getConstructionTaskTemplateList,
  getConstructionExecutorList,
} from "@/api/construction";
import { effectivePage } from "@/api/contract";
import { getCustomerPage } from "@/api/customer";
import ApiSelectPicker from "@/components/ApiSelectPicker.vue";
import ApiSelectScrollPicker from "@/components/ApiSelectScrollPicker.vue";
import DictSelectPicker from "@/components/DictSelectPicker.vue";
import { onLoad } from "@dcloudio/uni-app";

// 编辑模式：任务ID
const taskId = ref("");
const isEdit = ref(false);

const submitting = ref(false);

const form = ref({
  id: "",
  contractId: "",
  customerId: "",
  templateId: "",
  taskType: "",
  auditorId: "",
  planFinishTime: "",
  taskRequire: "",
  subTaskList: [],
});

// ========== 编辑回显 ==========
async function loadDetail(id) {
  try {
    const res = await getConstructionTaskDetail({ id });
    const task = res?.task;
    const subTaskList = res?.subTaskList || [];
    if (!task) return;

    form.value = {
      id: task.id || "",
      contractId: task.contractId || "",
      customerId: task.customerId || "",
      templateId: task.templateId || "",
      taskType: task.taskType || "",
      planFinishTime: task.planFinishTime || "",
      taskRequire: task.taskRequire || "",
      subTaskList: subTaskList.map((s, i) => ({
        subTaskName: s.subTaskName || "",
        executorIdList: s.executorIdList || [],
        subTaskRequire: s.subTaskRequire || "",
        planFinishTime: s.planFinishTime || "",
        sort: s.sort ?? i + 1,
      })),
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

// 合同选项 label：合同编号 - 客户名称
const contractLabelFormat = (item) =>
  `${item.contractNo || ""} - ${item.customerName || ""}`;

// 选择合同后客户以合同为准
function onContractConfirm(item) {
  if (item?.customerId) {
    form.value.customerId = item.customerId;
  }
}

// 选择模板后自动填充任务类型、任务要求、子任务流程
function onTemplateConfirm(item) {
  if (!item) return;
  if (item.taskType) form.value.taskType = item.taskType;
  if (item.taskRequire) form.value.taskRequire = item.taskRequire;
  // defaultSubTasks 是 JSON 字符串，需解析
  let subTaskList = item.defaultSubTasks || item.subTaskList;
  if (typeof subTaskList === "string") {
    try {
      subTaskList = JSON.parse(subTaskList);
    } catch {
      subTaskList = null;
    }
  }
  if (Array.isArray(subTaskList) && subTaskList.length) {
    form.value.subTaskList = subTaskList.map((s, i) => ({
      subTaskName: s.subTaskName || "",
      executorIdList: s.executorIdList || [],
      subTaskRequire: s.subTaskRequire || "",
      // 优先按 planFinishDays 以当前时间+天数换算；否则沿用模板的 planFinishTime
      planFinishTime: s.planFinishDays
        ? addDays(s.planFinishDays)
        : s.planFinishTime || "",
      sort: s.sort ?? i + 1,
    }));
  }
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 23:59:59`;
}

// ========== 子任务操作 ==========
function addSubTask() {
  form.value.subTaskList.push({
    subTaskName: "",
    executorIdList: [],
    subTaskRequire: "",
    planFinishTime: "",
    sort: form.value.subTaskList.length + 1,
  });
}

function removeSubTask(index) {
  uni.showModal({
    title: "提示",
    content: "确定删除该子任务吗？",
    success: (res) => {
      if (res.confirm) form.value.subTaskList.splice(index, 1);
    },
  });
}

// ========== 时间选择器 ==========
const showDatePicker = ref(false);
const datePickerValue = ref(Date.now());
// 'main' 表示主任务时间，数字为子任务下标
const dateTarget = ref("main");

function openDatePicker(target) {
  dateTarget.value = target;
  const current =
    target === "main"
      ? form.value.planFinishTime
      : form.value.subTaskList[target]?.planFinishTime;
  datePickerValue.value = current
    ? new Date(current.replace(/-/g, "/")).getTime()
    : Date.now();
  showDatePicker.value = true;
}

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function onDateConfirm({ value }) {
  const timeStr = formatTime(value);
  if (dateTarget.value === "main") {
    form.value.planFinishTime = timeStr;
  } else {
    form.value.subTaskList[dateTarget.value].planFinishTime = timeStr;
  }
  showDatePicker.value = false;
}

// ========== 提交 ==========
function handleCancel() {
  uni.navigateBack();
}

async function handleSubmit() {
  if (!form.value.taskType) {
    return uni.showToast({ title: "请选择任务类型", icon: "none" });
  }
  if (!form.value.contractId && !form.value.customerId) {
    return uni.showToast({ title: "未选择合同时请选择客户", icon: "none" });
  }
  for (let i = 0; i < form.value.subTaskList.length; i++) {
    const s = form.value.subTaskList[i];
    if (!s.subTaskName) {
      return uni.showToast({
        title: `请填写第 ${i + 1} 个子任务名称`,
        icon: "none",
      });
    }
    if (!s.executorIdList || !s.executorIdList.length) {
      return uni.showToast({
        title: `请选择第 ${i + 1} 个子任务执行人`,
        icon: "none",
      });
    }
  }

  const payload = {
    id: form.value.id || undefined,
    contractId: form.value.contractId || undefined,
    customerId: form.value.customerId || undefined,
    templateId: form.value.templateId || undefined,
    taskType: form.value.taskType,
    planFinishTime: form.value.planFinishTime || undefined,
    taskRequire: form.value.taskRequire || undefined,
    subTaskList: form.value.subTaskList.map((s, i) => ({
      subTaskName: s.subTaskName,
      executorIdList: s.executorIdList,
      subTaskRequire: s.subTaskRequire || undefined,
      planFinishTime: s.planFinishTime || undefined,
      sort: s.sort ?? i + 1,
    })),
  };

  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateConstructionTask(payload);
      uni.showToast({ title: "更新成功", icon: "success" });
    } else {
      await createConstructionTask(payload);
      uni.showToast({ title: "创建成功", icon: "success" });
    }
    setTimeout(() => uni.navigateBack(), 800);
  } catch (error) {
    console.error(
      isEdit.value ? "更新施工任务失败" : "创建施工任务失败",
      error,
    );
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
  margin-bottom: 24rpx;
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
  .btn-add {
    color: #2979ff;
    font-size: 28rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    .icon-plus {
      font-size: 32rpx;
      margin-right: 4rpx;
    }
  }
}

.field-block {
  margin-bottom: 28rpx;
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

  &.small {
    padding: 12rpx 20rpx;
  }
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

/* 子任务卡片 */
.subtask-item {
  border: 1rpx solid #e5e5e5;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .subtask-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .subtask-index {
      background-color: #2979ff;
      color: #ffffff;
      font-size: 24rpx;
      font-weight: bold;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }
    .subtask-name-input {
      flex: 1;
      font-size: 30rpx;
      font-weight: 500;
      color: #1a1a1a;
    }
    .subtask-delete {
      width: 32rpx;
      height: 32rpx;
      margin-left: 20rpx;
      flex-shrink: 0;
    }
  }

  .subtask-field {
    margin-bottom: 16rpx;
    .subtask-lbl {
      font-size: 24rpx;
      color: #969799;
      margin-bottom: 10rpx;
      &.required::before {
        content: "*";
        color: #ee0a24;
        margin-right: 4rpx;
      }
    }
    .subtask-require-input {
      background-color: #f8f9fa;
      border-radius: 12rpx;
      padding: 16rpx 24rpx;
      font-size: 28rpx;
      width: 100%;
      box-sizing: border-box;
      min-height: 80rpx;
      line-height: 48rpx;
    }
  }
}

.placeholder-style {
  color: #969799;
}

.subtask-empty {
  padding: 40rpx 0;
  text-align: center;
  .subtask-empty-text {
    font-size: 26rpx;
    color: #999;
  }
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
