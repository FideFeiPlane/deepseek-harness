/**
 * Startup window size preference shared by the Desktop shell and the General
 * settings row that edits it. The shell applies the value when it creates the
 * main window, so a change takes effect at the next launch.
 */

/** How the Desktop shell sizes its main window when it opens. */
export type DesktopStartupWindowSize =
  | 'default'
  | 'maximize'
  | { readonly width: number; readonly height: number }

/** Product API the Electron preload exposes for the device-local window preference. */
export interface DesktopWindowPreferencesApi {
  /** @returns the stored preference; the shell applies it at the next launch. */
  startupSize(): Promise<DesktopStartupWindowSize>
  /**
   * Persist a new preference for the next launch.
   * @param size - requested startup size; the shell rejects values it cannot apply.
   * @returns the accepted preference.
   */
  setStartupSize(size: DesktopStartupWindowSize): Promise<DesktopStartupWindowSize>
}
