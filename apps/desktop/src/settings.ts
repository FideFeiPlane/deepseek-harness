/**
 * Local Electron shell settings, loaded once per process independently of the Host.
 * Ownership: .agents/notes/implemented/architecture/2026-10-08-desktop-shell-configuration.md.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import type { DesktopStartupWindowSize } from '@deepseek-ai/dsh-client-ui-settings-window/protocol'
import { parseDesktopStartupWindowSize } from './window-size.ts'

/** Resolved shell preferences; absent fields use the defaults without rewriting existing files. */
export interface DesktopSettings {
  readonly updates: {
    readonly allowTestAuthPopupWindow: boolean
  }
  readonly window: {
    readonly startupSize: DesktopStartupWindowSize
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Read shell settings, creating the default document exclusively when missing.
 * @param userData - Electron's userData directory, independent of DSH_HOME.
 * @returns Validated settings, or defaults when reading, creating or validating fails; changes require a restart.
 */
export function readDesktopSettings(userData: string): DesktopSettings {
  const directory = join(userData, 'desktop')
  const path = join(directory, 'settings.json')
  const defaults: DesktopSettings = {
    updates: { allowTestAuthPopupWindow: false },
    window: { startupSize: 'default' },
  }
  try {
    let raw: string
    try { raw = readFileSync(path, 'utf8') } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      mkdirSync(directory, { recursive: true, mode: 0o700 })
      try { writeFileSync(path, `${JSON.stringify(defaults, null, 2)}\n`, { flag: 'wx', mode: 0o600 }) } catch (error) {
        // An existing document belongs to the user, including one created during initialization.
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      }
      raw = readFileSync(path, 'utf8')
    }
    const value: unknown = JSON.parse(raw)
    if (!record(value) || (value.updates !== undefined && !record(value.updates))) {
      throw new Error('expected a JSON object with an optional updates object')
    }
    if (value.window !== undefined && !record(value.window)) {
      throw new Error('window must be a JSON object')
    }
    const allow = value.updates?.allowTestAuthPopupWindow
    if (allow !== undefined && typeof allow !== 'boolean') {
      throw new Error('updates.allowTestAuthPopupWindow must be true or false')
    }
    const startupSize = value.window?.startupSize
    const parsedStartupSize = parseDesktopStartupWindowSize(startupSize)
    if (startupSize !== undefined && parsedStartupSize === undefined) {
      throw new Error('window.startupSize must be "default", "maximize", or a positive integer width and height')
    }
    return {
      updates: { allowTestAuthPopupWindow: allow ?? false },
      window: { startupSize: parsedStartupSize ?? 'default' },
    }
  } catch (error) {
    try {
      console.warn(`desktop settings: ${path}: using defaults because settings could not be loaded`, error)
    } catch (_logError) {
      // Diagnostic output is best effort; its failure must not make optional settings fatal.
      // TODO: Persist settings diagnostics when console output is unavailable, without blocking startup.
    }
    return defaults
  }
}

/**
 * Persist the startup window size, leaving every other field — including fields
 * this build does not know — in place.
 * @param userData - Electron's userData directory, independent of DSH_HOME.
 * @param startupSize - accepted preference, applied when the shell next creates its main window.
 * @returns completion after the atomic replacement commits.
 * @throws when the existing document is unreadable or malformed, so a write never discards content it could not parse.
 */
export async function writeDesktopStartupSize(userData: string, startupSize: DesktopStartupWindowSize): Promise<void> {
  const path = join(userData, 'desktop', 'settings.json')
  let document: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    if (!record(parsed)) throw new Error('expected a JSON object')
    document = parsed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  document.window = { ...(record(document.window) ? document.window : {}), startupSize }
  await writeFileAtomic(path, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600, dirMode: 0o700 })
}
