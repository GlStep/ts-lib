import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { copyDir, ensureDir, isDirEmpty } from '../fs'

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
      expect(existsSync(newDir)).toBe(false)
      await ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })

    it('should not fail, if dir already exists', async () => {
      const existingDir = join(tempDir, 'existing-dir')
      await ensureDir(existingDir)
      await expect(ensureDir(existingDir)).resolves.toBeUndefined()
      expect(existsSync(existingDir)).toBe(true)
    })

    it('should create nested directories', async () => {
      const nestedDir = join(tempDir, 'level1', 'level2', 'level3')
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
      await ensureDir(emptyDir)
      const result = await isDirEmpty(emptyDir)
      expect(result).toBe(true)
    })

    it('should return false for non empty dir', async () => {
      const nonEmptyDir = join(tempDir, 'non-empty-dir')
      await ensureDir(nonEmptyDir)
      writeFileSync(join(nonEmptyDir, 'file.txt'), 'Hello, World!', { encoding: 'utf8', flag: 'wx' })
      const result = await isDirEmpty(nonEmptyDir)
      expect(result).toBe(false)
    })

    it('should return false for dir with sub-dir', async () => {
      const dirWithSubDir = join(tempDir, 'dir-with-sub-dir')
      const subDir = join(dirWithSubDir, 'sub-dir')
      await ensureDir(subDir)
      const result = await isDirEmpty(dirWithSubDir)
      expect(result).toBe(false)
    })

    it('should return false for dir with hidden files', async () => {
      const dirWithHiddenFile = join(tempDir, 'dir-with-hidden-file')
      await ensureDir(dirWithHiddenFile)
      writeFileSync(join(dirWithHiddenFile, '.hiddenfile'), 'This is a hidden file', { encoding: 'utf8', flag: 'wx' })
      const result = await isDirEmpty(dirWithHiddenFile)
      expect(result).toBe(false)
    })

    it('should return false for dir with multiple items', async () => {
      const dirWithMultipleItems = join(tempDir, 'dir-with-multiple-items')
      await ensureDir(dirWithMultipleItems)
      writeFileSync(join(dirWithMultipleItems, 'file1.txt'), 'File 1', { encoding: 'utf8', flag: 'wx' })
      writeFileSync(join(dirWithMultipleItems, 'file2.txt'), 'File 2', { encoding: 'utf8', flag: 'wx' })
      await ensureDir(join(dirWithMultipleItems, 'sub-dir'))
      const result = await isDirEmpty(dirWithMultipleItems)
      expect(result).toBe(false)
    })
  })

  describe('copyDir', () => {
    it('should copy directory with all files', async () => {
      const srcDir = join(tempDir, 'src')
      const destDir = join(tempDir, 'dest')

      await ensureDir(srcDir)
      writeFileSync(join(srcDir, 'file1.txt'), 'File 1', { encoding: 'utf8', flag: 'wx' })
      writeFileSync(join(srcDir, 'file2.txt'), 'File 2', { encoding: 'utf8', flag: 'wx' })

      await copyDir(srcDir, destDir)

      expect(existsSync(destDir)).toBe(true)
      expect(existsSync(join(destDir, 'file1.txt'))).toBe(true)
      expect(existsSync(join(destDir, 'file2.txt'))).toBe(true)
      expect(readFileSync(join(destDir, 'file1.txt'), 'utf8')).toBe('File 1')
      expect(readFileSync(join(destDir, 'file2.txt'), 'utf8')).toBe('File 2')
    })
  })
})
