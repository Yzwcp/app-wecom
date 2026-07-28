interface MuiRouterConfig {
  /**
   * 传递页面间参数，参数携带在url上，页面刷新数据不会消失
   */
  query?: object
  /**
   * 传递页面间参数，页面刷新数据消失
   */
  params?: object
  /**
   * 触发当前页的事件，使用场景，在下一页调用trigger方法触发该事件刷新当前页面数据
   * @param {any} arg 触发该事件的页面传递的任意参数
   * @param {string | string[] | undefined} pagePath 触发该次事件的所有页面，trigger触发页面不传则没有
   * @param {string} triggerPagePath 触发该事件的页面,debugger调试时候需要，可查看触发该事件的页面，正常关闭避免性能损坏
   * @return {void} 没有参数返回
   */
  event?: (arg?: unknown, pagePath: string | string[] | undefined, triggerPagePath: string) => void
}
type MuiNavigateConfigUrl = UniNamespace.NavigateToOptions['url'] & NavigateToOptions['url']
type MuiNavigateConfig = MuiRouterConfig & {
  url: UniNamespace.NavigateToOptions['url'] & NavigateToOptions['url']
} | MuiNavigateConfigUrl
type MuiRedirectToConfigUrl = UniNamespace.RedirectToOptions['url'] & RedirectToOptions['url']
type MuiRedirectConfig = MuiRouterConfig & {
  url: MuiRedirectToConfigUrl
} | MuiRedirectToConfigUrl
type MuiSwitchTabConfigUrl = UniNamespace.SwitchTabOptions['url'] & SwitchTabOptions['url']
type MuiSwitchTabConfig = MuiRouterConfig & {
  url: MuiSwitchTabConfigUrl
} | MuiSwitchTabConfigUrl
type MuiReLaunchConfigUrl = UniNamespace.ReLaunchOptions['url'] & ReLaunchOptions['url']
type MuiReLaunchConfig = MuiRouterConfig & {
  url: MuiReLaunchConfigUrl
} | MuiReLaunchConfigUrl


/**
 * 一个轻量简洁的路由系统
 */
