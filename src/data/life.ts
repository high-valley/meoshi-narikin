// 生活のデータ（仕様書 7章）
export interface Home { n: string; d: string; rent: number; buy: number; move: number; sleep: number }
export interface Hall { n: string; d: string; reset: number; gift: number; rate: number; need: string; open?: (s: { peak: number; home: number }) => boolean }
export interface Shop { id: string; n: string; p: number; e: Partial<Record<'hun' | 'fun' | 'hp', number>> }
export interface Item { n: string; p: number; d: string; sleep?: number; fun?: number; hp?: number; keep?: number }

export const HOMES: Home[]=[
  {n:'ボロアパート',d:'築52年、6畳一間。隙間風が入る',rent:1000,buy:0,move:0,sleep:0},
  {n:'1Kアパート',d:'駅から徒歩12分。普通に住める',rent:3000,buy:0,move:50000,sleep:5},
  {n:'分譲マンション',d:'3LDK。家賃がいらなくなる',rent:0,buy:8000000,move:0,sleep:10},
  {n:'一戸建て',d:'庭つき。広いリビング',rent:0,buy:30000000,move:0,sleep:15},
  {n:'タワマン最上階',d:'夜景が一望できる',rent:0,buy:150000000,move:0,sleep:20}
];
/** reset：朝にハマりがリセットされる割合。gift：差し入れの値段 */
export const HALLS: Hall[]=[
  {n:'パーラー小銭',d:'近所の小さな店',reset:.45,gift:2000,rate:20,need:'最初から'},
  {n:'駅前メガホール',d:'台数の多い大型店',reset:.65,gift:5000,rate:100,need:'所持金50万円で解放',open:s=>s.peak>=500000},
  {n:'会員制サロン金鯱',d:'高レートの会員制',reset:.25,gift:20000,rate:1000,need:'分譲マンション以上に住むと解放',open:s=>s.home>=2}
];
export const FOODS: Shop[]=[
  {id:'cup',n:'カップ麺',p:200,e:{hun:25,hp:-2}},
  {id:'bento',n:'コンビニ弁当',p:600,e:{hun:40}},
  {id:'teish',n:'定食屋',p:1000,e:{hun:55,hp:3}},
  {id:'yaki',n:'焼肉',p:6000,e:{hun:80,fun:15}},
  {id:'sushi',n:'回らない寿司',p:30000,e:{hun:90,fun:25,hp:5}}
];
export const PLAYS: Shop[]=[
  {id:'drink',n:'栄養ドリンク',p:300,e:{hp:8}},
  {id:'manga',n:'漫画喫茶',p:1500,e:{fun:20}},
  {id:'kara',n:'カラオケ',p:3000,e:{fun:30,hun:-5}},
  {id:'seitai',n:'整体',p:5000,e:{hp:25}},
  {id:'onsen',n:'温泉',p:8000,e:{fun:20,hp:25}},
  {id:'trip',n:'海外旅行',p:200000,e:{fun:70,hp:30}}
];
/** 家具。寝具（sleep）は一番良いものだけ効く */
export const ITEMS: Record<string, Item>={
  futon:{n:'せんべい布団',p:0,sleep:5,d:'眠ると体調+5'},
  bed:{n:'ベッド',p:30000,sleep:15,d:'眠ると体調+15'},
  lbed:{n:'高級ベッド',p:300000,sleep:30,d:'眠ると体調+30'},
  tv:{n:'小型テレビ',p:15000,fun:6,d:'毎日 娯楽+6'},
  game:{n:'ゲーム機',p:40000,fun:10,d:'毎日 娯楽+10'},
  shelf:{n:'本棚',p:8000,fun:3,d:'毎日 娯楽+3'},
  plant:{n:'観葉植物',p:5000,hp:3,d:'毎日 体調+3'},
  fridge:{n:'冷蔵庫',p:25000,keep:10,d:'朝のお腹の減りが10少ない'},
  sofa:{n:'ソファ',p:60000,fun:5,hp:4,d:'毎日 娯楽+5 体調+4'},
  bigtv:{n:'大型テレビ',p:200000,fun:18,d:'毎日 娯楽+18'},
  tank:{n:'水槽',p:120000,fun:8,hp:3,d:'毎日 娯楽+8 体調+3'},
  mchair:{n:'マッサージチェア',p:250000,hp:12,d:'毎日 体調+12'}
};
