<template>
  <view class="api-select-scroll">
    <view v-if="!hideInner" class="api-select-scroll__inner" @click="open">
      <text v-if="displayLabel" class="api-select-scroll__text">{{
        displayLabel
      }}</text>
      <text v-else class="api-select-scroll__placeholder">{{
        placeholder
      }}</text>
      <wd-icon name="arrow" size="14px" color="#999" />
    </view>

    <!-- 弹层 -->
    <wd-popup
      v-model="innerVisible"
      position="bottom"
      :z-index="zIndex"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="onPopupClose"
    >
      <view class="api-select-scroll__popup">
        <!-- 标题栏 -->
        <view class="api-select-scroll__header">
          <text class="api-select-scroll__title">{{ title || "请选择" }}</text>
          <wd-icon name="close" size="20px" color="#999" @click="close" />
        </view>

        <!-- 搜索框 -->
        <view class="api-select-scroll__search">
          <wd-search
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            hide-cancel
            @search="handleSearch"
            @clear="handleSearch"
            @change="handleSearchChange"
          />
        </view>

        <!-- 选项列表 -->
        <scroll-view
          scroll-y
          class="api-select-scroll__list"
          :lower-threshold="80"
          @scrolltolower="handleScrollToLower"
        >
          <view
            v-for="item in filteredOptions"
            :key="item[valueKey]"
            class="api-select-scroll__item"
            :class="{ 'is-active': isSelected(item) }"
            @click="handleSelect(item)"
          >
            <text class="api-select-scroll__item-label">{{
              getItemLabel(item)
            }}</text>
            <wd-icon
              v-if="isSelected(item)"
              name="check"
              size="18px"
              color="#2979ff"
            />
          </view>

          <!-- 加载状态 -->
          <view v-if="loading" class="api-select-scroll__loading">
            <wd-loading size="24px" />
            <text class="api-select-scroll__loading-text">加载中...</text>
          </view>
          <view
            v-else-if="!filteredOptions.length"
            class="api-select-scroll__empty"
          >
            <text class="api-select-scroll__empty-text">暂无数据</text>
          </view>
          <view v-else-if="!hasMore" class="api-select-scroll__nomore">
            <text class="api-select-scroll__nomore-text">没有更多了</text>
          </view>
        </scroll-view>
      </view>
    </wd-popup>
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
  /** 搜索框占位文本 */
  searchPlaceholder: { type: String, default: "搜索" },
  /** 远程搜索时传给后端的搜索字段名（如 nameKeyword） */
  searchKey: { type: String, default: "keyword" },
  /** 是否远程搜索（true=调用接口搜索，false=本地过滤） */
  remoteSearch: { type: Boolean, default: false },
  /** 远程搜索防抖间隔 ms */
  searchDebounce: { type: Number, default: 400 },
});

const emit = defineEmits(["update:modelValue", "confirm", "update:visible"]);

const innerVisible = ref(false);
const loading = ref(false);
const rawOptions = ref([]);
const innerValue = ref(props.modelValue);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const hasMore = ref(true);
let loaded = false;
let closeGuard = false;
let searchTimer = null;

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
        fetchOptions(true);
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
    ...item,
    label: props.labelFormat
      ? props.labelFormat(item)
      : (item[props.labelKey] ?? item),
    value: item[props.valueKey] ?? item,
  }));
});

// 本地搜索过滤
const filteredOptions = computed(() => {
  if (props.remoteSearch || !searchKeyword.value) {
    return options.value;
  }
  const kw = searchKeyword.value.toLowerCase();
  return options.value.filter((item) =>
    String(item.label).toLowerCase().includes(kw),
  );
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
  return item ? item.label : props.label;
});

function getItemLabel(item) {
  return item.label;
}

function isSelected(item) {
  if (props.type === "checkbox" && Array.isArray(innerValue.value)) {
    return innerValue.value.includes(item.value);
  }
  return innerValue.value === item.value;
}

