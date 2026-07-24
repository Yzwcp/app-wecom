// @ts-nocheck
type Capsule = {
	hasCapsule: boolean,
	width:  number,//	宽度，单位：px
	height:	number,//	高度，单位：px
	top:	number,//	上边界坐标，单位：px
	right: 	number,//	右边界坐标，单位：px
	bottom: number,//	下边界坐标，单位：px
	left: 	number,//	左边界坐标，单位：px
}

export type Bounds = {
	statusBarHeight: number,
	capsule: Capsule,
	navbarWidth: number,
	navbarHeight: number,
	paddingLeft: number,
	paddingRight: number,
	paddingTop: number,
	paddingBottom: number,
}

export function getMenuButtonBoundingClientRect():Capsule {
	const capsule:Capsule = {
		hasCapsule:false,
		height: 32,
		top: 0,
		left: 0,
		right: 0, 
		width: 0,
		bottom: 0
	}
	// #ifdef MP
	// 场景值为1177（视频号直播间）和1175 （视频号profile页）时，小程序禁用了 wx.getMenuButtonBoundingClientRect
	const hasCapsule = uni.canIUse('getMenuButtonBoundingClientRect') && Boolean(uni.getMenuButtonBoundingClientRect);
	if(hasCapsule) {
		capsule.hasCapsule = hasCapsule;
		Object.assign(capsule, uni.getMenuButtonBoundingClientRect())
	}
	// #endif
	return capsule
}

export function getBounds():Bounds {
	const { statusBarHeight, windowWidth } = uni.getWindowInfo();
	const capsule = getMenuButtonBoundingClientRect();
	
	const offset = 8 // capsule.hasCapsule ? capsule.top - statusBarHeight : 8;
	// 如果使用capsule.top - statusBarHeight得到的值就太小了。
	const bounds:Bounds = {
		statusBarHeight: Math.max(statusBarHeight - offset / 2, 0),
		capsule,
		navbarWidth: windowWidth,
		navbarHeight: offset * 2 + capsule.height,
		paddingLeft: windowWidth - capsule.right,
		paddingRight: windowWidth - capsule.right + capsule.width,
		paddingTop: offset,
		paddingBottom: offset,
	}
	
	return bounds
}


export function truncateTitle(title: string | null, maxLength: number): string {
  if (maxLength <= 0 || title == null) {
    return '';
  }
  
  if (title.length <= maxLength) {
    return title;
  }
  
  return `${title.slice(0, maxLength)}...`;
}