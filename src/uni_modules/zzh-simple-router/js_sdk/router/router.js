/* eslint-disable complexity */
import { Base64, Check, deepClone, paramsToObj, paramsToUrl } from './util'

// uni 方法
// 修复vue3打包后 uni['navigateTo']访问不到，所以需要直接保存函数引用
const UNI_NAV_ACTION = {
	navigateTo: {
		// 保留当前页面，跳转到应用内的某个页面，使用navigateBack可以返回到原页面。
		action: uni.navigateTo,
		alias: ['to', 'push'],
	},
	redirectTo: {
		// 关闭当前页面，跳转到应用内的某个页面。 跳转到 tabBar 页面只能使用 switchTab 跳转
		action: uni.redirectTo,
		alias: ['replace'],
	},
	reLaunch: {
		// 关闭所有页面，打开到应用内的某个页面。
		action: uni.reLaunch,
		alias: [],
	},
	switchTab: {
		// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
		action: uni.switchTab,
		alias: [],
	},
	navigateBack: {
		// 返回页面
		action: uni.navigateBack,
		alias: ['back'],
	},
}

function _nav(args) {
	const { type = 'navigateTo', url = '', delta = '', query = {}, conf = {}, encode, } = args
	let queryUrl
	if (encode * 1 === 1) {
		const queryStr = Base64.encode(JSON.stringify(query)) // encodeURIComponent(JSON.stringify(query))
		// 跳转tab页不能携带参数，只能纯路径
		queryUrl = Check.isPlainObject(query) ? url : `${url}${url.includes('?') ? '&' : '?'}qryStr=${queryStr}`
	} else {
		// 跳转tab页不能携带参数，只能纯路径
		queryUrl = Check.isPlainObject(query) ? url : `${url}${url.includes('?') ? '&' : '?'}encode=0&${paramsToUrl(query)}`
	}

	return new Promise((resolve, reject) => {
		const config = {
			...conf,
			success(res) {
				resolve({
					config: args,
					...res,
				})
			},
			fail(err) {
				reject({
					config: args,
					errCode: 400,
					...err,
				})
			},
		}
		delta ? (config.delta = delta) : (config.url = queryUrl)
		UNI_NAV_ACTION[type].action(config)
	})
}

/**
 * @param {string} fullPath 全路径 pages/home/index
 * @param {string} relative 相对路径./index2
 * @return {string} 根据全路径返回当前相对路径的完整路径 输入../index2  返回类似 /pages/home/index2
 */
function getFullPath(relative, fullPath) {
	if (relative.startsWith('/')) return relative
	if (!relative.startsWith('.')) return `/${relative}`

	const stack = fullPath.split('/')
	const parts = relative.split('/')
	stack.pop() // 移除当前项 (或者空字符)
	for (let i = 0; i < parts.length; i++) {
		if (parts[i] === '.') continue
		if (parts[i] === '..') stack.pop()
		else stack.push(parts[i])
	}
	return `/${stack.join('/')}`
}

class Router {
	constructor(pages = []) {
		this.isDebug = false
		this.isLock = false
		this.isEncode = true
		this.pagesIns = new Set()
		this.currentPagePath = '' // 当前页路径
		this.lastPagePath = '' // 上个被关闭页面路径
		this.pageParams = new Map()
		this.paramsKey = ''
		this.pageEventStack = new Map()
		this.eventKey = ''

		// 拦截器
		this.before = null
		this.after = null
		this.onError = null

		Object.keys(UNI_NAV_ACTION).forEach((method) => {
			const func = (args, conf = {}) => this._push(args, conf, method)
			Router.prototype[method] = func
			UNI_NAV_ACTION[method].alias.forEach((alia) => {
				Router.prototype[alia] = func
			})
		})
	}

	_getCurrentPage(current = 1, routers = this.getPageStack()) {
		const emptyTemp = {}
		routers.forEach((p) => {
			emptyTemp[p.route] = p.route
			if (!this.pageEventStack.get(p.route)) {
				this.pageEventStack.set(p.route, null)
			}
		})
		this.pageEventStack.forEach((k) => {
			if (!emptyTemp[k]) this.pageEventStack.delete(k)
		})
		if (routers.length > 0) {
			return routers[Math.max(0, routers.length - current)]
		}
		throw new Error('未发现页面堆栈')
	}

