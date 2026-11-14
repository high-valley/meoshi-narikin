import { describe, expect, it } from 'vitest';
import { MACH, CEIL } from '../src/data/machines';
import { roll, pickSetting, isEvent, atRoll } from '../src/game/machines';
import { dailyEffects, arrangePlaced } from '../src/game/life';
import { SLOT_OF } from '../src/data/room';
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
  it('寝具は一番良いものだけ、同じ家具を複数置いても効果は1つ分', () => {
    const e = dailyEffects([{ id: 'futon' }, { id: 'bed' }, { id: 'fridge' }, { id: 'fridge' }, { id: 'fridge' }, { id: 'tv' }, { id: 'plant' }, { id: 'plant' }], 1, 5);
    expect(e.sleep).toBe(15 + 5 + 5);
    expect(e.keep).toBe(10);
    expect(e.fun).toBe(6);
    expect(e.hp).toBe(3);
  });

  it('古い保存データの家具を置き場所に整えると、一番良い寝具が残り、効果は下がらない', () => {
    const old = [{ id: 'lbed' }, { id: 'tv' }, { id: 'futon' }, { id: 'bigtv' }, { id: 'tv' }, { id: 'bed' }];
    const r = arrangePlaced(old, SLOT_OF);
    expect(r.placed.map(p => p.id)).toEqual(['lbed', 'tv', 'bigtv']);
    expect(r.back.sort()).toEqual(['bed', 'futon']);
    expect(dailyEffects(r.placed, 0)).toEqual(dailyEffects(old, 0));
  });
});
