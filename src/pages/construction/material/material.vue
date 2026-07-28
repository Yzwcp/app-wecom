<template>
  <view class="page">
    <view class="content-container">
      <view v-if="loading" class="loading-wrap">
        <wd-loading size="40rpx" /> 加载中...
      </view>

      <view v-else-if="materialList.length === 0" class="empty-wrap">
        <text class="empty-text">暂无材料数据，请点击下方添加</text>
      </view>

      <view v-else class="material-list">
        <view
          v-for="(item, index) in materialList"
          :key="item.id || index"
          class="material-card"
        >
          <view class="card-header">
            <view class="tag-index">{{
              String(index + 1).padStart(2, "0")
            }}</view>
            <text class="material-name">{{ item.materialName }}</text>
            <view class="action-icons">
              <wd-icon
                name="edit"
                size="18px"
                color="#0066ff"
                class="icon-space"
                @click="editMaterial(item, index)"
              />
              <wd-icon
                name="delete"
                size="18px"
                color="#ee0a24"
                @click="deleteMaterial(item, index)"
              />
            </view>
          </view>

          <view class="card-body">
            <view class="data-group">
              <view class="data-item">
                <text class="data-label">数量</text>
                <text class="data-val text-blue">{{ item.quantity }}</text>
              </view>
              <view class="divider-line"></view>
              <view class="data-item">
                <text class="data-label">单位</text>
                <text class="data-val">{{ item.unit }}</text>
              </view>
            </view>

            <view v-if="item.remark" class="material-desc">
              <wd-icon name="warning" size="14px" color="#999" />
              <text class="desc-text">描述：{{ item.remark }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-btn-group">
      <button class="btn-add" @click="addMaterial">添加材料</button>
      <button class="btn-save" :loading="submitting" @click="saveMaterial">
        保存材料
      </button>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getConstructionMaterialList } from "@/api/construction";
import { ref } from "vue";

const loading = ref(false);
const submitting = ref(false);
const materialList = ref([]);

const taskId = ref("");
const subTaskId = ref("");

function goBack() {
  uni.navigateBack();
}

// 【增】跳转到添加材料表单页面
function addMaterial() {
  uni.$router.push({
    url: "/pages/construction/material/form",
    params: {
      taskId: taskId.value,
      subTaskId: subTaskId.value,
      mode: "add",
    },
  });
}

// 【改】跳转到编辑材料表单页面，传参当前条目数据
function editMaterial(item, index) {
  uni.$router.push({
    url: "/pages/construction/material/form",
    params: {
      mode: "edit",
      index,
      data: item,
    },
  });
}

// 【删】删除确认提示与联动本地数组切除
function deleteMaterial(item, index) {
  uni.showModal({
    title: "提示",
    content: `确定要删除材料“${item.materialName}”的明细吗？`,
    confirmColor: "#ee0a24", // 警告类操作，确认按钮设为红色
    success: (res) => {
      if (res.confirm) {
        // 执行前端删除逻辑
        materialList.value.splice(index, 1);
        uni.showToast({
          title: "已删除",
          icon: "success",
        });

        // 如果需要立即同步后端，可以在这里调用后端删除 API:
        // doDeleteMaterialApi(item.id);
      }
    },
  });
}

// 【存】将材料列表回传给 record 页面，不调接口
async function saveMaterial() {
  if (materialList.value.length === 0) {
    uni.showToast({ title: "材料明细不能为空", icon: "none" });
    return;
  }

  uni.showToast({ title: "保存成功", icon: "success" });

  setTimeout(() => {
    uni.$router.back({
      delta: 1,
      params: {
        action: "updateMaterial",
        materialList: JSON.parse(JSON.stringify(materialList.value)),
      },
    });
  }, 300);
}

// 获取列表数据
async function fetchMaterialList() {
  loading.value = true;
  try {
    const res = await getConstructionMaterialList({
      id: subTaskId.value,
    });
    if (res && res.length > 0) {
      materialList.value = res;
    }
  } catch (err) {
    console.error("加载失败，采用Mock数据演示", err);
  } finally {
    loading.value = false;
  }
}

onLoad(() => {
  const params = uni.$router.params;
  if (params?.id) taskId.value = params.id;
  if (params?.subTaskId) subTaskId.value = params.subTaskId;

  // 如果 record 页面传了 materialList，直接使用，不再调接口
  if (params?.materialList && params.materialList.length > 0) {
    materialList.value = params.materialList;
  } else {
    fetchMaterialList();
  }
});

// 如果表单页修改了数据返回，接收回传数据并更新列表
onShow(() => {
  const result = uni.$router.params;
  if (result?.action && result?.data) {
    if (result.action === "add") {
      materialList.value.push(result.data);
    } else if (result.action === "edit" && result.index > -1) {
      materialList.value[result.index] = { ...result.data };
    }
    materialList.value = [...materialList.value];
  }
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 160rpx; /* 留出底部按钮兜底高度 */
}

.content-container {
  padding: 24rpx;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 12rpx;

  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

/* 材料卡片样式 */
.material-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 24rpx;

  .card-header {
    padding: 30rpx 24rpx 0 24rpx;
    display: flex;
    align-items: center;

    .tag-index {
      background-color: #0066ff;
      color: #ffffff;
      font-size: 24rpx;
      font-weight: bold;
      line-height: 1;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }

    .material-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
    }

    .action-icons {
      display: flex;
      align-items: center;

      .icon-space {
        margin-right: 28rpx;
      }
    }
  }

  .card-body {
    padding: 24rpx;
  }
}

.data-group {
  display: flex;
  background-color: #f6f9fe;
  border: 2rpx solid #dae7fd;
  border-radius: 16rpx;
  padding: 16rpx 0;
  margin-bottom: 16rpx;

  .data-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .data-label {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }

    .data-val {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;

      &.text-blue {
        color: #0066ff;
      }
    }
  }

  .divider-line {
    width: 2rpx;
    background-color: #dae7fd;
    align-self: center;
    height: 60rpx;
  }
}

.material-desc {
  display: flex;
  align-items: flex-start;
  padding-left: 6rpx;
  gap: 12rpx;

  .desc-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
  }
}

/* 底部按钮固定栏 */
.footer-btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: #ffffff;
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom)) 30rpx;
  display: flex;
  gap: 24rpx;
  border-top: 1px solid #f2f3f5;

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    text-align: center;
    box-sizing: border-box;

    &::after {
      border: none;
    }

    &.btn-add {
      background-color: #fff;
      color: #0066ff;
      border: 2rpx solid #0066ff;
    }

    &.btn-save {
      background-color: #0066ff;
      color: #ffffff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
