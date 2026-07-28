<template>
    <view class="page">
        <!-- 顶部导航栏 -->
        <wd-navbar title="材料明细" left-arrow fixed placeholder @click-left="goBack" />

        <view class="content-container">
            <!-- 温馨提示警告条 -->
            <view class="warning-tip-bar">
                <wd-icon name="warning" size="20px" color="#f08164" />
                <view class="tip-content">
                    <view class="tip-title">温馨提示</view>
                    <view class="tip-desc">请确认所有子任务已完成，材料消耗明细已填写完整且核对无误。</view>
                </view>
            </view>

            <!-- 任务信息卡片 -->
            <view class="info-card">
                <view class="card-title-row">
                    <wd-icon name="bean" size="18px" color="#0066ff" />
                    <text class="title-text">任务信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item" v-for="info in taskSummary" :key="info.name">
                        <text class="name">{{ info.name }}</text>
                        <text class="val">
                            {{ info.count }}
                            <text class="unit">{{ info.unit }}</text>
                        </text>
                    </view>
                </view>
                <!-- 合计条 -->
                <view class="summary-bar">
                    <text class="label">合计</text>
                    <view class="right-val">
                        <text class="num-blue">{{ taskSummary.length }}</text>
                        种 /
                        <text class="num-blue">{{ totalSummaryCount }}</text>
                        单位
                    </view>
                </view>
            </view>

            <!-- 子任务进度卡片 -->
            <view class="info-card">
                <view class="card-title-row justify-between">
                    <view class="left-title">
                        <wd-icon name="check-circle" size="18px" color="#4cd964" />
                        <text class="title-text">子任务进度</text>
                    </view>
                    <text class="progress-ratio text-green">{{ completedCount }}/{{ subTasks.length }}</text>
                </view>

                <!-- 步骤条进度区域 -->
                <view class="steps-wrapper">
                    <wd-steps vertical :active="currentActiveStep">
                        <wd-step v-for="(task, idx) in subTasks" :key="idx" :title="task.title" :description="task.time">
                            <!-- 自定义状态图标：区分未完成、已完成、完成 -->
                            <template #icon>
                                <view class="custom-step-icon" :class="getStepStatusClass(task.status)">
                                    <wd-icon v-if="task.status === '完成' || task.status === '已完成'" name="check" size="12px" color="#fff" />
                                    <view v-else class="dot-inner"></view>
                                </view>
                            </template>

                            <!-- 右侧标题与状态标签 -->
                            <template #title>
                                <view class="step-title-row">
                                    <text class="step-name">{{ task.title }}</text>
                                    <text :class="['status-tag', getStepStatusClass(task.status)]">{{ task.status }}</text>
                                </view>
                            </template>
                        </wd-step>
                    </wd-steps>
                </view>
            </view>

            <!-- 底部通知提示条 -->
            <view class="notice-info-bar">
                <wd-icon name="info-circle" size="16px" color="#0066ff" />
                <text class="notice-text">提交后将立即进入主管审核阶段，请确保所有数据准确无误。审核通过后将正式归档项目。</text>
            </view>
        </view>

        <!-- 确认提交完工固定按钮 -->
        <view class="fixed-bottom-single">
            <wd-button type="primary" block size="large" @click="submitFinalReport">确认提交完工</wd-button>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 物料消耗汇总数据
const taskSummary = ref([
    { name: '超五类网线', count: 350, unit: '米' },
    { name: '六类跳线', count: 10, unit: '条' },
    { name: '千兆光模块', count: 2, unit: '个' }
])

// 子任务进度列表：对应状态有：'未完成'，'已完成'，'完成'
const subTasks = ref([
    { title: '现场勘查', time: '2026-05-22 10:22', status: '完成' },
    { title: '设备安装', time: '2026-05-22 10:22', status: '已完成' },
    { title: '系统调试', time: '2026-05-22 10:22', status: '已完成' },
    { title: '验收交付', time: '2026-05-22 10:22', status: '未完成' }
])

const totalSummaryCount = computed(() => {
    return taskSummary.value.reduce((sum, item) => sum + Number(item.count), 0)
})

