import process from 'node:process'
import pc from 'picocolors'
import prompts from 'prompts'

export interface ProjectOptions {
  projectName: string
  packageName: string
  scope: string
  includeLib: boolean
  includeLibTs: boolean
  includePlayground: boolean
  includeDocs: boolean
  installDeps: boolean
}

export async function promptProjectOptions(targetDir: string): Promise<ProjectOptions | null> {
  console.log(`\n${pc.bold(pc.cyan('Create a Vue/TS Library project'))}\n`)

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name: ',
        initial: targetDir === '.' ? 'my-lib' : targetDir,
        validate: (value: string) => value.trim() ? true : 'Project name cannot be empty',
      },
      {
        type: 'text',
        name: 'scope',
        message: 'npm scope (optional, without @): ',
        initial: '',
        format: (value: string) => value.trim(),
      },
      {
        type: 'text',
        name: 'packageName',
        message: 'Package name (npm package name): ',
        initial: 'lib',
        validate: (value: string) => value.trim() ? true : 'Package name cannot be empty',
      },
      {
        type: 'multiselect',
        name: 'packages',
        message: 'Select packages to include: ',
        choices: [
          {
            title: 'Vue 3 library',
            value: 'lib',
            selected: false,
          },
          {
            title: 'TypeScript library',
            value: 'libTs',
            selected: false,
          },
          {
            title: `Playground (Vue 3 + Vite) ${pc.bold('(recommended)')}`,
            value: 'playground',
            selected: true,
          },
          {
            title: 'Documentation (VitePress)',
            value: 'docs',
            selected: false,
          },
        ],
        min: 1,
        hint: '- Space to select. Return to submit',
        instructions: false,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies after the project is created?',
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log(`${pc.red('\n✖')} Operation cancelled.`)
        process.exit(0)
      },
    },
  )

  if (!response.projectName) {
    return null
  }

  const packages: string[] = response.packages ?? []

  const options: ProjectOptions = {
    projectName: response.projectName,
    packageName: response.packageName,
    scope: response.scope,
    includeLib: packages.includes('lib'),
    includeLibTs: packages.includes('libTs'),
    includePlayground: packages.includes('playground'),
    includeDocs: packages.includes('docs'),
    installDeps: response.installDeps,
  }

  return options
}
