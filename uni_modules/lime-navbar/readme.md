# lime-navbar 导航栏组件
一个功能丰富的导航栏组件，用于页面顶部导航。支持标题、返回按钮、自定义胶囊按钮、搜索框等多种配置，可用于各种页面导航场景。组件提供了丰富的自定义选项，可以满足各种复杂的界面设计需求。

> 插件依赖：`lime-style`、`lime-shared`、`lime-icon`

## 文档链接
📚 组件详细文档请访问以下站点：
- [导航栏组件文档 - 站点1](https://limex.qcoon.cn/components/navbar.html)
- [导航栏组件文档 - 站点2](https://limeui.netlify.app/components/navbar.html)
- [导航栏组件文档 - 站点3](https://limeui.familyzone.top/components/navbar.html)

## 安装方法
1. 在uni-app插件市场中搜索并导入`lime-navbar`
2. 导入后可能需要重新编译项目
3. 在页面中使用`l-navbar`组件

::: tip 注意🔔 
本插件依赖的[【lime-svg】](https://ext.dcloud.net.cn/plugin?id=18519)是原生插件，如果购买(收费为6元)则需要自定义基座，才能使用，
若不需要删除即可
:::

## 代码演示

### 基础用法
最简单的导航栏组件用法，只需要设置标题即可。

```html
<l-navbar title="标题文字" :fixed="false"></l-navbar>
```

### 返回上级
通过 `left-arrow` 属性设置显示返回箭头图标，通过 `click-left` 事件接收点击事件，`delta` 属性设置后退按钮后退层数。

```html
<l-navbar title="标题文字" :left-arrow="true" @click-left="onClickLeft"></l-navbar>
```

```js
const onClickLeft = () => {
  console.log('点击返回')
}
```

### 标题文字超出
通过 `title-max-length` 属性设置标题文字最大长度，超出部分将显示为省略号。

```html
<l-navbar title="标题文字超出" :title-max-length="5" :fixed="false"></l-navbar>
```

### 自定义胶囊样式
通过 `capsule` 插槽自定义胶囊按钮样式。

```html
<l-navbar title="标题文字" :fixed="false">
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
```

```css
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
```

### 带搜索导航栏
通过 `left` 插槽自定义左侧内容，通过 `right` 插槽自定义右侧内容。

```html
<l-navbar title="标题文字" :fixed="false">
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
```

### 自定义样式
通过 `bg-color` 设置背景色，`color` 设置文本颜色。

```html
<l-navbar title="标题文字" :fixed="false" :left-arrow="true" bg-color="#3283ff" color="white"></l-navbar>
```

### 额外插槽
需要弹窗从顶部出现时，并且弹窗的top为navbar高度时可使用 `extra` 插槽。

```html
<l-navbar>
  <template #extra="{size}">
    <l-popup v-model="visible"
      :overlayStyle="{ top: size.height+ 'px' }"
      :l-style="{ top: size.height + 'px' }"
      :position="currentPlacement" 
      :closeable="true">
      <view style="padding: 100px;"></view>
    </l-popup>
  </template>
</l-navbar>
```

## 快速预览
导入插件后，可以直接使用以下标签查看演示效果：

```html
<!-- 代码位于 uni_modules/lime-navbar/components/lime-navbar -->
<lime-navbar />
```

## 插件标签说明

| 标签名 | 说明 | 
| --- | --- | 
| `l-navbar` | 组件标签 |
| `lime-navbar` | 演示标签 |

## Vue2使用说明
main.js中添加以下代码：
```js
// vue2项目中使用
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```

详细配置请参考官方文档：[Vue Composition API](https://uniapp.dcloud.net.cn/tutorial/vue-composition-api.html)

## API文档

### Props 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| placeholder | 固定在顶部时，是否在标签位置生成一个等高的占位元素 | _boolean_ | `false` |
| safeAreaInsetTop | 是否开启顶部安全区适配 | _boolean_ | `false` |
| animation | 是否添加动画效果 | _boolean_ | `true` |
| fixed | 是否固定在顶部 | _boolean_ | `true` |
| leftArrow | 是否展示左侧箭头 | _boolean_ | `false` |
| title | 页面标题 | _string_ | - |
| titleMaxLength | 标题文字最大长度，超出的范围使用 `...` 表示 | _number_ | - |
| delta | 后退按钮后退层数 | _number_ | `1` |
| zIndex | z-index 层级 | _number_ | - |
| bgColor | 背景色 | _string_ | - |
| color | 文本色 | _string_ | - |

### Events 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| back | 返回触发 | _-_ |
| click-left | 点击左侧图标触发 | _-_ |

### Slots 插槽

| 名称 | 说明 |
| --- | --- |
| capsule | 左侧胶囊区域 |
| left | 左侧区域 |
| right | 右侧区域 |
| title | 标题区域 |
| extra | 额外区域，用于顶部弹窗等场景 |

## 主题定制

组件提供了以下CSS变量，可用于自定义样式：

| 变量名称 | 默认值 | 描述 |
|---------|--------|------|
| `--l-navbar-color` | _$text-color-1_ | 导航栏文本颜色 |
| `--l-navbar-bg-color` | _$bg-color-container_ | 导航栏背景色 |
| `--l-navbar-height` | _48px_ | 导航栏高度 |
| `--l-navbar-z-index` | _998_ | 导航栏层级 |
| `--l-navbar-right` | _12px_ | 导航栏右侧内边距 |
| `--l-navbar-left` | _12px_ | 导航栏左侧内边距 |
| `--l-navbar-padding-top` | _0px_ | 导航栏顶部内边距 |
| `--l-navbar-title-font-size` | _18px_ | 标题字体大小 |
| `--l-navbar-title-font-weight` | _600_ | 标题字体粗细 |
| `--l-navbar-left-arrow-size` | _24px_ | 左侧箭头大小 |
| `--l-navbar-capsule-border-color` | _$border-color-1_ | 胶囊按钮边框颜色 |
| `--l-navbar-capsule-border-radius` | _16px_ | 胶囊按钮边框圆角 |
| `--l-navbar-capsule-width` | _88px_ | 胶囊按钮宽度 |
| `--l-navbar-capsule-height` | _32px_ | 胶囊按钮高度 |



## 支持与赞赏

如果你觉得本插件解决了你的问题，可以考虑支持作者：

| 支付宝赞助 | 微信赞助 |
|------------|------------|
| ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png) | ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png) |