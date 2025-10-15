import { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { replaceInFiles } from '../replace'

describe('replace utilities', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'replace-utils-test'))
  })

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('string replacement', () => {
    it('should replace string in text files', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'Hello World'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'World', to: 'Vitest' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Hello Vitest')
    })

    it('should replace multiple occurrences of a string', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'foo bar foo baz foo'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'qux' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('qux bar qux baz qux')
    })

    it('should replace strings in multiple files', async () => {
      const contDir = join(tempDir, 'subdir')
      mkdirSync(contDir)
      const filePath1 = join(contDir, 'file1.txt')
      const filePath2 = join(contDir, 'file2.txt')
      const contentBefore1 = 'apple banana'
      const contentBefore2 = 'banana cherry'
      writeFileSync(filePath1, contentBefore1, 'utf-8')
      writeFileSync(filePath2, contentBefore2, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'banana', to: 'orange' }])
      const contentAfter1 = readFileSync(filePath1, 'utf-8')
      const contentAfter2 = readFileSync(filePath2, 'utf-8')
      expect(contentAfter1).toBe('apple orange')
      expect(contentAfter2).toBe('orange cherry')
    })

    it('should not modify files if string not found', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'No matching string here.'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'nonexistent', to: 'replacement' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe(contentBefore)
    })

    it('should handle case-sensitive replacements', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'Case Sensitive CASE sensitive case SENSITIVE'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'case', to: 'word' }, { from: 'SENSITIVE', to: 'SOFT' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Case Sensitive CASE sensitive word SOFT')
    })
  })

  describe('regex replacement', () => {
    it('should replace pattern in text files', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'The quick brown fox jumps over the lazy dog.'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: /\bthe\b/gi, to: 'a' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('a quick brown fox jumps over a lazy dog.')
    })

    it('should replace multiple occurrences of a pattern', async () => {
      const filePath = join(tempDir, 'test.txt')
      const contentBefore = 'foo1 bar2 foo3 baz4 foo5'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: /foo\d/g, to: 'qux' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('qux bar2 qux baz4 qux')
    })

    it('should replace patterns in multiple files', async () => {
      const contDir = join(tempDir, 'subdir')
      mkdirSync(contDir)
      const filePath1 = join(contDir, 'file1.txt')
      const filePath2 = join(contDir, 'file2.txt')
      const contentBefore1 = 'item123 item4560'
      const contentBefore2 = 'item789 item0120'
      writeFileSync(filePath1, contentBefore1, 'utf-8')
      writeFileSync(filePath2, contentBefore2, 'utf-8')
      await replaceInFiles(tempDir, [{ from: /item\d{3}/g, to: 'product' }])
      const contentAfter1 = readFileSync(filePath1, 'utf-8')
      const contentAfter2 = readFileSync(filePath2, 'utf-8')
      expect(contentAfter1).toBe('product product0')
      expect(contentAfter2).toBe('product product0')
    })
  })

  describe('file type handling', () => {
    it('should process files with supported text extensions', async () => {
      const filePath = join(tempDir, 'test.md')
      const contentBefore = 'Markdown file with foo.'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Markdown file with bar.')
    })

    it('should skip binary files', async () => {
      const filePath = join(tempDir, 'image.png')
      const binaryContent = Buffer.from([0x89, 0x50, 0x4E, 0x47])
      writeFileSync(filePath, binaryContent)
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath)
      expect(contentAfter).toEqual(binaryContent)
    })

    it('should skip unsupported file types', async () => {
      const filePath = join(tempDir, 'archive.zip')
      const binaryContent = Buffer.from([0x50, 0x4B, 0x03, 0x04])
      writeFileSync(filePath, binaryContent)
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath)
      expect(contentAfter).toEqual(binaryContent)
    })

    it('should handle mixed file types in a directory', async () => {
      const contDir = join(tempDir, 'mixed')
      mkdirSync(contDir)
      const textFilePath = join(contDir, 'file.txt')
      const binaryFilePath = join(contDir, 'file.bin')
      const mdFilePath = join(contDir, 'file.md')
      const tsFilePath = join(contDir, 'file.ts')
      writeFileSync(textFilePath, 'foo in text file', 'utf-8')
      writeFileSync(binaryFilePath, Buffer.from([0x00, 0x01, 0x02, 0x03]))
      writeFileSync(mdFilePath, 'foo in markdown file', 'utf-8')
      writeFileSync(tsFilePath, 'const foo = 42;', 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const textContentAfter = readFileSync(textFilePath, 'utf-8')
      const binaryContentAfter = readFileSync(binaryFilePath)
      const mdContentAfter = readFileSync(mdFilePath, 'utf-8')
      const tsContentAfter = readFileSync(tsFilePath, 'utf-8')
      expect(textContentAfter).toBe('bar in text file')
      expect(binaryContentAfter).toEqual(Buffer.from([0x00, 0x01, 0x02, 0x03]))
      expect(mdContentAfter).toBe('bar in markdown file')
      expect(tsContentAfter).toBe('const bar = 42;')
    })

    it('should process package.json regardless of extension check', async () => {
      const filePath = join(tempDir, 'package.json')
      const contentBefore = '{"name": "foo-package", "version": "1.0.0"}'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('{"name": "bar-package", "version": "1.0.0"}')
    })
  })

  describe('directory handling', () => {
    it('should ignore node_modules and dist directories', async () => {
      const nodeModulesDir = join(tempDir, 'node_modules')
      const distDir = join(tempDir, 'dist')
      mkdirSync(nodeModulesDir)
      mkdirSync(distDir)
      const filePath1 = join(nodeModulesDir, 'file.txt')
      const filePath2 = join(distDir, 'file.txt')
      writeFileSync(filePath1, 'foo in node_modules', 'utf-8')
      writeFileSync(filePath2, 'foo in dist', 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter1 = readFileSync(filePath1, 'utf-8')
      const contentAfter2 = readFileSync(filePath2, 'utf-8')
      expect(contentAfter1).toBe('foo in node_modules')
      expect(contentAfter2).toBe('foo in dist')
    })

    it('should ignore .git directories', async () => {
      const gitDir = join(tempDir, '.git')
      mkdirSync(gitDir)
      const filePath = join(gitDir, 'config')
      writeFileSync(filePath, 'foo in .git config', 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('foo in .git config')
    })

    it('should handle nested directories', async () => {
      const nestedDir = join(tempDir, 'a/b/c/d/e')
      mkdirSync(nestedDir, { recursive: true })
      const filePath = join(nestedDir, 'test.txt')
      const contentBefore = 'Nested foo here'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Nested bar here')
    })
  })

  describe('edge cases', () => {
    it('should handle empty files', async () => {
      const filePath = join(tempDir, 'empty.txt')
      writeFileSync(filePath, '', 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('')
    })

    it('should handle files with special characters', async () => {
      const filePath = join(tempDir, 'special.txt')
      const contentBefore = 'Special chars: !@#$%^&*()_+[]{}|;:\'",.<>?/`~'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: '@#$', to: '###' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Special chars: !###%^&*()_+[]{}|;:\'",.<>?/`~')
    })

    it('should handle very large files efficiently', async () => {
      const filePath = join(tempDir, 'large.txt')
      const largeContent = 'foo '.repeat(10000) // ~40KB
      writeFileSync(filePath, largeContent, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('bar '.repeat(10000))
    })

    it('should handle files with no extensions', async () => {
      const filePath = join(tempDir, 'README')
      const contentBefore = 'This is a README file with foo.'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'foo', to: 'bar' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).not.toBe('This is a README file with bar.')
    })
  })

  describe('content integrity', () => {
    it('should preserve file encoding', async () => {
      const filePath = join(tempDir, 'utf8.txt')
      const contentBefore = 'Café Münsterländer'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'Münsterländer', to: 'Rheinländer' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Café Rheinländer')
    })

    it('should preserve line endings', async () => {
      const filePath = join(tempDir, 'lineendings.txt')
      const contentBefore = 'Line one.\r\nLine two.\r\nLine three.'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'Line', to: 'Sentence' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe('Sentence one.\r\nSentence two.\r\nSentence three.')
    })

    it('should preserve whitespace, when no replacement occurs', async () => {
      const filePath = join(tempDir, 'whitespace.txt')
      const contentBefore = '   Leading and trailing whitespace   \n\tTabbed line'
      writeFileSync(filePath, contentBefore, 'utf-8')
      await replaceInFiles(tempDir, [{ from: 'nonexistent', to: 'replacement' }])
      const contentAfter = readFileSync(filePath, 'utf-8')
      expect(contentAfter).toBe(contentBefore)
    })
  })
})
