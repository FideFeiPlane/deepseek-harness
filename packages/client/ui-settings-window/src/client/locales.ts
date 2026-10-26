/** Copy dictionaries for the Desktop startup window size row. */

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  title: '打开时的窗口大小',
  description: '下次启动桌面端时生效。',
  sizeDefault: '默认大小（1280 × 820）',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: '最大化',
  sizeCustom: '自定义大小',
  displayScale: '本机显示缩放 {scale}%，窗口尺寸按逻辑像素计算。',
  writeFailed: '没能保存这次改动，请重试。',
  loading: '正在读取…',
} satisfies Record<string, string>

/** Startup window size locale key union. */
export type WindowSizeLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  title: 'Window size on open',
  description: 'Applies the next time the desktop app starts.',
  sizeDefault: 'Default (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Maximized',
  sizeCustom: 'Custom size',
  displayScale: 'This display is scaled to {scale}%; sizes are logical pixels.',
  writeFailed: 'The change could not be saved. Try again.',
  loading: 'Reading…',
} satisfies Record<WindowSizeLocaleKey, string>

/** Japanese dictionary checked against the Chinese key set. */
export const ja = {
  title: '起動時のウィンドウサイズ',
  description: '次回デスクトップアプリを起動したときに反映されます。',
  sizeDefault: '既定（1280 × 820）',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: '最大化',
  sizeCustom: 'カスタムサイズ',
  displayScale: 'このディスプレイは {scale}% に拡大されています。サイズは論理ピクセルです。',
  writeFailed: '変更を保存できませんでした。もう一度お試しください。',
  loading: '読み込み中…',
} satisfies Record<WindowSizeLocaleKey, string>

/** Spanish dictionary checked against the Chinese key set. */
export const es = {
  title: 'Tamaño de la ventana al abrir',
  description: 'Se aplica la próxima vez que se inicie la aplicación de escritorio.',
  sizeDefault: 'Predeterminado (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Maximizada',
  sizeCustom: 'Tamaño personalizado',
  displayScale: 'Esta pantalla tiene un escalado del {scale}%; los tamaños son píxeles lógicos.',
  writeFailed: 'No se pudo guardar el cambio. Inténtalo de nuevo.',
  loading: 'Cargando…',
} satisfies Record<WindowSizeLocaleKey, string>

/** French dictionary checked against the Chinese key set. */
export const fr = {
  title: 'Taille de la fenêtre à l’ouverture',
  description: 'S’applique au prochain démarrage de l’application de bureau.',
  sizeDefault: 'Par défaut (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Agrandie',
  sizeCustom: 'Taille personnalisée',
  displayScale: 'Cet écran est à l’échelle {scale} % ; les tailles sont en pixels logiques.',
  writeFailed: 'La modification n’a pas pu être enregistrée. Réessayez.',
  loading: 'Chargement…',
} satisfies Record<WindowSizeLocaleKey, string>

/** German dictionary checked against the Chinese key set. */
export const de = {
  title: 'Fenstergröße beim Öffnen',
  description: 'Gilt beim nächsten Start der Desktop-App.',
  sizeDefault: 'Standard (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Maximiert',
  sizeCustom: 'Benutzerdefinierte Größe',
  displayScale: 'Dieser Bildschirm ist auf {scale} % skaliert; Größen sind logische Pixel.',
  writeFailed: 'Die Änderung konnte nicht gespeichert werden. Versuchen Sie es erneut.',
  loading: 'Wird gelesen…',
} satisfies Record<WindowSizeLocaleKey, string>

/** Russian dictionary checked against the Chinese key set. */
export const ru = {
  title: 'Размер окна при открытии',
  description: 'Применяется при следующем запуске приложения для компьютера.',
  sizeDefault: 'По умолчанию (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Развёрнуто',
  sizeCustom: 'Свой размер',
  displayScale: 'Масштаб экрана — {scale}%; размеры заданы в логических пикселях.',
  writeFailed: 'Не удалось сохранить изменение. Повторите попытку.',
  loading: 'Чтение…',
} satisfies Record<WindowSizeLocaleKey, string>

/** Portuguese dictionary checked against the Chinese key set. */
export const pt = {
  title: 'Tamanho da janela ao abrir',
  description: 'Aplica-se na próxima vez que o aplicativo para desktop iniciar.',
  sizeDefault: 'Padrão (1280 × 820)',
  sizeXga: '1366 × 768',
  sizeWxga: '1440 × 900',
  sizeHdplus: '1600 × 900',
  sizeFhd: '1920 × 1080',
  sizeQhd: '2560 × 1440',
  sizeMaximize: 'Maximizada',
  sizeCustom: 'Tamanho personalizado',
  displayScale: 'Esta tela está em escala de {scale}%; os tamanhos são pixels lógicos.',
  writeFailed: 'Não foi possível salvar a alteração. Tente novamente.',
  loading: 'Carregando…',
} satisfies Record<WindowSizeLocaleKey, string>
