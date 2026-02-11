// 每日签到系统
class CheckinSystem {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem("pony_checkin");
    if (saved) return JSON.parse(saved);
    return { lastDate: null, streak: 0, totalDays: 0, history: [] };
  }

  save() {
    localStorage.setItem("pony_checkin", JSON.stringify(this.data));
  }

  getTodayStr() {
    return new Date().toISOString().split("T")[0];
  }

  canCheckin() {
    return this.data.lastDate !== this.getTodayStr();
  }

  checkin() {
    if (!this.canCheckin()) return null;

    const today = this.getTodayStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 连续签到判定
    if (this.data.lastDate === yesterday) {
      this.data.streak++;
    } else {
      this.data.streak = 1;
    }

    this.data.lastDate = today;
    this.data.totalDays++;
    this.data.history.push(today);

    // 签到奖励
    const reward = this.getReward(this.data.streak);
    this.save();
    return reward;
  }

  getReward(streak) {
    // 连续签到奖励递增
    if (streak % 7 === 0) {
      return { type: "decoration_fragment", count: 3, label: "🎁 连续7天！获得装饰碎片x3" };
    } else if (streak % 3 === 0) {
      return { type: "decoration_fragment", count: 2, label: "🎁 连续3天！获得装饰碎片x2" };
    } else {
      return { type: "decoration_fragment", count: 1, label: "🎁 签到成功！获得装饰碎片x1" };
    }
  }

  getStreak() {
    return this.data.streak;
  }

  getTotalDays() {
    return this.data.totalDays;
  }

  // 获取本周签到状态（用于UI展示）
  getWeekStatus() {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // 周一=1 ... 周日=7
    const week = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (dayOfWeek - i));
      const dateStr = d.toISOString().split("T")[0];
      week.push({
        day: ["一", "二", "三", "四", "五", "六", "日"][i - 1],
        date: dateStr,
        checked: this.data.history.includes(dateStr),
        isToday: dateStr === this.getTodayStr()
      });
    }
    return week;
  }
}

export { CheckinSystem };
