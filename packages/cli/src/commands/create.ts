import { resolve } from 'node:path'
import process from 'node:process'
import ora from 'ora'
import pc from 'picocolors'
import { promptProjectOptions } from '../prompts/project'
import { scaffoldProject } from '../templates/index'
import { ensureDir, isDirEmpty } from '../utils/fs'
import { installDependencies } from '../utils/install'

export async function createCommand(targetDir: string): Promise<void> {
  const root = resolve(process.cwd(), targetDir)

  // Check if directory is empty
  const isEmpty = await isDirEmpty(root)
  if (!isEmpty) {
    console.error(
      pc.red(`✖ Directory ${pc.bold(targetDir)} is not empty`),
    )
    process.exit(1)
  }

  // Ensure directory exists
  await ensureDir(root)

  // Get user configuration
  const config = await promptProjectOptions(targetDir)
  if (!config) {
    process.exit(0)
  }

  // Scaffold project
  const spinner = ora('Creating project structure...').start()

  try {
    await scaffoldProject(root, config)
    spinner.succeed('Project structure created')
  }
  catch (err) {
    spinner.fail('Failed to create project structure')
    console.error(err)
    process.exit(1)
  }

  // Install dependencies
  if (config.installDeps) {
    await installDependencies(root)
  }

  // Success message
  console.log(`\n${pc.green('✔')} Project created successfully!\n`)
  console.log(pc.bold('Next steps:'))
  console.log(`  ${pc.cyan('cd')} ${config.projectName}`)
  if (!config.installDeps) {
    console.log(`  ${pc.cyan('pnpm install')}`)
  }
  console.log(`  ${pc.cyan('pnpm dev')}\n`)

  console.log(pc.dim('Happy coding! 🚀\n'))
}
