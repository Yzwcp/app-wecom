<template>
  <view class="api-select">
    <view v-if="!hideInner" class="api-select__inner" @click="open">
      <text v-if="displayLabel" class="api-select__text">{{
        displayLabel
      }}</text>
      <text v-else class="api-select__placeholder">{{ placeholder }}</text>
      <wd-icon
        v-if="clearable && hasValue"
        name="close-circle"
        color="#2A2B2E"
        size="24px"
        @click.stop="onClear"
      ></wd-icon>
      <wd-icon v-else color="#2A2B2E" name="right" size="24px"></wd-icon>
    </view>
    <wd-select-picker
      filterable
      v-model="innerValue"
      :columns="options"
      :title="title"
      :type="type"
      :loading="loading"
      :z-index="zIndex"
      v-model:visible="innerVisible"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
    <!-- 分页器：跟随弹层显示，定位在弹窗底部 -->
    <view
      v-if="paginated && totalPages > 1 && innerVisible"
      class="api-select__pagination"
      :style="{ zIndex: zIndex + 1 }"
    >
      <wd-pagination
        v-model="currentPage"
        :total="totalPages"
        @change="handlePageChange"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: "" },
  /** 请求选项列表的 API 函数（必填），需返回数组或分页对象 */
  api: { type: Function, required: true },
  title: { type: String, default: "" },
  placeholder: { type: String, default: "请选择" },
  /** 单选 radio / 多选 checkbox */
  type: { type: String, default: "radio" },
  /** 接口返回数据中 label 对应的字段名 */
  labelKey: { type: String, default: "label" },
  /** 接口返回数据中 value 对应的字段名 */
  valueKey: { type: String, default: "value" },
  /** 传给 API 函数的请求参数 */
  params: { type: Object, default: () => ({}) },
  /** 是否分页接口（自动从响应中提取 records） */
  paginated: { type: Boolean, default: false },
  /** 预设回显文本（选项未加载时展示，用于外部带入的值） */
  label: { type: String, default: "" },
  /** 是否隐藏内置触发框（由外部 v-model:visible 控制弹出） */
  hideInner: { type: Boolean, default: false },
  /** 外部控制弹出层显隐（v-model:visible） */
  visible: { type: Boolean, default: false },
  /** 自定义选项 label 格式化函数 (item) => string，优先级高于 labelKey */
  labelFormat: { type: Function, default: null },
  /** 弹出层 z-index（页面有 fixed 底部栏时需要调大） */
  zIndex: { type: Number, default: 10 },
  /** 禁止选中的 value 列表（如转派时排除当前执行人） */
  disabledValues: { type: Array, default: () => [] },
  /** 是否可清除（默认开启，右侧显示清除按钮） */
  clearable: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "confirm", "update:visible"]);

const innerVisible = ref(false);
const loading = ref(false);
const rawOptions = ref([]);
const innerValue = ref(props.modelValue);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);
let loaded = false;
let closeGuard = false;

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
);

// 外部控制弹出
watch(
  () => props.visible,
  (val) => {
    if (val) {
      innerValue.value = props.modelValue;
      if (!loaded) {
        fetchOptions();
      }
      innerVisible.value = true;
    }
  },
);

// 弹出层关闭时同步给外部
watch(innerVisible, (val) => {
  if (!val && props.visible) {
    emit("update:visible", false);
  }
});

const options = computed(() => {
  return rawOptions.value.map((item) => ({
    label: props.labelFormat
      ? props.labelFormat(item)
      : (item[props.labelKey] ?? item),
    value: item[props.valueKey] ?? item,
    disabled: props.disabledValues.includes(item[props.valueKey] ?? item),
  }));
});

const displayLabel = computed(() => {
  if (props.type === "checkbox" && Array.isArray(innerValue.value)) {
    const labels = innerValue.value
      .map((v) => {
        const item = options.value.find((c) => c.value === v);
        return item ? item.label : "";
      })
      .filter(Boolean);
    return labels.join("、") || props.label;
  }
  const item = options.value.find((c) => c.value === innerValue.value);
  // 选项未加载时，使用外部预设的 label 回显
  return item ? item.label : props.label;
});

function onClear() {
  innerValue.value = props.type === "checkbox" ? [] : "";
  emit("update:modelValue", innerValue.value);
  emit("confirm", undefined);
  closeGuard = true;
  setTimeout(() => {
    closeGuard = false;
  }, 300);
}

const hasValue = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length > 0;
  return props.modelValue !== "" && props.modelValue != null;
});

function buildParams() {
  const p = { ...props.params };
  if (props.paginated) {
    p.current = currentPage.value;
    p.size = pageSize.value;
  }
  return p;
}

async function fetchOptions() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await props.api(buildParams());
    if (props.paginated && res && Array.isArray(res.records)) {
      rawOptions.value = res.records;
      totalPages.value = res.pages || 1;
      currentPage.value = res.current || 1;
      pageSize.value = res.size || 10;
    } else if (Array.isArray(res)) {
      rawOptions.value = res;
    } else {
      rawOptions.value = [];
    }
    loaded = true;
  } catch (err) {
    console.error("获取选项列表失败", err);
    rawOptions.value = [];
  } finally {
    loading.value = false;
  }
}

function handlePageChange({ page }) {
  currentPage.value = page;
  loaded = false;
  fetchOptions();
}

function open() {
  if (closeGuard) return;
  innerValue.value = props.modelValue;
  if (!loaded) {
    fetchOptions();
  }
  innerVisible.value = true;
  emit("update:visible", true);
}

function onConfirm(data) {
  emit("update:modelValue", data.value);
  emit(
    "confirm",
    rawOptions.value.find((item) => item[props.valueKey] === data.value),
  );
  closeGuard = true;
  setTimeout(() => {
    closeGuard = false;
  }, 300);
}

function onCancel() {
  closeGuard = true;
  setTimeout(() => {
    closeGuard = false;
  }, 300);
}

// 初始化时自动加载选项，确保回显正常
fetchOptions();
</script>

<style scoped>
.api-select {
  width: 100%;
}

.api-select__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  min-height: 48rpx;
}

.api-select__text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.api-select__placeholder {
  font-size: 28rpx;
  color: #999;
  flex: 1;
}

/* 分页器：固定在弹窗内容上方 */
.api-select__pagination {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 16rpx 24rpx;
  border-top: 1rpx solid #eeeeee;
}
</style>
