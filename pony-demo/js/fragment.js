// 装饰碎片合成系统
const FRAGMENT_RECIPES = [
  { id: "saddle_basic", name: "普通马鞍", cost: 3, emoji: "🪑", category: "basic" },
  { id: "rein_simple", name: "简单缰绳", cost: 3, emoji: "🪢", category: "basic" },
  { id: "wreath_flower", name: "小花环", cost: 3, emoji: "💐", category: "basic" },
  { id: "hat_fortune", name: "财神帽", cost: 8, emoji: "🎩", category: "special" },
  { id: "cape_lucky", name: "吉祥披风", cost: 8, emoji: "🧣", category: "special" },
  { id: "wings_small", name: "小翅膀", cost: 10, emoji: "🪽", category: "special" },
  { id: "horseshoe_glow", name: "发光马蹄铁", cost: 10, emoji: "🧲", category: "special" },
  { id: "plate_success", name: "马到成功挂牌", cost: 20, emoji: "🏅", category: "limited" },
  { id: "saddle_gold", name: "金马鞍", cost: 25, emoji: "👑", category: "limited" }
];

class FragmentSystem {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem("pony_fragments");
    if (saved) return JSON.parse(saved);
    return { count: 0 };
  }

  save() {
    localStorage.setItem("pony_fragments", JSON.stringify(this.data));
  }

  add(amount) {
    this.data.count += amount;
    this.save();
  }

  getCount() {
    return this.data.count;
  }

  canCraft(recipeId) {
    const recipe = FRAGMENT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    return this.data.count >= recipe.cost;
  }

  craft(recipeId) {
    const recipe = FRAGMENT_RECIPES.find(r => r.id === recipeId);
    if (!recipe || this.data.count < recipe.cost) return null;
    this.data.count -= recipe.cost;
    this.save();
    return recipe;
  }

  getRecipes(ownedDecoIds) {
    return FRAGMENT_RECIPES.map(r => ({
      ...r,
      owned: ownedDecoIds.includes(r.id),
      affordable: this.data.count >= r.cost
    }));
  }
}

export { FragmentSystem, FRAGMENT_RECIPES };
