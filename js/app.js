// 主入口
import { Horse } from "./horse.js";
import { InteractionController } from "./interaction.js";
import { DecorationSystem } from "./decoration.js";
import { PhraseEngine } from "./phrases.js";
import { HorseRenderer } from "./renderer-svg.js";
import { CheckinSystem } from "./checkin.js";
import { FragmentSystem } from "./fragment.js";
import { AchievementSystem } from "./achievement.js";
import { ShareCardGenerator } from "./sharecard.js";
import { JumpGame } from "./games/jump.js";
import { CatchGame } from "./games/catch.js";
import { RhythmGame } from "./games/rhythm.js";
import { MatchGame } from "./games/match.js";
import { RaceGame } from "./games/race.js";
import { FortuneSystem, ZODIAC_SIGNS, COLORS, PERSONALITIES } from "./fortune.js";
import { AssistSystem } from "./assist.js";

class App {
  constructor() {
    this.horse = null;
    this.controller = new InteractionController();
    this.decoSystem = new DecorationSystem();
    this.phraseEngine = new PhraseEngine();
    this.renderer = new HorseRenderer("horseCanvas");
    this.checkin = new CheckinSystem();
    this.fragments = new FragmentSystem();
    this.achievements = new AchievementSystem();
    this.shareCard = new ShareCardGenerator();
    this.fortune = new FortuneSystem();
    this.assist = new AssistSystem();
    this.currentGame = null;
    this.cooldownTimers = {};
    this.lastPhrase = "";
    this.fortuneAnswers = { zodiac: null, color: null, personality: null };
  }

  init() {
    const user = localStorage.getItem("pony_user");
    this.horse = Horse.load();

    if (!user || !this.horse) {
      this.showAdoptScreen();
    } else {
      this.showMainScreen();
    }
  }

  showAdoptScreen() {
    document.getElementById("adoptScreen").classList.remove("hidden");
    document.getElementById("mainScreen").classList.add("hidden");
    this.showFortuneStep(1);

    // 绑定运势测试流程
    document.getElementById("btnStartFortune").addEventListener("click", () => this.showFortuneStep(2));
    
    // 渲染选项
    this.renderZodiacOptions();
    this.renderColorOptions();
    this.renderPersonalityOptions();

    document.getElementById("btnAdoptFortune").addEventListener("click", () => this.completeAdoption());
    document.getElementById("btnShareFortune").addEventListener("click", () => this.shareFortuneResult());
  }

