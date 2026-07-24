<template>
	<view class="demo-block">
		<l-navbar title="标题文字" :leftArrow="true" safeAreaInsetTop placeholder></l-navbar>
		<text class="demo-block__title-text ultra">Navbar 导航栏</text>
		<text class="demo-block__desc-text">为页面提供导航功能，常用于页面顶部。</text>	
		<view class="demo-block__body">
			<view class="demo-block">
				<text class="demo-block__title-text">基础</text>
				<view class="demo-block__body">
					
					<l-navbar title="标题文字" :fixed="false" :leftArrow="true"></l-navbar>
					<view style="height: 10px;"></view>
					<l-navbar title="标题文字" :fixed="false" :leftArrow="true">
						<template #left>
						    <l-icon name="close" size="24px" />
						</template>
						<template #right>
						    <l-icon name="ellipsis" size="24px" />
						</template>
					</l-navbar>
					<view style="height: 10px;"></view>
					<l-navbar title="标题文字超出" :title-max-length="5" :fixed="false" @click-left="handleClick">
					    <template #capsule>
					      <view class="custom-capsule">
					        <l-icon name="chevron-left" size="20px" class="custom-capsule__icon" />
							<view style="width: 1px;height: 20px; background-color: #ddd; margin: 0 10px;"></view>
					        <l-icon name="home" size="20px" class="custom-capsule__icon" />
					      </view>
					    </template>
					    <template #right>
					      <l-icon name="ellipsis" size="24px" />
					    </template>
					</l-navbar>
					<view style="height: 10px;"></view>
					<l-navbar :fixed="false">
					    <template #left>
					       <view style="width: 80%;">
								<l-search placeholder="搜索预设文案?" shape="round"/>
							</view>
					    </template>
					    <template #right>
					        <l-icon name="home" size="24px" />
							<view style="width: 10px;"></view>
					        <l-icon name="ellipsis" size="24px" />
					    </template>
					</l-navbar>
					<view style="height: 10px;"></view>
					<l-navbar title="标题文字" :fixed="false" :leftArrow="true" bg-color="#3283ff" color="white">
						    
					</l-navbar>
				</view>	
			</view>	
			
		</view>	
		<view style="height: 1600px;"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		methods: {
			handleClick(){}
		}
	}
</script>

<style lang="scss">
	.custom-capsule {
	  width: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: row;
	}
	
	.custom-capsule__icon {
	  position: relative;
	  margin: 0;
	}
	
	.demo-block {
		margin: 32px  0;
		// overflow: visible;
		&.card{
			background-color: white;
			padding: 30rpx;
			margin-bottom: 20rpx;
		}
		&__title {
			margin: 0;
			margin-top: 8px;
			&-text {
				padding: 0 16px;
				display: block;
				color: rgba(0, 0, 0, 0.6);
				font-weight: 400;
				font-size: 14px;
				line-height: 16px;
				
				&.large {
					color: rgba(0, 0, 0, 0.9);
					font-size: 18px;
					font-weight: 700;
					line-height: 26px;
				}
				&.ultra {
					color: rgba(0, 0, 0, 0.9);
					font-size: 24px;
					font-weight: 700;
					line-height: 32px;
				}
			}
		}
		&__desc-text {
			color: rgba(0, 0, 0, 0.6);
			margin: 8px 16px 0 16px;
			font-size: 14px;
			line-height: 22px;
		}
		&__body {
			margin: 16px 0;
			overflow: visible;
			.demo-block {
				// margin-top: 0px;
				margin: 0;
			}
		}
	}
</style>