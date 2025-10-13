import { existsSync, mkdtempSync, rmSync, writeFile } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ensureDir, isDirEmpty } from '../fs'

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
    it('should create new dir if does not exist', async () => {
      const newDir = join(tempDir, 'new-dir')
      console.log('Temporary directory for test: ', newDir)

      expect(existsSync(newDir)).toBe(false)
      await ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })

    it('should not fail, if dir already exists', async () => {
      const existingDir = join(tempDir, 'existing-dir')
      await ensureDir(existingDir)
      console.log('Temporary directory for test: ', existingDir)
      await expect(ensureDir(existingDir)).resolves.toBeUndefined()
      expect(existsSync(existingDir)).toBe(true)
    })

    it('should create nested directories', async () => {
      const nestedDir = join(tempDir, 'level1', 'level2', 'level3')
      console.log('Temporary directory for test: ', nestedDir)
      await ensureDir(nestedDir)
      expect(existsSync(nestedDir)).toBe(true)
    })
  })

  describe('isDirEmpty', () => {
    it('should return true for non existent dir', async () => {
      const nonExistentDir = join(tempDir, 'non-existent')
      expect(existsSync(nonExistentDir)).toBe(false)
      const result = await isDirEmpty(nonExistentDir)
      expect(result).toBe(true)
    })

    it('should return true for empty dir', async () => {
      const emptyDir = join(tempDir, 'empty-dir')
      console.log('Temporary directory for test: ', emptyDir)
      await ensureDir(emptyDir)
      const result = await isDirEmpty(emptyDir)
      expect(result).toBe(true)
    })

    it('should return false for non empty dir', async () => {
      const nonEmptyDir = join(tempDir, 'non-empty-dir')
      console.log('Temporary directory for test: ', nonEmptyDir)
      writeFile(join(nonEmptyDir, 'file.txt'), 'content')
      const result = await isDirEmpty(nonEmptyDir)
      expect(result).toBe(false)
    })
  })
})
