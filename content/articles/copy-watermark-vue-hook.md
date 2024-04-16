---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2024-03-21T11:07:03.110Z
update: 2024-03-21T11:09:13.580Z
---

最近有一个需求，类似 csdn 的那种在复制文本时候添加特殊的水印。

这里我封装了一个 vue 的 hook 分享给大家。

## 代码

```javascript
/**
 * 复制文本添加水印
 * @param {HTMLElement|import('vue').Ref<HTMLElement>|import('vue').ComputedRef<HTMLElement>} target 监听的元素
 * @param {string|import('vue').Ref<string>|import('vue').ComputedRef<string>} watermark 水印内容(html格式)
 * @param {string|import('vue').Ref<string>|import('vue').ComputedRef<string>} [fallbackWatermark] 不支持html的回滚水印内容(文本格式)
 * @param {number|import('vue').Ref<number>|import('vue').ComputedRef<number>} [minTextLength] 添加水印的阈值
 */
export default function useCopyWatermark(target, { watermark, fallbackWatermark, minTextLength } = {}) {
  const watermarkText = computed(() => {
    const unwrappedFallbackWatermark = unref(fallbackWatermark)
    if (unwrappedFallbackWatermark) return unwrappedFallbackWatermark
    const watermarkEle = document.createElement('div')
    watermarkEle.innerHTML = unref(watermark)
    return watermarkEle.innerText
  })
  const copyHandler = (evt) => {
    const selection = window.getSelection()
    if (selection.toString().length < unref(minTextLength ?? 200)) return
    const helper = document.createElement('div')
    helper.appendChild(selection.getRangeAt(0).cloneContents())
    evt.clipboardData.setData('text/plain', helper.innerText + watermarkText.value)
    evt.clipboardData.setData('text/html', helper.innerHTML + unref(watermark))
    evt.preventDefault()
  }
  onMounted(() => unref(target)?.addEventListener('copy', copyHandler))
  onUnmounted(() => unref(target)?.removeEventListener('copy', copyHandler))
}
```

## 使用方法
```vue
<script setup>
const ele = ref()
const watermark = `<br/>
<p>————————————————</p>
<p>版权声明：本文为 FlapyPan 的原创文章，禁止一切未经授权的转载、发布、出售等行为，违者将被追究法律责任。</p>
<p>原文链接：<a href="https://www.flapypan.top/copy-watermark-vue-hook">https://www.flapypan.top/copy-watermark-vue-hook</p></a>`
useCopyWatermark(ele, { watermark })
</script>

<template>
  <div ref="ele"></div>
</template>
```

