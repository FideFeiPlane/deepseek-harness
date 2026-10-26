/** Preset order, matching, and comparison, including sizes hand-edited into the settings file. */
import { expect, it } from 'vitest'
import { matchingStartupPreset, sameStartupSize, STARTUP_SIZE_PRESETS } from '../src/client/startup-size.ts'
import { en } from '../src/client/locales.ts'

it('offers the presets in ascending order with maximize last', () => {
  expect(STARTUP_SIZE_PRESETS.map(preset => preset.id)).toEqual([
    'default', 'xga', 'wxga', 'hdplus', 'fhd', 'qhd', 'maximize',
  ])
})

it('grows every concrete preset', () => {
  const widths = STARTUP_SIZE_PRESETS.flatMap(preset => (typeof preset.size === 'string' ? [] : [preset.size.width]))
  widths.forEach((width, index) => {
    const previous = widths[index - 1]
    if (previous !== undefined) expect(width).toBeGreaterThan(previous)
  })
})

it('matches stored presets and reports a custom size', () => {
  expect(matchingStartupPreset('default')?.id).toBe('default')
  expect(matchingStartupPreset('maximize')?.id).toBe('maximize')
  expect(matchingStartupPreset({ width: 1440, height: 900 })?.id).toBe('wxga')
  expect(matchingStartupPreset({ width: 2560, height: 1440 })?.id).toBe('qhd')
  expect(matchingStartupPreset({ width: 1000, height: 700 })).toBeUndefined()
})

it('compares sizes structurally but presets by identity of their kind', () => {
  expect(sameStartupSize({ width: 1440, height: 900 }, { width: 1440, height: 900 })).toBe(true)
  expect(sameStartupSize({ width: 1440, height: 900 }, { width: 1440, height: 901 })).toBe(false)
  expect(sameStartupSize('default', 'maximize')).toBe(false)
  expect(sameStartupSize('maximize', 'maximize')).toBe(true)
})

it('carries copy for every preset label and state', () => {
  for (const key of [
    'sizeDefault', 'sizeXga', 'sizeWxga', 'sizeHdplus', 'sizeFhd', 'sizeQhd', 'sizeMaximize',
    'sizeCustom', 'displayScale', 'writeFailed', 'loading',
  ] as const) expect(en[key]).not.toBe('')
})
