
export default {
	placeholder: {
		type: Boolean,
		default: false,
	},
	safeAreaInsetTop: {
		type: Boolean,
		default: false,
	},
	/** 是否添加动画效果 */
	animation: {
		type: Boolean,
		default: true,
	},
	/** 是否固定在顶部 */
	fixed: {
		type: Boolean,
		default: true,
	},
	/** 是否展示左侧箭头 */
	leftArrow: {
		type: Boolean,
		default: false,
	},
	/** 页面标题 */
	title: {
		type: String,
		default: null
	},
	/** 标题文字最大长度，超出的范围使用 `...` 表示 */
	titleMaxLength: {
		type: Number,
		default: null
	},
	/** 后退按钮后退层数，含义参考 [wx.navigateBack](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateBack.html)，特殊的，传入 0 不会发生执行 wx.navigateBack */
	delta: {
		type: Number,
		default: 1,
	},
	zIndex: {
		type: Number,
		default: null,
	},
	bgColor: {
		type: String,
		default: null,
	},
	color: {
		type: String,
		default: null,
	},
};