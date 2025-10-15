import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Declare mocks at module level (before any tests)
const execMock = vi.fn()
const spinnerMock = { start: vi.fn().mockReturnThis(), succeed: vi.fn(), fail: vi.fn() }

vi.mock('node:child_process', () => ({ execSync: execMock }))
vi.mock('ora', () => ({ default: vi.fn(() => spinnerMock) }))
vi.mock('picocolors', () => ({ default: { yellow: (s: string) => s } }))

describe('install utilities', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'install-utils-test'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('successful installation', () => {
    it('should execute pnpm install', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(execMock).toHaveBeenCalledWith('pnpm install', {
        cwd: tempDir,
        stdio: 'ignore',
      })
    })

    it('should run command in specified directory', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(execMock).toHaveBeenCalledWith('pnpm install', expect.objectContaining({
        cwd: tempDir,
      }))
    })

    it('should show spinner and message during installation', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(spinnerMock.start).toHaveBeenCalled()
    })

    it('should show success message on completion', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(spinnerMock.succeed).toHaveBeenCalledWith('Dependencies installed successfully.')
    })

    it('should resolve without errors', async () => {
      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).resolves.toBeUndefined()
    })

    it('should create spinner with correct message', async () => {
      const oraMock = vi.mocked(await import('ora')).default

      const { installDependencies } = await import('../install')
      await installDependencies(tempDir)

      expect(oraMock).toHaveBeenCalledWith('Installing dependencies...')
    })
  })

  describe('failed installation', () => {
    it('should handle failed pnpm install command', async () => {
      execMock.mockImplementationOnce(() => {
        throw new Error('pnpm command failed')
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`process.exit: ${code}`)
      })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow('process.exit: 0')

      expect(execMock).toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalled()
      expect(exitSpy).toHaveBeenCalledWith(0)

      exitSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('should show failure message', async () => {
      execMock.mockImplementationOnce(() => {
        throw new Error('pnpm failed')
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow()

      expect(spinnerMock.fail).toHaveBeenCalledWith('Failed to install dependencies.')
    })

    it('should prompt user to run command manually', async () => {
      execMock.mockImplementationOnce(() => {
        throw new Error('fail')
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow()

      expect(logSpy).toHaveBeenCalled()
      const logCall = logSpy.mock.calls[0][0]
      expect(logCall).toContain('pnpm install')
      expect(logCall).toContain('manually')
    })

    it('should exit process after failure with code 0', async () => {
      execMock.mockImplementationOnce(() => {
        throw new Error('fail')
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow('exit: 0')

      expect(exitSpy).toHaveBeenCalledWith(0)
    })
  })

  describe('command execution', () => {
    it('should run with stdio: ignore', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(execMock).toHaveBeenCalledWith('pnpm install', expect.objectContaining({
        stdio: 'ignore',
      }))
    })

    it('should pass correct parameters to execSync', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(execMock).toHaveBeenCalledWith('pnpm install', {
        cwd: tempDir,
        stdio: 'ignore',
      })
    })
  })

  describe('spinner behavior', () => {
    it('should start spinner before installation', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(spinnerMock.start).toHaveBeenCalled()
      const startCallOrder = spinnerMock.start.mock.invocationCallOrder[0]
      const execCallOrder = execMock.mock.invocationCallOrder[0]
      expect(startCallOrder).toBeLessThan(execCallOrder)
    })

    it('should stop spinner after installation', async () => {
      const { installDependencies } = await import('../install')

      await installDependencies(tempDir)

      expect(spinnerMock.succeed).toHaveBeenCalled()
      expect(spinnerMock.fail).not.toHaveBeenCalled()
    })

    it('should stop spinner on error', async () => {
      execMock.mockImplementationOnce(() => {
        throw new Error('fail')
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow()

      expect(spinnerMock.fail).toHaveBeenCalled()
      expect(spinnerMock.succeed).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle missing pnpm', async () => {
      execMock.mockImplementationOnce(() => {
        const error = new Error('Command not found: pnpm') as NodeJS.ErrnoException
        error.code = 'ENOENT'
        throw error
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow('exit: 0')

      expect(spinnerMock.fail).toHaveBeenCalled()
    })

    it('should handle permission error', async () => {
      execMock.mockImplementationOnce(() => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException
        error.code = 'EACCES'
        throw error
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow('exit: 0')

      expect(spinnerMock.fail).toHaveBeenCalled()
    })

    it('should handle network issues', async () => {
      execMock.mockImplementationOnce(() => {
        const error = new Error('Network timeout') as NodeJS.ErrnoException
        error.code = 'ETIMEDOUT'
        throw error
      })

      vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
        throw new Error(`exit: ${code}`)
      })
      vi.spyOn(console, 'log').mockImplementation(() => {})

      const { installDependencies } = await import('../install')

      await expect(installDependencies(tempDir)).rejects.toThrow('exit: 0')

      expect(spinnerMock.fail).toHaveBeenCalled()
    })
  })
})
