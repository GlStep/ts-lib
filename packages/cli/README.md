# TypeScript Component/Library-Monorepo Template

> Repository template for developing Vue 3 libraries in a monorepo powered by pnpm workspaces, heavily inspired by [LinusBorg/vue-lib-template](https://github.com/LinusBorg/vue-lib-template) created by [LinusBorg](https://github.com/LinusBorg) with a few additions and other spices

**STATE**: Still working on this here and there ☺️

## What is this and who is it for?

This is a **batteries-included monorepo template** for building libraries with TypeScript. It provides a complete development environment with all the tooling you need to:

- 📦 **Build multiple library packages** in a single repository
- 🎮 **Develop and test** with an integrated playground app
- 📚 **Document** your libraries with VitePress
- ✅ **Test** with Vitest and proper TypeScript support
- 🚀 **Publish** packages to npm with confidence

### Who should use this?

- **Library authors** building reusable Vue 3 components or utilities
- **Teams** maintaining multiple related packages in one repository
- **Open source maintainers** who want a professional setup out of the box
- **Developers** who value TypeScript, modern tooling, and best practices

### When to use this template

✅ Building a Vue component library\
✅ Creating TypeScript utilities that work\
✅ Managing multiple related packages together\
✅ Need a playground to test your libraries\
✅ Want documentation alongside your code

❌ Building a single standalone app\
❌ Need a different meta-framework

## Quick Start

### Use the CLI (Recommended)

The fastest way to get started is with our CLI tool:

```bash
# Using pnpm (recommended)
pnpm create @glstep/vue-ts-lib my-library
```

The CLI will guide you through:

- Choosing which packages to include (lib, lib-ts, playground, docs)
- Setting up your package scope
- Configuring project metadata

## Project Structure

This monorepo contains multiple packages in the `packages/` directory:

```
my-library/
├── packages/
│   ├── cli/              # CLI tool for scaffolding new projects
│   │   ├── src/          # CLI source code
│   │   ├── templates/    # Project templates
│   │   └── bin/          # Executable entry point
│   │
│   ├── lib/              # Vue 3 component library (example)
│   │   ├── src/          # Component source code
│   │   │   ├── Component.vue
│   │   │   └── index.ts
│   │   └── vite.config.ts
│   │
│   ├── lib-ts/           # TypeScript utilities library (example)
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── playground/       # Development playground
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   └── vite.config.ts
│   │
│   └── docs/             # VitePress documentation
│       ├── .vitepress/
│       ├── guide/
│       └── api/
│
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── tsconfig.json         # Root TypeScript config
```

### Package Details

#### `packages/cli`

A CLI tool to scaffold new projects based on this template. Allows you to choose which packages to include and customize the setup.

**Published to npm as:** `@glstep/create-ts-lib`

#### `packages/lib`

Example Vue 3 component library with:

- TypeScript support
- Vite for building
- Vitest for testing
- Proper tree-shaking and type definitions

#### `packages/lib-ts`

Example TypeScript utilities library for:

- Pure TypeScript code (no Vue dependency)
- Shared utilities between packages
- Type-only exports

#### `packages/playground`

Development and testing environment:

- Hot module replacement (HMR)
- Imports workspace packages automatically
- Tailwind CSS pre-configured
- Perfect for manual testing

#### `packages/docs`

VitePress documentation site:

- Markdown-based documentation
- Component demos
- API documentation
- Ready to deploy to Netlify/Vercel

## Features

### Development Experience

- ✅ **Full TypeScript support** for the entire dev workflow
- ⚡️ **Vite-powered** build system for lightning-fast development
  - 🎯 Build libraries with [Vite](https://vitejs.dev)
  - 🔥 Hot Module Replacement (HMR) in playground
  - 📦 Optimized production builds
- 🎨 **Type checking** with `vue-tsc` and declaration file generation
- 🧪 **Unit tests** with [Vitest](https://vitest.dev)
  - Fast execution with native ESM
  - Vue component testing with `@vue/test-utils`
  - Watch mode for TDD
- 🖍 **Code quality** with ESLint and Prettier
  - Consistent code style across all packages
  - Auto-fixing on save (VS Code)

### Monorepo Management

- 📦 **pnpm workspaces** for efficient dependency management
  - Shared dependencies hoisted to root
  - Workspace protocol for local package linking
  - Fast installations with content-addressable storage
- 🔗 **Automatic package linking** between workspace packages
- 🎯 **Selective script execution** with pnpm filters
- 🏗️ **TypeScript project references** for incremental builds

### Documentation & Publishing

- 📚 **VitePress documentation** with:
  - Beautiful default theme
  - Markdown-based content
  - Vue component demos
  - Dark mode support
  - Ready for deployment
- 🚀 **Publishing ready** with:
  - Proper `package.json` configuration
  - Tree-shaking support
  - Type definitions
  - ESM and CJS builds (configurable)

### CLI Tool

- 🛠️ **Interactive scaffolding** with `@glstep/create-vue-ts-lib`
- ✨ **Customizable templates** - choose what you need
- 🎨 **Package scope configuration** - `@yourorg/lib`
- ⚡️ **Fast setup** - from zero to development in seconds

## Configuration

### TypeScript

The project uses TypeScript project references for better IDE performance:

- Root `tsconfig.json` - Coordinates all packages
- `tsconfig.app.json` - For library source code
- `tsconfig.vitest.json` - For test files

### Vite

Each package has its own `vite.config.ts` configured for:

- Library mode (for lib packages)
- App mode (for playground)
- Vue plugin with proper JSX support
- Path aliases (`@/` → `src/`)

### pnpm

The `pnpm-workspace.yaml` defines workspace packages:

```yaml
packages:
  - 'packages/*'
```

## Best Practices

### Package Naming

- Use scoped packages: `@yourorg/package-name`
- Keep names consistent: `lib`, `lib-ts`, `playground`, `docs`
- Use `workspace:*` for internal dependencies

### Versioning

- Use [semantic versioning](https://semver.org/)
- Keep related packages in sync when possible
- Use [changesets](https://github.com/changesets/changesets) for complex version management

### Testing

- Write tests alongside your code in `__tests__` folders
- Aim for high coverage on library packages
- Use playground for integration testing
- Test TypeScript types with `expectTypeOf` from Vitest

### Documentation

- Document public APIs with JSDoc comments
- Add usage examples to VitePress docs
- Include migration guides for breaking changes
- Keep README files up to date

## Troubleshooting

### Common Issues

**Problem:** Package not found in workspace
**Solution:** Run `pnpm install` to link workspace packages

**Problem:** TypeScript errors in IDE
**Solution:** Restart TypeScript server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")

**Problem:** Tests fail with module resolution errors
**Solution:** Check `vitest.config.ts` has correct aliases and resolvers

**Problem:** Build fails with type errors
**Solution:** Run `pnpm typecheck` to see all type errors across packages

### Getting Help

- Issues: [GitHub Issues](https://github.com/glstep/vue-comp/issues)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Gleb Stepanov](https://github.com/glstep)

## Acknowledgments

- Inspired by [LinusBorg/vue-lib-template](https://github.com/LinusBorg/vue-lib-template)
- Built with [Vite](https://vitejs.dev), [Vue 3](https://vuejs.org), and [pnpm](https://pnpm.io)
- Documentation powered by [VitePress](https://vitepress.dev)
- Testing with [Vitest](https://vitest.dev)
