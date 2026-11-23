// 自己投資・目薬・裏市場・日雇いバイト・店員さんとの仲・実績の数値（仕様書 6.4・7.4・8章）
export type UpgKey = 'eye' | 'data' | 'body';
/** 自己投資。cost[l] は Lv l → l+1 の値段 */
export const UPG: Record<UpgKey, { n: string; max: number; cost: number[] }> = {
  eye: { n: '動体視力トレーニング', max: 5, cost: [20000, 80000, 180000, 320000, 500000] },
  data: { n: 'データ分析', max: 3, cost: [30000, 120000, 400000] },
  body: { n: '体力づくり', max: 3, cost: [15000, 60000, 135000] },
};
/** 動体視力1段階ごとに、リールがゆっくり見える割合 */
export const EYE_SLOW = 0.01;

/** 目薬（その日だけ） */
export const DROPS = { price: 1500, slow: 0.03 };

/** 裏市場の改造基盤 */
export const KIBAN = {
  /** 3日目から買える */
  openDay: 3,
  /** 値段 = price × (家の段階 + 1) */
  price: 50000,
  /** ボーナス確率の倍率 */
  boost: 1.4,
  /** 見つかる確率（%）= base + 見つかった回数 × step、最大 max */
  bustBase: 20, bustStep: 10, bustMax: 60,
  /** ルーレットのマス数 */
  segs: 10,
  /** 罰金 = 所持金 × fineRate（最低 fineMin） */
  fineRate: 0.3, fineMin: 50000,
  banDays: 5,
  friendCut: 40,
  funCut: 20,
};

/** 日雇いバイト（検品ライン） */
export const JOB = {
  boxes: 30,
  /** 不良品の割合 */
  bad: 0.22,
  base: 1500, perBox: 160, perMiss: 200, min: 1000,
  /** 実績「検品のプロ」で増える倍率 */
  proBonus: 1.1,
  effect: { hun: -25, hp: -12, fun: -10 },
};

/** 店員さんとの仲（0〜100） */
export const FRIEND = {
  start: 10, visit: 2, gift: 8,
  /** 仲がこの値以上で、もらえる情報が増える（傾向・割合・台ごと） */
  tiers: [30, 60, 90],
};

/** 天井の割合がこれ以上の台は金色に光る */
export const HOT_CEIL = 0.6;

/** 実績の条件とごほうびの数値 */
export const ACH_NUM = {
  first: 3000, ceil: 10000, ticket1: 5000, six: 20000,
  /** ハイエナ：座ったときにこのゲーム数以上ハマっている */
  hyenaFrom: 400,
  /** ビタ職人：連続成功の回数と、ごほうびの増える枚数 */
  bitaRun: 10, bitaPlus: 2,
  /** 大勝ち：1日の勝ちと、ごほうびの娯楽 */
  winDay: 50000, winFun: 20,
  /** ボロアパートから一戸建て：寝たときの体調回復 */
  houseSleep: 5,
};
