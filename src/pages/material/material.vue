<template>
    <view class="page">
        <!-- 顶部导航栏 -->
        <wd-navbar title="材料明细" left-arrow fixed placeholder @click-left="goBack" />

        <view class="content-container">
            <!-- 材料列表卡片 -->
            <view class="material-list">
                <view v-for="(item, index) in materialList" :key="item.id" class="material-card">
                    <view class="material-top">
                        <view class="tag-index">{{ formatIndex(index + 1) }}</view>
                        <view class="material-name">{{ item.name }}</view>
                        <view class="action-icons">
                            <wd-icon name="edit" size="18px" color="#0066ff" class="icon-space" @click="editMaterial(item)" />
                            <wd-icon name="delete" size="18px" color="#ee0a24" @click="deleteMaterial(index)" />
                        </view>
                    </view>

                    <view class="material-data-box">
                        <view class="data-item">
                            <view class="data-label">数量</view>
                            <view class="data-val text-blue">{{ item.count }}</view>
                        </view>
                        <view class="divider-line"></view>
                        <view class="data-item">
                            <view class="data-label">单位</view>
                            <view class="data-val">{{ item.unit }}</view>
                        </view>
                    </view>

                    <view class="material-desc">
                        <wd-icon name="warning" size="14px" color="#0066ff" />
                        <text class="desc-text">描述： {{ item.desc || '暂无描述' }}</text>
                    </view>
                </view>
            </view>

            <!-- 底部蓝色统计明细看板 -->
            <view class="statistics-board">
                <view class="board-title">统计明细</view>
                <view class="board-content">
                    <view class="stat-item">
                        <text class="stat-num">{{ materialList.length }}</text>
                        <text class="stat-label">种物料</text>
                    </view>
                    <view class="stat-item">
                        <text class="stat-num">{{ totalCount }}</text>
                        <text class="stat-label">件 总用量</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作按钮区域 -->
        <view class="fixed-bottom-btns">
            <wd-button type="secondary" plain block class="flex-btn" @click="addMaterialItem">添加材料</wd-button>
            <wd-button type="primary" block class="flex-btn" @click="navigateToForm">保存材料</wd-button>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟材料明细列表数据
const materialList = ref([
    { id: 1, name: '星际网吧', count: 350, unit: '米', desc: '实在不在写什么，就随便写写吧' },
    { id: 2, name: '星际网吧', count: 350, unit: '米', desc: '实在不在写什么，就随便写写吧' },
    { id: 3, name: '星际网吧', count: 350, unit: '米', desc: '实在不在写什么，就随便写写吧' }
])

// 计算材料总用量
const totalCount = computed(() => {
    return materialList.value.reduce((sum, item) => sum + Number(item.count), 0)
})

function formatIndex(num) {
    return num < 10 ? '0' + num : num
}

function goBack() {
    uni.navigateBack()
}

function addMaterialItem() {
    materialList.value.push({
        id: Date.now(),
        name: '新建物料资源',
        count: 100,
        unit: '个',
        desc: '点击编辑修改具体描述信息'
    })
}

function editMaterial(item) {
    uni.showToast({ title: `编辑: ${item.name}`, icon: 'none' })
}

function deleteMaterial(index) {
    materialList.value.splice(index, 1)
}

// 跳转到提交完工表单页面
function navigateToForm() {
    uni.navigateTo({
        url: '/pages/material/form' // 请对应您实际的表单页面路由
    })
}
</script>

<style scoped lang="scss">
.page {
    width: 100%;
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 180rpx;
}
.content-container {
    padding: 24rpx;
}
.material-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-bottom: 24rpx;
}
.material-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 28rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

    .material-top {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;

        .tag-index {
            background-color: #0066ff;
            color: #ffffff;
            font-size: 24rpx;
            font-weight: bold;
            padding: 4rpx 14rpx;
            border-radius: 8rpx;
            margin-right: 18rpx;
        }
        .material-name {
            font-size: 30rpx;
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
}
.material-data-box {
    display: flex;
    background-color: #f2f7ff;
    border: 1px solid #d4e4ff;
    border-radius: 12rpx;
    padding: 20rpx 0;
    margin-bottom: 20rpx;

    .data-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .data-label {
            font-size: 24rpx;
            color: #8daade;
            margin-bottom: 6rpx;
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
        background-color: #d4e4ff;
        align-self: stretch;
    }
}
.material-desc {
    display: flex;
    align-items: flex-start;
    gap: 8rpx;
    background-color: #fafafa;
    padding: 12rpx 16rpx;
    border-radius: 8rpx;
    .desc-text {
        font-size: 24rpx;
        color: #666;
        line-height: 1.4;
    }
}
.statistics-board {
    background-color: #0066ff;
    border-radius: 16rpx;
    padding: 28rpx;
    color: #ffffff;
    margin-bottom: 40rpx;

    .board-title {
        font-size: 26rpx;
        opacity: 0.9;
        margin-bottom: 20rpx;
    }
    .board-content {
        display: flex;
        gap: 60rpx;

        .stat-item {
            display: flex;
            align-items: baseline;
            gap: 8rpx;
            .stat-num {
                font-size: 48rpx;
                font-weight: bold;
            }
            .stat-label {
                font-size: 24rpx;
                opacity: 0.85;
            }
        }
    }
}
.fixed-bottom-btns {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    padding: 24rpx 32rpx;
    display: flex;
    gap: 24rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
    z-index: 99;
    .flex-btn {
        flex: 1;
    }
}
</style>
