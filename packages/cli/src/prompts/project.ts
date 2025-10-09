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
    ],
  )

  return response as ProjectOptions | null
}