  showFortuneStep(step) {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`fortuneStep${i}`);
      if (el) el.classList.toggle("hidden", i !== step);
    }
  }

  renderZodiacOptions() {
    const container = document.getElementById("zodiacOptions");
    container.innerHTML = ZODIAC_SIGNS.map(z => `
      <button class="fortune-option" data-value="${z.id}">
        <span class="fortune-option-emoji">${z.emoji}</span>
        <span class="fortune-option-text">${z.name}</span>
      </button>
    `).join("");
    container.querySelectorAll(".fortune-option").forEach(btn => {
      btn.addEventListener("click", () => {
        this.fortuneAnswers.zodiac = btn.dataset.value;
        this.showFortuneStep(3);
      });
    });
  }

  renderColorOptions() {
    const container = document.getElementById("colorOptions");
    container.innerHTML = COLORS.map(c => `
      <button class="fortune-option" data-value="${c.id}">
        <span class="fortune-option-emoji">${c.emoji}</span>
        <span class="fortune-option-text">${c.name}</span>
      </button>
    `).join("");
    container.querySelectorAll(".fortune-option").forEach(btn => {
      btn.addEventListener("click", () => {
        this.fortuneAnswers.color = btn.dataset.value;
        this.showFortuneStep(4);
      });
    });
  }

  renderPersonalityOptions() {
    const container = document.getElementById("personalityOptions");
    container.innerHTML = PERSONALITIES.map(p => `
      <button class="fortune-option fortune-option-wide" data-value="${p.id}">
        <span class="fortune-option-emoji">${p.emoji}</span>
        <span class="fortune-option-text">${p.name}</span>
      </button>
    `).join("");
    container.querySelectorAll(".fortune-option").forEach(btn => {
      btn.addEventListener("click", () => {
        this.fortuneAnswers.personality = btn.dataset.value;
        this.generateFortuneResult();
      });
    });
  }

  generateFortuneResult() {
    const { zodiac, color, personality } = this.fortuneAnswers;
    const result = this.fortune.generate(zodiac, color, personality);
    
    // 显示结果
    document.getElementById("fortuneScore").textContent = result.score;
    document.getElementById("fortuneDetails").innerHTML = `
      <div class="fortune-item">
        <span class="fortune-item-icon">💼</span>
        <span class="fortune-item-label">事业运</span>
        <span class="fortune-item-text">${result.career}</span>
      </div>
      <div class="fortune-item">
        <span class="fortune-item-icon">💰</span>
        <span class="fortune-item-label">财运</span>
        <span class="fortune-item-text">${result.wealth}</span>
      </div>
      <div class="fortune-item">
        <span class="fortune-item-icon">💕</span>
        <span class="fortune-item-label">爱情运</span>
        <span class="fortune-item-text">${result.love}</span>
      </div>
      <div class="fortune-item">
        <span class="fortune-item-icon">🏃</span>
        <span class="fortune-item-label">健康运</span>
        <span class="fortune-item-text">${result.health}</span>
      </div>
      <div class="fortune-lucky">
        <span>幸运数字：<strong>${result.luckyNumber}</strong></span>
        <span>幸运颜色：<strong>${result.luckyColor}</strong></span>
      </div>
    `;

    document.getElementById("horseIntroText").textContent = 
      `${result.horseTrait.blessing}！你的专属小马性格${result.personality.trait}，外形${result.horseTrait.appearHint}，将陪伴你度过吉祥马年！`;

    this.showFortuneStep(5);
  }

  shareFortuneResult() {
    const result = this.fortune.getResult();
    if (!result) return;
    const text = `我的2026马年运势：${result.score}分！\n\n💼 ${result.career}\n💰 ${result.wealth}\n💕 ${result.love}\n\n快来测测你的马年运势，领养专属小马吧！`;
    
    if (navigator.share) {
      navigator.share({ title: "马年运势测试", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("📋 运势结果已复制，快去分享吧！");
      });
    }
  }

  completeAdoption() {
    const result = this.fortune.getResult();
    const horseName = this.fortune.generateHorseName(
      this.fortuneAnswers.zodiac,
      this.fortuneAnswers.personality
    );
    const name = horseName || "小马主人" + Math.floor(Math.random() * 9000 + 1000);
    
    localStorage.setItem("pony_user", JSON.stringify({ name, avatar: "🧑", fortune: result }));
    this.horse = new Horse();
    this.horse.save();
    
    this.showToast("🎉 恭喜领养你的专属小马，好好照顾它吧～");
    setTimeout(() => {
      document.getElementById("adoptScreen").classList.add("hidden");
      this.showMainScreen();
    }, 1500);
  }

  showMainScreen() {
    document.getElementById("mainScreen").classList.remove("hidden");
    const user = JSON.parse(localStorage.getItem("pony_user"));
    document.getElementById("userName").textContent = user.name;

    // 助力系统UI更新
    this.updateAssistUI();

    // 显示衰减提示
    if (this.horse.hunger < 30) {
      setTimeout(() => this.showToast("😿 小马好饿，快喂喂它吧～"), 500);
    } else if (this.horse.happiness < 30) {
      setTimeout(() => this.showToast("😿 小马不太开心，陪它玩玩吧～"), 500);
    }

    // 签到提示
    if (this.checkin.canCheckin()) {
      setTimeout(() => this.showCheckinHint(), 1200);
    }

    this.renderHorse();
    this.updateStatusBars();
    this.updateFragmentCount();
    this.bindButtons();
    this.startCooldownDisplay();
  }

  updateAssistUI() {
    const hasBoost = this.assist.hasBoost();
    const boostBtn = document.getElementById("btnBoost");
    const banner = document.getElementById("assistBanner");

    if (hasBoost) {
      const remaining = this.assist.getBoostRemaining();
      boostBtn.style.display = "block";
      boostBtn.textContent = `⚡ 加速中 ${remaining}分钟`;
      banner.style.display = "none";
    } else {
      boostBtn.style.display = "none";
      const count = this.assist.getTodayAssistCount();
      if (count < 3) {
        banner.style.display = "flex";
      } else {
        banner.style.display = "none";
      }
    }
  }

  renderHorse() {
    this.renderer.render(this.horse);
  }

  updateStatusBars() {
    const hungerBar = document.getElementById("hungerBar");
    const happyBar = document.getElementById("happyBar");
    const hungerVal = document.getElementById("hungerVal");
    const happyVal = document.getElementById("happyVal");

    hungerBar.style.width = this.horse.hunger + "%";
    happyBar.style.width = this.horse.happiness + "%";
    hungerVal.textContent = Math.round(this.horse.hunger);
    happyVal.textContent = Math.round(this.horse.happiness);

    hungerBar.style.background = this.horse.hunger < 30 ? "#ff6b6b" : "#7ec87e";
    happyBar.style.background = this.horse.happiness < 30 ? "#ff6b6b" : "#ffd93d";
  }

  updateFragmentCount() {
    const el = document.getElementById("fragmentCount");
    if (el) el.textContent = this.fragments.getCount();
  }

  bindButtons() {
    document.getElementById("btnPat").addEventListener("click", () => this.doInteract("pat"));
    document.getElementById("btnGroom").addEventListener("click", () => this.doInteract("groom"));
    document.getElementById("btnFeed").addEventListener("click", () => this.doInteract("feed"));
    
    // 主功能按钮
    document.getElementById("btnGames").addEventListener("click", () => this.showGamesModal());
    document.getElementById("btnBag").addEventListener("click", () => this.showBag());
    document.getElementById("btnCheckin").addEventListener("click", () => this.doCheckin());
    document.getElementById("btnMore").addEventListener("click", () => this.showMoreModal());
    
    // 游戏选择弹窗中的按钮
    document.getElementById("btnGameRace").addEventListener("click", () => { this.closeModal('gamesModal'); this.startGame("race"); });
    document.getElementById("btnGameMatch").addEventListener("click", () => { this.closeModal('gamesModal'); this.startGame("match"); });
    document.getElementById("btnGameJump").addEventListener("click", () => { this.closeModal('gamesModal'); this.startGame("jump"); });
    document.getElementById("btnGameCatch").addEventListener("click", () => { this.closeModal('gamesModal'); this.startGame("catch"); });
    document.getElementById("btnGameRhythm").addEventListener("click", () => { this.closeModal('gamesModal'); this.startGame("rhythm"); });
    
    // 更多功能中的按钮
    document.getElementById("btnStatus").addEventListener("click", () => { this.closeModal('moreModal'); this.showStatus(); });
    document.getElementById("btnCraft").addEventListener("click", () => { this.closeModal('moreModal'); this.showCraft(); });
    document.getElementById("btnAchievement").addEventListener("click", () => { this.closeModal('moreModal'); this.showAchievements(); });
    document.getElementById("btnShare").addEventListener("click", () => { this.closeModal('moreModal'); this.generateShareCard(); });
    
    // 其他
    document.getElementById("btnReset").addEventListener("click", () => this.resetHorse());
    document.getElementById("btnOpenAssist").addEventListener("click", () => this.showAssist());
    document.getElementById("btnBoost").addEventListener("click", () => this.showAssist());
  }

  showGamesModal() {
    document.getElementById("gamesModal").classList.remove("hidden");
  }

  showMoreModal() {
    document.getElementById("moreModal").classList.remove("hidden");
  }

  doInteract(type) {
    if (!this.controller.canInteract(type)) {
      const remaining = Math.ceil(this.controller.getRemainingCooldown(type) / 1000);
      this.showToast(`⏳ 冷却中，还需等待 ${remaining} 秒`);
      return;
    }

    if (type !== "feed") {
      const check = this.controller.canInteractWithHorse(this.horse, type);
      if (check.allowed === false) {
        this.showToast(`😿 ${check.reason}`);
        return;
      }
    }

    let result;
    switch (type) {
      case "pat": result = this.horse.pat(); break;
      case "groom": result = this.horse.groom(); break;
      case "feed": result = this.horse.feed(); break;
    }

    // 助力加速：如果有加速buff，额外增加属性
    if (this.assist.hasBoost()) {
      if (type === "feed") {
        this.horse.hunger = Math.min(100, this.horse.hunger + 5);
        this.horse.happiness = Math.min(100, this.horse.happiness + 1);
      } else {
        this.horse.happiness = Math.min(100, this.horse.happiness + 2);
      }
      this.horse.save();
    }

    this.controller.recordInteraction(type);
    this.renderer.playAnimation(type);

    const phrase = this.phraseEngine.getRandom(type);
    this.lastPhrase = phrase;
    this.showPhrase(phrase);

    // 装饰掉落
    const drop = this.decoSystem.tryDrop(this.horse.hunger, this.horse.happiness);
    if (drop) {
      setTimeout(() => this.showToast(`🎁 获得装饰：${drop.emoji} ${drop.name}！`), 1200);
    }

    // 互动也给碎片（前3次每日必给，之后概率）
    const todayInteracts = this.getTodayInteractCount();
    if (todayInteracts <= 3) {
      this.fragments.add(1);
      setTimeout(() => this.showToast("🧩 获得装饰碎片x1"), drop ? 2800 : 1200);
    } else if (Math.random() < 0.2) {
      this.fragments.add(1);
      setTimeout(() => this.showToast("🧩 获得装饰碎片x1"), drop ? 2800 : 1200);
    }

    // 成长事件
    if (result.growth) {
      this.renderer.showLevelUpEffect();
      for (const evt of result.growth) {
        setTimeout(() => {
          if (evt.type === "body") {
            this.showToast(`🌟 你的小马变${evt.label}啦！多亏你细心照顾～`);
          } else {
            this.showToast(`✨ 小马外形进化：${evt.label}！`);
          }
        }, 2000);
      }
    }

    // 检查成就
    this.checkAchievements();

    this.renderHorse();
    this.updateStatusBars();
    this.updateFragmentCount();
    this.incrementTodayInteract();
  }

  // 每日互动计数
  getTodayInteractCount() {
    const today = new Date().toISOString().split("T")[0];
    const data = JSON.parse(localStorage.getItem("pony_daily") || "{}");
    return (data.date === today) ? data.count : 0;
  }

  incrementTodayInteract() {
    const today = new Date().toISOString().split("T")[0];
    const data = JSON.parse(localStorage.getItem("pony_daily") || "{}");
    if (data.date === today) {
      data.count++;
    } else {
      data.date = today;
      data.count = 1;
    }
    localStorage.setItem("pony_daily", JSON.stringify(data));
  }

  // 签到
  showCheckinHint() {
    this.showToast("📅 今天还没签到哦，点击签到领碎片～");
  }

  doCheckin() {
    if (!this.checkin.canCheckin()) {
      this.showToast("✅ 今天已经签到过啦～");
      return;
    }
    const reward = this.checkin.checkin();
    if (reward) {
      this.fragments.add(reward.count);
      this.updateFragmentCount();
      this.showToast(reward.label + ` (连续${this.checkin.getStreak()}天)`);
      this.checkAchievements();
    }
  }

  // 合成
  showCraft() {
    const modal = document.getElementById("craftModal");
    const list = document.getElementById("craftList");
    const ownedIds = this.decoSystem.getBag().map(d => d.id);
    const recipes = this.fragments.getRecipes(ownedIds);

    document.getElementById("craftFragCount").textContent = this.fragments.getCount();

    list.innerHTML = recipes.map(r => `
      <div class="craft-item ${r.owned ? 'owned' : ''} ${r.affordable && !r.owned ? 'affordable' : ''}">
        <span class="craft-emoji">${r.emoji}</span>
        <div class="craft-info">
          <span class="craft-name">${r.name}</span>
          <span class="craft-cost">${r.owned ? '✅ 已拥有' : `🧩 ${r.cost} 碎片`}</span>
        </div>
        <span class="bag-category cat-${r.category}">${
          r.category === "basic" ? "基础" : r.category === "special" ? "特色" : "限定"
        }</span>
        ${!r.owned ? `<button class="btn-craft-do ${r.affordable ? '' : 'disabled'}" 
          onclick="app.doCraft('${r.id}')" ${r.affordable ? '' : 'disabled'}>合成</button>` : ''}
      </div>
    `).join("");

    modal.classList.remove("hidden");
  }

  doCraft(recipeId) {
    const result = this.fragments.craft(recipeId);
    if (result) {
      this.decoSystem.addToBag(result.id);
      this.showToast(`🎉 合成成功：${result.emoji} ${result.name}！`);
      this.updateFragmentCount();
      this.checkAchievements();
      this.showCraft(); // 刷新
    } else {
      this.showToast("碎片不够哦～");
    }
  }

  // 成就
  checkAchievements() {
    const stats = {
      totalInteract: this.horse.totalInteractCount,
      totalFeed: this.horse.totalFeedCount,
      streak: this.checkin.getStreak(),
      totalCheckin: this.checkin.getTotalDays(),
      decoCount: this.decoSystem.getBag().length,
      bodyStage: this.horse.bodyStage,
      appearanceStage: this.horse.appearanceStage,
      hunger: this.horse.hunger,
      happiness: this.horse.happiness
    };
    const newAch = this.achievements.check(stats);
    for (const ach of newAch) {
      setTimeout(() => {
        this.showToast(`🏅 成就解锁：${ach.icon} ${ach.name}！`);
      }, 3000);
    }
  }

  showAchievements() {
    const modal = document.getElementById("achieveModal");
    const list = document.getElementById("achieveList");
    const all = this.achievements.getAll();

    document.getElementById("achieveCount").textContent =
      `${this.achievements.getUnlockedCount()} / ${this.achievements.getTotalCount()}`;

    list.innerHTML = all.map(a => `
      <div class="achieve-item ${a.unlocked ? 'unlocked' : 'locked'}">
        <span class="achieve-icon">${a.unlocked ? a.icon : '🔒'}</span>
        <div class="achieve-info">
          <span class="achieve-name">${a.name}</span>
          <span class="achieve-desc">${a.desc}</span>
        </div>
      </div>
    `).join("");

    modal.classList.remove("hidden");
  }

  // 分享卡片 - 成长相册 + 马年运势
  async generateShareCard() {
    const user = JSON.parse(localStorage.getItem("pony_user"));
    const checkinStreak = this.checkin.getStreak();
    const fragmentCount = this.fragments.getCount();
    const decorationCount = this.decoSystem.getBag().length;
    
    this.showToast("🎨 正在生成分享卡片...");

    try {
      const dataUrl = await this.shareCard.generate(
        this.horse, 
        user.name, 
        checkinStreak, 
        fragmentCount, 
        decorationCount
      );
      this.showSharePreview(dataUrl);
    } catch (e) {
      this.showToast("生成失败，请重试");
      console.error(e);
    }
  }

  showSharePreview(dataUrl) {
    const modal = document.getElementById("shareModal");
    const img = document.getElementById("shareImage");
    img.src = dataUrl;
    modal.classList.remove("hidden");
  }

  downloadShareImage() {
    const img = document.getElementById("shareImage");
    const a = document.createElement("a");
    a.href = img.src;
    a.download = "我的专属小马-马年运势.png";
    a.click();
    this.showToast("📥 卡片已保存！");
  }

  // 背包
  showBag() {
    const modal = document.getElementById("bagModal");
    this.updateBagList();
    modal.classList.remove("hidden");
  }

  toggleEquip(decoId) {
    if (this.horse.decorations.includes(decoId)) {
      this.horse.unequipDecoration(decoId);
    } else {
      this.horse.equipDecoration(decoId);
    }
    this.renderHorse();
    // 只更新背包列表，不重新打开模态框
    this.updateBagList();
  }

  updateBagList() {
    const list = document.getElementById("bagList");
    const items = this.decoSystem.getBag();

    if (items.length === 0) {
      list.innerHTML = '<p class="empty-bag">还没有装饰哦，多多互动就能获得～</p>';
    } else {
      list.innerHTML = items.map(item => {
        const equipped = this.horse.decorations.includes(item.id);
        return `
          <div class="bag-item ${equipped ? 'equipped' : ''}" data-id="${item.id}">
            <span class="bag-emoji">${item.emoji}</span>
            <span class="bag-name">${item.name}</span>
            <span class="bag-category cat-${item.category}">${
              item.category === "basic" ? "基础" : item.category === "special" ? "特色" : "限定"
            }</span>
            <button class="btn-equip" onclick="app.toggleEquip('${item.id}')">${equipped ? "卸下" : "佩戴"}</button>
          </div>`;
      }).join("");
    }
  }

  // 状态
  showStatus() {
    const modal = document.getElementById("statusModal");
    const progress = this.horse.getGrowthProgress();
    const bodyMap = { normal: "匀称", sturdy: "壮硕圆润", slim: "挺拔矫健", balanced: "匀称健硕" };
    const appearMap = { base: "基础", fur_change: "毛发变化", fur_glow: "毛发光泽", marked: "专属印记" };

    document.getElementById("statusBody").innerHTML = `
      <div class="status-row"><span>🍎 饥饿值</span><span>${Math.round(this.horse.hunger)}%</span></div>
      <div class="status-row"><span>😊 愉悦值</span><span>${Math.round(this.horse.happiness)}%</span></div>
      <div class="status-row"><span>🍽️ 累计喂养</span><span>${this.horse.totalFeedCount} 次</span></div>
      <div class="status-row"><span>🤝 累计互动</span><span>${this.horse.totalInteractCount} 次</span></div>
      <div class="status-row"><span>💪 身材</span><span>${bodyMap[this.horse.bodyStage] || "匀称"}</span></div>
      <div class="status-row"><span>✨ 外形</span><span>${appearMap[this.horse.appearanceStage] || "基础"}</span></div>
      <div class="status-row"><span>📅 签到</span><span>连续${this.checkin.getStreak()}天 / 共${this.checkin.getTotalDays()}天</span></div>
      <div class="status-row"><span>🧩 碎片</span><span>${this.fragments.getCount()} 个</span></div>
      ${progress.nextStage ? `<div class="status-row next-growth"><span>📈 下次进化</span><span>还需 ${progress.remaining} 次 → ${progress.nextStage}</span></div>` : '<div class="status-row"><span>🏆</span><span>已达最高形态！</span></div>'}
    `;
    modal.classList.remove("hidden");
  }

  showPhrase(text) {
    const bubble = document.getElementById("phraseBubble");
    bubble.textContent = text;
    bubble.classList.remove("hidden", "fade-out");
    bubble.classList.add("fade-in");
    setTimeout(() => {
      bubble.classList.remove("fade-in");
      bubble.classList.add("fade-out");
      setTimeout(() => bubble.classList.add("hidden"), 500);
    }, 2500);
  }

  showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2500);
  }

  resetHorse() {
    if (confirm("确定要重置小马吗？所有养成进度和装饰都会清空！")) {
      if (confirm("真的确定吗？这个操作不可撤销！")) {
        Horse.reset();
        localStorage.removeItem("pony_checkin");
        localStorage.removeItem("pony_fragments");
        localStorage.removeItem("pony_achievements");
        localStorage.removeItem("pony_daily");
        location.reload();
      }
    }
  }

  closeModal(id) {
    document.getElementById(id).classList.add("hidden");
  }

  // 小游戏
  startGame(type) {
    const gameScreen = document.getElementById("gameScreen");
    const canvas = document.getElementById("gameCanvas");
    const titleEl = document.getElementById("gameTitle");
    const scoreEl = document.getElementById("gameScore");
    
    // 设置游戏标题
    const titles = {
      race: "🏇 一马当先",
      match: "🎯 马上有喜",
      jump: "🐴 马不停蹄",
      catch: "🌾 马上有钱",
      rhythm: "🎵 万马奔腾"
    };
    titleEl.textContent = titles[type] || "小游戏";
    
    // 赛马游戏不显示得分
    if (type === "race") {
      scoreEl.style.display = "none";
    } else {
      scoreEl.style.display = "block";
      scoreEl.textContent = "得分: 0";
    }
    
    // 显示游戏屏幕
    gameScreen.classList.remove("hidden");
    
    // 等待DOM更新后设置canvas大小
    setTimeout(() => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width || 360;
      canvas.height = rect.height || 520;
      
      // 启动游戏
      this.initGame(type, canvas);
    }, 50);
  }

  initGame(type, canvas) {
    const onEnd = (result) => {
      // 赛马游戏特殊处理
      if (type === "race") {
        // 赛马游戏内部处理碎片变化，需要保存
        this.fragments.data.count = result.fragments;
        this.fragments.save();
        this.updateFragmentCount();
        this.checkAchievements();
        return;
      }
      
      if (result.fragments > 0) {
        this.fragments.add(result.fragments);
        this.updateFragmentCount();
      }
      // 游戏也给养成加成
      this.horse.happiness = Math.min(100, this.horse.happiness + 3);
      this.horse.save();
      this.updateStatusBars();
      this.checkAchievements();

      // 更新得分显示
      document.getElementById("gameScore").textContent = `得分: ${result.score}`;
      
      setTimeout(() => {
        this.showToast(`🎮 得分 ${result.score}${result.fragments > 0 ? ` | 🧩+${result.fragments}` : ""}`);
      }, 500);
    };

    switch (type) {
      case "race":
        this.currentGame = new RaceGame(canvas, onEnd, this.fragments.getCount());
        break;
      case "match":
        this.currentGame = new MatchGame(canvas, onEnd);
        break;
      case "jump":
        this.currentGame = new JumpGame(canvas, onEnd);
        break;
      case "catch":
        this.currentGame = new CatchGame(canvas, onEnd);
        break;
      case "rhythm":
        this.currentGame = new RhythmGame(canvas, onEnd);
        break;
    }
  }

  closeGame() {
    if (this.currentGame) {
      this.currentGame.running = false;
      this.currentGame.cleanup();
      this.currentGame = null;
    }
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("gameScore").textContent = "得分: 0";
    this.renderHorse();
  }

  // 助力系统
  showAssist() {
    const modal = document.getElementById("assistModal");
    document.getElementById("myAssistCode").textContent = this.assist.getMyCode();
    document.getElementById("assistProgress").textContent = `${this.assist.getTodayAssistCount()}/3`;
    
    const list = this.assist.getAssistedList();
    const listEl = document.getElementById("assistListContent");
    if (list.length === 0) {
      listEl.innerHTML = '<p class="empty-assist">暂无助力记录</p>';
    } else {
      listEl.innerHTML = list.map(a => {
        const time = new Date(a.time);
        return `<div class="assist-record">
          <span class="assist-friend-name">${a.name}</span>
          <span class="assist-time">${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}</span>
        </div>`;
      }).join("");
    }

    modal.classList.remove("hidden");
  }

  copyAssistCode() {
    const code = this.assist.getMyCode();
    const text = this.assist.getShareText();
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("📋 助力信息已复制，快去分享给好友吧！");
    }).catch(() => {
      this.showToast(`你的助力码：${code}`);
    });
  }

  simulateAssist() {
    const result = this.assist.simulateFriendAssist();
    if (result.success) {
      this.showToast("🎉 好友助力成功！获得1小时双倍成长速度");
      this.updateAssistUI();
      this.showAssist(); // 刷新
    } else {
      this.showToast(result.reason);
    }
  }

  helpFriend() {
    const input = document.getElementById("friendCodeInput");
    const code = input.value.trim().toUpperCase();
    if (!code) {
      this.showToast("请输入好友助力码");
      return;
    }
    const result = this.assist.assistFriend(code);
    if (result.success) {
      this.showToast("✅ 助力成功！你的好友会收到加速buff");
      input.value = "";
      // 自己也领养小马（如果还没有）
      if (!this.horse) {
        this.showToast("你也可以领养自己的小马啦！");
      }
    } else {
      this.showToast(result.reason);
    }
  }

  startCooldownDisplay() {
    setInterval(() => {
      ["pat", "groom", "feed"].forEach(type => {
        const btn = document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`);
        const remaining = this.controller.getRemainingCooldown(type);
        const cdEl = btn.querySelector(".cooldown-text");
        if (remaining > 0) {
          btn.classList.add("on-cooldown");
          if (cdEl) cdEl.textContent = Math.ceil(remaining / 1000) + "s";
        } else {
          btn.classList.remove("on-cooldown");
          if (cdEl) cdEl.textContent = "";
        }
      });
    }, 200);
  }
}

const app = new App();
window.app = app;
document.addEventListener("DOMContentLoaded", () => app.init());
