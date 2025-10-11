import type { ProjectOptions } from '../prompts/project'
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyDir, readJson, writeJson } from '../utils/fs'
import { replaceInFiles } from '../utils/replace'

const __dirname = dirname(fileURLToPath(import.meta.url))

const packagesDir = join(__dirname, '../../..')

export async function scaffoldProject(targetDir: string, config: ProjectOptions): Promise<void> {
  await createBaseFiles(targetDir, config)
}

// TODO: adjust content of package.json, programmatically
async function createBaseFiles(targetDir: string, config: ProjectOptions): Promise<void> {
  const rootPkg = {
    name: config.projectName,
    type: 'module',
    version: '0.1.0',
    private: true,
    packageManager: 'pnpm@10.18.1',
    description: `${config.projectName} - A Vue/TS library`,
    author: 'Your name <your.email@example.com>',
    license: 'MIT',
    engines: {
      node: '>=24.7.0',
      pnpm: '>=10.16.1',
    },
    scripts: {
      'dev': 'pnpm -F playground dev',
      'test': 'pnpm --if-present -r run test',
      'test-ci': 'pnpm --if-present -r run test-ci',
      'docs': 'pnpm -F docs run dev',
      'docs-build': 'pnpm -F docs run build',
      'lint': 'eslint .',
      'lint-fix': 'eslint . --fix',
      'build': buildScripts(config),
    },
    devDependencies: {
      '@antfu/eslint-config': '^5.4.1',
      '@tsconfig/node24': '^24.0.1',
      '@types/node': '24.6.2',
      '@vitejs/plugin-vue': '^6.0.1',
      '@vue/compiler-dom': '^3.5.22',
      '@vue/test-utils': '^2.4.6',
      '@vue/tsconfig': '^0.8.1',
      'eslint': '^9.36.0',
      'eslint-plugin-format': '^1.0.1',
      'jsdom': '^27.0.0',
      'typescript': '^5.9.0',
      'vite': '^7.1.0',
      'vitest': '^3.2.4',
      'vue': '^3.5.0',
      'vue-tsc': '^3.0.0',
    },
  }

  await writeJson(join(targetDir, 'package.json'), rootPkg)

  const configFiles = [
    'tsconfig.json',
    'tsconfig.config.json',
    'eslint.config.js',
  ]

  for (const file of configFiles) {
    const sourcePath = join(packagesDir, file)
    const destPath = join(targetDir, file)
    await copyDir(sourcePath, destPath)
  }

  const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
*.tsbuildinfo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
`

  await writeFile(join(targetDir, '.gitignore'), gitignore)

  const readme = `# ${config.projectName}
A Vue/TypeScript library created with @glstep/app

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Start playground
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
\`\`\`

## Packages

${config.includeLib ? '- **lib**: Vue component library\n' : ''}${config.includeLibTs ? '- **lib-ts**: TypeScript utility library\n' : ''}${config.includePlayground ? '- **playground**: Development playground\n' : ''}${config.includeDocs ? '- **docs**: Documentation site\n' : ''}
`

  await writeFile(join(targetDir, 'README.md'), readme)
}

function buildScripts(config: ProjectOptions): string {
  const scripts: string[] = []

  if (config.includeLib)
    scripts.push('pnpm -F @SCOPE@/lib run build')
  if (config.includeLibTs)
    scripts.push('pnpm -F @SCOPE@/lib-ts run build')
  if (config.includePlayground)
    scripts.push('pnpm -F playground run build')
  if (config.includeDocs)
    scripts.push('pnpm -F docs run build')

  return scripts.join(' && ')
}

async function copyPackage(packageName: string, targetDir: string): Promise<void> {
  const sourceDir = join(packagesDir, 'packages', packageName)
  const destDir = join(targetDir, 'packages', packageName)

  await copyDir(sourceDir, destDir)
}

async function createWorkspaceFile(targetDir: string): Promise<void> {
  const content = `packages:
  - 'packages/*'
  `

  await writeFile(join(targetDir, 'pnpm-workspace.yaml'), content)
}

async function replacePlaceholders(targetDir: string, config: ProjectOptions): Promise<void> {
  const fullScope = config.scope ? `@${config.scope}` : ''
  const fullLibName = fullScope ? `${fullScope}/${config.packageName}` : config.packageName

  const replacements = [
    { from: /@glstep\/lib-ts/g, to: fullScope ? `${fullScope}/lib-ts` : 'lib-ts' },
    { from: /@glstep\/lib/g, to: fullLibName },
    { from: /@glstep/g, to: fullScope },
    { from: /vue-lib-monorepo-template/g, to: config.projectName },
    { from: /Gleb Stepanov <gleb\.stepanov@online\.de>/g, to: 'Your Name <your.email@example.com>' },
    { from: '@SCOPE@', to: fullScope || config.projectName },
  ]

  await replaceInFiles(targetDir, replacements)

  await updatePackageJsonFiles(targetDir, config, fullScope, fullLibName)
}

async function updatePackageJsonFiles(
  targetDir: string,
  config: ProjectOptions,
  fullScope: string,
  fullLibName: string,
): Promise<void> {
  const updates = []

  if (config.includeLib) {
    updates.push({
      path: join(targetDir, 'packages', 'lib', 'package.json'),
      name: fullLibName,
    })
  }

  if (config.includeLibTs) {
    updates.push({
      path: join(targetDir, 'packages', 'lib-ts', 'package.json'),
      name: fullScope ? `${fullScope}/lib-ts` : 'lib-ts',
    })
  }

  if (config.includePlayground) {
    updates.push({
      path: join(targetDir, 'packages', 'playground', 'package.json'),
      name: 'playground',
    })
  }

  if (config.includeDocs) {
    updates.push({
      path: join(targetDir, 'packages', 'docs', 'package.json'),
      name: 'docs',
    })
  }

  for (const { path, name } of updates) {
    try {
      const pkg = await readJson(path)
      pkg.name = name

      // Update dependencies
      if (pkg.dependencies) {
        const newDeps: Record<string, string> = {}
        for (const [key, value] of Object.entries(pkg.dependencies)) {
          if (key === '@glstep/lib') {
            newDeps[fullLibName] = value as string
          }
          else if (key.startsWith('@glstep/')) {
            const pkgName = key.split('/')[1]
            newDeps[fullScope ? `${fullScope}/${pkgName}` : pkgName] = value as string
          }
          else {
            newDeps[key] = value as string
          }
        }
        pkg.dependencies = newDeps
      }

      await writeJson(path, pkg)
    }
    catch (err) {
      console.warn(`Warning: Could not update package.json at ${path}: ${(err as Error).message}`)
    }
  }
}
