// リールの停止制御（仕様書 4.3）。画面・DOM に依存しない
import { FRAME_MS, LINES, MAX_SLIP, N, SPIN_UP_MS, type Sym } from '../data/reels';

export interface Reel {
  strip: Sym[];
  pos: number;
  state: 'stop' | 'spin' | 'slide';
  speed: number;
  noSlip: boolean;
  /** 狙った図柄を引き込める最大コマ数（体調が悪いと2）。蹴りは常に MAX_SLIP */
  maxSlip?: number;
  p0?: number;
  t0?: number;
  final?: number;
  tEnd?: number;
  res?: StopResult | null;
  [k: string]: unknown;
}

export interface StopResult {
  hit: boolean;
  slip: number;
  row: number;
  bita: boolean;
  sym: Sym;
  /** 外したとき、何コマ早い（正）／遅い（負） */
  off: number;
}

export interface Win { n: number; sym: string }

export interface PressOpts {
  /** すでに止まっているリールの停止位置（止まっていなければ null） */
  done: (number | null)[];
  /** リールごとの狙い（7・7・BAR のようにリールで違うとき） */
  tgs?: (Sym | null)[] | null;
  /** 左リールに見せてはいけない図柄 */
  hide?: Sym[];
  /** 必ずそろえる役（ベル・リプレイ） */
  must?: Sym | null;
  /** そろってよい役 */
  ok: string[];
  /** 出してはいけないボーナスの形（右リールの図柄） */
  noBonusLine?: Sym[] | null;
  centerOnly?: boolean;
  /** 止まっているリールとのつながりを見ずに、狙いの図柄が見えれば当たりにする（八門の扉チャンス） */
  free?: boolean;
  last?: boolean;
}

export const mod = (a: number, n = N) => ((a % n) + n) % n;

export function makeReel(strip: Sym[], pos = 0): Reel {
  return { strip, pos, state: 'stop', speed: 1, noSlip: false, res: null };
}

/** 全速で回っているか（回り始めの加速が終わったか）。ストップボタンはこれから受け付ける */
export function atFullSpeed(r: Reel, t: number): boolean {
  return r.state === 'spin' && t - (r.t0 ?? 0) >= SPIN_UP_MS;
}

export function posAt(r: Reel, t: number): number {
  if (r.state === 'spin') {
    // 回り始めは SPIN_UP_MS かけて一定の加速で全速にする
    const dt = Math.max(0, t - (r.t0 ?? 0)), run = dt < SPIN_UP_MS ? dt * dt / (2 * SPIN_UP_MS) : dt - SPIN_UP_MS / 2;
    return (r.p0 ?? 0) + run / FRAME_MS * r.speed;
  }
  if (r.state === 'slide') return Math.min(r.final ?? 0, (r.p0 ?? 0) + (t - (r.t0 ?? 0)) / FRAME_MS * r.speed);
  return r.pos;
}

/** 停止位置 f のとき、段 row（0上段・1中段・2下段）に見える図柄 */
export function symAt(r: Pick<Reel, 'strip'>, f: number, row: number): Sym {
  return r.strip[mod(f + 1 - row)];
}

export function lineWins(fs: number[], rs: Pick<Reel, 'strip'>[]): Win[] {
  const out: Win[] = [];
  LINES.forEach((L, n) => {
    const a = symAt(rs[0], fs[0], L[0]);
    if (a === symAt(rs[1], fs[1], L[1]) && a === symAt(rs[2], fs[2], L[2])) out.push({ n, sym: a });
  });
  return out;
}

/** 7・7・右（右が R7 なら BIG、BAR なら REG）のライン */
export function bonusLines(fs: number[], rs: Pick<Reel, 'strip'>[], right: Sym): Win[] {
  const out: Win[] = [];
  LINES.forEach((L, n) => {
    if (symAt(rs[0], fs[0], L[0]) === 'R7' && symAt(rs[1], fs[1], L[1]) === 'R7' && symAt(rs[2], fs[2], L[2]) === right)
      out.push({ n, sym: right === 'BAR' ? 'REG' : 'BIG' });
  });
  return out;
}

/** 全リールが止まった画面が、当たっている役と食い違うか */
export function finalBad(fs: number[], rs: Pick<Reel, 'strip'>[], o: PressOpts): boolean {
  const lw = lineWins(fs, rs);
  if (o.must && !lw.some(w => w.sym === o.must)) return true;
  if (lw.some(w => !o.ok.includes(w.sym))) return true;
  return !!(o.noBonusLine && o.noBonusLine.some(x => bonusLines(fs, rs, x).length));
}

