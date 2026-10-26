---
description: "Choose the Desktop window size the shell opens with from General settings."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-window

English | [中文](README.zh.md)

## Summary

Use **Window size on open** in **Settings → General** to choose the size the Desktop app's main window uses the next time it starts. The row appears only under the Desktop shell, because a browser has no application window to size; the choice is stored per device in the shell settings file and applied when the main window is created.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Pick **Default**, a fixed size, or **Maximized**. The change is saved immediately but applies at the next launch: the window already exists, so resizing it live would contradict the setting's name. A size smaller than the display work area is kept as chosen; a larger one opens fitted to the work area, and the shell keeps its minimum window size.

The value lives in `userData/desktop/settings.json` as `window.startupSize`, next to the other local desktop settings. Editing that file by hand is supported: `"default"`, `"maximize"`, or `{"width": 1440, "height": 900}`; the row shows a custom size it does not offer as a preset.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation details — click to expand</summary>

`apply` registers one `settings.general.item` row and returns without contributing anything when `globalThis.dshDesktop.window` is absent (Web, or a preload older than this row). The row reads and writes through that preload bridge; the Electron main process owns validation, storage, and application at window creation, so the row never sees a path or a file format.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Desktop shell](../../../apps/desktop/README.md) — local settings ownership and window creation.
- [Settings forms](../ui-settings/README.md) — settings sections, tabs, and General rows.
- [Web Client](../../../docs/subsystems/web-client.md) — plugin composition and settings placement.

<a id="model-experience"></a>
## Model Experience

None, as this browser preference changes only the Desktop window geometry.

#### KV Cache effect

None; no model input depends on it.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- The preference applies at the next launch, not to the window that is open while a choice is made.
- The shell keeps no window geometry history, so switching away from **Maximized** returns to the default size rather than a remembered windowed size.

<a id="dev-note"></a>
### Dev Note

None.
