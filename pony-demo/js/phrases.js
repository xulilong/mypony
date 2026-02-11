// 吉祥话话术库
const PHRASES = {
  pat: [
    "马到成功，万事顺意～",
    "主人最棒，马上有福！",
    "龙马精神，主人天天开心！",
    "有我在，主人马上好运！",
    "主人今天真好看，马上有喜！",
    "跟着主人，马上事事赢！"
  ],
  groom: [
    "马上顺利，烦恼全消～",
    "梳理马毛好舒服，马上顺心～",
    "好好照顾我，马上如愿哦✨",
    "谢谢主人，马上暴富！",
    "马上发财，好运连连！",
    "吃得饱饱，马上没烦恼！"
  ],
  feed: [
    "小马吃得好香，谢谢你～",
    "马上发财，好运连连！",
    "谢谢主人，马上暴富！",
    "好好照顾我，马上如愿哦✨",
    "吃得饱饱，马上没烦恼！",
    "龙马精神，主人天天开心！"
  ]
};

class PhraseEngine {
  constructor() {
    this.history = { pat: [], groom: [], feed: [] };
  }

  getRandom(type) {
    const pool = PHRASES[type];
    if (!pool) return "";
    // 避免连续重复：如果历史记录达到一半，清空重来
    if (this.history[type].length >= Math.floor(pool.length / 2)) {
      this.history[type] = [];
    }
    const available = pool.filter(p => !this.history[type].includes(p));
    const phrase = available[Math.floor(Math.random() * available.length)];
    this.history[type].push(phrase);
    return phrase;
  }
}

export { PhraseEngine, PHRASES };
