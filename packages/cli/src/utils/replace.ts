import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import fg from 'fast-glob'

export interface Replacement {
  from: string | RegExp
  to: string
}

export async function replaceInFiles(dir: string, replacements: Replacement[]): Promise<void> {
  const files = await fg('**/*', {
    cwd: dir,
    ignore: ['node_modules/**', '**/dist/**', '.git/**'],
    dot: true,
    onlyFiles: true,
  })

  const textExtensions = [
    '.js',
    '.mjs',
    '.cjs',
    '.ts',
    '.tsx',
    '.jsx',
    '.vue',
    '.json',
    '.html',
    '.css',
    '.scss',
    '.md',
    '.yml',
    '.yaml',
    '.txt',
  ]

  for (const file of files) {
    const filePath = join(dir, file)
    const ext = file.substring(file.lastIndexOf('.'))

    if (!textExtensions.includes(ext) && !file.endsWith('package.json')) {
      continue
    }

    try {
      let content = await readFile(filePath, 'utf-8')
      let modified = false

      for (const { from, to } of replacements) {
        const oldContent = content
        if (typeof from === 'string') {
          content = content.split(from).join(to)
        }
        else {
          content = content.replace(from, to)
        }

        if (content !== oldContent) {
          modified = true
        }
      }

      if (modified) {
        await writeFile(filePath, content, 'utf-8')
      }
    }
    catch (err) {
      console.error(`Error processing file ${filePath}:`, err)
    }
  }
}
