// 装饰掉落与背包系统
const DECORATIONS = [
  // 基础装饰（高频）
  { id: "saddle_basic", name: "普通马鞍", category: "basic", rarity: 40, emoji: "🪑", color: "#8B4513" },
  { id: "rein_simple", name: "简单缰绳", category: "basic", rarity: 40, emoji: "🪢", color: "#DAA520" },
  { id: "wreath_flower", name: "小花环", category: "basic", rarity: 35, emoji: "💐", color: "#FF69B4" },

  // 特色装饰（中低频）
  { id: "hat_fortune", name: "财神帽", category: "special", rarity: 15, emoji: "🎩", color: "#FFD700" },
  { id: "cape_lucky", name: "吉祥披风", category: "special", rarity: 12, emoji: "🧣", color: "#FF4500" },
  { id: "wings_small", name: "小翅膀", category: "special", rarity: 10, emoji: "🪽", color: "#87CEEB" },
  { id: "horseshoe_glow", name: "发光马蹄铁", category: "special", rarity: 8, emoji: "🧲", color: "#FFD700" },

  // 限定装饰（极低概率）
  { id: "plate_success", name: "马到成功挂牌", category: "limited", rarity: 3, emoji: "🏅", color: "#FF6347" },
  { id: "saddle_gold", name: "金马鞍", category: "limited", rarity: 2, emoji: "👑", color: "#FFD700" }
];

class DecorationSystem {
  constructor() {
    this.bag = this.loadBag();
  }

  // 尝试掉落装饰
  tryDrop(hunger, happiness) {
    // 基础概率 10%-15%，属性越高概率越高
    const baseProb = 0.10;
    const bonus = ((hunger + happiness) / 200) * 0.10; // 最高额外10%
    const dropProb = baseProb + bonus;

    if (Math.random() > dropProb) return null;

    // 按 rarity 权重随机选择
    const totalWeight = DECORATIONS.reduce((sum, d) => sum + d.rarity, 0);
    let rand = Math.random() * totalWeight;
    for (const deco of DECORATIONS) {
      rand -= deco.rarity;
      if (rand <= 0) {
        this.addToBag(deco.id);
        return deco;
      }
    }
    return null;
  }

  addToBag(decoId) {
    if (!this.bag.includes(decoId)) {
      this.bag.push(decoId);
      this.saveBag();
    }
  }

  getBag() {
    return this.bag.map(id => {
      const deco = DECORATIONS.find(d => d.id === id);
      return deco ? { ...deco } : null;
    }).filter(Boolean);
  }

  getDecoInfo(id) {
    return DECORATIONS.find(d => d.id === id) || null;
  }

  loadBag() {
    const data = localStorage.getItem("pony_bag");
    return data ? JSON.parse(data) : [];
  }

  saveBag() {
    localStorage.setItem("pony_bag", JSON.stringify(this.bag));
  }
}

export { DecorationSystem, DECORATIONS };
