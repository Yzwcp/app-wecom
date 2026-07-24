# custom-tabbar
# 如何使用 uniapp 开发微信小程序自定义底部导航栏呢？
在我们实际的开发过程中我们总会碰到各种各样的需求，比如：小程序中根据用户角色的不同展示不同的底部导航栏
需要在中间凸起展示，然而查看uni-app的tabBar文档可知，小程序是不支持midButton的；所以只能自定义底部导航栏
解决思路：隐藏uni-app原有的tabBar，然后换成自己手写的导航栏，进行定位和自定义样式

然后在引入自己的组件
在需要的page页面直接引入，共5个按钮，中间为凸起展示
		<custom-tabbar :current-page="0"></custom-tabbar>
		<custom-tabbar :current-page="1"></custom-tabbar>
		<custom-tabbar :current-page="2"></custom-tabbar>
		<custom-tabbar :current-page="3"></custom-tabbar>
		<custom-tabbar :current-page="4"></custom-tabbar>



custom-tabbar.vue文件
<template>
	<view class="tabbar-container">
		<block>
			<!-- 针对中间的导航栏  通过true来判断控制类名和样式 -->
			<view class="tabbar-item" v-for="(item, index) in tabbarList"
				:class="[item.centerItem ? 'center-item' : '']" @click="changeItem(item)" :key="index">
				<view class="item-top">
					<image :src="currentItem == item.id ? item.selectIcon : item.icon"
						style="width: 60rpx;height: 60rpx;"></image>
				</view>
				<!-- 通过三元判断控制类名 达到控制选中和未选中的样式 -->
				<view class="item-bottom" :class="[currentItem == item.id ? 'item-active' : '']">
					 {{item.text }}
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	// 组件的书写符合easycom规范 无需引入直接使用
	export default {
		props: {
			currentPage: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				currentItem: 0,
				tabbarList: [{
						id: 0,
						path: '/pages/tabbar/index/index',
						icon: '/static/tabbar/home.png',
						selectIcon: '/static/tabbar/home_1.png',
						text: '首页',
						centerItem: false
					},
					{
						id: 1,
						path: '/pages/tabbar/application/application',
						icon: '/static/tabbar/application.png',
						selectIcon: '/static/tabbar/application_1.png',
						text: '服务',
						centerItem: false
					},
					{
						id: 2,
						path: '/pages-index/payment/paymentQr',
						icon: '/static/tabbar/center.png',
						selectIcon: '/static/tabbar/center.png',
						text: '',
						centerItem: true
					},
					{
						id: 3,
						path: '/pages/tabbar/message/message',
						icon: '/static/tabbar/message.png',
						selectIcon: '/static/tabbar/message_1.png',
						text: '消息',
						centerItem: false
					},
					{
						id: 4,
						path: '/pages/tabbar/mine/mine',
						icon: '/static/tabbar/mine.png',
						selectIcon: '/static/tabbar/mine_1.png',
						text: '我的',
						centerItem: false
					}
				]
			}
		},
		mounted() {
			this.currentItem = this.currentPage
			// 隐藏原来的tabBar导航栏
		},
		methods: {
			changeItem(item) {
				let _this = this
				//_this.currentItem = item.id;
				if (item.id == 2) {
					uni.navigateTo({
						url: item.path
					})
				} else {
					uni.switchTab({
						url: item.path
					})
				}

			}
		}
	};
</script>
<style lang="scss" scope>
  view {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .tabbar-container {
    position: fixed;
	bottom:  0rpx;
    left: 0rpx;
    width: 100%;
    height: 140rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;  // 使得左右的 tab 项距离均匀
    color: #999999;
    background-color: #fff;
    padding-bottom:calc(env(safe-area-inset-bottom) - 35rpx);  /* 添加底部安全区域 padding */
    /* 针对tabbar的统一处理 */
    .tabbar-item {
      width: 33.33%;
      height: 100rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;

      .item-top {
        width: 60rpx;
        height: 60rpx;
        
        image {
          width: 100%;
          height: 100%;
        }
      }

      /* 未被选中的导航栏字体 */
      .item-bottom {
        font-size: 22rpx;
        width: 100%;
        color: #999999;
      }

      /* 被选中的导航栏字体 */
      .item-active {
        color: #4A9CE7;
      }
    }

    /* 最中间的tabbar导航栏 */
    .center-item {
      display: block;
      position: relative;

      .item-top {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 112rpx;
        height: 112rpx;
        position: absolute;
        top: -30rpx;
        left: calc(50% - 50rpx);  // 居中对齐
        border-radius: 50%;
        background-color: #4A9CE7;
        box-shadow: 0px 3px 6px rgba(74,156,231,0.5);
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
