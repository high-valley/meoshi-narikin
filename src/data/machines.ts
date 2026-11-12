// 台の数値（仕様書 5章）。確率は設定 s（1〜6）の関数
export type Kind = 'fuku' | 'sanj' | 'hachi';

export interface Machine {
  n: string;
  kind: Kind;
  bell: number;
  big: (s: number) => number;
  reg?: (s: number) => number;
  /** チェリーにボーナスが重複している割合 */
  dup: number;
  desc: string;
  col: string;
}

export const MACH: Record<Kind, Machine> = {
  fuku: { n: '福招き', kind: 'fuku', bell: 1 / 7.5, big: s => 1 / (240 - 12 * s), reg: s => 1 / (340 - 12 * s), dup: 0.2, desc: 'BAR狙いでチェリーとスイカを拾う。BIG中は赤7のビタ押し', col: '#e3203f' },
  sanj: { n: '三択侍', kind: 'sanj', bell: 1 / 4, big: s => 1 / (300 - 17 * s), dup: 0.1, desc: '押し順ベルの3択。赤7でラッシュ、終了時の3択で継続', col: '#2a6fe0' },
  hachi: { n: '八門', kind: 'hachi', bell: 1 / 6, big: s => 1 / (275 - 18 * s), reg: s => 1 / (460 - 12 * s), dup: 0.1, desc: '荒い台。赤7で扉チャンス。ビタ押しで扉を減らし8択', col: '#2f9e44' },
};

export const REPLAY_P = 1 / 7.3;
export const CHERRY_P = { fuku: 1 / 28, other: 1 / 40 };
export const WATERMELON_P = 1 / 50;
export const AT_BELL_P = 1 / 1.3;

export const PAY = { RP: 3, BL: 8, BLok: 9, BLng: 1, CHf: 4, CHo: 2, WM: 12 };
export const BITA_OK = 32, BITA_NG = 15, REG_G = 6, REG_PAY = 15, BIG_G = 10, AT_G = 50, AT_ADD = 30, DOOR_WIN = 600, DOOR_LOSE = 150, ZEN_G = 3;

/** 天井（最後の当たりからこの回転数で必ずボーナス） */
export const CEIL: Record<Kind, number> = { fuku: 800, sanj: 700, hachi: 900 };

/** 設定1〜6の出方（%）。普段とイベント日 */
export const SETTING_WEIGHTS = { normal: [30, 25, 20, 12, 8, 5], event: [10, 14, 20, 22, 18, 16] };
