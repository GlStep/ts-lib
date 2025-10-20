import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { copyDir, ensureDir, isDirEmpty, readJson, writeJson } from '../fs'

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

    it('should copy dir with nested structure', async () => {
      const srcDir = join(tempDir, 'src-nested')
      await ensureDir(join(srcDir, 'level1', 'level2'))
      writeFileSync(join(srcDir, 'level1', 'level2', 'file.txt'), 'Nested File', { encoding: 'utf8', flag: 'wx' })
      writeFileSync(join(srcDir, 'level1', 'file.txt'), 'Another nested File', { encoding: 'utf8', flag: 'wx' })
      writeFileSync(join(srcDir, 'file.txt'), 'Root File', { encoding: 'utf8', flag: 'wx' })

      const destDir = join(tempDir, 'dest-nested')
      await copyDir(srcDir, destDir)

      expect(existsSync(join(destDir, 'file.txt'))).toBe(true)
      expect(readFileSync(join(destDir, 'file.txt'), 'utf8')).toBe('Root File')

      expect(existsSync(join(destDir, 'level1', 'file.txt'))).toBe(true)
      expect(readFileSync(join(destDir, 'level1', 'file.txt'), 'utf8')).toBe('Another nested File')

      expect(existsSync(join(destDir, 'level1', 'level2', 'file.txt'))).toBe(true)
      expect(readFileSync(join(destDir, 'level1', 'level2', 'file.txt'), 'utf8')).toBe('Nested File')
    })
  })

  describe('readJson', async () => {
    it('should read and parse JSON file', async () => {
      const jsonFile = join(tempDir, 'data.json')
      const jsonData = {
        'name': 'Test',
        'value': 42,
        'nested': { a: 1, b: [1, 2, 3] },
        'array': [10, 20, 30],
        'arrayObject': [{ x: 1 }, { y: 2 }],
        'bool': true,
        'nullValue': null,
        'string-test': 'value',
      }
      writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2), { encoding: 'utf8', flag: 'wx' })

      const result = await readJson(jsonFile)
      expect(result).toEqual(jsonData)
      expect(result.name).toEqual(jsonData.name)
      expect(result['string-test']).toEqual(jsonData['string-test'])
    })

    it('should throw error for invalid JSON', async () => {
      const invalidJsonFile = join(tempDir, 'invalid.json')
      writeFileSync(invalidJsonFile, '{ invalid json ', { encoding: 'utf8', flag: 'wx' })

      const result = readJson(invalidJsonFile)
      await expect(result).rejects.toThrow(SyntaxError)
    })
  })

  describe('writeJson', async () => {
    it('should write JSON object to file', async () => {
      const jsonFile = join(tempDir, 'output.json')
      const jsonData = {
        title: 'Output Test',
        count: 100,
        items: ['a', 'b', 'c'],
        details: { key: 'value' },
        isActive: false,
        nullField: null,
      }

      await writeJson(jsonFile, jsonData)

      expect(existsSync(jsonFile)).toBe(true)
      const fileContent = readFileSync(jsonFile, { encoding: 'utf8' })
      const parsedContent = JSON.parse(fileContent)
      expect(parsedContent).toEqual(jsonData)
      expect(fileContent.endsWith('\n')).toBe(true)
    })

    it('should overwrite existing file', async () => {
      const jsonFile = join(tempDir, 'overwrite.json')
      const initialData = { initial: true }
      writeFileSync(jsonFile, JSON.stringify(initialData), { encoding: 'utf8', flag: 'wx' })

      const newData = { updated: true, number: 123 }
      await writeJson(jsonFile, newData)

      const fileContent = readFileSync(jsonFile, { encoding: 'utf8' })
      const parsedContent = JSON.parse(fileContent)
      expect(parsedContent).toEqual(newData)
    })
  })
})
