/** Startup geometry clamps a stored preference into the display work area. */
import { expect, it } from 'vitest'
import {
  DEFAULT_STARTUP_WINDOW, MIN_STARTUP_WINDOW, parseDesktopStartupWindowSize, resolveStartupWindowGeometry,
} from '../src/window-size.ts'

const AREA = { width: 1920, height: 1080 }

it('opens the default size when the preference names none', () => {
  expect(resolveStartupWindowGeometry('default', AREA)).toEqual({ ...DEFAULT_STARTUP_WINDOW, maximize: false })
})

it('asks for a maximized window without shrinking the restore size', () => {
  expect(resolveStartupWindowGeometry('maximize', AREA)).toEqual({ ...DEFAULT_STARTUP_WINDOW, maximize: true })
  expect(resolveStartupWindowGeometry('maximize', AREA).maximize).toBe(true)
})

it('keeps a custom size that fits the work area', () => {
  expect(resolveStartupWindowGeometry({ width: 1600, height: 900 }, AREA))
    .toEqual({ width: 1600, height: 900, maximize: false })
})

it('fits an oversized custom size into the work area', () => {
  expect(resolveStartupWindowGeometry({ width: 4000, height: 3000 }, AREA))
    .toEqual({ width: 1920, height: 1080, maximize: false })
})

it('keeps the window minimum on a work area smaller than it', () => {
  expect(resolveStartupWindowGeometry({ width: 300, height: 200 }, { width: 400, height: 300 }))
    .toEqual({ ...MIN_STARTUP_WINDOW, maximize: false })
})

it.each(['default', 'maximize', { width: 1280, height: 720 }] as const)('accepts the stored preference %o', (value) => {
  expect(parseDesktopStartupWindowSize(value)).toEqual(value)
})

it.each(['', 'fullscreen', null, [], {}, { width: 0, height: 720 }, { width: 1280 },
  { width: 1280.5, height: 720 }, { width: '1280', height: 720 }, { width: 99999, height: 720 }])(
  'rejects %o', (value) => {
    expect(parseDesktopStartupWindowSize(value)).toBeUndefined()
  })
