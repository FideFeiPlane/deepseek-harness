---
description: "在通用设置中选择桌面端启动时的窗口大小。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-window

[English](README.md) | 中文

## 概述

在**设置 → 通用**里的**打开时的窗口大小**中选择桌面端主窗口下次启动时的尺寸。该行只在桌面端出现，因为浏览器没有需要设定大小的应用窗口；选择按设备保存在桌面壳的配置文件里，在主窗口创建时应用。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与暂缓事项](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

选择**默认**、某个固定尺寸，或**最大化**。改动立即保存，但下次启动才生效：窗口此刻已经存在，实时改变它的尺寸会与“打开时”这个语义相矛盾。小于显示器工作区的尺寸按所选值打开；大于工作区的尺寸按工作区收敛，且不小于窗口最小尺寸。

取值保存在 `userData/desktop/settings.json` 的 `window.startupSize` 中，与其他本地桌面设置放在一起。支持手工编辑该文件：`"default"`、`"maximize"`，或 `{"width": 1440, "height": 900}`；手工写入的自定义尺寸会在该行显示，但不在预设列表中。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

`apply` 注册一个 `settings.general.item` 行；当 `globalThis.dshDesktop.window` 不存在时（Web 端，或早于本行的 preload），它直接返回、不贡献任何内容。该行通过这个 preload 桥读写；校验、存储，以及在创建窗口时应用，都由 Electron 主进程负责，所以该行看不到路径与文件格式。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [桌面壳](../../../apps/desktop/README.zh.md) — 本地设置的归属与窗口创建。
- [设置表单](../ui-settings/README.zh.md) — 设置分区、标签页与通用行。
- [Web 客户端](../../../docs/subsystems/web-client.zh.md) — 插件组成与设置位置。

<a id="model-experience"></a>
## 模型体验

无。这是浏览器端偏好，只改变桌面端窗口几何。

#### KV Cache 影响

无；没有模型输入依赖它。

## 已知限制与暂缓事项

<a id="known-limitations-and-deferred-work"></a>

- 该偏好在下次启动生效，不作用于选择时已经打开的窗口。
- 桌面壳不保存窗口几何历史，因此从**最大化**改回其他选项得到的是默认尺寸，而不是上次的窗口尺寸。

<a id="dev-note"></a>
### 开发备注

无。
