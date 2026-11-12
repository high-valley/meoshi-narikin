import { makeReel, pressL, type Reel } from '../src/game/reels';
import { N, STRIPS, type Sym } from '../src/data/reels';

/** seed 付きの乱数（mulberry32） */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1ゲームを止めきる。order の順にランダムな時刻で押す */
export function playGame(r: () => number, order: number[], targets: (Sym | null)[], opt: { hide?: Sym[]; must?: Sym | null; ok: string[]; noBonusLine?: Sym[] | null; tgs?: (Sym | null)[] | null }) {
  const rs: Reel[] = STRIPS.map(s => makeReel(s));
  const done: (number | null)[] = [null, null, null];
  order.forEach((j, k) => {
    const p = r() * N;
    Object.assign(rs[j], { state: 'spin', p0: p, t0: 0, speed: 1 });
    pressL(rs, j, 0, targets[j], { ...opt, done: done.slice(), last: k === 2 });
    done[j] = rs[j].final!;
  });
  return { rs, fs: done as number[] };
}
