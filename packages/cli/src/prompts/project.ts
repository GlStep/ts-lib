import chalk from 'chalk'
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
  console.log(`\n${chalk.bold.cyan('Create a Vue/TS Library project')}\n`)

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
            title: `Playground (Vue 3 + Vite) ${chalk.bold('(recommended)')}`,
            value: 'playground',
            selected: true,
          },
        ],
        min: 1,
        hint: '- Space to select. Return to submit',
        instructions: false,
      },
    ],
  )

  if (!response.projectName) {
    return null
  }

  const packages: string[] = response.packages || []

  return {
    projectName: response.projectName,
    packageName: response.packageName,
    scope: response.scope,
    includeLib: packages.includes('lib'),
    includeLibTs: packages.includes('libTs'),
    includePlayground: packages.includes('playground'),
    includeDocs: true,
    installDeps: true,
  }
}
