// 赛马游戏 - 用碎片下注
class RaceGame {
  constructor(canvas, onEnd, currentFragments) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onEnd = onEnd;
    this.width = canvas.width;
    this.height = canvas.height;
    this.currentFragments = currentFragments;
    
    // 游戏状态
    this.running = true;
    this.phase = "betting"; // betting, racing, result
    this.betAmount = 0;
    this.selectedHorse = null;
    
    // 赛马数据
    this.horses = [
      { id: 1, name: "闪电", emoji: "🐴", color: "#FF6B6B", position: 0, speed: 0, odds: 2.0 },
      { id: 2, name: "疾风", emoji: "🏇", color: "#4ECDC4", position: 0, speed: 0, odds: 2.5 },
      { id: 3, name: "烈焰", emoji: "🦄", color: "#FFD93D", position: 0, speed: 0, odds: 3.0 },
      { id: 4, name: "雷霆", emoji: "🌟", color: "#9B59B6", position: 0, speed: 0, odds: 4.0 }
    ];
    
    // 赛道设置
    this.trackLength = 280;
    this.trackY = 120;
    this.trackHeight = 60;
    this.finishLine = this.trackLength;
    
    // 比赛结果
    this.winner = null;
    this.raceFinished = false;
    
    // 输入
    this.setupInput();
    
