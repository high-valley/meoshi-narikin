// 打つ画面の台（仕様書 9.9）。台を画面いっぱいに出し、台の絵の上に液晶・リール・カウンター・ボタンを重ねる。
// 位置と大きさは台に対する %（x・y は左上、w・h は幅・高さ）。値は台の絵の緑の窓から scripts/cut-cabinet.py で読み取ったもの。
// リールを大きく見せるため、台の絵は液晶の窓の真ん中を詰め、その分リールの帯を縦に伸ばしてある

export interface Box { x: number; y: number; w: number; h: number }

/** 台の縦横比（横 / 縦）。台の絵（941×1672）に合わせる */
export const CAB_ASPECT = 941 / 1672;
/** 台全体の絵（public/cabinet/ のファイル名、窓は透明に切り抜いたもの）。空なら部品の絵と CSS で描く */
export const CAB_ART = 'cabinet.webp';

export const CAB_BOXES: { name: Box; stats: Box; lcd: Box; reels: Box; meter: Box; over: Box } = {
  /** 上の金の名札（機種名を重ねる） */
  name: { x: 24, y: 2.7, w: 52, h: 6.3 },
  /** データカウンターの4つの窓をまとめた範囲 */
  stats: { x: 14.1, y: 15.3, w: 71.8, h: 3.9 },
  lcd: { x: 12.5, y: 22.8, w: 74.9, h: 13.0 },
  /** リールの3つの窓をまとめた範囲 */
  reels: { x: 15.9, y: 41.9, w: 68.2, h: 19.5 },
  /** 下の赤い板（持ちメダルと収支を出す） */
  meter: { x: 17, y: 85.6, w: 66, h: 7.4 },
  /** 扉・3択を出す場所（レバーとストップボタンの代わり） */
  over: { x: 4, y: 63.5, w: 92, h: 21.5 },
};
/** カウンターの窓どうし・リールの窓どうしのすき間（台の幅に対する %） */
export const STATS_GAP = 4.1;
export const REELS_GAP = 2.6;
/** ストップボタンの丸の中心（x・y）と直径（d、台の幅に対する %） */
export const CAB_STOPS: { x: number; y: number; d: number }[] = [
  { x: 37.5, y: 74, d: 11.5 },
  { x: 56.3, y: 74, d: 11.5 },
  { x: 75.2, y: 74, d: 11.5 },
];
/** ストップボタンの押せる範囲（丸の直径に対する倍率）。押しやすさのため丸より広くとるが、隣と重ならない大きさ（間隔÷直径 ≒ 1.6 より小さく） */
export const STOP_HIT = 1.4;
/** レバーの受け（台に対して垂直に刺さったレバーの根元）の中心と直径（台の幅に対する %） */
export const CAB_LEVER = { x: 10.1, y: 72.7, d: 14 };
/**
 * レバーの絵（public/cabinet/、正面から見た赤い玉と根元の輪）。空なら CSS で描く。
 * w：絵の幅（台の幅に対する %）、cx・cy：絵の中の根元の輪の中心（絵に対する割合）、ar：絵の縦÷横
 */
export const LEVER_ART = { file: 'lever-front.webp', w: 13, cx: 0.509, cy: 0.202, ar: 1070 / 690 };
/** レバーの押せる範囲（受けの直径に対する倍率） */
export const LEVER_HIT = 1.45;
/** レバーを叩いたときに下へ動く量（受けの直径に対する %）と、戻るまでの時間（ミリ秒） */
export const LEVER_DIP = 16;
export const LEVER_MS = 340;
