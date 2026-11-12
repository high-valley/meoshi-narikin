// 抽選（仕様書 5章）。乱数は呼び出し側が渡す（0以上1未満）
import { AT_BELL_P, CHERRY_P, REPLAY_P, SETTING_WEIGHTS, WATERMELON_P, type Machine } from '../data/machines';

export type Flag = 'BIG' | 'REG' | 'RP' | 'BL' | 'CH' | 'WM' | null;

export function roll(m: Machine, s: number, x: number): Flag {
  let p = m.big(s); if (x < p) return 'BIG';
  if (m.reg) { p += m.reg(s); if (x < p) return 'REG'; }
  p += REPLAY_P; if (x < p) return 'RP';
  p += m.bell; if (x < p) return 'BL';
  if (m.kind === 'fuku') {
    p += CHERRY_P.fuku; if (x < p) return 'CH';
    p += WATERMELON_P; if (x < p) return 'WM';
    return null;
  }
  p += CHERRY_P.other; if (x < p) return 'CH';
  return null;
}

/** 侍ラッシュ中の抽選 */
export function atRoll(x: number): Flag {
  return x < AT_BELL_P ? 'BL' : x < AT_BELL_P + REPLAY_P ? 'RP' : null;
}

export function pickSetting(x: number, ev: boolean): number {
  const w = ev ? SETTING_WEIGHTS.event : SETTING_WEIGHTS.normal;
  let a = 0;
  for (let i = 0; i < 6; i++) { a += w[i] / 100; if (x < a) return i + 1; }
  return 6;
}

/** 7のつく日がイベント日 */
export const isEvent = (day: number) => day % 10 === 7;