function buildParams() {
  const p = { ...props.params };
  if (props.paginated) {
    p.current = currentPage.value;
    p.size = pageSize.value;
  }
  // 远程搜索
  if (props.remoteSearch && searchKeyword.value) {
    p[props.searchKey] = searchKeyword.value;
  }
  return p;
}

async function fetchOptions(isReset = false) {
  if (loading.value) return;
  loading.value = true;
  if (isReset) {
    currentPage.value = 1;
    hasMore.value = true;
  }

  try {
    const res = await props.api(buildParams());
    if (props.paginated && res && Array.isArray(res.records)) {
      if (isReset || currentPage.value === 1) {
        rawOptions.value = res.records;
      } else {
        rawOptions.value = [...rawOptions.value, ...res.records];
      }
      totalPages.value = res.pages || 1;
      currentPage.value = res.current || currentPage.value;
      hasMore.value = currentPage.value < totalPages.value;
    } else if (Array.isArray(res)) {
      rawOptions.value = res;
      hasMore.value = false;
    } else {
      rawOptions.value = [];
      hasMore.value = false;
    }
    loaded = true;
  } catch (err) {
    console.error("获取选项列表失败", err);
    rawOptions.value = [];
  } finally {
    loading.value = false;
  }
}

function handleScrollToLower() {
  if (loading.value || !hasMore.value || !props.paginated) return;
  currentPage.value++;
  fetchOptions();
}

// 搜索处理（本地过滤实时，远程搜索防抖）
function handleSearchChange() {
  if (!props.remoteSearch) return;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchOptions(true);
  }, props.searchDebounce);
}

function handleSearch() {
  if (props.remoteSearch) {
    if (searchTimer) clearTimeout(searchTimer);
    fetchOptions(true);
  }
}

function open() {
  if (closeGuard) return;
  innerValue.value = props.modelValue;
  searchKeyword.value = "";
  if (!loaded) {
    fetchOptions(true);
  }
  innerVisible.value = true;
  emit("update:visible", true);
}

function close() {
  innerVisible.value = false;
  emit("update:visible", false);
}

function onPopupClose() {
  close();
}

function handleSelect(item) {
  if (props.type === "checkbox") {
    const arr = Array.isArray(innerValue.value) ? [...innerValue.value] : [];
    const idx = arr.indexOf(item.value);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(item.value);
    }
    innerValue.value = arr;
    emit("update:modelValue", arr);
    emit(
      "confirm",
      rawOptions.value.filter((i) => arr.includes(i[props.valueKey])),
    );
  } else {
    innerValue.value = item.value;
    emit("update:modelValue", item.value);
    emit(
      "confirm",
      rawOptions.value.find((i) => i[props.valueKey] === item.value),
    );
    close();
  }
  closeGuard = true;
  setTimeout(() => {
    closeGuard = false;
  }, 300);
}

// 初始化时自动加载选项，确保回显正常
fetchOptions(true);
</script>

<style scoped>
.api-select-scroll {
  width: 100%;
}

.api-select-scroll__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  min-height: 48rpx;
}

.api-select-scroll__text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.api-select-scroll__placeholder {
  font-size: 28rpx;
  color: #999;
  flex: 1;
}

/* 弹层内容 */
.api-select-scroll__popup {
  display: flex;
  flex-direction: column;
  height: 70vh;
  background-color: #ffffff;
}

.api-select-scroll__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.api-select-scroll__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.api-select-scroll__search {
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.api-select-scroll__list {
  flex: 1;
  overflow: hidden;
}

.api-select-scroll__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &.is-active {
    background-color: #f0f7ff;
  }

  &:active {
    background-color: #f5f5f5;
  }
}

.api-select-scroll__item-label {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.api-select-scroll__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 12rpx;
}

.api-select-scroll__loading-text {
  font-size: 26rpx;
  color: #999;
}

.api-select-scroll__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.api-select-scroll__empty-text {
  font-size: 26rpx;
  color: #999;
}

.api-select-scroll__nomore {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0 40rpx;
}

.api-select-scroll__nomore-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
