// 小马渲染器 - 使用图片素材
class HorseRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentAnim = null;
    this.horseImg = null;
    this.decorationLayers = [];
    this.init();
  }

  init() {
    // 创建小马图片元素
    this.horseImg = document.createElement('img');
    this.horseImg.className = 'horse-sprite';
    this.horseImg.alt = '小马';
    
    // 创建装饰容器
    this.decorationContainer = document.createElement('div');
    this.decorationContainer.className = 'decoration-container';
    
    // 组装DOM
    this.container.innerHTML = '';
    this.container.appendChild(this.horseImg);
    this.container.appendChild(this.decorationContainer);
  }

  render(horse) {
    // 根据小马状态选择图片
    const spritePath = this.getSpritePath(horse);
    this.horseImg.src = spritePath;
    
    // 根据身材调整缩放
    const scale = this.getBodyScale(horse);
    this.horseImg.style.transform = `scale(${scale})`;
    
    // 渲染装饰
    this.renderDecorations(horse.decorations);
  }

  getSpritePath(horse) {
    const mood = horse.getMood();
    
    // 优先根据心情选择
    if (mood === 'sad') {
      return 'assets/images/pony-sad.png';
    } else if (mood === 'excited') {
      return 'assets/images/pony-happy.png';
    }
    
    // 根据身材选择
    if (horse.bodyStage === 'sturdy') {
      return 'assets/images/pony-fat.png.png';
    }
    
    // 默认站立
    return 'assets/images/pony-idle.png';
  }

  getBodyScale(horse) {
    switch (horse.bodyStage) {
      case 'sturdy': return 1.1;
      case 'slim': return 0.95;
      case 'balanced': return 1.05;
      default: return 1;
    }
  }

  renderDecorations(decoIds) {
    this.decorationContainer.innerHTML = '';
    
    if (!decoIds || decoIds.length === 0) return;
    
    const decoMap = {
      'hat_fortune': { src: 'assets/images/caishenmao.png', class: 'deco-hat' },
      'cape_lucky': { src: 'assets/images/jixiangpifeng.png', class: 'deco-cape' },
      'wings_small': { src: 'assets/images/chibang.png', class: 'deco-wings' },
      'wreath_flower': { src: 'assets/images/huahuan.png', class: 'deco-wreath' },
      'saddle_basic': { src: 'assets/images/maan.png', class: 'deco-saddle' },
      'saddle_gold': { src: 'assets/images/maan.png', class: 'deco-saddle deco-gold' },
      'horseshoe_glow': { class: 'deco-horseshoe' }, // 用CSS特效
      'plate_success': { class: 'deco-plate' }, // 用CSS特效
      'rein_simple': { class: 'deco-rein' } // 用CSS特效
    };
    
    decoIds.forEach(id => {
      const deco = decoMap[id];
      if (!deco) return;
      
      if (deco.src) {
        const img = document.createElement('img');
        img.src = deco.src;
        img.className = `decoration-layer ${deco.class}`;
        img.alt = id;
        this.decorationContainer.appendChild(img);
      } else {
        // 用CSS绘制的装饰
        const div = document.createElement('div');
        div.className = `decoration-layer ${deco.class}`;
        if (id === 'horseshoe_glow') div.textContent = '✨';
        if (id === 'plate_success') div.textContent = '🏅';
        if (id === 'rein_simple') div.textContent = '🪢';
        this.decorationContainer.appendChild(div);
      }
    });
  }

  // 播放互动动画
  playAnimation(type) {
    const container = this.container;
    if (!container) return;
    
    // 移除旧动画
    container.classList.remove('anim-pat', 'anim-groom', 'anim-feed', 'anim-bounce');
    void container.offsetWidth; // force reflow
    
    // 添加新动画
    container.classList.add(`anim-${type}`);
    
    // 切换对应状态的图片
    if (type === 'feed') {
      this.horseImg.src = 'assets/images/pony-eat.png';
      setTimeout(() => {
        this.horseImg.src = 'assets/images/pony-idle.png';
      }, 800);
    } else if (type === 'pat' || type === 'groom') {
      this.horseImg.src = 'assets/images/pony-happy.png';
      setTimeout(() => {
        this.horseImg.src = 'assets/images/pony-idle.png';
      }, 800);
    }
    
    // 显示特效
    this.showEffect(type);
    
    setTimeout(() => {
      container.classList.remove(`anim-${type}`);
    }, 800);
  }

  showEffect(type) {
    const effect = document.createElement('img');
    effect.className = 'interaction-effect';
    
    if (type === 'pat' || type === 'groom') {
      effect.src = 'assets/images/aixinpiaosan.png';
    }
    
    effect.style.position = 'absolute';
    effect.style.top = '20%';
    effect.style.left = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'effectFadeOut 1s ease forwards';
    
    this.container.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
    }, 1000);
  }

  // 显示升级特效
  showLevelUpEffect() {
    const effect = document.createElement('img');
    effect.src = 'assets/images/shengjiguanghuan.png';
    effect.className = 'levelup-effect';
    effect.style.position = 'absolute';
    effect.style.top = '50%';
    effect.style.left = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'levelUpAnim 1.5s ease forwards';
    
    this.container.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
    }, 1500);
  }
}

export { HorseRenderer };
