import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ensureDir } from '../fs'

describe('fs utilities', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'fs-utils-test'))
  })

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('ensureDir', () => {
    it('create new dir if does not exist', async () => {
      const newDir = join(tempDir, 'new-dir')

      expect(existsSync(newDir)).toBe(false)
      await ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })
  })
})
