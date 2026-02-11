// 马蹄节奏 - 音游式踩节拍
class RhythmGame {
  constructor(canvas, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onEnd = onEnd;
    this.width = canvas.width;
    this.height = canvas.height;

    // 轨道设置
    this.lanes = 3;
    this.laneWidth = this.width / this.lanes;
    this.hitZoneY = this.height - 80;
    this.hitZoneHeight = 50;

    // 音符（马蹄印）
    this.notes = [];
    this.noteSpeed = 3;
    this.spawnTimer = 0;
    this.spawnInterval = 35;
    this.noteSize = 36;

    // 游戏状态
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.misses = 0;
    this.maxMisses = 10;
    this.bestScore = parseInt(localStorage.getItem("pony_rhythm_best") || "0");
    this.running = false;
    this.gameOver = false;
    this.frame = 0;

    // 判定反馈
    this.judgments = []; // { text, x, y, life, color }
    this.hitEffects = []; // { x, y, life }

    // 节拍模式（预设节奏型，循环使用）
    this.patterns = [
      [1], [0], [2], [1],
      [0, 2], [1], [0], [2],
      [1, 2], [0], [1], [0, 1],
      [2], [0], [1, 2], [0],
    ];
    this.patternIndex = 0;

    this.bindInput();
    this.running = true;
    this.loop();
  }

  bindInput() {
    this.handleTap = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * this.width;
      const y = ((clientY - rect.top) / rect.height) * this.height;
      
      // 检测重新开始按钮点击
      if (this.gameOver && this.restartButton) {
        const btn = this.restartButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
          this.restartGame();
          return;
        }
      }
      
