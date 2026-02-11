// 成就系统
const ACHIEVEMENTS = [
  // 互动类
  { id: "first_pat", name: "初次抚摸", desc: "第一次拍拍马屁", icon: "🤚", check: s => s.totalInteract >= 1 },
  { id: "interact_10", name: "亲密伙伴", desc: "累计互动10次", icon: "🤝", check: s => s.totalInteract >= 10 },
  { id: "interact_50", name: "形影不离", desc: "累计互动50次", icon: "💕", check: s => s.totalInteract >= 50 },
  { id: "interact_100", name: "灵魂伴侣", desc: "累计互动100次", icon: "💖", check: s => s.totalInteract >= 100 },

  // 喂养类
  { id: "first_feed", name: "初次喂养", desc: "第一次喂养小马", icon: "🌾", check: s => s.totalFeed >= 1 },
  { id: "feed_10", name: "贴心主人", desc: "累计喂养10次", icon: "🍎", check: s => s.totalFeed >= 10 },
  { id: "feed_50", name: "美食管家", desc: "累计喂养50次", icon: "🍽️", check: s => s.totalFeed >= 50 },

  // 签到类
  { id: "checkin_3", name: "三日之约", desc: "连续签到3天", icon: "📅", check: s => s.streak >= 3 },
  { id: "checkin_7", name: "一周陪伴", desc: "连续签到7天", icon: "🗓️", check: s => s.streak >= 7 },
  { id: "checkin_30", name: "月度守护", desc: "累计签到30天", icon: "🏆", check: s => s.totalCheckin >= 30 },

  // 收集类
  { id: "deco_1", name: "初次收获", desc: "获得第一个装饰", icon: "🎁", check: s => s.decoCount >= 1 },
  { id: "deco_5", name: "小小收藏家", desc: "收集5个装饰", icon: "🎒", check: s => s.decoCount >= 5 },
  { id: "deco_all", name: "全装饰大师", desc: "收集全部装饰", icon: "👑", check: s => s.decoCount >= 9 },

  // 成长类
  { id: "growth_body", name: "体型变化", desc: "小马第一次身材变化", icon: "💪", check: s => s.bodyStage !== "normal" },
  { id: "growth_appear", name: "外形进化", desc: "小马第一次外形变化", icon: "✨", check: s => s.appearanceStage !== "base" },
  { id: "growth_max", name: "完美形态", desc: "小马达到最高外形", icon: "🌟", check: s => s.appearanceStage === "marked" },

  // 特殊
  { id: "full_status", name: "满满幸福", desc: "饥饿值和愉悦值同时达到100", icon: "🥰", check: s => s.hunger >= 100 && s.happiness >= 100 },
];

class AchievementSystem {
  constructor() {
    this.unlocked = this.load();
  }

  load() {
    const saved = localStorage.getItem("pony_achievements");
    return saved ? JSON.parse(saved) : [];
  }

  save() {
    localStorage.setItem("pony_achievements", JSON.stringify(this.unlocked));
  }

  // 检查并返回新解锁的成就
  check(stats) {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      if (!this.unlocked.includes(ach.id) && ach.check(stats)) {
        this.unlocked.push(ach.id);
        newlyUnlocked.push(ach);
      }
    }
    if (newlyUnlocked.length > 0) this.save();
    return newlyUnlocked;
  }

  getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: this.unlocked.includes(a.id)
    }));
  }

  getUnlockedCount() {
    return this.unlocked.length;
  }

  getTotalCount() {
    return ACHIEVEMENTS.length;
  }
}

export { AchievementSystem, ACHIEVEMENTS };
