// 接草料 - 左右移动接住掉落物
class CatchGame {
  constructor(canvas, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onEnd = onEnd;
    this.width = canvas.width;
    this.height = canvas.height;

    // 小马（底部接住）
    this.horse = { x: this.width / 2, y: this.height - 70, width: 60, height: 50 };

    // 掉落物
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = 45;

    // 游戏状态
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.bestScore = parseInt(localStorage.getItem("pony_catch_best") || "0");
    this.running = false;
    this.gameOver = false;
    this.frame = 0;
    this.speed = 2;

    // 特效
    this.particles = [];
    this.shakeAmount = 0;

    // 触控
    this.touchX = null;
    this.bindInput();
    this.running = true;
    this.loop();
  }

  bindInput() {
    this.handleMove = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      this.horse.x = ((clientX - rect.left) / rect.width) * this.width;
      this.horse.x = Math.max(this.horse.width / 2, Math.min(this.width - this.horse.width / 2, this.horse.x));
    };
    
    this.handleClick = (e) => {
      if (this.gameOver && this.restartButton) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = ((clientX - rect.left) / rect.width) * this.width;
        const y = ((clientY - rect.top) / rect.height) * this.height;
        
        const btn = this.restartButton;
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          this.restartGame();
        }
      }
    };
    
    this.canvas.addEventListener("touchmove", this.handleMove, { passive: false });
    this.canvas.addEventListener("mousemove", this.handleMove);
    this.canvas.addEventListener("touchstart", this.handleMove, { passive: false });
    this.canvas.addEventListener("touchend", this.handleClick, { passive: false });
    this.canvas.addEventListener("click", this.handleClick);
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;
    this.frame++;

    // 震动衰减
    if (this.shakeAmount > 0) this.shakeAmount *= 0.9;

    // 生成掉落物
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnItem();
      // 逐渐加速
      if (this.frame % 300 === 0) {
        this.speed = Math.min(5, this.speed + 0.2);
        this.spawnInterval = Math.max(20, this.spawnInterval - 2);
      }
    }

    // 更新掉落物
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;
      item.rotation += item.rotSpeed;

      // 接住判定
      if (item.y + item.size > this.horse.y &&
          item.y < this.horse.y + this.horse.height &&
          Math.abs(item.x - this.horse.x) < (this.horse.width / 2 + item.size / 2)) {
        if (item.type === "bomb") {
          this.lives--;
          this.combo = 0;
          this.shakeAmount = 8;
          this.spawnParticles(item.x, item.y, "#ff4444", 10);
          if (this.lives <= 0) {
            this.endGame();
            return;
          }
        } else {
          const points = item.type === "golden" ? 3 : 1;
          this.score += points * (1 + Math.floor(this.combo / 5));
          this.combo++;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.spawnParticles(item.x, item.y, item.type === "golden" ? "#FFD700" : "#FF8C00", 6);
        }
        this.items.splice(i, 1);
        continue;
      }

      // 掉出屏幕
      if (item.y > this.height + 20) {
        if (item.type !== "bomb") {
          this.combo = 0; // 漏接草料断连击
        }
        this.items.splice(i, 1);
      }
    }

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  spawnItem() {
    const rand = Math.random();
    let type, emoji, size, color;
    if (rand < 0.15) {
      type = "bomb"; emoji = "💣"; size = 28; color = "#333";
    } else if (rand < 0.25) {
      type = "golden"; emoji = "🌾"; size = 30; color = "#FFD700";
    } else {
      type = "hay"; emoji = "🌾"; size = 26; color = "#DEB887";
    }

    this.items.push({
      x: 30 + Math.random() * (this.width - 60),
      y: -30,
      type, emoji, size, color,
      speed: this.speed + Math.random() * 1.5,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.1
    });
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        color,
        size: 3 + Math.random() * 4,
        life: 20 + Math.random() * 15
      });
    }
  }

  endGame() {
    this.gameOver = true;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("pony_catch_best", this.bestScore);
    }
    const fragments = Math.floor(this.score / 10);
    setTimeout(() => {
      this.running = false;
      this.cleanup();
      this.onEnd({ score: this.score, best: this.bestScore, fragments, maxCombo: this.maxCombo });
    }, 1500);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    if (this.shakeAmount > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeAmount,
        (Math.random() - 0.5) * this.shakeAmount
      );
    }

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#87CEEB");
    grad.addColorStop(0.7, "#B2DFDB");
    grad.addColorStop(1, "#7ec87e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 地面
    ctx.fillStyle = "#6ab06a";
    ctx.fillRect(0, h - 30, w, 30);

    // 掉落物
    this.items.forEach(item => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.font = `${item.size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (item.type === "golden") {
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 10;
      }
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();
    });

    // 粒子
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 35;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 小马
    this.drawHorse(ctx);

    // UI
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#8B6F5E";
    ctx.lineWidth = 3;
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(this.score, w / 2, 40);
    ctx.fillText(this.score, w / 2, 40);

    // 连击
    if (this.combo >= 3) {
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = "#FFD93D";
      ctx.strokeStyle = "#8B5E3C";
      ctx.lineWidth = 2;
      const comboText = `${this.combo} 连击！`;
      ctx.strokeText(comboText, w / 2, 68);
      ctx.fillText(comboText, w / 2, 68);
    }

    // 生命
    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("❤️".repeat(this.lives) + "🖤".repeat(3 - this.lives), 10, 35);

    // 游戏结束
    if (this.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD93D";
      ctx.font = "bold 28px 'PingFang SC', sans-serif";
      ctx.fillText("游戏结束！", w / 2, h / 2 - 40);
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`得分: ${this.score}  最高: ${this.bestScore}`, w / 2, h / 2);
      ctx.fillText(`最大连击: ${this.maxCombo}`, w / 2, h / 2 + 30);
      const frags = Math.floor(this.score / 10);
      if (frags > 0) {
        ctx.font = "18px sans-serif";
        ctx.fillText(`🧩 获得 ${frags} 个碎片！`, w / 2, h / 2 + 65);
      }
      
      // 再玩一次按钮
      this.drawRestartButton(ctx, w, h);
    }

    ctx.restore();
  }

  drawHorse(ctx) {
    const { x, y } = this.horse;
    ctx.save();
    ctx.translate(x, y + 10);

    // 身体
    ctx.fillStyle = "#C4A882";
    ctx.beginPath();
    ctx.ellipse(0, 10, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头（朝上看）
    ctx.beginPath();
    ctx.ellipse(5, -8, 14, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛（朝上看的大眼睛）
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(10, -12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(9.5, -13, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴（张嘴接）
    ctx.fillStyle = "#A0724A";
    ctx.beginPath();
    ctx.arc(16, -3, 5, 0, Math.PI);
    ctx.fill();

    // 耳朵
    ctx.fillStyle = "#B09070";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-5, -30);
    ctx.lineTo(5, -20);
    ctx.fill();

    // 鬃毛
    ctx.fillStyle = "#8B6F5E";
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.quadraticCurveTo(-15, -25, -3, -28);
    ctx.quadraticCurveTo(5, -22, 0, -12);
    ctx.fill();

    // 腿
    ctx.fillStyle = "#B09070";
    [[-12, 24], [-4, 24], [8, 24], [16, 24]].forEach(([lx, ly]) => {
      ctx.fillRect(lx - 3, ly, 6, 12);
    });

    ctx.restore();
  }

  drawRestartButton(ctx, w, h) {
    const btnWidth = 200;
    const btnHeight = 55;
    const btnX = w / 2 - btnWidth / 2;
    const btnY = h / 2 + 100;
    
    this.restartButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    const gradient = ctx.createLinearGradient(0, btnY, 0, btnY + btnHeight);
    gradient.addColorStop(0, "#FFD93D");
    gradient.addColorStop(1, "#FFB84D");
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 28);
    ctx.fill();
    
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = "#2D3748";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔄 再玩一次", w / 2, btnY + btnHeight / 2);
  }
  
  restartGame() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.gameOver = false;
    this.frame = 0;
    this.speed = 2;
    this.running = true;
    
    this.items = [];
    this.particles = [];
    
    this.horse.x = this.width / 2;
  }

  cleanup() {
    this.canvas.removeEventListener("touchmove", this.handleMove);
    this.canvas.removeEventListener("mousemove", this.handleMove);
    this.canvas.removeEventListener("touchend", this.handleClick);
    this.canvas.removeEventListener("click", this.handleClick);
    this.canvas.removeEventListener("touchstart", this.handleMove);
  }
}

export { CatchGame };
