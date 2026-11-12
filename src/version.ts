// アプリの版（ビルドの印）。__BUILD_ID__ と __BUILD_TIME__ はビルドのときに vite.config.ts が埋め込む
declare const __BUILD_ID__: string | undefined;
declare const __BUILD_TIME__: string | undefined;

export interface BuildInfo {
  /** コミットの先頭7文字（手元のビルドは 'local'、開発中は 'dev'） */
  id: string;
  /** ビルドした日時（ISO 8601）。分からなければ空 */
  time: string;
}

export const CURRENT_BUILD: BuildInfo = {
  id: typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev',
  time: typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '',
};

/** 画面に出す版の文字（例：「2026/11/12 18:40 版（e73ec03）」） */
export function buildLabel(b: BuildInfo): string {
  if (!b.time) return `開発版（${b.id}）`;
  const d = new Date(b.time);
  if (Number.isNaN(d.getTime())) return b.id;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} 版（${b.id}）`;
}
