<template>
    <view class="page">
        <!-- 顶部导航栏 -->
        <wd-navbar title="回访录入" left-arrow fixed placeholder @click-left="goBack" />

        <view class="form-container">
            <!-- 客户信息展示卡片 -->
            <view class="info-card">
                <view class="card-title-row">
                    <wd-icon name="user" size="18px" color="#0066ff" />
                    <text class="title-text">客户信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">客户名称</text>
                        <text class="val">{{ customerInfo.name }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">联系人</text>
                        <text class="val">{{ customerInfo.contact }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">联系电话</text>
                        <text class="val">{{ customerInfo.phone }}</text>
                    </view>
                </view>
            </view>

            <!-- 回访时间选择行 -->
            <view class="select-cell-card" @click="openDatePicker">
                <view class="left-label">
                    回访时间
                    <text class="required">*</text>
                </view>
                <view class="right-content">
                    <text class="time-text">{{ formattedVisitTime || '请选择回访时间' }}</text>
                    <wd-icon name="arrow" size="16px" color="#999" />
                </view>
            </view>

            <!-- 核心录入卡片块 -->
            <view class="form-body-card">
                <!-- 满意度评分自定义单选 -->
                <view class="form-section">
                    <view class="section-title">
                        满意度评分
                        <text class="required">*</text>
                    </view>
                    <view class="satisfaction-grid">
                        <view
                            v-for="rate in rateOptions"
                            :key="rate.value"
                            :style="{ backgroundColor: rateLevel === rate.value ? rate.activeColor : '#f5f6f7', color: rateLevel === rate.value ? '#ffffff' : '#666666' }"
                            class="rate-btn"
                            @click="selectRate(rate.value)"
                        >
                            {{ rate.label }}
                        </view>
                    </view>
                </view>

                <!-- 回访内容 -->
                <view class="form-section">
                    <view class="section-title">
                        回访内容
                        <text class="required">*</text>
                    </view>
                    <wd-input v-model="formData.content" type="textarea" placeholder="请输入回访内容描述" no-border custom-class="custom-textarea" />
                </view>

                <!-- 问题记录 -->
                <view class="form-section">
                    <view class="section-title">问题记录</view>
                    <wd-input v-model="formData.problems" type="textarea" placeholder="请输入发现的问题记录" no-border custom-class="custom-textarea" />
                </view>

                <!-- 后续维护计划 -->
                <view class="form-section">
                    <view class="section-title">后续维护计划</view>
                    <wd-input v-model="formData.plans" type="textarea" placeholder="请输入后续跟进或维护策略" no-border custom-class="custom-textarea" />
                </view>
            </view>
        </view>

        <!-- Wot UI 时间选择器组件抽屉 -->
        <wd-datetime-picker v-model="pickerTimeValue" type="datetime" v-model:visible="datePickerVisible" @confirm="handleDateConfirm" />

        <!-- 底部提交操作按钮 -->
        <view class="fixed-bottom-box">
            <wd-button type="primary" block size="large" class="submit-btn" @click="submitVisitForm">提交回访</wd-button>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 头部客户只读基本信息
const customerInfo = ref({
    name: '杭州网晶科技有限公司',
    contact: '李先生',
    phone: '12548853625'
})

// 时间选择器控制
const datePickerVisible = ref(false)
const pickerTimeValue = ref(new Date().getTime())
const formattedVisitTime = ref('2026-05-24 14:50:22')

// 满意度评分选项状态
const rateLevel = ref('very_satisfied') // 对应选中的满意度代码
const rateOptions = [
    { label: '非常满意', value: 'very_satisfied', activeColor: '#f97316' }, // 橙橘色
    { label: '满意', value: 'satisfied', activeColor: '#fb923c' }, // 浅橙色
    { label: '一般', value: 'normal', activeColor: '#fca5a5' }, // 淡红色
    { label: '不满意', value: 'unsatisfied', activeColor: '#ef4444' } // 正红色
]

// 文本框输入绑定
const formData = ref({
    content: '1. 更换核心交换机\n2. 调试无盘系统',
    problems: '1. 更换核心交换机\n2. 调试无盘系统',
    plans: '1. 更换核心交换机\n2. 调试无盘系统'
})

function goBack() {
    uni.navigateBack()
}

function openDatePicker() {
    datePickerVisible.value = true
}

// 转换时间格式为 YYYY-MM-DD HH:mm:ss
function handleDateConfirm({ value }) {
    const d = new Date(value)
    const pad = (n) => (n < 10 ? '0' + n : n)
    formattedVisitTime.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function selectRate(val) {
    rateLevel.value = val
}

function submitVisitForm() {
    if (!formattedVisitTime.value) {
        uni.showToast({ title: '请选择回访时间', icon: 'none' })
        return
    }
    if (!formData.value.content.trim()) {
        uni.showToast({ title: '请填写回访内容', icon: 'none' })
        return
    }

    uni.showToast({
        title: '回访录入成功',
        icon: 'success',
        success: () => {
            setTimeout(() => {
                uni.navigateBack()
            }, 1500)
        }
    })
}

onLoad((options) => {
    if (options.name) {
        customerInfo.value.name = decodeURIComponent(options.name)
    }
})
</script>

<style scoped lang="scss">
.page {
    width: 100%;
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 180rpx;
}
.form-container {
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.required {
    color: #ef4444;
    margin-left: 6rpx;
}

/* 客户基础信息卡片 */
.info-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.01);

    .card-title-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        border-bottom: 1px solid #f5f6f7;
        padding-bottom: 20rpx;
        margin-bottom: 20rpx;
        .title-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
        }
    }

    .info-list {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
        .info-item {
            display: flex;
            justify-content: space-between;
            font-size: 26rpx;
            .label {
                color: #666;
            }
            .val {
                color: #333;
                font-weight: 500;
            }
        }
    }
}

/* 日期选择单元格卡片 */
.select-cell-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-label {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
    }
    .right-content {
        display: flex;
        align-items: center;
        gap: 8rpx;
        .time-text {
            font-size: 26rpx;
            color: #333;
        }
    }
}

/* 表单主体区块 */
.form-body-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 36rpx;
}

.form-section {
    .section-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
    }
}

/* 满意度栅格单选按钮 */
.satisfaction-grid {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;

    .rate-btn {
        flex: 1;
        text-align: center;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 12rpx;
        font-size: 26rpx;
        font-weight: bold;
        transition: all 0.2s ease;
    }
}

/* 覆盖 Wot UI 输入框组件文本域底色 */
:deep(.custom-textarea) {
    background-color: #f8f9fa !important;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 26rpx;
    textarea {
        min-height: 140rpx;
        line-height: 1.5;
    }
}

/* 底部吸底 */
.fixed-bottom-box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    padding: 24rpx 32rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
    z-index: 99;
    .submit-btn {
        :deep(.wd-button) {
            background-color: #0066ff !important;
        }
    }
}
</style>
