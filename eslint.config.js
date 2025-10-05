import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ["dist/","**/dist/**/","packages/*/dist","packages/*/dist/**","packages/*/types","packages/*/types/**","node_modules/","**/node_modules/**/"],
  formatters: true,
  vue: true,
})
