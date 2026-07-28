<template>
    <view>4</view>
</template>

<script setup>
import bottomBarVue from '../../components/bottom-bar.vue'
import { getUserCoupon, miniPay, getPointByUser } from '@/api/index.js'
import { padToElevenDigits } from '../../utils/tools'
import { useGlobalStore } from '../../store/global'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useNavbarHeight } from '/components/hook/navbar.js'
import { ref, computed } from 'vue'
const { safeAreaTop, titleBarHeight, titleBarMarginTop, navbarHeight } = useNavbarHeight()
const height = computed(() => navbarHeight)
import { storeToRefs } from 'pinia'
</script>

<style scoped lang="scss">
/* 基础样式 + 动画 */
.body {
    z-index: 80;
    background-color: #fff;
    position: relative;
    transition: all 0.5s ease; /* 统一过渡动画 */
}

/* 隐藏状态：回到原来的 -500rpx */
.body-hidden {
    margin-top: -500rpx;
}

/* 显示状态：margin-top 0 */
.body-show {
    margin-top: 0;
}

.card-swiper {
    --wot-swiper-radius: 0;
    --wot-swiper-item-padding: 0 24rpx;
    --wot-swiper-nav-dot-color: #e7e7e7;
    --wot-swiper-nav-dot-active-color: #4d80f0;
    padding-bottom: 24rpx;
    :deep(.custom-indicator-class) {
        bottom: -16px;
    }
    :deep(.custom-image) {
        border-radius: 12rpx;
    }
    :deep(.custom-image-prev) {
        height: 168px !important;
    }
}
.slot-img {
    width: 80rpx;
    border-radius: 80rpx;
    height: 80rpx;
}
.common-top {
    background-color: #f4f4f4;
    display: flex;
    align-items: flex-end;
    padding: 0 60rpx;

    .one {
        font-size: 28rpx;
        font-family: 'HarmonyOS_Sans_SC_Bold';
    }
    .two {
        border: 1px solid #6f6f6f;
        padding: 2rpx 4rpx;
        margin-left: 20rpx;
        border-radius: 6rpx;
        font-family: 'HarmonyOS_Sans_SC_Bold';
        font-size: 22rpx;
    }
}
</style>
