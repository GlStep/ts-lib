#!/usr/bin/env node
import process from 'node:process'
import { createCommand } from './commands/create'

async function main() {
  const args = process.argv.slice(2)
  const targetDir = args[0] || '.'

  await createCommand(targetDir)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
