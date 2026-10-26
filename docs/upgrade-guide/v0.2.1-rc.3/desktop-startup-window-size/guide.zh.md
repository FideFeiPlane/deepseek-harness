---
kind: upgrade-guide
description: "桌面端把启动窗口大小存进壳配置，并在通用设置中提供选择。"
---

# 选择桌面端启动时的窗口大小

[English](guide.md) | 中文

## 变更

桌面端在创建主窗口时读取 `userData/desktop/settings.json` 中的 `window.startupSize`，并可在工作区显示前最大化。**设置 → 通用**新增**打开时的窗口大小**一行，来自新的 `@deepseek-ai/dsh-client-ui-settings-window` 包；桌面端 preload 的产品 API 新增 `window.startupSize()` 与 `window.setStartupSize(size)`，由两个新的 `DESKTOP_IPC` 通道支撑。

已有文件不会被重写：缺少或非法的 `window.startupSize` 按 `"default"`（1280 × 820）处理，与之前固定的窗口尺寸一致。该行仅在桌面壳中注册，浏览器组合不会出现新内容。

## 迁移

1. 有意替换内置通用设置分区的自定义客户端组合无需改动：当 `globalThis.dshDesktop?.window` 不存在时，该行不会注册。
2. 自行实现桌面产品 API 的自定义 preload 需要暴露 `window.startupSize()` 与 `window.setStartupSize(size)` 才能保留该行，或整体省略 `window`，该行保持隐藏。
3. 取值范围为 `"default"`、`"maximize"`，或 `{"width": <整数>, "height": <整数>}`。大于显示器工作区的尺寸按工作区收敛；任何一边都不低于 520 × 600。
4. 文件无法解析时，该行的写入会失败而不会覆盖原内容。修正文件后重启即可应用手工编辑的尺寸。

文件位置与完整字段语义见[桌面端参考](../../../../apps/desktop/README.zh.md#local-desktop-settings)。
