/** General Settings row for the Desktop startup window size. */
import { useEffect, useState } from 'react'
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DesktopStartupWindowSize, DesktopWindowPreferencesApi } from '../protocol.ts'
import type { WindowSizeLocaleKey } from './locales.ts'
import { matchingStartupPreset, STARTUP_SIZE_PRESETS, type StartupSizePreset } from './startup-size.ts'
import css from './StartupWindowSizeRow.module.css'

/** Registration-side face: the preload bridge that owns the preference. */
export interface StartupWindowSizeRowInjected {
  /** Desktop window preference API exposed by the Electron preload. */
  readonly window: DesktopWindowPreferencesApi
}

/** Full Settings-row props. */
export type StartupWindowSizeRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsLocale<'settings.startupWindow'>
  & InjectFace<StartupWindowSizeRowInjected>

const PRESET_LABEL: Record<StartupSizePreset['id'], WindowSizeLocaleKey> = {
  default: 'sizeDefault',
  xga: 'sizeXga',
  wxga: 'sizeWxga',
  hdplus: 'sizeHdplus',
  fhd: 'sizeFhd',
  qhd: 'sizeQhd',
  maximize: 'sizeMaximize',
}

/**
 * Percentage the system scales this display by.
 * @returns the percentage when it is not 100, otherwise undefined.
 */
function displayScale(): number | undefined {
  const ratio = globalThis.devicePixelRatio
  if (!(ratio > 0) || !Number.isFinite(ratio)) return undefined
  const percent = Math.round(ratio * 100)
  return percent === 100 ? undefined : percent
}

/**
 * Render the startup window size selector.
 * @param props - the preload bridge and localized copy.
 * @returns the preference row, or nothing before the stored value loads.
 */
export function StartupWindowSizeRow({ window: bridge, t }: StartupWindowSizeRowProps) {
  const [value, setValue] = useState<DesktopStartupWindowSize>()
  const [failure, setFailure] = useState<'read' | 'write'>()
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    void bridge.startupSize().then(
      (stored) => { if (!cancelled) setValue(stored) },
      () => { if (!cancelled) setFailure('read') },
    )
    return () => { cancelled = true }
  }, [bridge])

  const current = value === undefined ? undefined : matchingStartupPreset(value)
  const scale = displayScale()
  const label = ((): string => {
    if (value === undefined) return t('loading')
    if (current !== undefined) return t(PRESET_LABEL[current.id])
    return typeof value === 'string'
      ? t('sizeDefault')
      : `${t('sizeCustom')} (${String(value.width)} × ${String(value.height)})`
  })()

  const choose = (preset: StartupSizePreset): void => {
    setOpen(false)
    setBusy(true)
    setFailure(undefined)
    void bridge.setStartupSize(preset.size).then(
      (accepted) => { setValue(accepted); setBusy(false) },
      () => { setFailure('write'); setBusy(false) },
    )
  }

  return (
    <div className={css.row}>
      <div className={css.rowText}>
        <div className={css.title}>{t('title')}</div>
        {failure === undefined
          ? <div className={css.desc}>{t('description')}</div>
          : (
            <div className={`${css.desc} ${css.failure}`} role="status">
              {t(failure === 'read' ? 'readFailed' : 'writeFailed')}
            </div>
          )}
        {scale !== undefined && <div className={css.desc}>{t('displayScale', { scale })}</div>}
      </div>
      <Menu
        open={open}
        onClose={() => { setOpen(false) }}
        items={STARTUP_SIZE_PRESETS.map(preset => ({ id: preset.id, label: t(PRESET_LABEL[preset.id]) }))}
        selectedId={current?.id}
        onSelect={(id) => {
          const preset = STARTUP_SIZE_PRESETS.find(candidate => candidate.id === id)
          if (preset !== undefined) choose(preset)
        }}
        align="end"
        portal
        anchor={(
          <button
            type="button"
            className={css.selector}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={t('title')}
            disabled={busy || value === undefined}
            onClick={() => { setOpen(state => !state) }}
          >
            {label}
            <IconChevronDownOutlineRegular className={css.chevron} />
          </button>
        )}
      />
    </div>
  )
}
