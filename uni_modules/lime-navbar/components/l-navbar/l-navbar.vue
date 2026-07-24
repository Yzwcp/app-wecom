<template>
	<view class="l-navbar" 
		:style="[styles]" ref="navbarRef">
		<view class="l-navbar__placeholder" ref="placeholderRef" v-if="placeholder && fixed"></view>
		<view class="l-navbar__content" :class="{'l-navbar--fixed': fixed}" >
			<view ref="leftRef" class="l-navbar__left" v-if="leftArrow || $slots['capsule'] || $slots['left']">
				<view v-if="leftArrow" class="l-navbar__btn" @tap="goBack" aria-role="button" aria-label="返回">
					<l-icon name="chevron-left" class="l-navbar__left-arrow" size="24px" :color="color" />
				</view>
				<slot name="left"></slot>
				<view class="l-navbar__capsule" v-if="$slots['capsule']">
					<slot name="capsule" />
				</view>
			</view>
			<view ref="centerRef" class="l-navbar__center" v-if="title || $slots['title']">
				<slot name="title">
					<text v-if="title" class="l-navbar__center-title" :style="{color:color}">{{titleContent}}</text>
				</slot>
			</view>
			<view ref="rightRef" class="l-navbar__right"  v-if="$slots['right']">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>
<script lang="ts">
	// @ts-nocheck
	/**
	 * Navbar 导航栏组件
	 * 
	 * @description 用于页面顶部导航栏，支持自定义标题、返回按钮和状态栏适配 
	 * <br> 插件类型： LNavbarComponentPublicInstance
	 * @tutorial https://ext.dcloud.net.cn/plugin?name=lime-navbar
	 * 
	 * @property {boolean} placeholder 是否生成占位元素（用于固定定位时防遮挡）
	 * @property {boolean} safeAreaInsetTop 适配顶部安全区域（默认true）
	 * @property {number} delta 返回页面数（例：2表示上两页）
	 * @property {boolean} animation 切换页面时启用动画（默认true）
	 * @property {boolean} fixed 是否固定定位在顶部（默认false）
	 * @property {boolean} leftArrow 是否显示左侧返回箭头（默认true）
	 * @property {string} title 标题文本（支持插槽）
	 * @property {number} titleMaxLength 标题最大字符数（超出显示...）
	 * @property {number} zIndex 层级（默认：980）
	 * @property {string} bgColor 背景色（支持CSS颜色值）
	 * @property {string} color 文字颜色（影响标题/图标）
	 * @event {Function} back 点击返回触发
	 * @event {Function} fail 返回失败触发
	 * @event {Function} complete 返回触发
	 * @event {Function} success 返回成功触发
	 * @event {Function} clickLeft 点击左侧触发
	 * @event {Function} size 返回节点尺寸信息事件
	 */
	import { defineComponent, computed } from '@/uni_modules/lime-shared/vue';
	import { getBounds, truncateTitle } from './utils';
	import navbarProps from './props';
	const name = 'l-navbar'
	export default defineComponent({
		// name,
		props: navbarProps,
		emits: ["back", "fail", "complete", "success", "click-left", "size"],
		setup(props, { emit }) {
			
			const bounds = getBounds()
			const styles = computed(()=>{
				const style: Record<string, any> = {}
				if(props.bgColor) {
					style['--l-navbar-bg-color'] = props.bgColor
				}
				if(props.color) {
					style['--l-navbar-color'] = props.color
				}
				if(props.zIndex) {
					style['--l-navbar-z-index'] = props.zIndex
				}
				if(props.safeAreaInsetTop) {
					style['--l-navbar-padding-top'] = bounds.statusBarHeight + 'px';
				}
				if(bounds.capsule.hasCapsule) {
					style['--l-navbar-height'] = bounds.navbarHeight + 'px';
					style['--l-navbar-capsule-height'] = bounds.capsule.height + 'px';
					style['--l-navbar-capsule-width'] = bounds.capsule.width + 'px';
					style['--l-navbar-left'] = bounds.paddingLeft + 'px';
					style['--l-navbar-right'] = bounds.paddingRight + 'px';
				}
				
				return style
			})
			
			
			
			const goBack = () => {
				emit('click-left')
				const { delta } = props
				
				if (delta > 0) {
					emit("back");
					uni.navigateBack({
						delta,
						fail: (e) => {
							emit("fail", e);
						},
						complete: (e) => {
							emit("complete", e);
						},
						success: (e) => {
							emit("success", e);
						},
					});
				}
			}
			const titleContent = computed((): string =>{
				return truncateTitle(props.title, props.titleMaxLength ?? Number.MAX_VALUE)
			})
			
			const top = (props.safeAreaInsetTop ? bounds.statusBarHeight : 0)
			emit("size", {
				height: bounds.navbarHeight + top,
				statusBarHeight: bounds.statusBarHeight,
				navbarHeight: bounds.navbarHeight,
				capsuleHeight: bounds.capsule.height,
				capsuleWidth: bounds.capsule.width,
				paddingLeft: bounds.paddingLeft,
				paddingRight: bounds.paddingRight,
				isFixed: props.fixed // 额外返回是否是固定定位
			})
			
			return {
				styles,
				titleContent,
				goBack
			}
		}
	})
</script>
<style lang="scss">
	@import './index-u';
</style>