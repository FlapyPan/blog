// https://github.com/nuxt-themes/alpine/blob/main/nuxt.schema.ts
export default defineAppConfig({
  alpine: {
    title: 'FlapyPan',
    description: `FlapyPan's blog`,
    header: {
      position: 'center',
    },
    footer: {
      credits: {
        enabled: false,
      },
      navigation: false,
      alignment: 'left',
      message: '',
    },
    socials: {
      twitter: '_FlapyPan',
      github: 'FlapyPan',
    },
  },
})
