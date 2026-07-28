# 特点

`zzh_simple_router`一个借鉴axios任务编排机制实现的简单易用路由，可以实现类似axios一样的多级路由拦截，
前置拦截，后置拦截，使用和原生一样的api名称，减少记忆成本，参数传递不丢失数据类型且获取简单方便

## 快速上手


main.js

```
import createRouter from '@/uni_modules/zzh-simple-router/js_sdk/router/router.js'

const router = createRouter()
router.encode = 0 // 任意可转化为Boolen的值，是否编码query参数,有多层对象需要true，否则只会传第一层对象的值

const whiteList = ['pages/index/index'] // 除了这些路径，其他都必须登录

// 全局路由拦截器
router.before = function(from, next) {
	const hasPermission = whiteList.find(rule => (from.url).includes(rule))
	if (!hasPermission) {
		uni.showModal({
			title: '温馨提示',
			content: '是否前往登录',
			success: (res) => {
				console.log(res);
				if (res.confirm) {
					// next({ url: 'pages/login/index' }) 支持字符串或对象
					next('pages/login/index')

				}
			}
		})
		return
	}
	// console.log(from);
	next()
}

router.after = to => {
	// console.log(to);
	return to
}

router.onError = err => {
   console.log(err)
}

Vue.prototype.$router = router
vue3中 app.config.globalProperties.$router = router

uni.$router = router

// vue3 
export function createApp() {
	const app = createSSRApp(App)
	app.use(router)
	return {
		app
	}
}
```

## 使用方式

 ###刷新当前页
  调用可刷新当前页面,所有生命周期会全部执行

```
  uni.$router.reloadPage()
```

###页面使用方式1
 直接传路径，路由处理了pages前面的/，传不传都行

```
 uni.$router.navigateTo('pages/home/index')
 uni.$router.push('pages/home/index')
 uni.$router.to('pages/home/index')
```

###页面使用方式2
 直接传路径，路由处理了pages前面的/，传不传都行,query 方式和原生跳转一样，携带在参数上，本路由增强了传参方式，且不会丢失数据类型， 如果不在h5等会刷新页面的场合，可以使用更强大的params传参，params传参没有原生跳转tabbar不能传参的限制，支持任意方式，包括navigateBack，也可以携带参数返回上一个页面，query和参数可以同时使用，并且互不影响

```
 uni.$router.back({ delta: 1,params: {a:'携带我返回上一页'} }) 
 /*上一页可以 uni.$router.params()获取到我传递的值*/
 更推荐event和trigger搭配携带数据返回上一页
```

 ###页面使用方式3

```
 uni.$router.navigateTo({
 	url: 'pages/second/second',
   	query: {
      test:'我是query参数，会携带在链接上，刷新不会丢失'
   	},
 	params: {
   		test:'我是params参数，不会携带在链接上，刷新会丢失，但是支持任意方式传递，包括页面返回也可以携带，并且大小无限制，甚至可以传递一个函数指针'
 		a: 5,
 		b: {
 			c: 5
 		},
   		testFun: ()=> {
   			console.log('下个页面调用会执行')
   		}
 	}
 },{/*这儿的参数和原生uni.navigateTo传递一样*/});
```

#### 可以传递第三个参数，同原生一样的配置，

```
 uni.$router.navigateTo(
   	{
   		url: 'pages/login/forget',
   		query: {
   			a: 5,
   			b: {
   				c: 5
   			}
   		}
   	},
   	{ animationType: 'pop-in' }
 );
```

## 触发上一页或打开页的事件

