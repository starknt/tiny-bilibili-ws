import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    './src/index',
    './src/browser',
  ],
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
