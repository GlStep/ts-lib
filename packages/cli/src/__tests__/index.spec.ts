import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('cli', () => {
  it('should output message', () => {
    const binPath = resolve(__dirname, '../../bin/create-app.mjs')

    const output = execSync(`node ${binPath}`, {
      encoding: 'utf-8',
    })

    expect(output).toContain('Hello, CLI!')
  })
})
