<template>
  <wd-upload
    :file-list="fileList"
    :action="uploadUrl"
    :limit="limit"
    :disabled="disabled || readonly"
    :accept="accept"
    :extension="extension"
    :max-size="maxSize"
    reupload
    :upload-method="customUpload"
    @success="handleSuccess"
    @remove="handleRemove"
  >
  </wd-upload>
</template>

<script setup>
import { ref, watch } from "vue";
import { useGlobalStore } from "@/store/global";
import { baseUrl } from "../utils/config";
import { extractFileIdFromUrl } from "@/utils/tools";

const props = defineProps({
  modelValue: { type: [String, Array], default: "" },
  category: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  limit: { type: Number, default: 1 },
  /** 文件类型：image | video | media | all | file（all/file 支持任意文件上传） */
  accept: { type: String, default: "image" },
  /** 文件扩展名过滤，如 ['.pdf', '.jpg'] */
  extension: { type: Array, default: () => [] },
  /** 单个文件大小限制（MB），默认 0 不限制 */
  sizeLimit: { type: Number, default: 0 },
  action: { type: String, default: "/wjapp/wjMobile/file/upload" },
  urlKey: { type: String, default: "url" },
});

const emit = defineEmits(["update:modelValue", "update:fileId", "extraData"]);

const globalStore = useGlobalStore();
const fileList = ref([]);

const uploadUrl = baseUrl + props.action;
// wd-upload maxSize 单位为字节
const maxSize =
  props.sizeLimit > 0 ? props.sizeLimit * 1024 * 1024 : Number.MAX_VALUE;

// 将 modelValue (String|Array) 转为内部 fileList
function valueToFileList(val) {
  if (!val || (Array.isArray(val) && val.length === 0)) {
    return [];
  }
  if (Array.isArray(val)) {
    return val.map((url) => ({ url, status: "success" }));
  }
  return [{ url: val, status: "success" }];
}

// modelValue 变化时同步到 fileList
watch(
  () => props.modelValue,
  (val) => {
    fileList.value = valueToFileList(val);
  },
  { immediate: true },
);

// 自定义上传方法
function customUpload(file, formData, options) {
  const task = uni.uploadFile({
    url: uploadUrl,
    filePath: file.url,
    name: "file",
    formData: { category: props.category },
    header: { Token: globalStore.token || "" },
    success: (res) => {
      try {
        const result = JSON.parse(res.data);

        if (result.code === 200) {
          options.onSuccess(result, file, formData);
        } else {
          uni.showModal({
            title: "上传失败",
            content: result.msg || "上传失败",
            showCancel: false,
          });
          options.onError(result, file, formData);
        }
      } catch {
        options.onError({ msg: "解析失败" }, file, formData);
      }
    },
    fail: (err) => {
      options.onError(err, file, formData);
    },
  });
  task.onProgressUpdate((res) => {
    options.onProgress(res, file);
  });
  return task;
}

// 从上传响应中提取文件 ID/URL
function extractUrl(response) {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    return response[props.urlKey] || response.url || "";
  }
  return response?.[1] || "";
}

// 上传成功：提取 URL 写入 v-model，同时回传文件 ID
function handleSuccess(result) {
  const response = result.file.response;
  const newUrl = extractUrl(response);
  const fileId =
    (typeof response === "object" &&
      !Array.isArray(response) &&
      (response.id || response.fileId)) ||
    extractFileIdFromUrl(newUrl);

  if (typeof response === "object" && !Array.isArray(response)) {
    emit("extraData", response);
  }

  emit("update:fileId", fileId || "");

  if (props.limit === 1) {
    // 单图模式：直接传字符串
    emit("update:modelValue", newUrl);
  } else {
    // 多图模式：累加到已有数组中
    const existing = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : props.modelValue
        ? [props.modelValue]
        : [];
    existing.push(newUrl);
    emit("update:modelValue", existing);
  }
}

// 移除图片
function handleRemove(event) {
  if (props.readonly) return;
  // @remove 事件 payload 为 { file }，需正确提取
  const file = event?.file || event;
  if (props.limit === 1) {
    emit("update:modelValue", "");
    emit("update:fileId", "");
  } else {
    const existing = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : props.modelValue
        ? [props.modelValue]
        : [];
    const fileUrl = file.url || file;
    const removeIndex = existing.indexOf(fileUrl);
    if (removeIndex !== -1) {
      existing.splice(removeIndex, 1);
    }
    emit("update:modelValue", existing);
  }
}
</script>
