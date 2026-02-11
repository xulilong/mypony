// 马上对对碰 - 创新消除游戏
class MatchGame {
  constructor(canvas, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onEnd = onEnd;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 游戏状态
    this.running = true;
    this.score = 0;
    this.combo = 0;
    this.gameOver = false;
    this.piecesPlaced = 0; // 已放置的图标数
    
    // 棋盘设置
    this.rows = 7; // 从8改为7，减少一行避免被按钮遮挡
    this.cols = 4;
    this.cellSize = 70;
    this.offsetX = (this.width - this.cols * this.cellSize) / 2;
    this.offsetY = 100; // 从80改为100，给顶部更多空间
    
    // 计算虚拟按钮位置（预留空间）
    this.virtualButtonY = this.height - 85;
    this.virtualButtonSize = 70;
    
    // 图标类型 - 增加到5种
    this.icons = [
      { emoji: "🐴", name: "马", value: 1, color: "#8B4513" },
      { emoji: "🏇", name: "骑手", value: 2, color: "#FF6B6B" },
      { emoji: "🦄", name: "独角兽", value: 3, color: "#9B59B6", special: "bomb" },
      { emoji: "🌟", name: "神马", value: 5, color: "#FFD700", special: "line" },
      { emoji: "🎠", name: "旋转木马", value: 2, color: "#FF69B4" }
    ];
    
    // 棋盘数据
    this.board = [];
    this.initBoard();
    
    // 掉落系统 - 渐进式难度
    this.fallingIcon = null;
    this.fallingX = Math.floor(this.cols / 2);
    this.fallingY = -1;
    this.baseFallSpeed = 0.6; // 基础速度（秒）- 从1.2改为0.6，快一倍
    this.fallSpeed = this.baseFallSpeed;
    this.fallTimer = 0;
    this.manualDrop = false; // 是否手动加速
    
    // 动画
    this.particles = [];
    this.shakeAmount = 0;
    
    // 输入
    this.setupInput();
    
    // 开始游戏循环
    this.lastTime = Date.now();
    this.loop();
  }

