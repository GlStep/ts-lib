import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: {
    css: true,
    html: true,
    markdown: true,
  },
  ignores: [
    'dist/',
    '**/dist/**/',
    'packages/*/dist',
    'packages/*/dist/**',
    'packages/*/types',
    'packages/*/types/**',
    'node_modules/',
    '**/node_modules/**/',
  ],
})
