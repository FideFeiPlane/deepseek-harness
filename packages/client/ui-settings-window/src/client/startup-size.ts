/** Startup size presets and the comparison the row uses to find the current one. */
import type { DesktopStartupWindowSize } from '../protocol.ts'

/** One selectable startup size; `id` is the menu key and the stored preference is `size`. */
export interface StartupSizePreset {
  readonly id: 'default' | '720p' | 'xga' | 'wxga' | 'hdplus' | 'fhd' | 'maximize'
  readonly size: DesktopStartupWindowSize
}

/** Presets offered in General settings, smallest first and maximized last. */
export const STARTUP_SIZE_PRESETS: readonly StartupSizePreset[] = [
  { id: 'default', size: 'default' },
  { id: '720p', size: { width: 1280, height: 720 } },
  { id: 'xga', size: { width: 1366, height: 768 } },
  { id: 'wxga', size: { width: 1440, height: 900 } },
  { id: 'hdplus', size: { width: 1600, height: 900 } },
  { id: 'fhd', size: { width: 1920, height: 1080 } },
  { id: 'maximize', size: 'maximize' },
]

/**
 * Compare two preferences, including custom sizes a user edited into the shell settings file.
 * @param left - first preference.
 * @param right - second preference.
 * @returns whether both name the same window size.
 */
export function sameStartupSize(left: DesktopStartupWindowSize, right: DesktopStartupWindowSize): boolean {
  if (typeof left === 'string' || typeof right === 'string') return left === right
  return left.width === right.width && left.height === right.height
}

/**
 * Find the preset that currently applies.
 * @param size - stored preference.
 * @returns the matching preset, or undefined for a custom size.
 */
export function matchingStartupPreset(size: DesktopStartupWindowSize): StartupSizePreset | undefined {
  return STARTUP_SIZE_PRESETS.find(preset => sameStartupSize(preset.size, size))
}
