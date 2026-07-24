<template>
    <view>
        <view style="height: 70px; width: 100px; margin-top: 60rpx"></view>
        <view class="tabbar-container">
            <image src="/static/intergral/item-bg.png" class="tabbar-bg"></image>

            <!-- 首页 -->
            <view class="tabbar-item" @click="changeItem(whiteList[0])">
                <view class="item-top">
                    <image
                        :src="currentItem == 0 ? whiteList[0].selectIcon : whiteList[0].icon"
                        style="width: 30px; height: 27px"
                    ></image>
                </view>
                <view class="item-bottom" :class="[currentItem == 0 ? 'item-active' : '']">
                    {{ whiteList[0].text }}
                </view>
            </view>

            <!-- 地图 -->
            <view class="tabbar-item" @click="changeItem(whiteList[1])">
                <view class="item-top">
                    <image
                        :src="currentItem == 1 ? whiteList[1].selectIcon : whiteList[1].icon"
                        class="item-icon"
                        style="width: 34px; height: 27px"
                    ></image>
                </view>
                <view class="item-bottom" :class="[currentItem == 1 ? 'item-active' : '']">
                    {{ whiteList[1].text }}
                </view>
            </view>

            <!-- 中间扫码上机 -->
            <view class="tabbar-item center-item" @click="changeItem(whiteList[2])">
                <view class="item-top center-item-top">
                    <image src="/static/tab/bar-middle.png" class="center-icon"></image>
                </view>
                <view class="item-bottom" :class="[currentItem == 2 ? 'item-active' : '']"></view>
            </view>

            <!-- 积分 -->
            <view class="tabbar-item" @click="changeItem(whiteList[3])">
                <view class="item-top">
                    <image
                        :src="currentItem == 3 ? whiteList[3].selectIcon : whiteList[3].icon"
                        style="width: 28px; height: 27px"
                    ></image>
                </view>
                <view class="item-bottom" :class="[currentItem == 3 ? 'item-active' : '']">
                    {{ whiteList[3].text }}
                </view>
            </view>

            <!-- 我的 -->
            <view class="tabbar-item" @click="changeItem(whiteList[4])">
                <view class="item-top">
                    <image
                        :src="currentItem == 4 ? whiteList[4].selectIcon : whiteList[4].icon"
                        style="width: 29px; height: 27px"
                    ></image>
                </view>
                <view class="item-bottom" :class="[currentItem == 4 ? 'item-active' : '']">
                    {{ whiteList[4].text }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        currentPage: {
            type: Number,
            default: 0
        },
        theme: {
            type: String,
            default: 'white'
        }
    },

    data() {
        return {
            currentItem: 0,
            whiteList: [
                {
                    id: 0,
                    path: '/pages/tab/index',
                    icon: '/static/tab/h1-white.png',
                    selectIcon: '/static/tab/h1-white-a.png',
                    text: '首页',
                    centerItem: false
                },
                {
                    id: 1,
                    path: '/pages/tab/map',
                    icon: '/static/tab/h2-white.png',
                    selectIcon: '/static/tab/h2-white-a.png',
                    text: '地图',
                    centerItem: false
                },
                {
                    id: 2,
                    path: '',
                    icon: '/static/tab/bar-middle.png',
                    selectIcon: '/static/tab/center.svg',
                    text: '扫码上机',
                    centerItem: true
                },
                {
                    id: 3,
                    path: '/pages/tab/integral',
                    icon: '/static/tab/h3-white.png',
                    selectIcon: '/static/tab/h3-white-a.png',
                    text: '积分',
                    centerItem: false
                },
                {
                    id: 4,
                    path: '/pages/tab/profile',
                    icon: '/static/tab/h4-white.png',
                    selectIcon: '/static/tab/h4-white-a.png',
                    text: '我的',
                    centerItem: false
                }
            ]
        }
    },
    mounted() {
        this.currentItem = this.currentPage
    },

    methods: {
        changeItem(item) {
            uni.switchTab({
                url: item.path
            })
        }
    }
}
</script>

<style lang="scss" scoped>
view {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.tabbar-bg {
    width: 100vw;
    height: 260rpx;
    position: fixed;
    bottom: 140rpx;
    z-index: 90;
}

.tabbar-container {
    position: fixed;
    bottom: 0rpx;
    left: 0rpx;
    width: 100%;
    z-index: 100;
    height: 140rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #999999;
    background-color: #fff;
    padding-bottom: calc(env(safe-area-inset-bottom) - 35rpx);

    .tabbar-item {
        width: 33.33%;
        height: 100rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        z-index: 100;
        .item-top {
        }

        .item-icon {
            width: 50rpx;
            height: 45rpx;
        }

        .item-bottom {
            font-size: 22rpx;
            width: 100%;
            margin-top: 10rpx;
            color: #5e5d5d;
        }

        .item-active {
            color: #000;
        }
    }

    .center-item {
        display: block;
        position: relative;
        .center-item-top {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 100rpx;
            height: 100rpx;
            position: absolute;
            top: -20rpx;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 50%;
            border: 1rpx solid #000;
            background-color: #fff;
            // box-shadow: 0px 3px 6px rgba(74, 156, 231, 0.5);
        }

        .center-icon {
            width: 55rpx;
            height: 50rpx;
        }

        .item-bottom {
            position: absolute;
            bottom: 5rpx;
        }

        .item-active {
            position: absolute;
            bottom: 5rpx;
            color: #1fff;
        }
    }
}
</style>
