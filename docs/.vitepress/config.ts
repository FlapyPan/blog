import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-Hans',
  title: 'FlapyPan',
  description: '腾包子的点心铺',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/avatar.webp',
    nav: [
      { text: '前台 🏠', link: '/' },
      { text: '小笼包 🤤', activeMatch: '/posts/', link: '/posts/tools/' },
      { text: '水煎包 🤓', activeMatch: '/notes/', link: '/notes/markdown/' },
      { text: '网址导航 🌏', activeMatch: '/nav/', link: '/nav/' },
      { text: '关于我 🤡', activeMatch: '/about/', link: '/about/' },
    ],
    sidebar: {
      '/posts/': [
        { text: '工具推荐', link: '/posts/tools/' },
        { text: '安装使用 Scoop', link: '/posts/scoop/' },
        { text: 'JS 常见基础面试题', link: '/posts/js-qa/' },
        { text: 'JS 经典之眼见不一定为实', link: '/posts/js-wtf-eq/' },
        { text: 'JS 经典之眼见不一定为实', link: '/posts/js-wtf/' },
        { text: 'CVE-2023-34092', link: '/posts/cve-2023-34092/' },
        { text: 'SpringBoot 3.2 尝鲜', link: '/posts/springboot-3_2/' },
        { text: '栢码项目面经', link: '/posts/itbaima-qa/' },
      ],
      '/notes/': [
        { text: 'Markdown 语法速查', link: '/notes/markdown/' },
        { text: 'Starship 安装配置', link: '/notes/starship/' },
        { text: '系统运维和操作笔记', link: '/notes/system/' },
        { text: 'Windows 使用笔记', link: '/notes/windows/' },
        { text: 'Web 笔记', link: '/notes/web/' },
        { text: 'Vue 笔记', link: '/notes/vue/' },
        { text: 'Node.js 笔记', link: '/notes/nodejs/' },
        { text: 'Go 语言笔记', link: '/notes/go/' },
        { text: 'Kotlin 笔记', link: '/notes/kotlin/' },
        { text: 'ungoogled chromium 安装配置', link: '/notes/ungoogled-chromium/' },
        { text: 'VMware Workstation 下载地址', link: '/notes/vmware-workstation-download/' },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/FlapyPan/blog' }],
    editLink: {
      pattern: 'https://github.com/FlapyPan/blog/edit/main/docs/:path',
      text: '改一下',
    },
    footer: {
      message: '😺 萌ICP备20237722号',
    },
    docFooter: {
      prev: '👈 上一个',
      next: '下一个 👉',
    },
    outline: {
      label: '❤️ 点我跳转 ❤️',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short',
      },
    },
    returnToTopLabel: '飞回去 ☝️',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '变白！',
    darkModeSwitchTitle: '变黑！',
  },
})