  initBoard() {
    for (let r = 0; r < this.rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c] = null;
      }
    }
    this.spawnNewIcon();
  }

  spawnNewIcon() {
    // 根据已放置数量调整难度
    // 前10个：只有普通马
    // 10-20个：加入骑手
    // 20-30个：加入独角兽
    // 30+个：全部图标（包括旋转木马）
    const rand = Math.random();
    let iconIndex;
    
    if (this.piecesPlaced < 10) {
      // 简单阶段：只有普通马
      iconIndex = 0;
    } else if (this.piecesPlaced < 20) {
      // 中等阶段：普通马和骑手
      iconIndex = rand < 0.7 ? 0 : 1;
    } else if (this.piecesPlaced < 30) {
      // 困难阶段：前3种
      if (rand < 0.5) iconIndex = 0;
      else if (rand < 0.8) iconIndex = 1;
      else iconIndex = 2;
    } else {
      // 地狱阶段：全部5种图标
      if (rand < 0.4) iconIndex = 0;
      else if (rand < 0.65) iconIndex = 1;
      else if (rand < 0.8) iconIndex = 4; // 旋转木马
      else if (rand < 0.93) iconIndex = 2;
      else iconIndex = 3;
    }
    
    this.fallingIcon = { ...this.icons[iconIndex] };
    this.fallingX = Math.floor(this.cols / 2);
    this.fallingY = -1;
    this.fallTimer = 0;
    
    // 渐进式加速：每放置5个图标，速度提升5%
    const speedMultiplier = Math.max(0.4, 1 - (this.piecesPlaced / 100));
    this.fallSpeed = this.baseFallSpeed * speedMultiplier;
  }

  setupInput() {
    // 键盘控制
    this.keyHandler = (e) => {
      if (!this.running || this.gameOver) return;
      
      if (e.key === "ArrowLeft" && this.fallingX > 0) {
        this.fallingX--;
      } else if (e.key === "ArrowRight" && this.fallingX < this.cols - 1) {
        this.fallingX++;
      } else if (e.key === "ArrowDown" || e.key === " ") {
        this.manualDrop = true; // 手动加速
      }
    };
    
    this.keyUpHandler = (e) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        this.manualDrop = false;
      }
    };
    
    // 触摸控制
    this.virtualButtons = null; // 将在绘制时初始化
    
    this.touchStartHandler = (e) => {
      if (!this.running) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // 游戏结束时检查重启按钮
      if (this.gameOver && this.restartButton) {
        const btn = this.restartButton;
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          this.restartGame();
          return;
        }
      }
      
      // 检查是否点击了虚拟按钮
      if (this.virtualButtons) {
        // 检查左按钮
        if (this.isPointInButton(x, y, this.virtualButtons.left)) {
          if (this.fallingX > 0) this.fallingX--;
          return;
        }
        
        // 检查右按钮
        if (this.isPointInButton(x, y, this.virtualButtons.right)) {
          if (this.fallingX < this.cols - 1) this.fallingX++;
          return;
        }
        
        // 检查下按钮
        if (this.isPointInButton(x, y, this.virtualButtons.down)) {
          this.manualDrop = true;
          return;
        }
      }
    };
    
    this.touchEndHandler = (e) => {
      e.preventDefault();
      this.manualDrop = false; // 松开时停止加速
    };
    
    document.addEventListener("keydown", this.keyHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    this.canvas.addEventListener("touchstart", this.touchStartHandler);
    this.canvas.addEventListener("touchend", this.touchEndHandler);
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
    if (this.gameOver) return;
    
    // 更新掉落 - 使用实际秒数而不是固定间隔
    const currentSpeed = this.manualDrop ? 0.1 : this.fallSpeed;
    this.fallTimer += dt;
    
    if (this.fallTimer >= currentSpeed) {
      this.fallTimer = 0;
      this.fallingY++;
      
      // 检查是否落地
      if (this.fallingY >= this.rows - 1 || 
          (this.fallingY >= 0 && this.board[this.fallingY + 1][this.fallingX] !== null)) {
        this.landIcon();
      }
    }
    
    // 更新粒子
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.y -= p.vy * dt;
      p.x += p.vx * dt;
      p.vy += 200 * dt; // 重力
      return p.life > 0;
    });
    
    // 更新震动
    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.1) this.shakeAmount = 0;
    }
  }

  landIcon() {
    // 找到正确的落地位置（从当前位置往下找第一个空位）
    let landRow = this.fallingY;
    
    // 如果当前位置已经有图标，往上找空位
    while (landRow >= 0 && this.board[landRow][this.fallingX] !== null) {
      landRow--;
    }
    
    // 如果找不到空位，游戏结束
    if (landRow < 0) {
      this.endGame();
      return;
    }
    
    // 放置图标
    this.board[landRow][this.fallingX] = this.fallingIcon;
    this.piecesPlaced++; // 增加计数
    
    // 检查消除
    const matches = this.findMatches();
    if (matches.length > 0) {
      this.clearMatches(matches);
      this.combo++;
    } else {
      this.combo = 0;
    }
    
    // 检查游戏结束
    if (this.board[0].some(cell => cell !== null)) {
      this.endGame();
      return;
    }
    
    // 生成新图标
    this.spawnNewIcon();
  }

  findMatches() {
    const matches = [];
    const checked = new Set();
    
    // 检查横向
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c <= this.cols - 3; c++) {
        const icon1 = this.board[r][c];
        const icon2 = this.board[r][c + 1];
        const icon3 = this.board[r][c + 2];
        
        if (icon1 && icon2 && icon3 && 
            icon1.emoji === icon2.emoji && icon2.emoji === icon3.emoji) {
          const key = `${r},${c}`;
          if (!checked.has(key)) {
            matches.push({ r, c, dir: "h", icon: icon1 });
            checked.add(key);
          }
        }
      }
    }
    
    // 检查纵向
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r <= this.rows - 3; r++) {
        const icon1 = this.board[r][c];
        const icon2 = this.board[r + 1][c];
        const icon3 = this.board[r + 2][c];
        
        if (icon1 && icon2 && icon3 && 
            icon1.emoji === icon2.emoji && icon2.emoji === icon3.emoji) {
          const key = `${r},${c}`;
          if (!checked.has(key)) {
            matches.push({ r, c, dir: "v", icon: icon1 });
            checked.add(key);
          }
        }
      }
    }
    
    return matches;
  }

  clearMatches(matches) {
    const cellsToClear = new Set();
    
    // 收集所有要清除的格子，并再次验证
    matches.forEach(match => {
      if (match.dir === "h") {
        // 横向：再次验证这3个格子确实相同
        const icon1 = this.board[match.r][match.c];
        const icon2 = this.board[match.r][match.c + 1];
        const icon3 = this.board[match.r][match.c + 2];
        
        if (icon1 && icon2 && icon3 && 
            icon1.emoji === icon2.emoji && icon2.emoji === icon3.emoji) {
          for (let i = 0; i < 3; i++) {
            cellsToClear.add(`${match.r},${match.c + i}`);
          }
        }
      } else {
        // 纵向：再次验证这3个格子确实相同
        const icon1 = this.board[match.r][match.c];
        const icon2 = this.board[match.r + 1][match.c];
        const icon3 = this.board[match.r + 2][match.c];
        
        if (icon1 && icon2 && icon3 && 
            icon1.emoji === icon2.emoji && icon2.emoji === icon3.emoji) {
          for (let i = 0; i < 3; i++) {
            cellsToClear.add(`${match.r + i},${match.c}`);
          }
        }
      }
    });
    
    // 如果没有要清除的格子，直接返回
    if (cellsToClear.size === 0) {
      return;
    }
    
    // 计分
    const baseScore = matches.reduce((sum, m) => sum + m.icon.value * 3, 0);
    const comboMultiplier = 1 + this.combo * 0.5;
    const earnedScore = Math.floor(baseScore * comboMultiplier);
    this.score += earnedScore;
    
    // 清除并创建粒子
    cellsToClear.forEach(key => {
      const [r, c] = key.split(",").map(Number);
      const icon = this.board[r][c];
      if (icon) {
        this.createParticles(c, r, icon);
        this.board[r][c] = null;
      }
    });
    
    // 震动效果
    this.shakeAmount = 5;
    
    // 下落填充
    setTimeout(() => this.applyGravity(), 100);
  }

  applyGravity() {
    let moved = false;
    
    // 从下往上检查
    for (let r = this.rows - 1; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c] === null) {
          // 找上方第一个非空格子
          for (let r2 = r - 1; r2 >= 0; r2--) {
            if (this.board[r2][c] !== null) {
              this.board[r][c] = this.board[r2][c];
              this.board[r2][c] = null;
              moved = true;
              break;
            }
          }
        }
      }
    }
    
    if (moved) {
      // 继续检查消除
      setTimeout(() => {
        const matches = this.findMatches();
        if (matches.length > 0) {
          this.clearMatches(matches);
          this.combo++;
        } else {
          this.combo = 0;
        }
      }, 200);
    }
  }

  createParticles(col, row, icon) {
    const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
    const y = this.offsetY + row * this.cellSize + this.cellSize / 2;
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100 - 100,
        life: 0.5,
        emoji: icon.emoji,
        size: 20
      });
    }
  }

  draw() {
    // 清屏
    this.ctx.fillStyle = "#E8F5F7";
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 应用震动
    this.ctx.save();
    if (this.shakeAmount > 0) {
      this.ctx.translate(
        (Math.random() - 0.5) * this.shakeAmount,
        (Math.random() - 0.5) * this.shakeAmount
      );
    }
    
    // 绘制分数和combo
    this.ctx.fillStyle = "#4A5568";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`分数: ${this.score}`, 20, 40);
    
    // 显示难度阶段
    let stage = "简单";
    let stageColor = "#4CAF50";
    if (this.piecesPlaced >= 30) {
      stage = "地狱";
      stageColor = "#9C27B0";
    } else if (this.piecesPlaced >= 20) {
      stage = "困难";
      stageColor = "#F44336";
    } else if (this.piecesPlaced >= 10) {
      stage = "中等";
      stageColor = "#FF9800";
    }
    
    this.ctx.fillStyle = stageColor;
    this.ctx.font = "bold 16px Arial";
    this.ctx.fillText(`${stage} | 第${this.piecesPlaced}个`, this.width - 150, 40);
    
    if (this.combo > 0) {
      this.ctx.fillStyle = "#FF6B6B";
      this.ctx.font = "bold 20px Arial";
      this.ctx.fillText(`Combo x${this.combo + 1}`, 20, 65);
    }
    
    // 绘制棋盘网格
    this.ctx.strokeStyle = "#D0D0D0";
    this.ctx.lineWidth = 1;
    for (let r = 0; r <= this.rows; r++) {
      const y = this.offsetY + r * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, y);
      this.ctx.lineTo(this.offsetX + this.cols * this.cellSize, y);
      this.ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      const x = this.offsetX + c * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.offsetY);
      this.ctx.lineTo(x, this.offsetY + this.rows * this.cellSize);
      this.ctx.stroke();
    }
    
    // 绘制棋盘上的图标
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const icon = this.board[r][c];
        if (icon) {
          this.drawIcon(icon, c, r);
        }
      }
    }
    
    // 绘制掉落中的图标
    if (this.fallingIcon && this.fallingY >= -1) {
      this.drawIcon(this.fallingIcon, this.fallingX, this.fallingY, 0.9);
    }
    
    // 绘制粒子
    this.particles.forEach(p => {
      this.ctx.font = `${p.size}px Arial`;
      this.ctx.globalAlpha = p.life * 2;
      this.ctx.fillText(p.emoji, p.x, p.y);
    });
    this.ctx.globalAlpha = 1;
    
    this.ctx.restore();
    
    // 游戏结束
    if (this.gameOver) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 32px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText("游戏结束", this.width / 2, this.height / 2 - 40);
      
      this.ctx.font = "24px Arial";
      this.ctx.fillText(`最终得分: ${this.score}`, this.width / 2, this.height / 2 + 10);
      
      this.ctx.font = "18px Arial";
      this.ctx.fillStyle = "#FFD93D";
      this.ctx.fillText("点击下方按钮", this.width / 2, this.height / 2 + 50);
      
      // 再玩一次按钮
      this.drawRestartButton();
    }
    
    // 虚拟按键（手机端）
    if (!this.gameOver) {
      this.drawVirtualButtons();
    }
  }

  drawVirtualButtons() {
    const buttonSize = this.virtualButtonSize;
    const buttonY = this.virtualButtonY;
    const leftX = 70;
    const rightX = this.width - 70;
    const downX = this.width / 2;
    
    // 存储按钮位置供触摸检测（先存储，再绘制）
    this.virtualButtons = {
      left: { x: leftX, y: buttonY, radius: buttonSize / 2 },
      right: { x: rightX, y: buttonY, radius: buttonSize / 2 },
      down: { x: downX, y: buttonY, radius: buttonSize / 2 }
    };
    
    // 绘制左按钮
    this.drawButton(leftX, buttonY, buttonSize, "←", "#A8E6CF", "#7BC8A4");
    
    // 绘制右按钮
    this.drawButton(rightX, buttonY, buttonSize, "→", "#A8E6CF", "#7BC8A4");
    
    // 绘制下按钮（加速）- 按下时高亮
    const downColor = this.manualDrop ? "#FF9A76" : "#FFD93D";
    const downBorder = this.manualDrop ? "#FF6B6B" : "#FFB84D";
    this.drawButton(downX, buttonY, buttonSize, "↓", downColor, downBorder, this.manualDrop);
  }
  
  drawButton(x, y, size, text, color, borderColor, pressed = false) {
    const radius = size / 2;
    
    // 设置半透明度
    this.ctx.globalAlpha = 0.85;
    
    // 阴影效果
    if (!pressed) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 4;
    }
    
    // 外圈渐变
    const gradient = this.ctx.createRadialGradient(x, y - 5, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, borderColor);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 重置阴影
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 内圈高光
    const innerGradient = this.ctx.createRadialGradient(x, y - 10, 0, x, y, radius - 5);
    innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    innerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    
    this.ctx.fillStyle = innerGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 边框
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = pressed ? 4 : 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 文字
    this.ctx.fillStyle = pressed ? "#FFFFFF" : "#2D3748";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x, y + 2);
    
    // 重置透明度
    this.ctx.globalAlpha = 1;
  }
  
  // 检测点是否在按钮内
  isPointInButton(x, y, button) {
    const dx = x - button.x;
    const dy = y - button.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= button.radius;
  }

  drawIcon(icon, col, row, alpha = 1) {
    const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
    const y = this.offsetY + row * this.cellSize + this.cellSize / 2;
    
    // 背景圆
    this.ctx.globalAlpha = alpha * 0.3;
    this.ctx.fillStyle = icon.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.cellSize / 2 - 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 图标
    this.ctx.globalAlpha = alpha;
    this.ctx.font = `${this.cellSize - 20}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(icon.emoji, x, y);
    
    this.ctx.globalAlpha = 1;
  }

  endGame() {
    this.gameOver = true;
    this.running = false;
    
    // 计算碎片奖励
    const fragments = Math.floor(this.score / 50);
    
    setTimeout(() => {
      this.onEnd({ score: this.score, fragments });
    }, 2000);
  }

  drawRestartButton() {
    const btnWidth = 200;
    const btnHeight = 55;
    const btnX = this.width / 2 - btnWidth / 2;
    const btnY = this.height / 2 + 80;
    
    // 存储按钮位置供点击检测
    this.restartButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    
    // 按钮阴影
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetY = 4;
    
    // 按钮背景渐变
    const gradient = this.ctx.createLinearGradient(0, btnY, 0, btnY + btnHeight);
    gradient.addColorStop(0, "#FFD93D");
    gradient.addColorStop(1, "#FFB84D");
    this.ctx.fillStyle = gradient;
    
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 28);
    this.ctx.fill();
    
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 按钮文字
    this.ctx.fillStyle = "#2D3748";
    this.ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🔄 再玩一次", this.width / 2, btnY + btnHeight / 2);
  }
  
  restartGame() {
    // 重置游戏状态
    this.score = 0;
    this.combo = 0;
    this.gameOver = false;
    this.piecesPlaced = 0;
    this.running = true;
    
    // 重置棋盘
    this.initBoard();
  }

  cleanup() {
    document.removeEventListener("keydown", this.keyHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
    this.canvas.removeEventListener("touchstart", this.touchStartHandler);
    this.canvas.removeEventListener("touchend", this.touchEndHandler);
  }
}

export { MatchGame };
