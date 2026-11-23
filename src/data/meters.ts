// メーター（お腹・娯楽・体調）と寝たときの数値（仕様書 3章）
/** はじめの状態 */
export const START = { money: 30000, hun: 70, fun: 50, hp: 80 };

/** 打っている間のメーターの変わり方。every は「何ゲームごとに」 */
export const PLAY_DRAIN = {
  hunEvery: 12,
  hpEvery: 20,
  funEvery: 15,
  /** お腹が0のとき、さらに体調が減る間隔 */
  starveEvery: 5,
  /** 体力づくり1段階ごとに減りを抑える割合 */
  bodyCut: 0.1,
};

/** 打っている間に娯楽が増える量（ボーナス・ラッシュ・扉チャンスの終わり） */
export const PLAY_FUN = { big: 6, reg: 3, rush: 6, doorWin: 12, doorLose: 4 };

/** ゲージがこれ未満で「低い」（赤く出す・目押しに影響する） */
export const LOW = 25;
/** お腹が LOW 未満のとき、リールがこの倍率で速く見える */
export const HUNGRY_SPEED = 1.12;
/** 体調が LOW 未満のときに引き込めるコマ数（蹴りはいつもの4コマのまま） */
export const WEAK_SLIP = 2;

/** 体調0でホールで倒れたとき */
export const COLLAPSE = { fee: 20000, hp: 30 };

/** 寝たとき */
export const SLEEP = {
  hun: 25,
  fun: -8,
  /** 体調の回復の基本（寝具・家・家具に足す） */
  rest: 10,
  /** 娯楽がこれ未満なら回復は半分 */
  lowFun: 20,
  /** お腹がこれ未満なら回復から hungryCut を引く */
  lowHun: 10,
  hungryCut: 10,
};

/** 引っ越したときに増える娯楽 */
export const MOVE_FUN = 20;
