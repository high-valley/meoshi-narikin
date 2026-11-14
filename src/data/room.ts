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
  shelf: { x: 11, y: 74, w: 13 },
  fridge: { x: 24, y: 72, w: 9 },
  tv: { x: 36, y: 75, w: 10 },
  bigtv: { x: 50, y: 76, w: 17 },
  tank: { x: 76, y: 74, w: 14 },
  plant: { x: 92, y: 76, w: 8 },
  game: { x: 34, y: 86, w: 10 },
  sofa: { x: 50, y: 96, w: 24 },
  bed: { x: 83, y: 99, w: 26 },
  mchair: { x: 15, y: 99, w: 15 },
};
/** 主人公の立つ場所（同じく %） */
export const PLAYER_SPOT = { x: 66, y: 88, w: 5 };

/** 家具の絵（public/furniture/<id>.webp）があるもの。ないものは仮のドット絵を置く */
export const FURNITURE_IMAGES: string[] = [];
/** 家具の絵がまだないとき、仮のドット絵を置き場所の幅のこの割合で描く */
export const PLACEHOLDER_SCALE = 0.55;
