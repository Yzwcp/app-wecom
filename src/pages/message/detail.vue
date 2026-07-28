<template>
    <view class="page">
        <wd-navbar title="消息详情" left-arrow fixed placeholder @click-left="goBack" />

        <scroll-view class="content-scroll" scroll-y>
            <view class="detail-card">
                <!-- 消息标题 -->
                <view class="detail-header">
                    <text class="detail-title">{{ detail.title }}</text>
                    <view class="detail-time">{{ detail.createTime }}</view>
                </view>

                <!-- 消息正文 -->
                <view class="detail-body">
                    <text class="detail-content">{{ detail.content }}</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { markAsRead } from '@/api'

const detail = ref({
    id: '',
    title: '',
    content: '',
    createTime: '',
    type: '',
})

function goBack() {
    uni.navigateBack()
}

onLoad(() => {
    const params = uni.$router.params || {}
    detail.value = {
        id: params.id || '',
        title: params.title || '',
        content: params.content || '',
        createTime: params.createTime || '',
        type: params.type || '',
    }

    // 加载时调用已读接口
    if (detail.value.id) {
        markAsRead({ id: detail.value.id }).catch((err) => {
            console.error('标记已读失败', err)
        })
    }
})
</script>

<style scoped lang="scss">
.page {
    width: 100%;
    min-height: 100vh;
    background-color: #f7f8fa;
}

.content-scroll {
    height: calc(100vh - 88rpx - env(safe-area-inset-top));
}

.detail-card {
    background-color: #ffffff;
    margin: 24rpx;
    border-radius: 16rpx;
    padding: 32rpx;
}

.detail-header {
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 28rpx;

    .detail-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        display: block;
        margin-bottom: 16rpx;
        line-height: 1.4;
    }

    .detail-time {
        font-size: 24rpx;
        color: #999999;
    }
}

.detail-body {
    .detail-content {
        font-size: 30rpx;
        color: #444444;
        line-height: 1.8;
    }
}
</style>
