// https://github.com/nuxt-themes/alpine/blob/main/nuxt.schema.ts
export default defineAppConfig({
  alpine: {
    title: 'FlapyPan',
    description: `FlapyPan's blog`,

    header: {
      position: 'right',

      logo: {
        alt: 'FlapyPan',
      },
    },

    footer: {
      credits: {
        enabled: true,
        text: 'FlapyPan/blog',
        repository: 'https://github.com/FlapyPan/blog',
      },
      navigation: true,
      alignment: 'left',
      message: '',
    },

    socials: {
      twitter: '_FlapyPan',
      github: 'FlapyPan',
    },

    image: {
      src: '/avatar.jpg',
    },
  },
})