declare class MuiRouter {
  /**
   */
  constructor(arg?: unknown);
  /**
  * 获取传递的参数，会拼接在链接上，页面刷新不会消失
  * @return {object} 没有参数返回{}
  */
  get query<T extends object>(): T
  /**
  * 获取传递的参数，存储在全局params中，刷新后会丢失
  * @return {object} 没有参数返回{}
  */
  get params<T extends object>(): T
  /**
   * 触发上一页的event事件，使用场景，在当前页调用trigger方法触发
   * @param {any} arg 传入event的任意参数,
   * @param {string|string[]} pagePath 页面路径，不传默认只触发上一页，传入路径数组则执行多个路径的event
   * @return {object} 没有参数返回{}
   */
  trigger(arg: unknown, pagePath: MuiReLaunchConfigUrl | MuiReLaunchConfigUrl[] | undefined): void
  /**
  * 保留当前页面，跳转到应用内的某个页面，使用back可以返回到原页面。
  * @param {string|MuiNavigateConfig} MuiNavigateConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  navigateTo(userConfig: MuiNavigateConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 保留当前页面，跳转到应用内的某个页面，使用back可以返回到原页面。navigateTo的别名
  * @demo to({url: 'xxx'}) to('xxxx') to({url: 'xxx',query: {id:xxx},params:{}})
  * @param {MuiNavigateConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  to(userConfig: MuiNavigateConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 保留当前页面，跳转到应用内的某个页面，使用back可以返回到原页面。navigateTo的别名
  * @demo push({url: 'xxx'}) push('xxxx') push({url: 'xxx',query: {id:xxx},params:{}})
  * @param {MuiNavigateConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  push(userConfig: MuiNavigateConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 关闭当前页面，跳转到应用内的某个页面。
  * @param {MuiRedirectConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  redirectTo(userConfig: MuiRedirectConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 关闭当前页面，跳转到应用内的某个页面。redirectTo的别名
  * @param {MuiRedirectConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  replace(userConfig: MuiRedirectConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 关闭所有页面，打开到应用内的某个页面。
  * @param {MuiReLaunchConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  reLaunch(userConfig: MuiReLaunchConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
  * @param {MuiSwitchTabConfig} userConfig - 传url,query,params 路径和参数
  * @param {UniApp.NavigateToOptions} uni_conf -同官方参数
  * @return Promise<object>
  */
  switchTab(userConfig: MuiSwitchTabConfig, uni_conf?: UniApp.NavigateToOptions): Promise<object>
  /**
  * 路由返回
  * @param {number} delta - 返回路由级数
  * @return Promise<object>
  */
  navigateBack(delta: number): Promise<object>
  /**
  * 路由返回
  * @param {number} delta - 返回路由级数，navigateBack的别名
  * @return Promise<object>
  */
  back(delta: number): Promise<object>
  /**
  * 刷新当前页面
  * @param {boolean} isTabBar - 当前页面是否是page.json中定义的tabbar页面
  * @return Promise<object>
  */
  reloadPage(isTabBar?: boolean): Promise<object>
  /**
   * 拦截路由跳转前配置
   */
  before: (arg: unknown, next: () => void) => void
  /**
   * 拦截路由跳转后配置
   */
  after: (arg: unknown) => void
  /**
  * 拦截路由跳转错误
  */
  onError: (err: unknown) => void
  /**
  * 获取当前页面路径
  */
  pagePath(): string
  /**
  * 设置query参数是否编码 0不编码,1编码
  */
  encode: number
  /**
  * 页面堆栈列表
  * @return Arrary<object>
  */
  getPageStack(): Page.PageInstance<AnyObject, unknown>[]
  /**
   * 子页面回退传参
   * @param methodName 父级回调名称
   * @param delta 返回层数,默认返回上一页
   * @param {...any} params 传递给父级的参数
   * @example
   * // 调用两个页面的方法
   * MuiRouter.sonSendToParent('funcTest', 1, 'arg1', 'arg2');
   */
  sonSendToParent(methodName: string, delta: number, ...params?: any): void
  /**
   * 获取当前页面实例
   */
  currentPage(): void
  /**
   * 是否是第一个页面
   */
  isFirstPage(): void
  /**
   * 执行当前页面的某个方法
   * @param methodName 页面方法名称
   * @param {...any} params 传递给方法的参数
   * @example
   * // 调用两个页面的方法
   * MuiRouter.callMethod('funcTest', 1, 2, 3);
   */
  callMethod(methodName: string, ...params?: any): any
  /**
   * 执行某个页面的某个方法
   * @param {string} path 页面路径名
   * @param {string} methodName 页面方法名称,传数组则执行多个方法
   * @param {...any} params 传递给方法的参数
   * @example
   * // 调用两个页面的方法
   * MuiRouter.callAnyPageMethod('pages/demo2/demo', 'publicTest', 1, 2, 3);
   */
  callAnyPageMethod(path: string, methodName: string, ...params?: any): any
  /**
 * 调用任意页面的指定方法，支持传入多个方法调用参数。
 *
 * @function callAnyPageMethods
 * @memberof MuiRouter
 * @param {...Array} calls - 一个或多个方法调用参数，每个参数是一个数组，包含页面路径、方法名和可选的方法参数。
 * @param {string} calls[][0] - 页面路径，例如 'pages/demo2/demo'。
 * @param {string} calls[][1] - 方法名，例如 'publicTest'。
 * @param {...any} calls[][2] - 可选的方法参数，数量不限。
 * @returns {void} 无返回值。
 * @example
 * // 调用两个页面的方法
 * MuiRouter.callAnyPageMethods(
 *   ['pages/demo2/demo', 'publicTest', 1, 2, 3],
 *   ['pages/demo3/demo', 'publicAnotherTest', 'arg1', 'arg2']
 * );
 */
  callAnyPageMethods(...calls: [string, string, ...any[]][]): any
}
declare function createRouter(): MuiRouter
export default createRouter