const completedCount = computed(() => {
    return subTasks.value.filter((t) => t.status === '完成' || t.status === '已完成').length
})

// 计算 Wot UI 组件当前点亮的最高激活索引
const currentActiveStep = computed(() => {
    const lastSuccess = subTasks.value.map((t) => t.status).lastIndexOf('已完成')
    const lastFinished = subTasks.value.map((t) => t.status).lastIndexOf('完成')
    return Math.max(lastSuccess, lastFinished) + 1
})

// 状态映射为特定的 css class 样式
function getStepStatusClass(status) {
    if (status === '完成') return 'status-finished'
    if (status === '已完成') return 'status-success'
    return 'status-todo'
}

function goBack() {
    uni.navigateBack()
}

function submitFinalReport() {
    const hasUnfinished = subTasks.value.some((t) => t.status === '未完成')
    if (hasUnfinished) {
        uni.showModal({
            title: '提示',
            content: '当前尚有未完成的子任务，确定强行提交完工吗？',
            success: (res) => {
                if (res.confirm) executeSubmit()
            }
        })
    } else {
        executeSubmit()
    }
}

function executeSubmit() {
    uni.showToast({
        title: '提交成功，已送审',
        icon: 'success',
        success: () => {
            setTimeout(() => {
                uni.reLaunch({ url: '/pages/index/index' }) // 完工后通常跳转回主页
            }, 1500)
        }
    })
}
</script>

<style scoped lang="scss">
.page {
    width: 100%;
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 160rpx;
}
.content-container {
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.warning-tip-bar {
    display: flex;
    gap: 16rpx;
    background-color: #fdf3f0;
    border: 1px solid #fcdbcf;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;

    .tip-content {
        flex: 1;
        .tip-title {
            font-size: 26rpx;
            font-weight: bold;
            color: #f08164;
            margin-bottom: 4rpx;
        }
        .tip-desc {
            font-size: 24rpx;
            color: #666;
            line-height: 1.4;
        }
    }
}
.info-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

    .card-title-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        border-bottom: 1px solid #f5f6f7;
        padding-bottom: 20rpx;
        margin-bottom: 20rpx;

        &.justify-between {
            justify-content: space-between;
        }
        .left-title {
            display: flex;
            align-items: center;
            gap: 12rpx;
        }
        .title-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
        }
        .progress-ratio {
            font-size: 26rpx;
            font-weight: bold;
            &.text-green {
                color: #4cd964;
            }
        }
    }
}
.info-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 26rpx;
        .name {
            color: #333;
        }
        .val {
            font-weight: 500;
            color: #333;
            .unit {
                color: #999;
                margin-left: 6rpx;
            }
        }
    }
}
.summary-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #e6f0ff;
    border-radius: 8rpx;
    padding: 16rpx 20rpx;
    margin-top: 24rpx;
    font-size: 26rpx;

    .label {
        color: #333;
        font-weight: 500;
    }
    .right-val {
        color: #555;
        .num-blue {
            color: #0066ff;
            font-weight: bold;
        }
    }
}
.steps-wrapper {
    padding: 10rpx 0;
    .step-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: 10rpx;
    }
    .step-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
    }
    .status-tag {
        font-size: 22rpx;
        padding: 2rpx 12rpx;
        border-radius: 20rpx;

        &.status-finished {
            background-color: #eaf8ee;
            color: #4cd964;
        }
        &.status-success {
            background-color: #e6f0ff;
            color: #0066ff;
        }
        &.status-todo {
            background-color: #f5f5f5;
            color: #999;
        }
    }
}
.custom-step-icon {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.status-finished,
    &.status-success {
        background-color: #4cd964;
    }
    &.status-todo {
        border: 2rpx solid #ccc;
        background-color: #fff;
        .dot-inner {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background-color: #ccc;
        }
    }
}
.notice-info-bar {
    display: flex;
    gap: 12rpx;
    background-color: #eef4ff;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    .notice-text {
        font-size: 24rpx;
        color: #0066ff;
        line-height: 1.5;
    }
}
.fixed-bottom-single {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    padding: 24rpx 32rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
    z-index: 99;
}
</style>
