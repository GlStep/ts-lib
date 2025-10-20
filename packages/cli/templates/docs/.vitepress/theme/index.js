import { install } from '@glstep/lib'
// import plugin from 'portal-vue'
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(install)
  },
}
