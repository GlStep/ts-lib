import type { ProjectOptions } from '../prompts/project'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'
import { copyDir, ensureDir, readJson, writeJson } from '../utils/fs'
import { installDependencies } from '../utils/install'
import { replaceInFiles } from '../utils/replace'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const templatesDir = join(__dirname, '..', 'templates')

export async function scaffoldProject(
  targetDir: string,
  options: ProjectOptions,
): Promise<void> {
  console.log(pc.cyan('\n📦 Creating project structure...\n'))

  try {
    // 1. Copy base files
    await copyDir(join(templatesDir, 'base'), targetDir)
    console.log(pc.dim('  ✓ Base files copied'))

    // 2. Create packages directory
    const packagesDir = join(targetDir, 'packages')
    await ensureDir(packagesDir)

    // 3. Copy selected packages
    const selectedPackages: string[] = []

    if (options.includeLib) {
      await copyDir(join(templatesDir, 'lib'), join(packagesDir, 'lib'))
      console.log(pc.dim('  ✓ Vue component library added'))
      selectedPackages.push('- `@SCOPE/lib` - Vue 3 component library')
    }

    if (options.includeLibTs) {
      await copyDir(join(templatesDir, 'lib-ts'), join(packagesDir, 'lib-ts'))
      console.log(pc.dim('  ✓ TypeScript utilities library added'))
      selectedPackages.push('- `@SCOPE/lib-ts` - TypeScript utilities')
    }

    if (options.includePlayground) {
      await copyDir(join(templatesDir, 'playground'), join(packagesDir, 'playground'))
      console.log(pc.dim('  ✓ Playground app added'))
      selectedPackages.push('- `playground` - Development playground')
    }

    if (options.includeDocs) {
      await copyDir(join(templatesDir, 'docs'), join(packagesDir, 'docs'))
      console.log(pc.dim('  ✓ Documentation site added'))
      selectedPackages.push('- `docs` - VitePress documentation')
    }

    // 4. Update package metadata and add workspace dependencies
    console.log(pc.cyan('\n⚙️  Configuring packages...\n'))
    await updatePackageMetadata(targetDir, packagesDir, options)
    console.log(pc.dim('  ✓ Package metadata updated'))

    // 5. Add workspace dependencies AFTER packages are renamed
    await addWorkspaceDependencies(packagesDir, options)
    console.log(pc.dim('  ✓ Workspace dependencies configured'))

    // 6. Replace placeholders
    const scope = options.scope ? `@${options.scope}` : ''
    const packagesList = selectedPackages.join('\n')

    await replaceInFiles(targetDir, [
      { from: /PROJECT_NAME/g, to: options.projectName },
      { from: /AUTHOR_NAME/g, to: options.author || '' },
      { from: /@SCOPE/g, to: scope || '@your-org' },
      { from: /PACKAGES_LIST/g, to: packagesList },
    ])
    console.log(pc.dim('  ✓ Placeholders replaced'))

    // 7. Update tsconfig references
    await updateTsConfigReferences(targetDir, options)
    console.log(pc.dim('  ✓ TypeScript configuration updated'))

    // 8. Install dependencies if requested
    if (options.installDeps) {
      await installDependencies(targetDir)
    }

    // 9. Show success message
    printSuccessMessage(options)
  }
  catch (error) {
    console.error(pc.red('\n✖ Failed to scaffold project\n'))
    throw error
  }
}

async function updatePackageMetadata(
  targetDir: string,
  packagesDir: string,
  options: ProjectOptions,
): Promise<void> {
  const scope = options.scope ? `@${options.scope}` : ''

  // Update root package.json
  const rootPkg = await readJson(join(targetDir, 'package.json'))
  rootPkg.name = options.projectName
  if (options.author) {
    rootPkg.author = options.author
  }
  await writeJson(join(targetDir, 'package.json'), rootPkg)

  // Update individual package names
  if (options.includeLib) {
    const libPkg = await readJson(join(packagesDir, 'lib', 'package.json'))
    libPkg.name = scope ? `${scope}/lib` : 'lib'
    if (options.author) {
      libPkg.author = options.author
    }
    await writeJson(join(packagesDir, 'lib', 'package.json'), libPkg)
  }

  if (options.includeLibTs) {
    const libTsPkg = await readJson(join(packagesDir, 'lib-ts', 'package.json'))
    libTsPkg.name = scope ? `${scope}/lib-ts` : 'lib-ts'
    if (options.author) {
      libTsPkg.author = options.author
    }
    await writeJson(join(packagesDir, 'lib-ts', 'package.json'), libTsPkg)
  }
}

async function addWorkspaceDependencies(
  packagesDir: string,
  options: ProjectOptions,
): Promise<void> {
  const scope = options.scope ? `@${options.scope}` : ''

  // Add lib-ts dependency to lib if both exist
  if (options.includeLib && options.includeLibTs) {
    const libPkg = await readJson(join(packagesDir, 'lib', 'package.json'))
    if (!libPkg.dependencies) {
      libPkg.dependencies = {}
    }
    const libTsName = scope ? `${scope}/lib-ts` : 'lib-ts'
    libPkg.dependencies[libTsName] = 'workspace:*'
    await writeJson(join(packagesDir, 'lib', 'package.json'), libPkg)
  }

  // Add dependencies to playground ONLY for packages that exist
  if (options.includePlayground) {
    const playgroundPkg = await readJson(join(packagesDir, 'playground', 'package.json'))

    // Ensure dependencies object exists
    if (!playgroundPkg.dependencies) {
      playgroundPkg.dependencies = {}
    }

    // Only add lib if it was selected
    if (options.includeLib) {
      const libName = scope ? `${scope}/lib` : 'lib'
      playgroundPkg.dependencies[libName] = 'workspace:*'
    }

    // Only add lib-ts if it was selected
    if (options.includeLibTs) {
      const libTsName = scope ? `${scope}/lib-ts` : 'lib-ts'
      playgroundPkg.dependencies[libTsName] = 'workspace:*'
    }

    await writeJson(join(packagesDir, 'playground', 'package.json'), playgroundPkg)
  }

  // Add lib dependency to docs if both exist
  if (options.includeDocs && options.includeLib) {
    const docsPkg = await readJson(join(packagesDir, 'docs', 'package.json'))
    if (!docsPkg.dependencies) {
      docsPkg.dependencies = {}
    }
    const libName = scope ? `${scope}/lib` : 'lib'
    docsPkg.dependencies[libName] = 'workspace:*'
    await writeJson(join(packagesDir, 'docs', 'package.json'), docsPkg)
  }
}

async function updateTsConfigReferences(
  targetDir: string,
  options: ProjectOptions,
): Promise<void> {
  const references: { path: string }[] = []

  if (options.includeLib) {
    references.push({ path: './packages/lib' })
  }

  if (options.includeLibTs) {
    references.push({ path: './packages/lib-ts' })
  }

  if (options.includePlayground) {
    references.push({ path: './packages/playground' })
  }

  // Only create tsconfig.json if there are references
  if (references.length > 0) {
    const tsconfig = {
      files: [],
      references,
    }
    await writeJson(join(targetDir, 'tsconfig.json'), tsconfig)
  }
}

function printSuccessMessage(options: ProjectOptions): void {
  console.log(pc.green('\n✨ Project created successfully!\n'))
  console.log('Next steps:')
  console.log(pc.cyan(`  cd ${options.projectName}`))

  if (!options.installDeps) {
    console.log(pc.cyan('  pnpm install'))
  }

  console.log(pc.cyan('  pnpm dev'))
  console.log()
}
