// 生活の計算（仕様書 3章・7章）
import { HOMES, ITEMS } from '../data/life';

/**
 * 置いた家具と家から、寝たときの効果を出す。houseBonus は実績「ボロアパートから一戸建て」の分。
 * 家具は1種類1つまで（仕様書 7.2）。前の版で同じ家具を複数置いたセーブでも、効果は種類ごとに1つ分
 */
export function dailyEffects(placed: { id: string }[], home: number, houseBonus = 0) {
  let sleep = 0, fun = 0, hp = 0, keep = 0;
  for (const id of new Set(placed.map(p => p.id))) {
    const it = ITEMS[id];
    if (!it) continue;
    if (it.sleep) sleep = Math.max(sleep, it.sleep);
    fun += it.fun || 0; hp += it.hp || 0; keep += it.keep || 0;
  }
  return { sleep: sleep + HOMES[home].sleep + houseBonus, fun, hp, keep };
}
