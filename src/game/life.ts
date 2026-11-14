// 生活の計算（仕様書 3章・7章）
import { HOMES, ITEMS } from '../data/life';

/**
 * 置いた家具を、決まった置き場所の形（仕様書 9.8）に整える。古い保存データの読み込み用。
 * 同じ家具が重なっていれば1つにし、同じ置き場所（寝具）に2つ以上あれば一番良いもの（睡眠の効果が高いもの）を残す。
 * 外したものは back に入れて返す（持ち物に戻す）
 */
export function arrangePlaced(placed: { id: string }[], slotOf: Record<string, string>): { placed: { id: string }[]; back: string[] } {
  const ids = [...new Set(placed.map(p => p.id))], best = new Map<string, string>(), back: string[] = [];
  const score = (id: string) => ITEMS[id]?.sleep ?? 0;
  for (const id of ids) {
    const s = slotOf[id] ?? id, cur = best.get(s);
    if (cur === undefined) best.set(s, id);
    else if (score(id) > score(cur)) { back.push(cur); best.set(s, id); }
    else back.push(id);
  }
  const keep = new Set(best.values());
  return { placed: ids.filter(id => keep.has(id)).map(id => ({ id })), back };
}

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