```
 // pages1
 uni.$router.push({
        url: './demo2',
        params: {
          test: 'pages1111到pages2222'
        },
        event(a, p, q) {
          console.log(a, p, q)
          console.log('触发啦-11111111---', 6666666)
        }
      })
// pages2
uni.$router.trigger('任意参数','不传默认只触发上一页的event，传路径数组则执行匹配到的已打开页的event函数')
//触发上一页event方法
```
## 回退页面并执行页面的方法
！！！vue3中必须defineExpose暴露出来才能访问
```
 // pages1
 uni.$router.sonSendToParent('methodName',1,'arg1','arg2','arg3')
```
## 任意位置执行当前页面方法
！！！vue3中必须defineExpose暴露出来才能访问
```
 // pages1
 uni.$router.callMethod('methodName',1,'arg1','arg2','arg3')
```
## 执行某个页面的某个方法
！！！vue3中必须defineExpose暴露出来才能访问，且方法名必须为public开头
```
 // pages1
 uni.$router.callAnyPageMethod('pages/demo2/demo', 'publicTest', 1, 2, 3);
```
## 调用任意页面的指定方法，支持传入多个方法调用参数。
！！！vue3中必须defineExpose暴露出来才能访问，且方法名必须为public开头
```
  // 调用两个页面的方法
  uni.$router.callAnyPageMethods(
    ['pages/demo2/demo', 'publicTest', 1, 2, 3],
    ['pages/demo3/demo', 'publicAnotherTest', 'arg1', 'arg2']
  );
```
## 获取当前页面实例
```
  uni.$router.currentPage();
```
## 是否是第一个页面
```
  uni.$router.isFirstPage();
```
## 页面堆栈列表
```
  uni.$router.getPageStack();
```
## 获取当前页面路径
```
  uni.$router.pagePath();
```
###获取传递的参数
在页面需要的地方使用即可获取传递的query和params参数

```
const p =  uni.$router.query
const p =  uni.$router.params
跳转的路由params传入什么参数这儿获取到的就是什么参数，并且数据类型不变，解决原生参数类型被转化为字符串的问题
```

 注意 params携带的所有参数页面完全刷新会丢失，调用路由的刷新当前页不会丢失

#### 路由方法

保持和官方的路由跳转名相同，减少记忆成本，跳转的限制通uni原生跳转一致
比如官方reLaunch跳转tabbar页不能带参数，这儿跳转不传参数即可

```
uni.$router.navigateTo('pages/home/index')
uni.$router.navigateTo({url:'pages/home/index',params:{a:5}})
uni.$router.navigateTo({url:'pages/home/index?a=5&b=6',query:{c:4,d:8},params:{p:5}})
// 支持链接拼接参数形式，同名参数query会覆盖链接上的值
//navigateTo 使用别名，to,push。。 可在源码UNI_NAV_ACTION 的alias数组里添加方便自己记忆的别名
uni.$router.to('pages/home/index')
uni.$router.push({url:'pages/home/index',params:{a:5}})

navigateTo 使用别名replace
uni.$router.redirectTo('pages/home/index')
uni.$router.replace('pages/home/index')
uni.$router.redirectTo({url:'pages/home/index',params:{a:5}})

uni.$router.reLaunch('pages/home/index')
uni.$router.reLaunch({url:'pages/home/index',params:{a:5}})

uni.$router.switchTab('pages/home/index')
uni.$router.switchTab({url:'pages/home/index',params:{a:5}})

uni.$router.navigateBack(1)
//使用别名，。。
uni.$router.back(1)

//携带参数并且返回上一页
uni.$router.back({delta: 1 ,params: {test:'我可以携带参数返回上一页哦'}})
uni.$router.back({url: '上一页的路径' ,params: {test:'我可以携带参数返回上一页哦'}})
```

#### 路由回调方法

##### 返回promise，对官方success和fail进行promise封装返回，另外也返回了更多的参数

```
uni.$router.navigateBack(1).then(res=>{
   
}).catch(err=>{})
```

## 拦截器

### 使用了类似于axios的拦截器，实现了前置拦截和相应后的拦截以更方便处理

### 跳转前可对参数拦截修改或者未登录权限跳转等业务功能 next方法支持传字符串，传字符串被认为是跳转的路径，传递对象和普通跳转一致

```
import createRouter from '@/uni_modules/zzh-simple-router/js_sdk/router/router.js'

const router = createRouter()
router.encode = 0 // 任意可转化为Boolen的值，是否编码query参数,有多层对象需要true，否则只会传第一层对象的值

// 全局路由拦截器
router.before= function(from, next) {
   	console.log(from);
   	if (!uni.getStorageSync('token')) {
   		uni.showModal({
   			title: '温馨提示',
   			content: '是否前去登录',
   			success: function (res) {
   				if (res.confirm) {
   					next({ url: '/pages/login/index' })
   				} else if (res.cancel) {
   					console.log('用户点击取消');
   				}
   			}
   		});
   		return
   	}
   	next()
}

router.after = (to) => {
   	console.log(to)
   	return to
}

router.onError = (err) => { // 跳转错误捕获
   	console.log(err)
}
```
