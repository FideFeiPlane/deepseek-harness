# Agent Note：桌面端启动窗口大小属于壳配置

Status: implemented

[English](2026-10-26-desktop-startup-window-size.md) | 中文

## 问题

桌面端主窗口固定以 1280 × 820 打开。壳不保存窗口几何信息，习惯最大化的用户每次启动都要重新最大化，也没有任何设置项能表达这个偏好。该偏好必须在 Electron 构造窗口时就可读，而那一刻早于 Host，也与任何 profile 无关。

## 决策

`userData/desktop/settings.json` 新增 `window.startupSize`，与已有的 `updates` 字段并列，遵循[壳配置决策](2026-10-08-desktop-shell-configuration.zh.md)：该值由 Electron 拥有，因为它在 Host 启动前构造窗口，而窗口尺寸属于设备而非 profile。

取值是 `"default"`、`"maximize"`，或显式的 `{ width, height }`。`apps/desktop/src/window-size.ts` 负责校验、按显示器工作区与窗口最小尺寸收敛，并给出是否需要最大化。`createWindow` 接收解析后的几何值，并在加载任何内容前最大化，使首帧即为目标尺寸；`enterWorkspace` 对进程重建的窗口再次应用最大化。

编辑入口是通用设置中仅桌面端出现的行，归 `@deepseek-ai/dsh-client-ui-settings-window` 所有。只有当 preload 暴露 `dshDesktop.window` 时才注册 `settings.general.item`，浏览器不会为一个它并不拥有的窗口显示该行。写入通过有类型的 preload API（`DESKTOP_IPC.windowStartupSizeGet`/`Set`）完成，主进程原子地重写文档并保留它不认识的字段。

## 考虑过的替代方案

**把偏好存进 Cordis 配置。** 窗口先于 Host 解析配置而存在，Electron 要么推迟窗口创建直到 Host 启动，要么复制配置求值，而壳配置决策已否决后者。

**持久化并恢复上次窗口几何。** 这是更大的行为承诺：需要按显示器记账、处理显示器消失，以及最大化与非最大化边界的规则。用户要的是事先选择的尺寸，不是恢复上一会话。

**把该行放进插件自己的配置页。** 那会把桌面窗口放到「插件」设置里，离开用户要求的通用设置面，而且同样需要这套 preload API。

## 影响

该偏好在下次启动生效，也作用于进程重建的窗口；修改它从不会改变用户当前正在看的窗口。手工编辑的自定义尺寸会被接受并显示为自定义值；切换到预设会替换它，且不记得之前的尺寸。文件无法解析时写入会失败而不是丢弃内容，因此该行能报告一个用户可自行修文件解决的失败。