const hides = (r: Pick<Reel, 'strip'>, f: number, hide?: Sym[]) => !!hide && [0, 1, 2].some(row => hide.includes(symAt(r, f, row)));

/** 残りのリールをどのタイミングで押されても、食い違わずに止められる割合（先読み） */
export function finishShare(rs: Reel[], fs: (number | null)[], o: PressOpts, memo?: Map<string, number>): number {
  const un = [0, 1, 2].filter(j => fs[j] == null);
  const key = fs.join(',');
  if (memo?.has(key)) return memo.get(key)!;
  let tot = 0, okc = 0;
  for (const j of un) {
    const max = rs[j].noSlip ? 0 : MAX_SLIP;
    for (let b = 0; b < N; b++) {
      tot++;
      let best = 0;
      for (let s = 0; s <= max && best < 1; s++) {
        const f = mod(b + s);
        if (j === 0 && hides(rs[0], f, o.hide)) continue;
        const n = fs.slice(); n[j] = f;
        best = Math.max(best, un.length === 1 ? (finalBad(n as number[], rs, o) ? 0 : 1) : finishShare(rs, n, o, memo));
      }
      okc += best;
    }
  }
  const v = tot ? okc / tot : 1;
  memo?.set(key, v);
  return v;
}

/**
 * リール i を時刻 t に止める。狙いの図柄を、止まっているリールとラインがつながる段へ引き込み、
 * 残りのリールが食い違わずに止められる止め方を選ぶ。リールの状態（p0・t0・final・tEnd・state）を書き換える。
 * 全速で回っているとき（atFullSpeed）に呼ぶこと。加速中に呼ぶと、そこから全速で滑ってしまう
 */
export function pressL(rs: Reel[], i: number, t: number, target: Sym | null, o: PressOpts): StopResult {
  const r = rs[i], p = posAt(r, t), base = Math.ceil(p - 1e-9);
  const max = r.noSlip ? 0 : MAX_SLIP, pull = r.noSlip ? 0 : (r.maxSlip ?? MAX_SLIP);
  const cand: { s: number; f: number; rows: number[] }[] = [];
  for (let s = 0; s <= max; s++) {
    const f = base + s, rows: number[] = [];
    if (target && s <= pull)
      for (const row of (o.centerOnly ? [1] : [1, 0, 2]))
        if (symAt(r, f, row) === target && (o.free || LINES.some(L => L[i] === row && o.done.every((df, j) => j === i || df == null || symAt(rs[j], df, L[j]) === (o.tgs ? o.tgs[j] : target)))))
          rows.push(row);
    cand.push({ s, f, rows });
  }
  const good = cand.filter(c => c.rows.length), pool = good.length ? good : cand;
  const finals = (f: number) => o.done.map((d, j) => (j === i ? f : d)) as number[];
  const major = (c: { f: number }) => {
    if (i === 0 && hides(r, c.f, o.hide)) return true;
    return !!(o.last && o.noBonusLine && o.noBonusLine.some(x => bonusLines(finals(c.f), rs, x).length));
  };
  const memo = new Map<string, number>();
  const score = (c: { f: number }) => {
    if (o.last) return major(c) ? 0 : finalBad(finals(c.f), rs, o) ? 0.5 : 1;
    if (i === 0 && hides(r, c.f, o.hide)) return -1;
    const fs = o.done.slice(); fs[i] = mod(c.f);
    return finishShare(rs, fs, o, memo);
  };
  const rank = (list: typeof cand) => {
    let best = list[0], bs = -2;
    for (const c of list) { const v = score(c); if (v > bs + 1e-9) { bs = v; best = c; } }
    return [best, bs] as const;
  };
  let [pick, ps] = rank(pool);
  if (!good.length || ps <= 0) { const [p2, s2] = rank(cand); if (!good.length || s2 > ps) pick = p2; }
  const hit = pick.rows.length > 0, row = hit ? pick.rows[0] : 1;
  let off = 0;
  if (!hit && target) {
    let e = 99, l = 99;
    for (let k = 1; k <= 10; k++) {
      if (e === 99 && r.strip[mod(base + k)] === target) e = k;
      if (l === 99 && r.strip[mod(base - k)] === target) l = k;
    }
    off = e <= l ? e : -l;
  }
  r.p0 = p; r.t0 = t; r.final = pick.f; r.tEnd = t + (pick.f - p) * FRAME_MS / r.speed; r.state = 'slide';
  return { hit, slip: pick.s, row, bita: hit && pick.s === 0 && row === 1, sym: symAt(r, pick.f, 1), off };
}
