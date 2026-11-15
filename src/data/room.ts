// 部屋（仕様書 7.2・9.8）。家ごとのアニメ調の背景と、家具ごとに決まった置き場所
/** 家ごとの部屋の背景（public/rooms/） */
export const ROOM_IMAGES = ['room0.webp', 'room1.webp', 'room2.webp', 'room3.webp', 'room4.webp'];

/** 同じ置き場所を使う家具（寝具は効果も一番良いものだけなので、置き場所も1つ）。ほかは家具ごとに置き場所がある */
export const SLOT_OF: Record<string, string> = { futon: 'bed', bed: 'bed', lbed: 'bed' };
/** 部屋の絵の縦横比（横 / 縦）。SLOTS の % はこの比の絵に合わせてある */
export const ROOM_ASPECT = 4 / 3;

/**
 * 置き場所。x は家具の横の中心、y は家具の下の端（床に接するところ）、w は家具の幅。どれも部屋の絵に対する %。
 * 奥（y が小さい）から順に描くので、手前の家具が奥の家具に重なる
 */
export const SLOTS: Record<string, { x: number; y: number; w: number }> = {
  shelf: { x: 11, y: 72, w: 12 },
  fridge: { x: 23, y: 71, w: 9 },
  tv: { x: 36, y: 72, w: 13 },
  bigtv: { x: 56, y: 73, w: 26 },
  tank: { x: 79, y: 73, w: 15 },
  plant: { x: 93, y: 74, w: 9 },
  game: { x: 27, y: 87, w: 12 },
  sofa: { x: 50, y: 98, w: 30 },
  bed: { x: 84, y: 99, w: 26 }, // 幅は寝具ごとの FURNITURE_W を使う（ないときの既定値）
  mchair: { x: 11, y: 99, w: 17 },
};
/** 主人公の立つ場所（同じく %） */
export const PLAYER_SPOT = { x: 67, y: 88, w: 8 };
/** 主人公の絵（public/rooms/）と、その縦横比（縦 / 横） */
export const PLAYER_IMAGE = 'hero.webp';
export const PLAYER_ASPECT = 900 / 296;

/**
 * 家具の絵（public/furniture/<id>.webp）の縦横比（縦 / 横）。絵の読み込み前でも、置き場所の大きさと押せる範囲が決まるように持っておく。
 * ここにない家具は仮のドット絵を置く
 */
export const FURNITURE_ASPECT: Record<string, number> = {
  futon: 435 / 640, bed: 640 / 582, lbed: 451 / 640, tv: 607 / 640, bigtv: 423 / 640, game: 439 / 640,
  shelf: 640 / 359, plant: 640 / 391, fridge: 640 / 330, sofa: 287 / 640, tank: 640 / 545, mchair: 640 / 591,
};
/** 置き場所の幅（SLOTS の w）と違う幅で置く家具（寝具は同じ置き場所でも絵の形が違うため） */
export const FURNITURE_W: Record<string, number> = { futon: 27, bed: 24, lbed: 30 };
export const FURNITURE_IMAGES = Object.keys(FURNITURE_ASPECT);
/** 押した点に絵があるか調べるとき、絵をこの幅まで縮めて透明度を読む（px） */
export const HIT_SAMPLE_W = 160;
/** 透明度（0〜255）がこれより大きければ、絵が描かれているとみなす */
export const HIT_ALPHA = 40;
/** 絵のない家具を足したとき、仮のドット絵を置き場所の幅のこの割合で描く */
export const PLACEHOLDER_SCALE = 0.55;
