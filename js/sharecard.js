// 小马成长相册 + 马年运势 分享卡片生成器
class ShareCardGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  async generate(horse, userName, checkinStreak, fragmentCount, decorationCount) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 750;
    this.canvas.height = 1200;
    this.ctx = this.canvas.getContext("2d");
    const ctx = this.ctx;

    // 背景渐变 - 春节氛围
    const grad = ctx.createLinearGradient(0, 0, 0, 1200);
    grad.addColorStop(0, "#FFE5E5");
    grad.addColorStop(0.5, "#FFF5E6");
    grad.addColorStop(1, "#FFE8E8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 750, 1200);

    // 装饰性元素 - 金色圆点
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 750, Math.random() * 1200, Math.random() * 25 + 8, 0, Math.PI * 2);
      ctx.fillStyle = ["#FFD93D", "#FF9A76", "#A8E6CF"][Math.floor(Math.random() * 3)];
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 顶部标题区
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, 750, 100);
    
    ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#8B6F5E";
    ctx.textAlign = "center";
    ctx.fillText("🐴 我的专属小马", 375, 65);

    // 小马展示区域
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    this.roundRect(ctx, 40, 120, 670, 380, 20);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 绘制小马
    this.drawHorse(ctx, horse);

    // 养了X天标签
    const days = Math.floor((Date.now() - (horse.birthTime || Date.now())) / (1000 * 60 * 60 * 24)) || 1;
    ctx.fillStyle = "#FFD93D";
    this.roundRect(ctx, 550, 140, 140, 45, 22);
    ctx.fill();
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#8B6F5E";
    ctx.fillText(`第 ${days} 天`, 620, 170);

    // 成长档案区
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    this.roundRect(ctx, 40, 520, 670, 200, 20);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#8B6F5E";
    ctx.textAlign = "left";
    ctx.fillText("📊 成长档案", 70, 565);

    const appearMap = { 
      base: "幼年马", 
      fur_change: "少年马", 
      fur_glow: "青年马", 
      marked: "成年马" 
    };
    const stageName = appearMap[horse.appearanceStage] || "幼年马";

    ctx.font = "22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#666";
    const stats = [
      `• 养了 ${days} 天`,
      `• 进化到 ${stageName}`,
      `• 收集 ${decorationCount} 个装饰`,
      `• 连续签到 ${checkinStreak} 天`
    ];
    stats.forEach((stat, i) => {
      ctx.fillText(stat, 90, 615 + i * 35);
    });

    // 马年运势区
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    this.roundRect(ctx, 40, 740, 670, 280, 20);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#8B6F5E";
    ctx.textAlign = "left";
    ctx.fillText("🔮 马年运势", 70, 785);

    // 生成运势数据
    const fortune = this.generateFortune(horse, userName);
    
    ctx.font = "22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText(`性格：${fortune.personality}`, 90, 835);
    
    ctx.fillText(`事业运：${fortune.careerStars} ${fortune.careerText}`, 90, 875);
    ctx.fillText(`财运：${fortune.wealthStars} ${fortune.wealthText}`, 90, 915);
    
    ctx.fillText(`幸运色：${fortune.luckyColor} | 幸运数：${fortune.luckyNumber}`, 90, 955);

    // 马年祝福
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#D4A76A";
    ctx.textAlign = "center";
    ctx.fillText(`🎊 ${fortune.blessing}`, 375, 1000);

    // 底部引导
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 1040, 750, 160);
    
    ctx.font = "24px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#8B6F5E";
    ctx.fillText("👉 快来养你的专属小马", 375, 1100);
    
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("长按保存图片，分享给好友", 375, 1140);
    ctx.fillText("养只小马 · 马年大吉", 375, 1170);

    return this.canvas.toDataURL("image/png");
  }

  generateFortune(horse, userName) {
    // 根据小马状态和用户名生成个性化运势
    const hash = (userName + horse.appearanceStage).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const personalities = [
      "活力型·闪电", "温柔型·微风", "勇敢型·烈焰", 
      "智慧型·星辰", "幸运型·彩虹", "稳重型·大地"
    ];
    
    const careerTexts = ["一马当先", "马到成功", "龙马精神", "快马加鞭"];
    const wealthTexts = ["马上有钱", "马上封侯", "马上发财", "财源滚滚"];
    const blessings = [
      "龙马精神，万事如意！",
      "一马当先，前程似锦！",
      "马到成功，心想事成！",
      "万马奔腾，鸿运当头！"
    ];
    const colors = ["金色", "红色", "紫色", "蓝色", "绿色"];
    
    const idx = Math.abs(hash);
    const careerLevel = 3 + (idx % 3);
    const wealthLevel = 3 + ((idx >> 2) % 3);
    
    return {
      personality: personalities[idx % personalities.length],
      careerStars: "⭐".repeat(careerLevel),
      careerText: careerTexts[idx % careerTexts.length],
      wealthStars: "⭐".repeat(wealthLevel),
      wealthText: wealthTexts[(idx >> 1) % wealthTexts.length],
      luckyColor: colors[idx % colors.length],
      luckyNumber: (idx % 9) + 1,
      blessing: blessings[idx % blessings.length]
    };
  }

  drawHorse(ctx, horse) {
    const cx = 375, cy = 300;
    const colors = {
      base: "#C4A882", 
      fur_change: "#A0724A",
      fur_glow: "#C4935A", 
      marked: "#D4A76A"
    };
    const bodyColor = colors[horse.appearanceStage] || colors.base;

    ctx.save();
    ctx.translate(cx - 120, cy - 150);
    ctx.scale(3, 3);

    // 身体
    ctx.beginPath();
    ctx.ellipse(60, 55, 40, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();

    // 腿
    const legColor = this.darkenHex(bodyColor, 20);
    [[25, 70], [40, 70], [70, 70], [85, 70]].forEach(([x, y]) => {
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.roundRect(x, y, 12, 35, 4);
      ctx.fill();
      // 蹄子
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 36, 7, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#5C4033";
      ctx.fill();
    });

    // 脖子+头
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(90, 45);
    ctx.quadraticCurveTo(100, 20, 88, 5);
    ctx.quadraticCurveTo(75, -5, 70, 10);
    ctx.quadraticCurveTo(65, 30, 85, 45);
    ctx.fill();

    // 头
    ctx.beginPath();
    ctx.ellipse(82, 5, 18, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 耳朵
    ctx.beginPath();
    ctx.moveTo(72, -8);
    ctx.lineTo(68, -22);
    ctx.lineTo(78, -12);
    ctx.fillStyle = bodyColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(88, -8);
    ctx.lineTo(92, -22);
    ctx.lineTo(95, -12);
    ctx.fill();

    // 眼睛
    ctx.beginPath();
    ctx.arc(76, 2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(75.5, 1, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // 腮红
    ctx.beginPath();
    ctx.ellipse(72, 10, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,182,193,0.5)";
    ctx.fill();

    // 鬃毛
    ctx.fillStyle = this.darkenHex(bodyColor, 40);
    ctx.beginPath();
    ctx.moveTo(73, -10);
    ctx.quadraticCurveTo(68, -20, 78, -22);
    ctx.quadraticCurveTo(88, -15, 83, -8);
    ctx.fill();

    // 尾巴
    ctx.fillStyle = this.darkenHex(bodyColor, 40);
    ctx.beginPath();
    ctx.moveTo(18, 45);
    ctx.quadraticCurveTo(0, 30, 5, 55);
    ctx.quadraticCurveTo(2, 70, 15, 65);
    ctx.fill();

    // 专属印记
    if (horse.appearanceStage === "marked") {
      ctx.font = "12px sans-serif";
      ctx.fillText("❤️", 77, -3);
    }

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  darkenHex(hex, amount) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
    const b = Math.max(0, (num & 0xFF) - amount);
    return `rgb(${r},${g},${b})`;
  }
}

export { ShareCardGenerator };
