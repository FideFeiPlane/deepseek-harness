import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import * as fs from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it, onTestFinished, vi } from 'vitest'
import { readDesktopSettings, writeDesktopStartupSize } from '../src/settings.ts'

vi.mock('node:fs', async importOriginal => ({ ...await importOriginal<typeof import('node:fs')>() }))

beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { vi.restoreAllMocks() })

function fixture() {
  const userData = mkdtempSync(join(tmpdir(), 'dsh-desktop-settings-'))
  onTestFinished(() => { rmSync(userData, { recursive: true, force: true }) })
  const directory = join(userData, 'desktop')
  mkdirSync(directory)
  return { userData, path: join(directory, 'settings.json') }
}

it('creates a discoverable default file on first launch without touching other preferences', () => {
  const { userData, path } = fixture()
  rmSync(join(userData, 'desktop'), { recursive: true })
  writeFileSync(join(userData, 'keybindings.json'), 'existing shortcuts\n')
  expect(readDesktopSettings(userData)).toEqual({
    updates: { allowTestAuthPopupWindow: false },
    window: { startupSize: 'default' },
  })
  expect(readFileSync(path, 'utf8'))
    .toBe('{\n  "updates": {\n    "allowTestAuthPopupWindow": false\n  },\n  "window": {\n    "startupSize": "default"\n  }\n}\n')
  expect(readFileSync(join(userData, 'keybindings.json'), 'utf8')).toBe('existing shortcuts\n')
})

it.each(['{}', '{"updates": {}}', '{"other": 1, "updates": {"other": true}}'])('defaults an older document without rewriting it: %s', (raw) => {
  const { userData, path } = fixture()
  writeFileSync(path, raw)
  expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(false)
  expect(readDesktopSettings(userData).window.startupSize).toBe('default')
  expect(readFileSync(path, 'utf8')).toBe(raw)
})

it('loads explicit opt-in and opt-out on the next read without changing an earlier process snapshot', () => {
  const { userData, path } = fixture()
  for (const allow of [true, false]) {
    const raw = JSON.stringify({ updates: { allowTestAuthPopupWindow: allow }, custom: 'preserve' })
    writeFileSync(path, raw)
    expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(allow)
    expect(readFileSync(path, 'utf8')).toBe(raw)
  }
  const previous = readDesktopSettings(userData)
  writeFileSync(path, '{"updates":{"allowTestAuthPopupWindow":true}}')
  expect(previous.updates.allowTestAuthPopupWindow).toBe(false)
  expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(true)
})

it.each([
  ['"default"', 'default'],
  ['"maximize"', 'maximize'],
  ['{"width":1920,"height":1080}', { width: 1920, height: 1080 }],
] as const)('loads the stored startup size %s', (raw, expected) => {
  const { userData, path } = fixture()
  writeFileSync(path, `{"window":{"startupSize":${raw}}}`)
  expect(readDesktopSettings(userData).window.startupSize).toEqual(expected)
})

it.each(['', '{', 'null', '[]', '{"updates":null}', '{"updates":[]}',
  '{"updates":{"allowTestAuthPopupWindow":"false"}}', '{"updates":{"allowTestAuthPopupWindow":1}}',
  '{"updates":{"allowTestAuthPopupWindow":null}}', '{"window":null}', '{"window":[]}',
  '{"window":{"startupSize":"fullscreen"}}', '{"window":{"startupSize":{"width":0,"height":720}}}',
  '{"window":{"startupSize":{"width":1280}}}'])('reports invalid settings with their path and preserves the original: %s', (raw) => {
  const { userData, path } = fixture()
  writeFileSync(path, raw)
  const settings = readDesktopSettings(userData)
  expect(settings.updates.allowTestAuthPopupWindow).toBe(false)
  expect(settings.window.startupSize).toBe('default')
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(path), expect.any(Error))
  expect(readFileSync(path, 'utf8')).toBe(raw)
})

it('reports filesystem errors instead of replacing unreadable settings', () => {
  const { userData, path } = fixture()
  mkdirSync(path)
  expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(false)
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(path), expect.any(Error))
  expect(fs.statSync(path).isDirectory()).toBe(true)
})

it.each(['mkdirSync', 'writeFileSync'] as const)('continues with disabled popups when %s fails', (operation) => {
  const { userData, path } = fixture()
  const failure = Object.assign(new Error('settings creation denied'), { code: 'EACCES' })
  vi.spyOn(fs, operation).mockImplementation(() => { throw failure })
  expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(false)
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(path), failure)
})

it('continues with defaults even when warning output fails', () => {
  const { userData, path } = fixture()
  writeFileSync(path, '{')
  vi.mocked(console.warn).mockImplementation(() => { throw new Error('output unavailable') })
  expect(readDesktopSettings(userData).updates.allowTestAuthPopupWindow).toBe(false)
  expect(readFileSync(path, 'utf8')).toBe('{')
})

it('creates the document when the size is the first stored preference', async () => {
  const { userData, path } = fixture()
  rmSync(join(userData, 'desktop'), { recursive: true })
  await writeDesktopStartupSize(userData, 'maximize')
  expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual({ window: { startupSize: 'maximize' } })
  expect(readDesktopSettings(userData).window.startupSize).toBe('maximize')
  if (process.platform !== 'win32') expect(statSync(path).mode & 0o777).toBe(0o600)
})

it('keeps unknown fields and unrelated preferences while replacing the size', async () => {
  const { userData, path } = fixture()
  writeFileSync(path, JSON.stringify({
    updates: { allowTestAuthPopupWindow: true },
    custom: { nested: true },
    window: { startupSize: 'default', extra: 'keep' },
  }))
  await writeDesktopStartupSize(userData, { width: 1600, height: 900 })
  expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual({
    updates: { allowTestAuthPopupWindow: true },
    custom: { nested: true },
    window: { startupSize: { width: 1600, height: 900 }, extra: 'keep' },
  })
})

it('refuses to replace a document it cannot parse', async () => {
  const { userData, path } = fixture()
  writeFileSync(path, '{"window": {')
  await expect(writeDesktopStartupSize(userData, 'maximize')).rejects.toThrow()
  expect(readFileSync(path, 'utf8')).toBe('{"window": {')
})
