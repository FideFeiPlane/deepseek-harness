/** Preset matching covers stored presets and hand-edited custom sizes. */
import { expect, it } from 'vitest'
import { matchingStartupPreset, sameStartupSize, STARTUP_SIZE_PRESETS } from '../src/client/startup-size.ts'
import { en } from '../src/client/locales.ts'

it('offers the presets in ascending order with maximize last', () => {
  expect(STARTUP_SIZE_PRESETS.map(preset => preset.id)).toEqual([
    'default', '720p', 'xga', 'wxga', 'hdplus', 'fhd', 'maximize',
  ])
})

it('matches stored presets and reports a custom size', () => {
  expect(matchingStartupPreset('default')?.id).toBe('default')
  expect(matchingStartupPreset('maximize')?.id).toBe('maximize')
  expect(matchingStartupPreset({ width: 1440, height: 900 })?.id).toBe('wxga')
  expect(matchingStartupPreset({ width: 1000, height: 700 })).toBeUndefined()
})

it('compares sizes structurally but presets by identity of their kind', () => {
  expect(sameStartupSize({ width: 1280, height: 720 }, { width: 1280, height: 720 })).toBe(true)
  expect(sameStartupSize({ width: 1280, height: 720 }, { width: 1280, height: 721 })).toBe(false)
  expect(sameStartupSize('default', 'maximize')).toBe(false)
  expect(sameStartupSize('maximize', 'maximize')).toBe(true)
})

it('carries copy for every referenced preset label', () => {
  for (const key of ['sizeDefault', 'sizeMaximize', 'sizeCustom', 'writeFailed', 'loading'] as const) {
    expect(en[key]).not.toBe('')
  }
})
