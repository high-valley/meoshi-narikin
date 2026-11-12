import { describe, expect, it } from 'vitest';
import { STRIPS, N, MAX_SLIP, LINES, type Sym } from '../src/data/reels';
import { bonusLines, lineWins, mod, symAt, type PressOpts } from '../src/game/reels';
import { playGame, rng } from './helpers';

const rs = STRIPS.map(strip => ({ strip }));
const leftShows = (fs: number[], syms: Sym[]) => [0, 1, 2].some(row => syms.includes(symAt(rs[0], fs[0], row)));

// 仕様書 4.3：順押しなら、どう押しても当たりと食い違わない止め方が必ずある
function solvableLeftFirst(o: PressOpts): boolean {
  const memo = new Map<string, boolean>();
  const bad = (fs: number[]) => {
    const lw = lineWins(fs, rs);
    if (o.must && !lw.some(w => w.sym === o.must)) return true;
    if (lw.some(w => !o.ok.includes(w.sym))) return true;
    return bonusLines(fs, rs, 'R7').length > 0 || bonusLines(fs, rs, 'BAR').length > 0;
  };
  const solve = (fs: (number | null)[]): boolean => {
    const un = [0, 1, 2].filter(j => fs[j] == null);
    if (!un.length) return !bad(fs as number[]);
    const k = fs.join(',');
    if (memo.has(k)) return memo.get(k)!;
    let ok = true;
    for (const j of un) {
      for (let b = 0; b < N && ok; b++) {
        let found = false;
        for (let s = 0; s <= MAX_SLIP && !found; s++) {
          const n = fs.slice(); n[j] = mod(b + s);
          if (solve(n)) found = true;
        }
        if (!found) ok = false;
      }
      if (!ok) break;
    }
    memo.set(k, ok);
    return ok;
  };
  for (let b = 0; b < N; b++) {
    let found = false;
    for (let s = 0; s <= MAX_SLIP && !found; s++) {
      const f = mod(b + s);
      if (o.hide && [0, 1, 2].some(row => o.hide!.includes(symAt(rs[0], f, row)))) continue;
      if (solve([f, null, null])) found = true;
    }
    if (!found) return false;
  }
  return true;
}

describe('リール配列', () => {
  it('21コマで、ベルとリプレイは5コマ以内の間隔', () => {
    for (const st of STRIPS) {
      expect(st.length).toBe(21);
      for (const sym of ['BL', 'RP'] as Sym[]) {
        const at = st.map((x, i) => (x === sym ? i : -1)).filter(i => i >= 0);
        at.forEach((v, i) => expect((at[(i + 1) % at.length] - v + 21) % 21 || 21).toBeLessThanOrEqual(5));
      }
    }
  });
  it('左のチェリーはBARの真下、赤7は左に2つ・中と右に1つ、右は赤7とBARが1か所にまとまる', () => {
    STRIPS[0].forEach((x, i) => { if (x === 'CH') expect(STRIPS[0][mod(i + 1)]).toBe('BAR'); });
    expect(STRIPS[0].filter(x => x === 'R7').length).toBe(2);
    for (const st of STRIPS.slice(1)) expect(st.filter(x => x === 'R7').length).toBe(1);
    expect(STRIPS[2].filter(x => x === 'BAR').length).toBe(1);
    STRIPS[2].forEach((x, i) => { if (x === 'R7') expect(STRIPS[2][mod(i + 2)]).toBe('BAR'); });
  });
});

describe('停止制御の約束（仕様書 4.3）', () => {
  const hide: Sym[] = ['CH', 'WM'];
  it('順押しなら、ハズレ・ベル・リプレイのどれでも食い違わない止め方がある', () => {
    expect(solvableLeftFirst({ done: [], ok: [], hide })).toBe(true);
    expect(solvableLeftFirst({ done: [], ok: ['BL'], must: 'BL', hide })).toBe(true);
    expect(solvableLeftFirst({ done: [], ok: ['RP'], must: 'RP', hide })).toBe(true);
  }, 120000);

  it('順押しで実際に押すと、ハズレは何もそろわず、ベル・リプレイは必ずそろう', () => {
    const r = rng(1);
    for (let g = 0; g < 150; g++) {
      const order = r() < 0.5 ? [0, 1, 2] : [0, 2, 1];
      const h = playGame(r, order, [null, null, null], { hide, ok: [], noBonusLine: ['R7', 'BAR'] });
      expect(lineWins(h.fs, h.rs)).toEqual([]);
      expect(leftShows(h.fs, hide)).toBe(false);
      for (const sym of ['BL', 'RP'] as Sym[]) {
        const g2 = playGame(r, order, [sym, sym, sym], { hide, ok: [sym], must: sym, noBonusLine: ['R7', 'BAR'] });
        expect(lineWins(g2.fs, g2.rs).map(w => w.sym)).toContain(sym);
        expect(lineWins(g2.fs, g2.rs).every(w => w.sym === sym)).toBe(true);
      }
    }
  }, 120000);

  it('押し順にかかわらず、スイカ以上でなければ左にスイカもチェリーも出さず、ボーナスの形も出さない', () => {
    const r = rng(2);
    for (let g = 0; g < 200; g++) {
      const order = [0, 1, 2].sort(() => r() - 0.5);
      const h = playGame(r, order, [null, null, null], { hide, ok: [], noBonusLine: ['R7', 'BAR'] });
      expect(leftShows(h.fs, hide)).toBe(false);
      expect(bonusLines(h.fs, h.rs, 'R7').length + bonusLines(h.fs, h.rs, 'BAR').length).toBe(0);
    }
  }, 120000);

  it('左と中で7のラインができていれば、右にはそろえられる押し位置が必ずある', () => {
    const lineOK = (fs: number[], right: Sym) => LINES.some(L => symAt(rs[0], fs[0], L[0]) === 'R7' && symAt(rs[1], fs[1], L[1]) === 'R7' && symAt(rs[2], fs[2], L[2]) === right);
    for (const right of ['R7', 'BAR'] as Sym[])
      for (let a = 0; a < N; a++) for (let c = 0; c < N; c++) {
        if (!LINES.some(L => symAt(rs[0], a, L[0]) === 'R7' && symAt(rs[1], c, L[1]) === 'R7')) continue;
        let hits = 0;
        for (let b = 0; b < N; b++) if ([0, 1, 2, 3, 4].some(s => lineOK([a, c, mod(b + s)], right))) hits++;
        expect(hits).toBeGreaterThan(0);
      }
  });

  it('ボーナスは 7・7・7（BIG）と 7・7・BAR（REG）でそろい、逆の形は出ない', () => {
    const r = rng(3);
    for (const bonus of ['BIG', 'REG'] as const) {
      const tgs: Sym[] = ['R7', 'R7', bonus === 'BIG' ? 'R7' : 'BAR'];
      for (let g = 0; g < 100; g++) {
        const h = playGame(r, [0, 1, 2], tgs, { tgs, hide: ['CH'], ok: bonus === 'BIG' ? ['BAR', 'R7'] : ['BAR'], noBonusLine: bonus === 'BIG' ? ['BAR'] : ['R7'] });
        expect(bonusLines(h.fs, h.rs, bonus === 'BIG' ? 'BAR' : 'R7')).toEqual([]);
      }
    }
  }, 120000);
});
