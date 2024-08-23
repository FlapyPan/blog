import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

const TITLE = 'FlapyPan'
const SUBTITLE = '腾包子的点心铺'

export const siteConfig: SiteConfig = {
  title: TITLE,
  subtitle: SUBTITLE,
  lang: 'zh_CN', // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
  themeColor: {
    hue: 270, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: false, // Hide the theme color picker for visitors
  },
  banner: {
    enable: false,
    src: '/social-card-preview.webp', // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: 'center', // Equivalent to object-position, defaults center
    credit: {
      enable: false, // Display the credit text of the banner image
      text: '', // Credit text to be displayed
      url: '', // (Optional) URL link to the original artwork or artist's page
    },
  },
  favicon: [{ src: '/avatar.jpg' }],
}

export const navBarConfig: NavBarConfig = {
  links: [LinkPreset.Home, LinkPreset.Archive, LinkPreset.About],
}

export const profileConfig: ProfileConfig = {
  avatar: '/avatar.jpg', // Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: TITLE,
  bio: SUBTITLE,
  links: [
    {
      name: 'Twitter',
      icon: 'fa6-brands:twitter', // Visit https://icones.js.org/ for icon codes
      // You will need to install the corresponding icon set if it's not already included
      // `pnpm add @iconify-json/<icon-set-name>`
      url: 'https://twitter.com/_FlapyPan',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/FlapyPan',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
