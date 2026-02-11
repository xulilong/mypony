// 小马状态与养成逻辑
const GROWTH_THRESHOLDS = {
  bodyStages: [
    { name: "normal", label: "匀称", feedReq: 0, interactReq: 0 },
    { name: "sturdy", label: "壮硕圆润", feedReq: 30, interactReq: 0 },
    { name: "slim", label: "挺拔矫健", feedReq: 0, interactReq: 30 },
    { name: "balanced", label: "匀称健硕", feedReq: 25, interactReq: 25 }
  ],
  appearanceStages: [
    { name: "base", label: "基础", totalReq: 0 },
    { name: "fur_change", label: "毛发变化", totalReq: 20 },
    { name: "fur_glow", label: "毛发光泽", totalReq: 40 },
    { name: "marked", label: "专属印记", totalReq: 60 }
  ]
};

class Horse {
  constructor(savedData = null) {
    if (savedData) {
      Object.assign(this, savedData);
      this.applyDecay(); // 加载时计算离线衰减
    } else {
      this.hunger = 50;
      this.happiness = 50;
      this.totalFeedCount = 0;
      this.totalInteractCount = 0;
      this.bodyStage = "normal";
      this.appearanceStage = "base";
      this.adoptedAt = Date.now();
      this.lastActiveTime = Date.now();
      this.decorations = []; // equipped decoration ids
    }
  }

  // 属性自然衰减：离线期间每小时饥饿-2、愉悦-1
  applyDecay() {
    if (!this.lastActiveTime) {
      this.lastActiveTime = Date.now();
      return;
    }
    const elapsed = Date.now() - this.lastActiveTime;
    const hours = elapsed / (1000 * 60 * 60);
    if (hours >= 0.5) { // 至少半小时才衰减
      const hungerDecay = Math.floor(hours * 2);
      const happyDecay = Math.floor(hours * 1);
      this.hunger = Math.max(0, this.hunger - hungerDecay);
      this.happiness = Math.max(0, this.happiness - happyDecay);
    }
    this.lastActiveTime = Date.now();
  }

  feed() {
    const oldHunger = this.hunger;
    this.hunger = Math.min(100, this.hunger + 10);
    this.happiness = Math.min(100, this.happiness + 2);
    this.totalFeedCount++;
    const growth = this.checkGrowth();
    this.save();
    return {
      hungerChange: this.hunger - oldHunger,
      happinessChange: 2,
      growth
    };
  }

  pat() {
    const oldHappiness = this.happiness;
    this.happiness = Math.min(100, this.happiness + 5);
    this.totalInteractCount++;
    const growth = this.checkGrowth();
    this.save();
    return {
      happinessChange: this.happiness - oldHappiness,
      growth
    };
  }

  groom() {
    const oldHappiness = this.happiness;
    this.happiness = Math.min(100, this.happiness + 5);
    this.totalInteractCount++;
    const growth = this.checkGrowth();
    this.save();
    return {
      happinessChange: this.happiness - oldHappiness,
      growth
    };
  }

  checkGrowth() {
    let events = [];

    // 身材判定 - 优先判定均衡
    let newBody = "normal";
    if (this.totalFeedCount >= 25 && this.totalInteractCount >= 25) {
      newBody = "balanced";
    } else if (this.totalFeedCount >= 30) {
      newBody = "sturdy";
    } else if (this.totalInteractCount >= 30) {
      newBody = "slim";
    }
    if (newBody !== this.bodyStage) {
      const stage = GROWTH_THRESHOLDS.bodyStages.find(s => s.name === newBody);
      events.push({ type: "body", stage: newBody, label: stage.label });
      this.bodyStage = newBody;
    }

    // 外形判定
    const total = this.totalFeedCount + this.totalInteractCount;
    const stages = GROWTH_THRESHOLDS.appearanceStages;
    let newAppearance = "base";
    for (let i = stages.length - 1; i >= 0; i--) {
      if (total >= stages[i].totalReq) {
        newAppearance = stages[i].name;
        break;
      }
    }
    if (newAppearance !== this.appearanceStage) {
      const stage = stages.find(s => s.name === newAppearance);
      events.push({ type: "appearance", stage: newAppearance, label: stage.label });
      this.appearanceStage = newAppearance;
    }

    return events.length > 0 ? events : null;
  }

  getMood() {
    if (this.hunger < 30 || this.happiness < 30) return "sad";
    if (this.hunger >= 80 && this.happiness >= 80) return "excited";
    return "normal";
  }

  getGrowthProgress() {
    const total = this.totalFeedCount + this.totalInteractCount;
    const stages = GROWTH_THRESHOLDS.appearanceStages;
    for (let i = 0; i < stages.length - 1; i++) {
      if (total < stages[i + 1].totalReq) {
        const remaining = stages[i + 1].totalReq - total;
        return { nextStage: stages[i + 1].label, remaining };
      }
    }
    return { nextStage: null, remaining: 0 };
  }

  equipDecoration(id) {
    if (!this.decorations.includes(id)) {
      this.decorations.push(id);
      this.save();
    }
  }

  unequipDecoration(id) {
    this.decorations = this.decorations.filter(d => d !== id);
    this.save();
  }

  save() {
    this.lastActiveTime = Date.now();
    localStorage.setItem("pony_horse", JSON.stringify(this));
  }

  static load() {
    const data = localStorage.getItem("pony_horse");
    if (data) {
      return new Horse(JSON.parse(data));
    }
    return null;
  }

  static reset() {
    localStorage.removeItem("pony_horse");
    localStorage.removeItem("pony_bag");
    localStorage.removeItem("pony_user");
  }
}

export { Horse, GROWTH_THRESHOLDS };