    // 开始游戏循环
    this.lastTime = Date.now();
    this.loop();
  }

  setupInput() {
    this.clickHandler = (e) => {
      if (!this.running) return;
      e.preventDefault();
      
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * this.width;
      const y = ((clientY - rect.top) / rect.height) * this.height;
      
      if (this.phase === "betting") {
        this.handleBettingClick(x, y);
      } else if (this.phase === "result") {
        this.handleResultClick(x, y);
      }
    };
    
    this.canvas.addEventListener("click", this.clickHandler);
    this.canvas.addEventListener("touchstart", this.clickHandler, { passive: false });
  }

  handleBettingClick(x, y) {
    // 检查是否点击了马匹卡片
    this.horses.forEach((horse, index) => {
      const cardY = 155 + index * 85;
      if (y >= cardY && y <= cardY + 70 && x >= 25 && x <= this.width - 25) {
        this.selectedHorse = horse.id;
      }
    });
    
    // 检查下注按钮
    if (this.selectedHorse) {
      const betY = 535;
      const betButtons = [
        { amount: 1 },
        { amount: 5 },
        { amount: 10 },
        { amount: this.currentFragments }
      ];
      
      const buttonWidth = 68;
      const buttonGap = 10;
      const totalWidth = buttonWidth * 4 + buttonGap * 3;
      const startX = (this.width - totalWidth) / 2;
      
      betButtons.forEach((btn, i) => {
        const btnX = startX + i * (buttonWidth + buttonGap);
        const inButton = x >= btnX && x <= btnX + buttonWidth && 
                        y >= betY + 20 && y <= betY + 64;
        const hasFragments = this.currentFragments >= btn.amount;
        
        if (inButton && hasFragments) {
          this.placeBet(btn.amount);
        }
      });
      
      // 开始比赛按钮
      if (this.betAmount > 0) {
        const startBtnX = this.width / 2 - 95;
        const startBtnY = betY + 135;
        if (x >= startBtnX && x <= startBtnX + 190 && 
            y >= startBtnY && y <= startBtnY + 55) {
          this.startRace();
        }
      }
    }
  }

  handleResultClick(x, y) {
    // 再来一局按钮
    const cardHeight = 400;
    const cardY = (this.height - cardHeight) / 2 - 20;
    const btnY = cardY + cardHeight + 22;
    
    if (x >= this.width / 2 - 105 && x <= this.width / 2 + 105 &&
        y >= btnY && y <= btnY + 52) {
      this.resetGame();
    }
  }

  placeBet(amount) {
    if (this.currentFragments >= amount) {
      this.betAmount = Math.min(amount, this.currentFragments);
    }
  }

  startRace() {
    this.phase = "racing";
    this.currentFragments -= this.betAmount;
    
    // 通知外部碎片变化
    this.onEnd({ fragments: this.currentFragments, score: 0 });
    
    // 随机初始化马的速度（带一些随机性）
    this.horses.forEach(horse => {
      horse.position = 0;
      horse.baseSpeed = 40 + Math.random() * 20; // 40-60
      horse.speed = horse.baseSpeed;
    });
  }

  resetGame() {
    this.phase = "betting";
    this.betAmount = 0;
    this.selectedHorse = null;
    this.winner = null;
    this.raceFinished = false;
    this.horses.forEach(horse => {
      horse.position = 0;
      horse.speed = 0;
    });
  }

  loop() {
    if (!this.running) return;
    
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    
    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    if (this.phase === "racing" && !this.raceFinished) {
      // 更新马的位置
      this.horses.forEach(horse => {
        // 添加随机波动
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
        horse.speed = horse.baseSpeed * randomFactor;
        horse.position += horse.speed * dt;
        
        // 检查是否到达终点
        if (horse.position >= this.finishLine && !this.winner) {
          this.winner = horse;
          this.raceFinished = true;
          this.phase = "result";
          
          // 计算奖励
          if (this.selectedHorse === horse.id) {
            const winAmount = Math.floor(this.betAmount * horse.odds);
            this.currentFragments += winAmount;
          }
          
          // 通知外部碎片变化
          this.onEnd({ fragments: this.currentFragments, score: 0 });
        }
      });
    }
  }

  draw() {
    // 清屏 - 使用主界面的背景色
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#E8F5F7");
    gradient.addColorStop(1, "#FFF5E6");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    if (this.phase === "betting") {
      this.drawBettingScreen();
    } else if (this.phase === "racing") {
      this.drawRacingScreen();
    } else if (this.phase === "result") {
      this.drawResultScreen();
    }
  }

  drawBettingScreen() {
    // 标题
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "600 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🏇 一马当先", this.width / 2, 50);
    
    // 碎片余额 - 圆角矩形
    const balanceY = 85;
    this.ctx.fillStyle = "#FFD93D";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 100, balanceY, 200, 45, 22);
    this.ctx.fill();
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText(`🧩 ${this.currentFragments} 碎片`, this.width / 2, balanceY + 22);
    
    // 马匹选项 - 可爱的卡片
    this.horses.forEach((horse, index) => {
      const y = 155 + index * 85;
      const isSelected = this.selectedHorse === horse.id;
      
      // 卡片阴影
      this.ctx.shadowColor = isSelected ? "rgba(0, 0, 0, 0.12)" : "rgba(0, 0, 0, 0.06)";
      this.ctx.shadowBlur = isSelected ? 12 : 6;
      this.ctx.shadowOffsetY = isSelected ? 4 : 2;
      
      // 卡片背景
      if (isSelected) {
        const gradient = this.ctx.createLinearGradient(0, y, 0, y + 70);
        gradient.addColorStop(0, horse.color);
        gradient.addColorStop(1, this.lightenColor(horse.color, 10));
        this.ctx.fillStyle = gradient;
      } else {
        this.ctx.fillStyle = "#FFFFFF";
      }
      
      this.ctx.beginPath();
      this.ctx.roundRect(25, y, this.width - 50, 70, 16);
      this.ctx.fill();
      
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
      
      // 马的图标 - 居中对齐
      this.ctx.font = "44px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(horse.emoji, 60, y + 35);
      
      // 马的名字
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = isSelected ? "#FFFFFF" : "#2D3748";
      this.ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.textBaseline = "alphabetic";
      this.ctx.fillText(horse.name, 100, y + 30);
      
      // 赔率说明
      this.ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.fillStyle = isSelected ? "rgba(255,255,255,0.85)" : "#718096";
      this.ctx.fillText(`赔率 ${horse.odds}x`, 100, y + 52);
      
      // 右侧赔率大字
      this.ctx.textAlign = "right";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = isSelected ? "#FFFFFF" : horse.color;
      this.ctx.font = "700 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.fillText(`${horse.odds}x`, this.width - 40, y + 35);
    });
    
    // 下注区域
    const betY = 535;
    
    if (this.selectedHorse) {
      const selectedHorse = this.horses.find(h => h.id === this.selectedHorse);
      
      // 已选提示
      this.ctx.fillStyle = "#718096";
      this.ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(`已选择 ${selectedHorse.emoji} ${selectedHorse.name}`, this.width / 2, betY);
      
      // 下注金额按钮
      const betButtons = [
        { amount: 1, label: "1🧩" },
        { amount: 5, label: "5🧩" },
        { amount: 10, label: "10🧩" },
        { amount: this.currentFragments, label: "全部" }
      ];
      
      const buttonWidth = 68;
      const buttonGap = 10;
      const totalWidth = buttonWidth * 4 + buttonGap * 3;
      const startX = (this.width - totalWidth) / 2;
      
      betButtons.forEach((btn, i) => {
        const x = startX + i * (buttonWidth + buttonGap);
        const canBet = this.currentFragments >= btn.amount;
        const isActive = this.betAmount === btn.amount;
        
        // 按钮阴影
        if (canBet) {
          this.ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
          this.ctx.shadowBlur = 6;
          this.ctx.shadowOffsetY = 2;
        }
        
        // 按钮背景
        if (isActive) {
          this.ctx.fillStyle = "#FF9A76";
        } else if (canBet) {
          this.ctx.fillStyle = "#A8E6CF";
        } else {
          this.ctx.fillStyle = "#E2E8F0";
        }
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, betY + 20, buttonWidth, 44, 22);
        this.ctx.fill();
        
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 按钮文字
        this.ctx.fillStyle = isActive ? "#FFFFFF" : "#2D3748";
        this.ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(btn.label, x + buttonWidth / 2, betY + 42);
      });
      
      // 当前下注显示
      if (this.betAmount > 0) {
        this.ctx.fillStyle = "#2D3748";
        this.ctx.font = "600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`下注: ${this.betAmount} 🧩`, this.width / 2, betY + 92);
        
        const potentialWin = Math.floor(this.betAmount * selectedHorse.odds);
        this.ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
        this.ctx.fillStyle = "#48BB78";
        this.ctx.fillText(`可赢: ${potentialWin} 🧩`, this.width / 2, betY + 115);
        
        // 开始比赛按钮
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 3;
        
        const gradient = this.ctx.createLinearGradient(0, betY + 135, 0, betY + 190);
        gradient.addColorStop(0, "#FFD93D");
        gradient.addColorStop(1, "#FFB84D");
        this.ctx.fillStyle = gradient;
        
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 95, betY + 135, 190, 55, 28);
        this.ctx.fill();
        
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillStyle = "#2D3748";
        this.ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
        this.ctx.fillText("🏁 开始比赛", this.width / 2, betY + 162);
      }
    } else {
      // 提示选择
      this.ctx.fillStyle = "#A0AEC0";
      this.ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("👆 请选择一匹马开始下注", this.width / 2, betY + 50);
    }
  }
  
  drawRacingScreen() {
    // 标题
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "600 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🏁 比赛进行中", this.width / 2, 50);
    
    // 下注信息
    const selectedHorse = this.horses.find(h => h.id === this.selectedHorse);
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.fillStyle = "#FFD93D";
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 120, 80, 240, 42, 21);
    this.ctx.fill();
    
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText(`押注 ${selectedHorse.emoji} ${selectedHorse.name} ${this.betAmount}🧩`, this.width / 2, 101);
    
    // 绘制赛道
    const trackStartY = 145;
    
    this.horses.forEach((horse, index) => {
      const y = trackStartY + index * 80;
      
      // 赛道卡片
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = 2;
      
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.width - 40, 68, 14);
      this.ctx.fill();
      
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
      
      // 马的名字和星标
      this.ctx.fillStyle = "#2D3748";
      this.ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      
      if (this.selectedHorse === horse.id) {
        this.ctx.fillStyle = "#FFD93D";
        this.ctx.font = "18px Arial";
        this.ctx.fillText("★", 30, y + 10);
        this.ctx.fillStyle = "#2D3748";
        this.ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
        this.ctx.fillText(horse.name, 52, y + 12);
      } else {
        this.ctx.fillText(horse.name, 30, y + 12);
      }
      
      // 进度条背景
      const progressBarX = 30;
      const progressBarY = y + 36;
      const progressBarWidth = this.width - 100;
      this.ctx.fillStyle = "#F0F0F0";
      this.ctx.beginPath();
      this.ctx.roundRect(progressBarX, progressBarY, progressBarWidth, 24, 12);
      this.ctx.fill();
      
      // 进度条
      const progress = Math.min(horse.position / this.finishLine, 1);
      if (progress > 0.01) {
        const gradient = this.ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth * progress, 0);
        gradient.addColorStop(0, horse.color);
        gradient.addColorStop(1, this.lightenColor(horse.color, 20));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(progressBarX, progressBarY, progressBarWidth * progress, 24, 12);
        this.ctx.fill();
      }
      
      // 马的图标（在进度条上移动）
      const horseX = progressBarX + progressBarWidth * progress;
      this.ctx.font = "36px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(horse.emoji, Math.max(progressBarX + 12, horseX - 12), progressBarY + 12);
      
      // 进度百分比
      this.ctx.fillStyle = "#A0AEC0";
      this.ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.textAlign = "right";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(`${Math.floor(progress * 100)}%`, this.width - 30, progressBarY + 12);
    });
  }
  
  // 辅助函数：颜色变亮
  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  drawResultScreen() {
    // 半透明遮罩
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 结果卡片
    const cardWidth = 300;
    const cardHeight = 400;
    const cardX = (this.width - cardWidth) / 2;
    const cardY = (this.height - cardHeight) / 2 - 20;
    
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetY = 8;
    
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 18);
    this.ctx.fill();
    
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 判断输赢
    const isWin = this.selectedHorse === this.winner.id;
    const yourHorse = this.horses.find(h => h.id === this.selectedHorse);
    
    // 顶部装饰
    this.ctx.fillStyle = isWin ? "#A8E6CF" : "#FF9A76";
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardWidth, 90, [18, 18, 0, 0]);
    this.ctx.fill();
    
    // 大表情
    this.ctx.font = "54px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(isWin ? "🎉" : "😢", this.width / 2, cardY + 42);
    
    // 标题
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText(isWin ? "恭喜中奖!" : "很遗憾", this.width / 2, cardY + 75);
    
    // 冠军信息
    this.ctx.fillStyle = "#A0AEC0";
    this.ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText("🏆 冠军", this.width / 2, cardY + 120);
    
    this.ctx.font = "46px Arial";
    this.ctx.fillText(this.winner.emoji, this.width / 2, cardY + 165);
    
    this.ctx.fillStyle = this.winner.color;
    this.ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText(this.winner.name, this.width / 2, cardY + 205);
    
    // 分隔线
    this.ctx.strokeStyle = "#E2E8F0";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + 45, cardY + 230);
    this.ctx.lineTo(cardX + cardWidth - 45, cardY + 230);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // 你的选择
    this.ctx.fillStyle = "#A0AEC0";
    this.ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText("你的选择", this.width / 2, cardY + 258);
    
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.fillText(`${yourHorse.emoji} ${yourHorse.name}`, this.width / 2, cardY + 285);
    
    // 结算
    if (isWin) {
      const winAmount = Math.floor(this.betAmount * this.winner.odds);
      this.ctx.fillStyle = "#48BB78";
      this.ctx.font = "700 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.fillText(`+${winAmount} 🧩`, this.width / 2, cardY + 330);
      
      this.ctx.fillStyle = "#CBD5E0";
      this.ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.fillText(`(${this.betAmount} × ${this.winner.odds})`, this.width / 2, cardY + 360);
    } else {
      this.ctx.fillStyle = "#F56565";
      this.ctx.font = "700 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
      this.ctx.fillText(`-${this.betAmount} 🧩`, this.width / 2, cardY + 330);
    }
    
    // 再来一局按钮
    const btnY = cardY + cardHeight + 22;
    
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 3;
    
    const gradient = this.ctx.createLinearGradient(0, btnY, 0, btnY + 52);
    gradient.addColorStop(0, "#FFD93D");
    gradient.addColorStop(1, "#FFB84D");
    this.ctx.fillStyle = gradient;
    
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 105, btnY, 210, 52, 26);
    this.ctx.fill();
    
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "600 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🔄 再来一局", this.width / 2, btnY + 26);
  }

  cleanup() {
    this.canvas.removeEventListener("click", this.clickHandler);
    this.canvas.removeEventListener("touchstart", this.clickHandler);
  }
}

export { RaceGame };
