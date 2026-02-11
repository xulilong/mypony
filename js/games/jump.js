// 小马跳跳跳 - Flappy Bird 风格
class JumpGame {
  constructor(canvas, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onEnd = onEnd;
    this.width = canvas.width;
    this.height = canvas.height;

    // 小马
    this.horse = { x: 80, y: 200, vy: 0, size: 36 };
    this.gravity = 0.45;
    this.jumpForce = -7.5;

    // 障碍物（栅栏）
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 130;
    this.pipeSpeed = 2.5;
    this.pipeTimer = 0;
    this.pipeInterval = 100;

    // 地面
    this.groundY = this.height - 40;
    this.groundScroll = 0;

    // 游戏状态
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem("pony_jump_best") || "0");
    this.running = false;
    this.gameOver = false;
    this.started = false;
    this.frame = 0;

    // 云朵装饰
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: 20 + Math.random() * 80,
        size: 20 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.5
      });
    }

    this.bindInput();
    this.running = true;
    this.loop();
  }

  bindInput() {
    this.handleTap = (e) => {
      e.preventDefault();
      
      // 游戏结束时检查重启按钮
      if (this.gameOver) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        if (this.restartButton) {
          const btn = this.restartButton;
          if (x >= btn.x && x <= btn.x + btn.width &&
              y >= btn.y && y <= btn.y + btn.height) {
            this.restartGame();
            return;
          }
        }
        return;
      }
      
      if (!this.started) this.started = true;
      this.horse.vy = this.jumpForce;
    };
    this.canvas.addEventListener("touchstart", this.handleTap);
    this.canvas.addEventListener("mousedown", this.handleTap);
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (!this.started || this.gameOver) return;
    this.frame++;

    // 小马物理
    this.horse.vy += this.gravity;
    this.horse.y += this.horse.vy;

    // 地面碰撞
    if (this.horse.y + this.horse.size / 2 > this.groundY) {
      this.endGame();
      return;
    }
    // 天花板
    if (this.horse.y < 0) {
      this.horse.y = 0;
      this.horse.vy = 0;
    }

    // 地面滚动
    this.groundScroll = (this.groundScroll + this.pipeSpeed) % 40;

    // 云朵
    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.size < 0) c.x = this.width + c.size;
    });

    // 生成障碍
    this.pipeTimer++;
    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      const gapY = 60 + Math.random() * (this.groundY - this.pipeGap - 120);
      this.pipes.push({ x: this.width, gapY, scored: false });
    }

    // 移动障碍
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;

      // 计分
      if (!this.pipes[i].scored && this.pipes[i].x + this.pipeWidth < this.horse.x) {
        this.pipes[i].scored = true;
        this.score++;
        // 加速
        if (this.score % 5 === 0) {
          this.pipeSpeed = Math.min(5, this.pipeSpeed + 0.3);
          this.pipeGap = Math.max(100, this.pipeGap - 3);
        }
      }

      // 碰撞检测
      if (this.checkCollision(this.pipes[i])) {
        this.endGame();
        return;
      }

      // 移除屏幕外的
      if (this.pipes[i].x + this.pipeWidth < -10) {
        this.pipes.splice(i, 1);
      }
    }
  }

  checkCollision(pipe) {
    const h = this.horse;
    const hx = h.x - h.size / 3;
    const hy = h.y - h.size / 3;
    const hw = h.size * 0.6;
    const hh = h.size * 0.6;

    // 上方栅栏
    if (hx + hw > pipe.x && hx < pipe.x + this.pipeWidth &&
        hy < pipe.gapY) return true;
    // 下方栅栏
    if (hx + hw > pipe.x && hx < pipe.x + this.pipeWidth &&
        hy + hh > pipe.gapY + this.pipeGap) return true;

    return false;
  }

  endGame() {
    this.gameOver = true;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("pony_jump_best", this.bestScore);
    }
    // 碎片奖励：每5分1碎片
    const fragments = Math.floor(this.score / 5);
    setTimeout(() => {
      this.running = false;
      this.cleanup();
      this.onEnd({ score: this.score, best: this.bestScore, fragments });
    }, 1500);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 天空
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, "#87CEEB");
    skyGrad.addColorStop(1, "#E0F7FA");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 云朵
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    this.clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.3, c.y - c.size * 0.15, c.size * 0.4, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.6, c.y, c.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });

    // 栅栏障碍
    this.pipes.forEach(pipe => {
      // 上栅栏
      ctx.fillStyle = "#8B5E3C";
      ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
      ctx.fillStyle = "#A0724A";
      ctx.fillRect(pipe.x - 4, pipe.gapY - 20, this.pipeWidth + 8, 20);
      // 栅栏纹理
      ctx.strokeStyle = "#6B4226";
      ctx.lineWidth = 2;
      for (let y = 10; y < pipe.gapY - 20; y += 20) {
        ctx.beginPath();
        ctx.moveTo(pipe.x, y);
        ctx.lineTo(pipe.x + this.pipeWidth, y);
        ctx.stroke();
      }

      // 下栅栏
      const bottomY = pipe.gapY + this.pipeGap;
      ctx.fillStyle = "#8B5E3C";
      ctx.fillRect(pipe.x, bottomY, this.pipeWidth, h - bottomY);
      ctx.fillStyle = "#A0724A";
      ctx.fillRect(pipe.x - 4, bottomY, this.pipeWidth + 8, 20);
      ctx.strokeStyle = "#6B4226";
      for (let y = bottomY + 25; y < this.groundY; y += 20) {
        ctx.beginPath();
        ctx.moveTo(pipe.x, y);
        ctx.lineTo(pipe.x + this.pipeWidth, y);
        ctx.stroke();
      }
    });

    // 地面
    ctx.fillStyle = "#7ec87e";
    ctx.fillRect(0, this.groundY, w, h - this.groundY);
    ctx.fillStyle = "#6ab06a";
    for (let x = -this.groundScroll; x < w; x += 40) {
      ctx.fillRect(x, this.groundY, 20, 4);
    }

    // 小马
    this.drawHorse(ctx);

    // 分数
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#8B6F5E";
    ctx.lineWidth = 3;
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(this.score, w / 2, 50);
    ctx.fillText(this.score, w / 2, 50);

    // 开始提示
    if (!this.started) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px 'PingFang SC', sans-serif";
      ctx.fillText("点击屏幕让小马起飞！", w / 2, h / 2);
      ctx.font = "16px sans-serif";
      ctx.fillText("躲避栅栏，坚持越久分越高", w / 2, h / 2 + 35);
    }

    // 游戏结束
    if (this.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#FFD93D";
      ctx.font = "bold 28px 'PingFang SC', sans-serif";
      ctx.fillText("游戏结束！", w / 2, h / 2 - 30);
      ctx.fillStyle = "#fff";
      ctx.font = "22px sans-serif";
      ctx.fillText(`得分: ${this.score}  最高: ${this.bestScore}`, w / 2, h / 2 + 10);
      const frags = Math.floor(this.score / 5);
      if (frags > 0) {
        ctx.font = "18px sans-serif";
        ctx.fillText(`🧩 获得 ${frags} 个碎片！`, w / 2, h / 2 + 45);
      }
      
      // 再玩一次按钮
      this.drawRestartButton(ctx, w, h);
    }
  }

  drawHorse(ctx) {
    const { x, y, vy, size } = this.horse;
    ctx.save();
    ctx.translate(x, y);

    // 根据速度旋转
    const angle = Math.max(-0.4, Math.min(0.4, vy * 0.04));
    ctx.rotate(angle);

    // 身体
    ctx.fillStyle = "#C4A882";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头
    ctx.fillStyle = "#C4A882";
    ctx.beginPath();
    ctx.ellipse(size * 0.3, -size * 0.15, size * 0.2, size * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(size * 0.38, -size * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();

    // 耳朵
    ctx.fillStyle = "#B09070";
    ctx.beginPath();
    ctx.moveTo(size * 0.25, -size * 0.28);
    ctx.lineTo(size * 0.2, -size * 0.42);
    ctx.lineTo(size * 0.32, -size * 0.3);
    ctx.fill();

    // 鬃毛
    ctx.fillStyle = "#8B6F5E";
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.25);
    ctx.quadraticCurveTo(-size * 0.05, -size * 0.35, size * 0.15, -size * 0.35);
    ctx.quadraticCurveTo(size * 0.25, -size * 0.3, size * 0.2, -size * 0.2);
    ctx.fill();

    // 尾巴
    ctx.fillStyle = "#8B6F5E";
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size * 0.05);
    ctx.quadraticCurveTo(-size * 0.6, -size * 0.2, -size * 0.55, size * 0.05);
    ctx.quadraticCurveTo(-size * 0.5, size * 0.15, -size * 0.35, size * 0.05);
    ctx.fill();

    // 腿（简化为小短腿，可爱）
    ctx.fillStyle = "#B09070";
    [[-0.15, 0.25], [0.05, 0.25], [0.15, 0.25], [-0.05, 0.25]].forEach(([ox, oy], i) => {
      const legY = oy * size + Math.sin(this.frame * 0.3 + i) * 3;
      ctx.fillRect(ox * size - 3, legY, 6, size * 0.15);
    });

    // 腮红
    ctx.fillStyle = "rgba(255,182,193,0.5)";
    ctx.beginPath();
    ctx.ellipse(size * 0.35, -size * 0.08, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawRestartButton(ctx, w, h) {
    const btnWidth = 200;
    const btnHeight = 55;
    const btnX = w / 2 - btnWidth / 2;
    const btnY = h / 2 + 80;
    
    // 存储按钮位置供点击检测
    this.restartButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    
    // 按钮阴影
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    // 按钮背景渐变
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
    
    // 按钮文字
    ctx.fillStyle = "#2D3748";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔄 再玩一次", w / 2, btnY + btnHeight / 2);
  }
  
  restartGame() {
    // 重置游戏状态
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.frame = 0;
    this.running = true;
    
    // 重置小马位置
    this.horse.y = this.canvas.height / 2;
    this.horse.vy = 0;
    
    // 清空障碍物
    this.pipes = [];
    this.pipeTimer = 0;
  }

  cleanup() {
    this.canvas.removeEventListener("touchstart", this.handleTap);
    this.canvas.removeEventListener("mousedown", this.handleTap);
  }
}

export { JumpGame };
