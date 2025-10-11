import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'

export async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

export async function isDirEmpty(dir: string): Promise<boolean> {
  if (!existsSync(dir)) {
    return true
  }
  const files = await readdir(dir)
  return files.length === 0
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await cp(src, dest, { recursive: true, force: true })
}

export async function readJson(path: string): Promise<any> {
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content)
}

export async function writeJson(path: string, data: any): Promise<void> {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}