	/**
	 * @param {object | number | Sting} user_conf 传url,query,params 路径和参数,query类似get，params类似post。刷新丢失
	 * @param {object} uni_conf 额外配置，配置同uni原生跳转的其它参数
	 * @return {promise}
	 */
	async _push(user_conf, uni_conf = {}, type) {
		if (this.isLock) return
		const routers = this.getPageStack()
		this.isLock = true
		let queryObj = {}
		let paramsObj = {}
		let eventObj = null
		let url
		let name
		let deltaNums
		switch (true) {
			case Check.isObject(user_conf): {
				const { params = {}, query = {}, event, delta, encode = false } = user_conf
				this.isEncode = encode || this.isEncode
				name = user_conf.name
				if (!Check.isObject(params) || !Check.isObject(query)) {
					throw new TypeError('params数据必须是Object')
				}
				if (!delta) {
					url = user_conf.url
					queryObj = query
					paramsObj = params
					if (event && typeof event !== 'function') {
						throw new Error('event必须为函数')
					}
					eventObj = event
				} else {
					const { route } = this._getCurrentPage(delta + 1, routers)
					url = route
					deltaNums = delta
					paramsObj = params
				}
			}
			break
			case Check.isString(user_conf):
				url = user_conf
				break
			case Check.isNumber(user_conf):
			case typeof user_conf === 'undefined': {
				user_conf = user_conf || 1
				const { route } = this._getCurrentPage(user_conf + 1, routers)
				url = route
				deltaNums = user_conf || 1
			}
			break
			default:
				throw new Error('参数必须是对象，数字，字符串')
		}

		const config = {
			name,
			url,
			delta: deltaNums,
			type,
			encode: this.isEncode ? '1' : '0',
			query: queryObj,
			params: paramsObj,
			conf: uni_conf,
		}

		const { route: fromPath } = this._getCurrentPage(1, routers)
		const [toPath] = config.url.split('?')

		config.url = getFullPath(config.url, fromPath) // 根据当前路径的全路径自动补全，将 ./或../或pages开头统一转为/pages/home
		config.toPath = toPath
		config.fromPath = fromPath

		if (this.before && typeof this.before === 'function') {
			const nextRes = await new Promise((next) => {
				const beforeRes = this.before(Object.assign({}, config), next)
				if (!beforeRes) {
					this.isLock = false
				}
			})
			this.isLock = true
			if (Check.isString(nextRes)) {
				config.url = getFullPath(nextRes, fromPath)
				config.toPath = config.url.split('?')[0]
			} else if (Check.isObject(nextRes)) {
				for (const key in config) {
					if (nextRes[key]) {
						if (key === 'url') {
							config.url = getFullPath(nextRes.url, fromPath)
							config.toPath = config.url.split('?')[0]
						} else {
							config[key] = nextRes[key]
						}
					}
				}
			}
		}

		this.paramsKey = toPath
		this.eventKey = fromPath

		this.pageParams.set(this.paramsKey, !Check.isPlainObject(paramsObj) ? paramsObj : {})
		this.pageEventStack.set(fromPath, !Check.isPlainObject(eventObj) ? eventObj : {})
		try {
			const res = await _nav(config)
			if (this.after && typeof this.after === 'function') {
				this.after(res)
			}
			return res
		} catch (e) {
			if (this.onError && typeof this.onError === 'function') {
				this.onError(e)
			}
			return e
		} finally {
			this.isLock = false
		}
	}

	/**
	 *
	 * @param {any} eventType 传入event的任意参数
	 * @param {string|string[]} pagePath 页面路径，不传默认只触发上一页，传入路径数组则执行多个路径的event
	 */
	trigger(eventType, pagePath) {
		eventType = deepClone(eventType || '')
		const triggerPagePath = this.isDebug && this._getCurrentPage(1)?.route
		if (Array.isArray(pagePath)) {
			for (let i = 0; i < pagePath.length; i++) {
				const path = pagePath[i]
				const func = this.pageEventStack.get(path)
				func && func(eventType, pagePath, triggerPagePath)
			}
			return
		}

		const func = this.pageEventStack.get(pagePath || this.eventKey)
		func && func(eventType, pagePath, triggerPagePath)
	}

	get params() {
		// 获取params
		return this.pageParams.get(this.paramsKey) || {}
	}

	/**
	 * @param {any} val
	 */
	set encode(val) {
		this.isEncode = !!val
	}

	/**
	 * @param {any} val
	 */
	set debug(val) {
		this.isDebug = !!val
	}

	get debug() {
		return this.isDebug
	}

	get encode() {
		return this.isEncode
	}

	getPageStack() {
		return getCurrentPages()
	}

	// 当前页面信息
	currentPage() {
		const routers = this.getPageStack()
		return routers[Math.max(0, routers.length - 1)] || {}
	}

	// 页面栈长度是否只有1
	isFirstPage() {
		return this.getPageStack().length === 1
	}

	// 执行当前页面的某个方法
	callMethod(methodName = '', ...data) {
		if (!methodName) throw new Error('必须输入触发页面的方法名')
		const { $vm } = this.currentPage()

		const method = this._getMethod($vm, methodName)
		method && method(...data)
	}

