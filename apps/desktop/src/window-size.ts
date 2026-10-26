/**
 * Desktop startup window geometry: the stored preference resolved against the
 * display work area and the window minimums.
 */
import type { DesktopStartupWindowSize } from '@deepseek-ai/dsh-client-ui-settings-window/protocol'

/** Window size used when the preference names none, and the size a maximized window restores to. */
export const DEFAULT_STARTUP_WINDOW = { width: 1280, height: 820 } as const

/** Smallest startup window, matching the BrowserWindow minimums in `main.ts`. */
export const MIN_STARTUP_WINDOW = { width: 520, height: 600 } as const

/** Largest dimension accepted from the settings file or an IPC request. */
const MAX_STARTUP_WINDOW_DIMENSION = 16_384

/** Resolved geometry for one launch. */
export interface StartupWindowGeometry {
  readonly width: number
  readonly height: number
  readonly maximize: boolean
}

/** Work area of the display the window opens on. */
export interface StartupWindowArea {
  readonly width: number
  readonly height: number
}

/**
 * Resolve the stored preference into the size one launch opens with.
 * @param size - stored preference.
 * @param area - work area of the display the window opens on.
 * @returns the requested size clamped into the work area, and whether to maximize.
 */
export function resolveStartupWindowGeometry(
  size: DesktopStartupWindowSize,
  area: StartupWindowArea,
): StartupWindowGeometry {
  if (size === 'maximize') return { ...DEFAULT_STARTUP_WINDOW, maximize: true }
  const requested = size === 'default' ? DEFAULT_STARTUP_WINDOW : size
  return {
    width: clampStartupDimension(requested.width, area.width, MIN_STARTUP_WINDOW.width),
    height: clampStartupDimension(requested.height, area.height, MIN_STARTUP_WINDOW.height),
    maximize: false,
  }
}

/**
 * A work area smaller than the window minimums keeps the minimum: the shell
 * still opens, and the user resizes instead of facing an unusable window.
 */
function clampStartupDimension(requested: number, available: number, minimum: number): number {
  return Math.min(Math.max(requested, minimum), Math.max(available, minimum))
}

/**
 * Validate one stored preference.
 * @param value - candidate from the settings file or an IPC request.
 * @returns the preference, or undefined when the value names no startup size.
 */
export function parseDesktopStartupWindowSize(value: unknown): DesktopStartupWindowSize | undefined {
  if (value === 'default' || value === 'maximize') return value
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const { width, height } = value as { readonly width?: unknown; readonly height?: unknown }
  if (!isStartupDimension(width) || !isStartupDimension(height)) return undefined
  return { width, height }
}

function isStartupDimension(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
    && value > 0 && value <= MAX_STARTUP_WINDOW_DIMENSION
}
