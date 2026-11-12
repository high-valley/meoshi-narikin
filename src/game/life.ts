// 生活の計算（仕様書 3章・7章）
import { HOMES, ITEMS } from '../data/life';

/** 置いた家具と家から、寝たときの効果を出す。houseBonus は実績「ボロアパートから一戸建て」の分 */
export function dailyEffects(placed: { id: string }[], home: number, houseBonus = 0) {
  let sleep = 0, fun = 0, hp = 0, keep = 0;
  for (const p of placed) {
    const it = ITEMS[p.id];
    if (!it) continue;
    if (it.sleep) sleep = Math.max(sleep, it.sleep);
    fun += it.fun || 0; hp += it.hp || 0; keep += it.keep || 0;
  }
  return { sleep: sleep + HOMES[home].sleep + houseBonus, fun, hp, keep: Math.min(20, keep) };
}
