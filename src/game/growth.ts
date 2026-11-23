// 自己投資・裏市場・バイト・メーターの計算（仕様書 3章・7.4・8章）。画面に依存しない
import { UPG, EYE_SLOW, DROPS, KIBAN, JOB, type UpgKey } from '../data/growth';
import { HUNGRY_SPEED, LOW, WEAK_SLIP, SLEEP } from '../data/meters';
import { MAX_SLIP } from '../data/reels';

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/** 自己投資を Lv l から1つ上げる値段。最大なら 0 */
export function upgCost(k: UpgKey, l: number) { return l >= UPG[k].max ? 0 : UPG[k].cost[l]; }

/** リールの見える速さの倍率（お腹・動体視力・目薬） */
export function speedMul(hun: number, eye: number, drops: boolean) {
  return (hun < LOW ? HUNGRY_SPEED : 1) * (1 - EYE_SLOW * eye) * (drops ? 1 - DROPS.slow : 1);
}

/** 狙った図柄を引き込めるコマ数（体調） */
export function maxSlip(hp: number) { return hp < LOW ? WEAK_SLIP : MAX_SLIP; }

/** 改造基盤の値段 */
export function kibanPrice(home: number) { return KIBAN.price * (1 + home); }
/** 改造基盤が見つかる確率（%） */
export function bustRate(conv: number) { return Math.min(KIBAN.bustMax, KIBAN.bustBase + conv * KIBAN.bustStep); }
/** 見つかったときの罰金 */
export function kibanFine(money: number) { return Math.max(KIBAN.fineMin, Math.round(money * KIBAN.fineRate)); }

/** バイト代。pro は実績「検品のプロ」 */
export function jobPay(good: number, miss: number, pro = false) {
  const p = Math.max(JOB.min, JOB.base + good * JOB.perBox - miss * JOB.perMiss);
  return pro ? Math.round(p * JOB.proBonus) : p;
}

/** 寝たあとのメーター。ev は dailyEffects の結果 */
export function sleepMeters(m: { hun: number; fun: number; hp: number }, ev: { sleep: number; fun: number; hp: number; keep: number }) {
  const hun = clamp(m.hun - (SLEEP.hun - ev.keep)), fun = clamp(m.fun + SLEEP.fun + ev.fun);
  let rest = ev.sleep + ev.hp + SLEEP.rest;
  if (fun < SLEEP.lowFun) rest = Math.round(rest / 2);
  if (hun < SLEEP.lowHun) rest -= SLEEP.hungryCut;
  return { hun, fun, hp: clamp(m.hp + rest) };
}