	_getMethod($vm, methodName) {
		if ($vm) {
			if ($vm[methodName]) {
				return $vm[methodName]
			} else if ($vm.$.exposed?.[methodName]) {
				return $vm.$.exposed[methodName]
			} else {
				console.log('当前页面没有此方法')
			}
		} else {
			console.log('找不到该页面实例')
		}
	}

	getAllPages() {
		return this.pagesIns
	}

	findPageIns(route) {
		for (const v of this.pagesIns) {
			if (v.route === route) return v
		}
		return {}
	}

	// 执行某个页面的某个方法
	callAnyPageMethod(path = '', methodName = '', ...data) {
		if (!path) throw new Error('必须输入触发页面的路径')
		if (!methodName) throw new Error('必须输入触发页面的方法名')
		if (!methodName.startsWith('public')) throw new Error('被触发方法名必须public开头')

		const { $vm } = this.findPageIns(path)
		data.push(this.currentPagePath)

		const method = this._getMethod($vm, methodName)
		method && method(...data)
	}

	// 执行每个页面的每个方法
	callAnyPageMethods(...params) {
		for (let i = 0; i < params.length; i++) {
			if (!Array.isArray(params[i])) {
				throw new TypeError('参数必须是数组')
			}
		}

		for (let i = 0; i < params.length; i++) {
			const [path, methodName, ...data] = params[i]
			if (!path) throw new Error('必须输入触发页面的路径')
			if (!methodName) throw new Error('必须输入触发页面的方法名')
			if (!methodName.startsWith('public')) throw new Error('被触发方法名必须public开头')
			data.push(this.currentPagePath)
			const { $vm } = this.findPageIns(path)

			const method = this._getMethod($vm, methodName)
			method && method(...data)
		}
	}

	/**
	 * 子页面回退传参执行回退后的页面的某个方法
	 * @param methodName 父级回调名称
	 * @param delta 返回层数,默认返回上一页
	 * @param params 传递给父级的参数
	 */
	sonSendToParent(methodName = '', delta = 1, ...params) {
		const pages = this.getPageStack()
		const prevPage = pages[pages.length - (delta + 1)]

		const method = this._getMethod(prevPage.$vm, methodName)
		method && method(...params)

		uni.navigateBack({
			delta,
		})
	}

	pagePath() {
		// const routers = this.getPageStack()
		// if (routers.length > 0) {
		//   return routers[routers.length - 1].route
		// }
		// return ''
		return this.currentPagePath
	}

	get query() {
		const routers = this.getPageStack()
		const currentRoute = routers[routers.length - 1]
		if (routers.length > 0) {
			let options = {}
			// #ifdef VUE2
			options = currentRoute.options
			// #endif
			// #ifdef VUE3
			// #ifdef MP-WEIXIN
			options = currentRoute.options
			// #endif
			// #ifndef MP-WEIXIN
			const { $page = {} } = currentRoute
			options = $page.options
			// #endif
			// #endif
			options = options || {}
			const { qryStr = '{}', encode } = options
			if (encode === '0') {
				const newOptions = Object.assign({}, options)
				delete newOptions.encode
				delete newOptions.qryStr
				return paramsToObj(newOptions)
			} else {
				if (qryStr === '{}') {
					return options
				}
				try {
					const decodeParse = JSON.parse(Base64.decode(qryStr)) // JSON.parse(decodeURIComponent(qryStr))
					const newOptions = Object.assign({}, options)
					delete newOptions.qryStr
					return Object.assign({}, newOptions, decodeParse)
				} catch (e) {
					console.warn('queryStr使用JSON.parse解析错误，返回原值，注意数据类型解析')
					return options
					// TODO handle the exception
				}
			}
		}
		return {}
	}

	reloadPage(isTabBar = false) {
		const currPage = this._getCurrentPage() // curpage instance
		isTabBar = currPage?.$page?.meta?.isTabBar || isTabBar // 小程序路由信息中获取不到是否是tabbar需用户自动传入
		const path = currPage.route // pages/test/test
		if (!path) return
		const action = isTabBar ? 'reLaunch' : 'redirectTo'
		this[action]({
			url: path,
			query: this.query,
			params: this.params,
		}, {
			animationType: 'fade-in',
			animationDuration: 200,
		}, )
	}
}

let instance = null

function $$router(arg) {
	if (instance) return instance
	instance = new Router(arg)
	instance.Router = Router
	instance.UNI_NAV_ACTION = UNI_NAV_ACTION

	return instance
}

export default function createRouter(arg) {
	const ins = $$router(arg)
	ins.install = function(app) {
		app.mixin({
			onLoad() {
				ins.pagesIns.add(this)
				ins.currentPagePath = this.route || this.__route__
			},
			onShow() {
				if (this.route) {
					ins.currentPagePath = this.route || this.__route__
				}
			},
			// onHide() {

			// },
			onUnload() {
				ins.pagesIns.delete(this)
				ins.lastPagePath = this.route || this.__route__
			}
		})
	}
	return ins
}