// @ts-nocheck

export type NavbarSize = {
  height: number;              // 导航栏总高度（包含状态栏）
  statusBarHeight: number;     // 状态栏高度
  navbarHeight: number;        // 导航栏内容高度（不包含状态栏）
  capsuleHeight: number;      // 胶囊按钮高度
  capsuleWidth: number;       // 胶囊按钮宽度
  paddingLeft: number;        // 左侧内边距
  paddingRight: number;       // 右侧内边距
  isFixed: boolean;           // 是否固定定位
}

export interface NavbarProps {
	placeholder: boolean;
	safeAreaInsetTop: boolean;
	delta: number;
	/**
	 * 是否添加动画效果
	 */
	animation : boolean;
	/**
	 * 是否固定在顶部
	 */
	fixed: boolean;
	/**
	 * 左侧区域
	 */
	// left?: TNode;
	/**
	 * 是否展示左侧箭头
	 */
	leftArrow : boolean;
	/**
	 * 右侧区域
	 */
	// right?: TNode;
	/**
	 * 页面标题
	 */
	title ?: string;
	/**
	 * 标题文字最大长度，超出的范围使用 `...` 表示
	 */
	titleMaxLength ?: number;
	zIndex?: number;
	bgColor?: string;
	color?: string;
}