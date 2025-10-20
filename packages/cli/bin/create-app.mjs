#!/usr/bin/env node

import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cliPath = resolve(__dirname, '../dist/index.js')
import(pathToFileURL(cliPath).href).catch((err) => {
  console.error('Failed to load CLI', err)
  process.exit(1)
})