      if (this.gameOver) return;
      const lane = Math.floor(x / this.laneWidth);
      this.tryHit(Math.max(0, Math.min(this.lanes - 1, lane)));
    };
    this.canvas.addEventListener("touchstart", this.handleTap, { passive: false });
    this.canvas.addEventListener("mousedown", this.handleTap);
  }

  tryHit(lane) {
    // 找最近的可击中音符
    let closest = null;
    let closestDist = Infinity;

    for (const note of this.notes) {
      if (note.lane === lane && !note.hit) {
        const dist = Math.abs(note.y - this.hitZoneY);
        if (dist < this.hitZoneHeight && dist < closestDist) {
          closest = note;
          closestDist = dist;
        }
      }
    }

    const laneX = lane * this.laneWidth + this.laneWidth / 2;

    if (closest) {
      closest.hit = true;
      let judgment, color, points;

      if (closestDist < 15) {
        judgment = "Perfect!"; color = "#FFD93D"; points = 3;
      } else if (closestDist < 30) {
        judgment = "Great!"; color = "#7ec87e"; points = 2;
      } else {
        judgment = "OK"; color = "#87CEEB"; points = 1;
      }

      this.score += points * (1 + Math.floor(this.combo / 10));
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);

      this.judgments.push({ text: judgment, x: laneX, y: this.hitZoneY - 30, life: 30, color });
      this.hitEffects.push({ x: laneX, y: this.hitZoneY, life: 15 });

      // 加速
      if (this.combo % 15 === 0) {
        this.noteSpeed = Math.min(6, this.noteSpeed + 0.2);
        this.spawnInterval = Math.max(18, this.spawnInterval - 2);
      }
    } else {
      // 空击
      this.hitEffects.push({ x: laneX, y: this.hitZoneY, life: 8 });
    }
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

    // 生成音符
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const pattern = this.patterns[this.patternIndex % this.patterns.length];
      this.patternIndex++;
      for (const lane of pattern) {
        this.notes.push({
          lane,
          x: lane * this.laneWidth + this.laneWidth / 2,
          y: -this.noteSize,
          hit: false
        });
      }
    }

    // 移动音符
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      note.y += this.noteSpeed;

      // 漏掉
      if (!note.hit && note.y > this.hitZoneY + this.hitZoneHeight) {
        this.misses++;
        this.combo = 0;
        this.judgments.push({
          text: "Miss",
          x: note.x,
          y: this.hitZoneY - 30,
          life: 25,
          color: "#ff6b6b"
        });
        this.notes.splice(i, 1);
        if (this.misses >= this.maxMisses) {
          this.endGame();
          return;
        }
        continue;
      }

      // 已击中的移除
      if (note.hit) {
        this.notes.splice(i, 1);
        continue;
      }

      // 超出屏幕
      if (note.y > this.height + 50) {
        this.notes.splice(i, 1);
      }
    }

    // 更新判定文字
    for (let i = this.judgments.length - 1; i >= 0; i--) {
      this.judgments[i].y -= 1.5;
      this.judgments[i].life--;
      if (this.judgments[i].life <= 0) this.judgments.splice(i, 1);
    }

    // 更新击中特效
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      this.hitEffects[i].life--;
      if (this.hitEffects[i].life <= 0) this.hitEffects.splice(i, 1);
    }
  }

  endGame() {
    this.gameOver = true;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("pony_rhythm_best", this.bestScore);
    }
    const fragments = Math.floor(this.score / 15);
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

    // 背景
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, w, h);

    // 轨道线
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i < this.lanes; i++) {
      ctx.beginPath();
      ctx.moveTo(i * this.laneWidth, 0);
      ctx.lineTo(i * this.laneWidth, h);
      ctx.stroke();
    }

    // 判定区域
    const hitGrad = ctx.createLinearGradient(0, this.hitZoneY - this.hitZoneHeight / 2, 0, this.hitZoneY + this.hitZoneHeight / 2);
    hitGrad.addColorStop(0, "rgba(255,217,61,0)");
    hitGrad.addColorStop(0.5, "rgba(255,217,61,0.3)");
    hitGrad.addColorStop(1, "rgba(255,217,61,0)");
    ctx.fillStyle = hitGrad;
    ctx.fillRect(0, this.hitZoneY - this.hitZoneHeight / 2, w, this.hitZoneHeight);

    // 判定线
    ctx.strokeStyle = "rgba(255,217,61,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.hitZoneY);
    ctx.lineTo(w, this.hitZoneY);
    ctx.stroke();

    // 击中特效
    this.hitEffects.forEach(eff => {
      const alpha = eff.life / 15;
      const radius = (15 - eff.life) * 3;
      ctx.strokeStyle = `rgba(255,217,61,${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(eff.x, eff.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 音符（马蹄印）
    this.notes.forEach(note => {
      if (note.hit) return;
      ctx.font = `${this.noteSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 接近判定区时发光
      const dist = Math.abs(note.y - this.hitZoneY);
      if (dist < this.hitZoneHeight) {
        ctx.shadowColor = "#FFD93D";
        ctx.shadowBlur = 15;
      }
      ctx.fillText("🐴", note.x, note.y);
      ctx.shadowBlur = 0;
    });

    // 判定文字
    this.judgments.forEach(j => {
      ctx.globalAlpha = j.life / 30;
      ctx.font = "bold 18px 'PingFang SC', sans-serif";
      ctx.fillStyle = j.color;
      ctx.textAlign = "center";
      ctx.fillText(j.text, j.x, j.y);
    });
    ctx.globalAlpha = 1;

    // 底部轨道按钮提示
    for (let i = 0; i < this.lanes; i++) {
      const cx = i * this.laneWidth + this.laneWidth / 2;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.arc(cx, h - 30, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.textAlign = "center";
      ctx.fillText(["👈", "👇", "👉"][i], cx, h - 26);
    }

    // 顶部UI
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.score, w / 2, 40);

    // 连击
    if (this.combo >= 3) {
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#FFD93D";
      ctx.fillText(`${this.combo} Combo`, w / 2, 65);
    }

    // Miss 计数
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText(`Miss: ${this.misses}/${this.maxMisses}`, 10, 30);

    // 游戏结束
    if (this.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD93D";
      ctx.font = "bold 28px 'PingFang SC', sans-serif";
      ctx.fillText("游戏结束！", w / 2, h / 2 - 50);
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`得分: ${this.score}  最高: ${this.bestScore}`, w / 2, h / 2 - 10);
      ctx.fillText(`最大连击: ${this.maxCombo}`, w / 2, h / 2 + 25);
      const frags = Math.floor(this.score / 15);
      if (frags > 0) {
        ctx.font = "18px sans-serif";
        ctx.fillText(`🧩 获得 ${frags} 个碎片！`, w / 2, h / 2 + 60);
      }
      
      // 再玩一次按钮
      this.drawRestartButton();
    }
  }

  drawRestartButton() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    const btnWidth = 200;
    const btnHeight = 55;
    const btnX = w / 2 - btnWidth / 2;
    const btnY = h / 2 + 100;
    
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
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔄 再玩一次", w / 2, btnY + btnHeight / 2);
  }
  
  restartGame() {
    // 重置游戏状态
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.misses = 0;
    this.gameOver = false;
    this.running = true;
    this.frame = 0;
    
    // 重置音符和特效
    this.notes = [];
    this.judgments = [];
    this.hitEffects = [];
    
    // 重置速度和生成间隔
    this.noteSpeed = 3;
    this.spawnTimer = 0;
    this.spawnInterval = 35;
    this.patternIndex = 0;
  }

  cleanup() {
    this.canvas.removeEventListener("touchstart", this.handleTap);
    this.canvas.removeEventListener("mousedown", this.handleTap);
  }
}

export { RhythmGame };
