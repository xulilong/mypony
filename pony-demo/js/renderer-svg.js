// 小马渲染器 - 精致SVG版本
class HorseRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentAnim = null;
    this.idleTimer = null;
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.startIdleAnimations();
  }

  startIdleAnimations() {
    // 每隔5-10秒随机播放一个待机动画
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 5000; // 5-10秒
      this.idleTimer = setTimeout(() => {
        this.playRandomIdleAnimation();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  playRandomIdleAnimation() {
    const svg = this.container.querySelector('.horse-svg-new');
    if (!svg) return;

    const animations = ['idle-bounce', 'idle-turn', 'idle-shake'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    
    svg.classList.add(randomAnim);
    setTimeout(() => svg.classList.remove(randomAnim), 1500);
  }

  render(horse) {
    const mood = horse.getMood();
    const svg = this.buildHorseSVG(horse, mood);
    this.container.innerHTML = svg;
  }

  buildHorseSVG(horse, mood) {
    const bodyColor = this.getBodyColor(horse);
    const maneColor = this.getManeColor(horse);
    const bodyScale = this.getBodyScale(horse);
    
    // 根据心情调整表情和姿态
    const eyeType = mood === 'sad' ? 'sad' : mood === 'excited' ? 'happy' : 'normal';
    const headY = mood === 'sad' ? 65 : 60;
    const tailRotate = mood === 'excited' ? -15 : mood === 'sad' ? 10 : 0;
    
    // 专属印记
    const mark = horse.appearanceStage === 'marked' ? 
      `<g class="special-mark"><circle cx="165" cy="55" r="8" fill="#FFD93D" opacity="0.8"/>
       <text x="165" y="60" font-size="10" text-anchor="middle" fill="#FF6B9D">❤</text></g>` : '';
    
    // 光泽效果
    const glowFilter = (horse.appearanceStage === 'fur_glow' || horse.appearanceStage === 'marked') ?
      `<filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
       <feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>` : '';

    // 装饰层
    const decorations = this.renderDecorations(horse.decorations);

    return `
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="horse-svg-new">
      <defs>
        ${glowFilter}
        <radialGradient id="bodyGrad" cx="40%" cy="35%">
          <stop offset="0%" stop-color="${this.lighten(bodyColor, 25)}"/>
          <stop offset="70%" stop-color="${bodyColor}"/>
          <stop offset="100%" stop-color="${this.darken(bodyColor, 15)}"/>
        </radialGradient>
        <radialGradient id="maneGrad">
          <stop offset="0%" stop-color="${this.lighten(maneColor, 15)}"/>
          <stop offset="100%" stop-color="${maneColor}"/>
        </radialGradient>
        <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bodyColor}"/>
          <stop offset="100%" stop-color="${this.darken(bodyColor, 20)}"/>
        </linearGradient>
      </defs>

      <g transform="translate(150, 150) scale(${bodyScale})" transform-origin="0 0" ${glowFilter ? 'filter="url(#glow)"' : ''}>
        <!-- 阴影 -->
        <ellipse cx="0" cy="85" rx="55" ry="12" fill="rgba(0,0,0,0.15)" opacity="0.5"/>
        
        <!-- 尾巴 -->
        <g class="tail" transform="rotate(${tailRotate}, -45, 20)">
          <!-- 尾巴主体 - 多层次蓬松效果 -->
          <path d="M-45 20 Q-60 15 -68 28 Q-75 42 -68 55 Q-60 68 -52 58 Q-48 45 -45 30 Z" 
                fill="url(#maneGrad)" stroke="${this.darken(maneColor, 20)}" stroke-width="1.5" 
                stroke-linejoin="round" opacity="0.9"/>
          
          <!-- 蓬松毛发层1 -->
          <path d="M-50 25 Q-58 22 -65 30 Q-70 38 -65 48 Q-58 56 -52 50 Q-48 40 -50 25 Z" 
                fill="${this.lighten(maneColor, 15)}" opacity="0.7"/>
          
          <!-- 蓬松毛发层2 -->
          <path d="M-55 30 Q-62 28 -67 36 Q-70 44 -65 52 Q-60 58 -55 52 Q-52 44 -55 30 Z" 
                fill="${this.lighten(maneColor, 25)}" opacity="0.6"/>
          
          <!-- 蓬松毛发层3 - 外侧飘逸 -->
          <path d="M-68 32 Q-73 30 -76 38 Q-78 48 -73 56 Q-68 62 -65 54 Q-66 42 -68 32 Z" 
                fill="${this.lighten(maneColor, 10)}" opacity="0.5"/>
          
          <!-- 高光效果 -->
          <ellipse cx="-60" cy="40" rx="8" ry="12" fill="white" opacity="0.2" transform="rotate(-20 -60 40)"/>
          <ellipse cx="-65" cy="48" rx="6" ry="10" fill="white" opacity="0.15" transform="rotate(-15 -65 48)"/>
          
          <!-- 毛发细节线条 -->
          <path d="M-52 28 Q-58 32 -62 42" stroke="${this.lighten(maneColor, 30)}" 
                stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
          <path d="M-54 35 Q-60 38 -64 48" stroke="${this.lighten(maneColor, 30)}" 
                stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
          <path d="M-56 42 Q-62 45 -66 54" stroke="${this.lighten(maneColor, 30)}" 
                stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
        </g>

        <!-- 后腿 -->
        <g class="back-legs">
          <rect x="-35" y="40" width="14" height="45" rx="7" fill="url(#legGrad)" 
                stroke="${this.darken(bodyColor, 25)}" stroke-width="1"/>
          <ellipse cx="-28" cy="87" rx="9" ry="5" fill="${this.darken(bodyColor, 30)}"/>
          
          <rect x="-15" y="40" width="14" height="45" rx="7" fill="url(#legGrad)" 
                stroke="${this.darken(bodyColor, 25)}" stroke-width="1"/>
          <ellipse cx="-8" cy="87" rx="9" ry="5" fill="${this.darken(bodyColor, 30)}"/>
        </g>

        <!-- 身体 -->
        <ellipse cx="0" cy="15" rx="50" ry="38" fill="url(#bodyGrad)" 
                 stroke="${this.darken(bodyColor, 20)}" stroke-width="2"/>
        
        <!-- 肚子高光 -->
        <ellipse cx="5" cy="25" rx="35" ry="25" fill="white" opacity="0.15"/>

        <!-- 装饰层（在身体上） -->
        ${decorations}

        <!-- 前腿 -->
        <g class="front-legs">
          <rect x="15" y="40" width="14" height="45" rx="7" fill="url(#legGrad)" 
                stroke="${this.darken(bodyColor, 25)}" stroke-width="1"/>
          <ellipse cx="22" cy="87" rx="9" ry="5" fill="${this.darken(bodyColor, 30)}"/>
          
          <rect x="35" y="40" width="14" height="45" rx="7" fill="url(#legGrad)" 
                stroke="${this.darken(bodyColor, 25)}" stroke-width="1"/>
          <ellipse cx="42" cy="87" rx="9" ry="5" fill="${this.darken(bodyColor, 30)}"/>
        </g>

        <!-- 脖子 -->
        <path d="M35 0 Q45 -20 35 -${headY}" fill="url(#bodyGrad)" 
              stroke="${this.darken(bodyColor, 20)}" stroke-width="2"/>

        <!-- 头部 -->
        <g class="head">
          <ellipse cx="30" cy="-${headY}" rx="28" ry="24" fill="url(#bodyGrad)" 
                   stroke="${this.darken(bodyColor, 20)}" stroke-width="2"/>
          
          <!-- 耳朵 -->
          <g class="ears">
            <path d="M15 -${headY + 22} L10 -${headY + 38} L20 -${headY + 28} Z" 
                  fill="${bodyColor}" stroke="${this.darken(bodyColor, 20)}" stroke-width="1.5"/>
            <path d="M13 -${headY + 25} L11 -${headY + 33} L17 -${headY + 27} Z" 
                  fill="${this.lighten(bodyColor, 30)}" opacity="0.8"/>
            
            <path d="M40 -${headY + 22} L44 -${headY + 38} L48 -${headY + 28} Z" 
                  fill="${bodyColor}" stroke="${this.darken(bodyColor, 20)}" stroke-width="1.5"/>
            <path d="M42 -${headY + 25} L44 -${headY + 33} L46 -${headY + 27} Z" 
                  fill="${this.lighten(bodyColor, 30)}" opacity="0.8"/>
          </g>

          <!-- 眼睛 -->
          ${this.drawEyes(eyeType, headY)}

          <!-- 鼻子 -->
          <ellipse cx="48" cy="-${headY - 12}" rx="6" ry="8" fill="${this.lighten(bodyColor, 20)}" 
                   stroke="${this.darken(bodyColor, 15)}" stroke-width="1"/>
          <ellipse cx="50" cy="-${headY - 10}" rx="2" ry="2.5" fill="${this.darken(bodyColor, 30)}"/>
          <ellipse cx="50" cy="-${headY - 14}" rx="2" ry="2.5" fill="${this.darken(bodyColor, 30)}"/>

          <!-- 嘴巴 -->
          <path d="M45 -${headY - 5} Q48 -${headY - 2} 51 -${headY - 5}" 
                fill="none" stroke="${this.darken(bodyColor, 25)}" stroke-width="2" 
                stroke-linecap="round"/>

          <!-- 腮红 -->
          <ellipse cx="12" cy="-${headY - 8}" rx="8" ry="5" fill="#FFB6C1" opacity="0.5"/>
          <ellipse cx="48" cy="-${headY - 8}" rx="8" ry="5" fill="#FFB6C1" opacity="0.5"/>
        </g>

        <!-- 鬃毛 -->
        <g class="mane">
          <!-- 头顶鬃毛 - 蓬松层次 -->
          <path d="M20 -${headY + 15} Q10 -${headY + 25} 15 -${headY + 35} Q20 -${headY + 30} 25 -${headY + 20}" 
                fill="url(#maneGrad)" stroke="${this.darken(maneColor, 20)}" stroke-width="1.5"/>
          <path d="M22 -${headY + 12} Q15 -${headY + 20} 18 -${headY + 28} Q22 -${headY + 24} 26 -${headY + 18}" 
                fill="${this.lighten(maneColor, 20)}" opacity="0.7"/>
          <path d="M25 -${headY + 10} Q20 -${headY + 20} 22 -${headY + 28}" 
                fill="${this.lighten(maneColor, 25)}" opacity="0.6"/>
          
          <!-- 颈部鬃毛 - 飘逸蓬松 -->
          <path d="M35 -${headY + 5} Q30 -10 25 5 Q20 15 25 25" 
                fill="url(#maneGrad)" stroke="${this.darken(maneColor, 20)}" stroke-width="1.5"/>
          <path d="M33 -${headY + 2} Q28 -8 24 8 Q20 18 24 26" 
                fill="${this.lighten(maneColor, 15)}" opacity="0.7"/>
          <path d="M32 -${headY} Q28 -5 26 10 Q23 18 26 24" 
                fill="${this.lighten(maneColor, 25)}" opacity="0.6"/>
          
          <!-- 鬃毛高光 -->
          <ellipse cx="22" cy="-${headY + 20}" rx="3" ry="6" fill="white" opacity="0.3" transform="rotate(-30 22 -${headY + 20})"/>
          <ellipse cx="28" cy="-5" rx="3" ry="8" fill="white" opacity="0.25" transform="rotate(-20 28 -5)"/>
        </g>

        ${mark}
      </g>
    </svg>`;
  }

  renderDecorations(decoIds) {
    if (!decoIds || decoIds.length === 0) return '';
    
    let svg = '';
    
    decoIds.forEach(id => {
      switch(id) {
        case 'hat_fortune': // 财神帽
          svg += `
            <g class="deco-hat">
              <ellipse cx="30" cy="-95" rx="22" ry="8" fill="#C41E3A" opacity="0.9"/>
              <path d="M10 -95 Q30 -115 50 -95 L48 -75 Q30 -80 12 -75 Z" 
                    fill="#C41E3A" stroke="#8B1538" stroke-width="1.5"/>
              <ellipse cx="30" cy="-75" rx="20" ry="6" fill="#FFD700"/>
              <circle cx="30" cy="-105" r="6" fill="#FFD700"/>
              <text x="30" y="-82" font-size="10" text-anchor="middle" fill="#FFD700" font-weight="bold">福</text>
            </g>`;
          break;
          
        case 'wings_small': // 小翅膀
          svg += `
            <g class="deco-wings">
              <path d="M-45 10 Q-65 0 -70 15 Q-65 25 -50 20 Z" 
                    fill="white" stroke="#E0E0E0" stroke-width="1.5" opacity="0.9"/>
              <path d="M-50 12 Q-62 8 -65 18 Q-60 23 -52 19 Z" 
                    fill="#F5F5F5" opacity="0.8"/>
              <ellipse cx="-58" cy="15" rx="3" ry="8" fill="white" opacity="0.6"/>
              <ellipse cx="-62" cy="17" rx="2" ry="6" fill="white" opacity="0.5"/>
            </g>`;
          break;
          
        case 'wreath_flower': // 花环
          svg += `
            <g class="deco-wreath">
              <circle cx="20" cy="-75" r="3" fill="#FF69B4"/>
              <circle cx="28" cy="-78" r="3" fill="#FFB6C1"/>
              <circle cx="36" cy="-75" r="3" fill="#FF1493"/>
              <circle cx="40" cy="-68" r="3" fill="#FFC0CB"/>
              <circle cx="38" cy="-60" r="3" fill="#FF69B4"/>
              <circle cx="22" cy="-68" r="3" fill="#FFB6C1"/>
              <path d="M20 -72 Q30 -75 40 -68" stroke="#90EE90" stroke-width="2" fill="none"/>
            </g>`;
          break;
          
        case 'cape_lucky': // 吉祥披风
          svg += `
            <g class="deco-cape" opacity="0.85">
              <path d="M-30 -10 Q-40 20 -35 50 L-25 48 Q-28 25 -22 -8 Z" 
                    fill="#C41E3A" stroke="#8B1538" stroke-width="1"/>
              <path d="M-25 -5 Q-32 15 -30 40" stroke="#FFD700" stroke-width="1.5" opacity="0.6"/>
              <circle cx="-27" cy="0" r="3" fill="#FFD700"/>
            </g>`;
          break;
          
        case 'saddle_basic': // 马鞍
          svg += `
            <g class="deco-saddle">
              <ellipse cx="0" cy="5" rx="35" ry="15" fill="#8B4513" opacity="0.8"/>
              <ellipse cx="0" cy="3" rx="32" ry="13" fill="#A0522D"/>
              <path d="M-25 5 Q0 0 25 5" stroke="#654321" stroke-width="2" fill="none"/>
              <circle cx="-15" cy="5" r="2" fill="#FFD700"/>
              <circle cx="15" cy="5" r="2" fill="#FFD700"/>
            </g>`;
          break;
          
        case 'saddle_gold': // 金马鞍
          svg += `
            <g class="deco-saddle-gold">
              <ellipse cx="0" cy="5" rx="35" ry="15" fill="#FFD700" opacity="0.9"/>
              <ellipse cx="0" cy="3" rx="32" ry="13" fill="#FFA500"/>
              <path d="M-25 5 Q0 0 25 5" stroke="#FF8C00" stroke-width="2" fill="none"/>
              <circle cx="-15" cy="5" r="2" fill="#FF6347"/>
              <circle cx="15" cy="5" r="2" fill="#FF6347"/>
              <circle cx="0" cy="5" r="3" fill="#FF4500"/>
            </g>`;
          break;
          
        case 'horseshoe_glow': // 发光马蹄铁
          svg += `
            <g class="deco-horseshoe">
              <text x="42" y="95" font-size="16" text-anchor="middle">✨</text>
            </g>`;
          break;
          
        case 'plate_success': // 马到成功挂牌
          svg += `
            <g class="deco-plate">
              <rect x="-8" y="-5" width="16" height="20" rx="2" fill="#FFD700" stroke="#FF8C00" stroke-width="1"/>
              <text x="0" y="8" font-size="8" text-anchor="middle" fill="#C41E3A" font-weight="bold">成功</text>
            </g>`;
          break;
          
        case 'rein_simple': // 缰绳
          svg += `
            <g class="deco-rein">
              <path d="M35 -50 Q45 -40 50 -30" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>
              <circle cx="35" cy="-50" r="2" fill="#654321"/>
            </g>`;
          break;
      }
    });
    
    return svg;
  }

  drawEyes(type, headY) {
    const baseY = -headY - 5;
    
    if (type === 'sad') {
      return `
        <g class="eyes sad">
          <ellipse cx="20" cy="${baseY}" rx="4" ry="5" fill="#4A4A4A"/>
          <ellipse cx="19" cy="${baseY - 1}" rx="1.5" ry="2" fill="white" opacity="0.8"/>
          <path d="M16 ${baseY + 8} Q20 ${baseY + 6} 24 ${baseY + 8}" 
                stroke="#87CEEB" stroke-width="1.5" fill="none" opacity="0.6"/>
        </g>`;
    } else if (type === 'happy') {
      return `
        <g class="eyes happy">
          <circle cx="20" cy="${baseY}" r="5" fill="#4A4A4A"/>
          <circle cx="19" cy="${baseY - 1}" r="2" fill="white"/>
          <circle cx="20.5" cy="${baseY + 0.5}" r="1" fill="white" opacity="0.6"/>
          <path d="M14 ${baseY - 8} Q20 ${baseY - 6} 26 ${baseY - 8}" 
                stroke="#4A4A4A" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="24" cy="${baseY - 3}" r="1.5" fill="#FFD93D" opacity="0.8"/>
          <circle cx="16" cy="${baseY - 2}" r="1" fill="#FFD93D" opacity="0.6"/>
        </g>`;
    } else {
      return `
        <g class="eyes normal">
          <circle cx="20" cy="${baseY}" r="4.5" fill="#4A4A4A"/>
          <circle cx="19" cy="${baseY - 1}" r="1.8" fill="white"/>
          <circle cx="20.5" cy="${baseY + 0.5}" r="0.8" fill="white" opacity="0.6"/>
        </g>`;
    }
  }

  getBodyColor(horse) {
    const colors = {
      base: '#D4A574',
      fur_change: '#B8956A',
      fur_glow: '#E8B887',
      marked: '#F0C896'
    };
    return colors[horse.appearanceStage] || colors.base;
  }

  getManeColor(horse) {
    const colors = {
      base: '#8B6F47',
      fur_change: '#6B5437',
      fur_glow: '#9B7F57',
      marked: '#AB8F67'
    };
    return colors[horse.appearanceStage] || colors.base;
  }

  getBodyScale(horse) {
    const scales = {
      normal: 0.85,
      sturdy: 0.95,
      slim: 0.78,
      balanced: 0.88
    };
    return scales[horse.bodyStage] || 0.85;
  }

  lighten(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `rgb(${r},${g},${b})`;
  }

  darken(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
    const b = Math.max(0, (num & 0xFF) - amount);
    return `rgb(${r},${g},${b})`;
  }

  playAnimation(type) {
    const svg = this.container.querySelector('.horse-svg-new');
    if (!svg) return;
    
    svg.classList.remove('anim-pat', 'anim-groom', 'anim-feed', 'anim-bounce');
    void svg.offsetWidth;
    svg.classList.add(`anim-${type}`);
    
    // 添加互动特效
    if (type === 'pat' || type === 'groom') {
      this.showHeartParticles();
    } else if (type === 'feed') {
      this.showFoodParticles();
    }
    
    setTimeout(() => svg.classList.remove(`anim-${type}`), 800);
  }

  showHeartParticles() {
    const hearts = ['❤️', '💕', '💖', '✨'];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        particle.style.cssText = `
          position: absolute;
          top: ${40 + Math.random() * 20}%;
          left: ${40 + Math.random() * 20}%;
          font-size: ${1.5 + Math.random() * 1}rem;
          pointer-events: none;
          z-index: 5;
          animation: floatUp 1.5s ease-out forwards;
        `;
        this.container.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
      }, i * 100);
    }
  }

  showFoodParticles() {
    const foods = ['🥕', '🌾', '🍎', '🌿'];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.textContent = foods[Math.floor(Math.random() * foods.length)];
        particle.style.cssText = `
          position: absolute;
          top: ${30 + Math.random() * 10}%;
          left: ${45 + Math.random() * 10}%;
          font-size: ${1.2 + Math.random() * 0.8}rem;
          pointer-events: none;
          z-index: 5;
          animation: fadeDown 1s ease-out forwards;
        `;
        this.container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }, i * 150);
    }
  }

  showLevelUpEffect() {
    const effect = document.createElement('div');
    effect.className = 'levelup-effect-svg';
    effect.innerHTML = '✨🌟✨';
    effect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      animation: levelUpAnim 1.5s ease forwards;
      pointer-events: none;
      z-index: 10;
    `;
    this.container.appendChild(effect);
    setTimeout(() => effect.remove(), 1500);
  }
}

export { HorseRenderer };
