// 部屋（仕様書 7.2・9.8）。家ごとの劇画風の背景と、家具ごとに決まった置き場所
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
  shelf: 640 / 359, plant: 640 / 361, fridge: 640 / 330, sofa: 287 / 640, tank: 640 / 545, mchair: 640 / 591,
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


/**
 * 部屋ごとの家具レイアウト。背景は同じ4:3でも、壁・床の境目や奥行きが異なるため
 * 家ごとに接地点を調整する。値は [家具の中央 x%, 床の接地点 y%]。
 * 家が大きくなるほど同じ家具は画面内で小さく見えるようにする。
 */
export const ROOM_ANCHORS: Array<Record<string, [number, number]>> = [
  {
    shelf: [11, 77], fridge: [24, 79], tv: [38, 79], bigtv: [56, 79],
    tank: [78, 79], plant: [94, 79], game: [24, 89],
    sofa: [49, 98], bed: [84, 99], mchair: [10, 99],
  },
  {
    shelf: [12, 77], fridge: [25, 78], tv: [39, 79], bigtv: [56, 79],
    tank: [79, 78], plant: [93, 77], game: [25, 89],
    sofa: [49, 98], bed: [84, 99], mchair: [10, 99],
  },
  {
    shelf: [12, 75], fridge: [25, 77], tv: [39, 78], bigtv: [57, 78],
    tank: [79, 77], plant: [93, 77], game: [26, 88],
    sofa: [49, 98], bed: [84, 99], mchair: [10, 99],
  },
  {
    shelf: [12, 76], fridge: [25, 77], tv: [39, 78], bigtv: [58, 78],
    tank: [80, 78], plant: [94, 77], game: [26, 89],
    sofa: [49, 98], bed: [84, 99], mchair: [10, 99],
  },
  {
    shelf: [12, 75], fridge: [25, 77], tv: [39, 78], bigtv: [57, 78],
    tank: [80, 78], plant: [94, 77], game: [26, 89],
    sofa: [49, 98], bed: [84, 99], mchair: [10, 99],
  },
];

/** 部屋が広くなるにつれて家具を少し小さくし、床面の余白を残す。 */
export const ROOM_SCALES = [1.03, 1, 0.94, 0.88, 0.82];
export const PLAYER_SPOTS = [
  { x: 67, y: 89, w: 8 },
  { x: 68, y: 89, w: 8 },
  { x: 69, y: 90, w: 7.5 },
  { x: 70, y: 90, w: 7.1 },
  { x: 70, y: 90, w: 6.8 },
];

/** 元画像の比率に合わせた、住居別の家具の表示サイズと足元の位置。 */
export function roomSlot(home: number, id: string): { x: number; y: number; w: number } | null {
  const key = SLOT_OF[id] || id;
  const origin = SLOTS[key];
  if (!origin) return null;
  const tier = Math.max(0, Math.min(ROOM_ANCHORS.length - 1, Math.floor(home) || 0));
  const anchor = ROOM_ANCHORS[tier][key] || [origin.x, origin.y];
  return {
    x: anchor[0],
    y: anchor[1],
    w: (FURNITURE_W[id] || origin.w) * ROOM_SCALES[tier],
  };
}

export function roomPlayerSpot(home: number) {
  return PLAYER_SPOTS[Math.max(0, Math.min(PLAYER_SPOTS.length - 1, Math.floor(home) || 0))];
}
