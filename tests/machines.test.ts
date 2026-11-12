import { describe, expect, it } from 'vitest';
import { MACH, CEIL } from '../src/data/machines';
import { roll, pickSetting, isEvent, atRoll } from '../src/game/machines';
import { dailyEffects } from '../src/game/life';
import { rng } from './helpers';

describe('抽選', () => {
  it('BIG確率は設定が上がるほど良く、計算どおりに出る', () => {
    for (const m of Object.values(MACH)) {
      expect(m.big(6)).toBeGreaterThan(m.big(1));
      const r = rng(7), n = 200000;
      let big = 0;
      for (let i = 0; i < n; i++) if (roll(m, 6, r()) === 'BIG') big++;
      expect(Math.abs(big / n - m.big(6))).toBeLessThan(m.big(6) * 0.15);
    }
  });
  it('スイカは福招きだけ', () => {
    const r = rng(8);
    for (let i = 0; i < 50000; i++) {
      expect(roll(MACH.sanj, 3, r())).not.toBe('WM');
      expect(roll(MACH.hachi, 3, r())).not.toBe('WM');
    }
  });
  it('侍ラッシュ中はベルが多い', () => {
    expect(atRoll(0)).toBe('BL');
    expect(atRoll(0.99)).toBe(null);
  });
  it('設定の出方とイベント日', () => {
    expect(pickSetting(0, false)).toBe(1);
    expect(pickSetting(0.9999, false)).toBe(6);
    expect(pickSetting(0.5, true)).toBeGreaterThan(pickSetting(0.5, false));
    expect([7, 17, 27].every(isEvent)).toBe(true);
    expect(isEvent(10)).toBe(false);
    expect(CEIL.fuku).toBe(800);
  });
});

describe('生活', () => {
  it('寝具は一番良いものだけ、冷蔵庫は最大20', () => {
    const e = dailyEffects([{ id: 'futon' }, { id: 'bed' }, { id: 'fridge' }, { id: 'fridge' }, { id: 'fridge' }, { id: 'tv' }], 1, 5);
    expect(e.sleep).toBe(15 + 5 + 5);
    expect(e.keep).toBe(20);
    expect(e.fun).toBe(6);
  });
});
