<template>
  <view class="api-select">
    <view class="api-select__inner" @click="open">
      <text v-if="displayLabel" class="api-select__text">{{
        displayLabel
      }}</text>
      <text v-else class="api-select__placeholder">{{ placeholder }}</text>
      <wd-icon name="arrow" size="14px" color="#999" />
    </view>
    <wd-select-picker
      filterable
      v-model="innerValue"
      :columns="options"
      :title="title"
      :type="type"
      :loading="loading"
      v-model:visible="visible"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
    <wd-pagination
      v-if="paginated && totalPages > 1"
      v-model="currentPage"
      :total="totalPages"
      @change="handlePageChange"
    />
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
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const visible = ref(false);
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

const options = computed(() => {
  return rawOptions.value.map((item) => ({
    label: item[props.labelKey] ?? item,
    value: item[props.valueKey] ?? item,
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
    return labels.join("、") || "";
  }
  const item = options.value.find((c) => c.value === innerValue.value);
  return item ? item.label : "";
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
  visible.value = true;
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
</style>
