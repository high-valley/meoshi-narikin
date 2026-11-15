// 打つ画面の台（仕様書 9.9）。台を画面いっぱいに出し、台の絵の上に液晶・リール・カウンター・ボタンを重ねる。
// 位置と大きさは台に対する %（x・y は左上、w・h は幅・高さ）。台全体の絵が届いたら、絵の緑の窓に合わせて差し替える

export interface Box { x: number; y: number; w: number; h: number }

/** 台の縦横比（横 / 縦） */
export const CAB_ASPECT = 9 / 16;
/** 台全体の絵（public/cabinet/ のファイル名）。空なら部品の絵と CSS で描く */
export const CAB_ART = '';

export const CAB_BOXES: { name: Box; stats: Box; lcd: Box; reels: Box; lever: Box; over: Box } = {
  name: { x: 15, y: 2.2, w: 70, h: 7 },
  stats: { x: 7.5, y: 10.5, w: 85, h: 6 },
  lcd: { x: 7.5, y: 18, w: 85, h: 21 },
  reels: { x: 7.5, y: 41, w: 85, h: 26 },
  lever: { x: 3.5, y: 68, w: 13, h: 15 },
  /** 扉・3択を出す場所（レバーとストップボタンの代わり） */
  over: { x: 5, y: 68, w: 90, h: 30 },
};
/** ストップボタンの丸の中心（x・y）と直径（d、台の幅に対する %） */
export const CAB_STOPS: { x: number; y: number; d: number }[] = [
  { x: 33, y: 76, d: 14 },
  { x: 51, y: 76, d: 14 },
  { x: 69, y: 76, d: 14 },
];
/** ストップボタンの押せる範囲（丸の直径に対する倍率）。押しやすさのため丸より広くとる */
export const STOP_HIT = 1.25; // 隣のボタンと重ならないよう、丸の間隔÷直径（18÷14）より小さく
