import createRouter from '@/uni_modules/zzh-simple-router/js_sdk/router/router.js'
import {
	useGlobalStore
} from '../store/global'
import {
	loginType
} from '../utils/config'
const router = createRouter()
router.encode = 0 // 任意可转化为Boolen的值，是否编码query参数,有多层对象需要true，否则只会传第一层对象的值
const whiteList = ['pages/tab/index', 'pages/auth/phone-login', 'pages/auth/openid-login', 'pages/login/login'] // 除了这些路径，其他都必须登录

// 全局路由拦截器
router.before = function(from, next) {
	const {
		token
	} = useGlobalStore()
	next()
	return
	const hasPermission = whiteList.find(rule => (from.url).includes(rule))
	if (token) {
		next()
		return
	}
	if (hasPermission) {
		next()
		return
	}
	uni.showModal({
		title: '温馨提示',
		content: '是否前往登录',
		success: (res) => {
			console.log(res);
			if (res.confirm) {
				// next({ url: 'pages/login/index' }) 支持字符串或对象
				next('pages/auth/' + 'phone' + '-login')

			}
		}
	})
	// console.log(from);
}

router.after = to => {
	// console.log(to);
	return to
}

router.onError = err => {
	console.log(err)
}

// Vue.prototype.$router = router
// vue3中 app.config.globalProperties.$router = router

uni.$router = router
export default router