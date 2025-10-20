import { execSync } from 'node:child_process'
import process from 'node:process'
import ora from 'ora'
import pc from 'picocolors'

export async function installDependencies(cwd: string): Promise<void> {
  const spinner = ora('Installing dependencies...').start()

  try {
    execSync('pnpm install', {
      cwd,
      stdio: 'ignore',
    })
    spinner.succeed('Dependencies installed successfully.')
  }
  catch {
    spinner.fail('Failed to install dependencies.')
    console.log(`\n${pc.yellow('Please run "pnpm install" manually.\n')}`)
    process.exit(0)
  }
}
