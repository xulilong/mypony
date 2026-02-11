// 马年运势测试系统
const ZODIAC_SIGNS = [
  { id: "rat", name: "鼠", emoji: "🐭" },
  { id: "ox", name: "牛", emoji: "🐮" },
  { id: "tiger", name: "虎", emoji: "🐯" },
  { id: "rabbit", name: "兔", emoji: "🐰" },
  { id: "dragon", name: "龙", emoji: "🐲" },
  { id: "snake", name: "蛇", emoji: "🐍" },
  { id: "horse", name: "马", emoji: "🐴" },
  { id: "goat", name: "羊", emoji: "🐑" },
  { id: "monkey", name: "猴", emoji: "🐵" },
  { id: "rooster", name: "鸡", emoji: "🐔" },
  { id: "dog", name: "狗", emoji: "🐶" },
  { id: "pig", name: "猪", emoji: "🐷" }
];

const COLORS = [
  { id: "red", name: "红色", emoji: "❤️", trait: "热情" },
  { id: "blue", name: "蓝色", emoji: "💙", trait: "沉稳" },
  { id: "green", name: "绿色", emoji: "💚", trait: "温和" },
  { id: "yellow", name: "黄色", emoji: "💛", trait: "活泼" },
  { id: "purple", name: "紫色", emoji: "💜", trait: "神秘" },
  { id: "pink", name: "粉色", emoji: "🩷", trait: "浪漫" }
];

const PERSONALITIES = [
  { id: "active", name: "活力满满", emoji: "⚡", trait: "行动派" },
  { id: "calm", name: "佛系随缘", emoji: "🧘", trait: "淡定型" },
  { id: "social", name: "社交达人", emoji: "🎉", trait: "外向型" },
  { id: "quiet", name: "安静独处", emoji: "📖", trait: "内向型" }
];

const FORTUNE_TEMPLATES = {
  career: [
    "事业运势旺盛，贵人相助，马到成功！",
    "工作顺利，升职加薪指日可待！",
    "事业稳步上升，坚持就是胜利！",
    "职场如鱼得水，大展宏图！",
    "事业运平稳，脚踏实地最重要！"
  ],
  wealth: [
    "财运亨通，正财偏财两旺！",
    "财源滚滚，投资有道！",
    "财运稳健，开源节流为上！",
    "横财运佳，意外之财可期！",
    "财运平稳，理性消费最重要！"
  ],
  love: [
    "桃花运爆棚，真爱即将降临！",
    "感情甜蜜，有情人终成眷属！",
    "爱情运势平稳，珍惜眼前人！",
    "单身有望脱单，主动出击！",
    "感情需要经营，用心维护！"
  ],
  health: [
    "身体健康，精力充沛！",
    "健康运佳，注意劳逸结合！",
    "体质增强，适合运动健身！",
    "健康平稳，保持良好作息！",
    "注意养生，预防为主！"
  ]
};

const HORSE_TRAITS = {
  // 根据测试结果生成小马特质
  rat: { bodyHint: "灵巧", appearHint: "机敏", blessing: "鼠马相遇，智勇双全" },
  ox: { bodyHint: "稳健", appearHint: "踏实", blessing: "牛马精神，勤劳致富" },
  tiger: { bodyHint: "威武", appearHint: "勇猛", blessing: "虎马生威，所向披靡" },
  rabbit: { bodyHint: "温柔", appearHint: "优雅", blessing: "兔马相伴，温馨美满" },
  dragon: { bodyHint: "神骏", appearHint: "华丽", blessing: "龙马精神，飞黄腾达" },
  snake: { bodyHint: "灵动", appearHint: "神秘", blessing: "蛇马合璧，智慧无双" },
  horse: { bodyHint: "矫健", appearHint: "英姿", blessing: "本命年，马上有福" },
  goat: { bodyHint: "温顺", appearHint: "祥和", blessing: "羊马同行，吉祥如意" },
  monkey: { bodyHint: "活泼", appearHint: "机灵", blessing: "猴马相逢，聪明伶俐" },
  rooster: { bodyHint: "精神", appearHint: "亮丽", blessing: "鸡马齐鸣，前程似锦" },
  dog: { bodyHint: "忠诚", appearHint: "可靠", blessing: "狗马为伴，忠义双全" },
  pig: { bodyHint: "福气", appearHint: "圆满", blessing: "猪马同福，财源广进" }
};

class FortuneSystem {
  constructor() {
    this.result = null;
  }

  // 生成运势结果
  generate(zodiac, color, personality) {
    const zodiacData = ZODIAC_SIGNS.find(z => z.id === zodiac);
    const colorData = COLORS.find(c => c.id === color);
    const personalityData = PERSONALITIES.find(p => p.id === personality);
    const horseTrait = HORSE_TRAITS[zodiac];

    // 基于选择生成运势（伪随机但固定，同样选择得到同样结果）
    const seed = this.hashCode(zodiac + color + personality);
    const fortune = {
      zodiac: zodiacData,
      color: colorData,
      personality: personalityData,
      horseTrait,
      career: this.pickByHash(FORTUNE_TEMPLATES.career, seed),
      wealth: this.pickByHash(FORTUNE_TEMPLATES.wealth, seed + 1),
      love: this.pickByHash(FORTUNE_TEMPLATES.love, seed + 2),
      health: this.pickByHash(FORTUNE_TEMPLATES.health, seed + 3),
      luckyNumber: (seed % 9) + 1,
      luckyColor: colorData.name,
      score: 75 + (seed % 20) // 75-94分
    };

    this.result = fortune;
    return fortune;
  }

  // 简单哈希函数
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  pickByHash(arr, seed) {
    return arr[seed % arr.length];
  }

  // 生成专属小马名字
  generateHorseName(zodiac, personality) {
    const prefixes = {
      active: ["飞驰", "奔腾", "疾风", "闪电"],
      calm: ["悠然", "静心", "淡然", "从容"],
      social: ["欢乐", "热情", "阳光", "活力"],
      quiet: ["幽静", "安宁", "雅致", "清幽"]
    };
    const suffixes = ["小马", "驹", "宝", "儿"];
    const prefix = prefixes[personality][Math.floor(Math.random() * 4)];
    const suffix = suffixes[Math.floor(Math.random() * 4)];
    return prefix + suffix;
  }

  getResult() {
    return this.result;
  }
}

export { FortuneSystem, ZODIAC_SIGNS, COLORS, PERSONALITIES };
