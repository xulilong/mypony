// 好友助力系统
class AssistSystem {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem("pony_assist");
    if (saved) return JSON.parse(saved);
    return {
      myCode: this.generateCode(),
      assistedBy: [], // 帮助过我的好友列表 [{name, time}]
      iAssisted: [], // 我帮助过的好友列表 [{code, time}]
      boostEndTime: 0, // 加速结束时间
      todayReceived: 0, // 今天收到的助力次数
      lastResetDate: this.getTodayStr()
    };
  }

  save() {
    localStorage.setItem("pony_assist", JSON.stringify(this.data));
  }

  getTodayStr() {
    return new Date().toISOString().split("T")[0];
  }

  // 重置每日计数
  checkDailyReset() {
    const today = this.getTodayStr();
    if (this.data.lastResetDate !== today) {
      this.data.todayReceived = 0;
      this.data.lastResetDate = today;
      this.save();
    }
  }

  generateCode() {
    return "P" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  getMyCode() {
    return this.data.myCode;
  }

  // 接收助力
  receiveAssist(friendName) {
    this.checkDailyReset();
    
    if (this.data.todayReceived >= 3) {
      return { success: false, reason: "今天已达助力上限（3次）" };
    }

    // 检查是否重复助力
    const alreadyAssisted = this.data.assistedBy.some(a => a.name === friendName);
    if (alreadyAssisted) {
      return { success: false, reason: "该好友今天已经帮助过你了" };
    }

    this.data.assistedBy.push({ name: friendName, time: Date.now() });
    this.data.todayReceived++;
    
    // 给予1小时双倍成长加速
    const boostDuration = 60 * 60 * 1000; // 1小时
    this.data.boostEndTime = Math.max(Date.now(), this.data.boostEndTime) + boostDuration;
    
    this.save();
    return { success: true, boostEndTime: this.data.boostEndTime };
  }

  // 帮助好友
  assistFriend(friendCode) {
    // 检查是否已经帮助过
    const today = this.getTodayStr();
    const alreadyHelped = this.data.iAssisted.some(a => 
      a.code === friendCode && new Date(a.time).toISOString().split("T")[0] === today
    );
    
    if (alreadyHelped) {
      return { success: false, reason: "今天已经帮助过这位好友了" };
    }

    this.data.iAssisted.push({ code: friendCode, time: Date.now() });
    this.save();
    return { success: true };
  }

  // 检查是否有加速效果
  hasBoost() {
    return Date.now() < this.data.boostEndTime;
  }

  getBoostRemaining() {
    if (!this.hasBoost()) return 0;
    return Math.ceil((this.data.boostEndTime - Date.now()) / 1000 / 60); // 返回剩余分钟数
  }

  getTodayAssistCount() {
    this.checkDailyReset();
    return this.data.todayReceived;
  }

  getAssistedList() {
    return this.data.assistedBy.slice(-10); // 最近10个
  }

  // 生成分享文案
  getShareText() {
    const userName = JSON.parse(localStorage.getItem("pony_user") || '{"name":"我"}').name;
    return `${userName}邀请你来帮TA的小马加速成长！\n\n🐴 养只小马，马年旺全年\n👉 点击助力，你也能领养专属小马\n\n助力码：${this.data.myCode}`;
  }

  // 模拟好友助力（Demo用，实际应该是真实好友点击链接）
  simulateFriendAssist() {
    const friendNames = ["小明", "小红", "小刚", "小美", "小强", "小丽", "小华", "小芳"];
    const randomName = friendNames[Math.floor(Math.random() * friendNames.length)] + Math.floor(Math.random() * 100);
    return this.receiveAssist(randomName);
  }
}

export { AssistSystem };
