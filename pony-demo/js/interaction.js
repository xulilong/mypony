// 互动控制器 - 冷却管理
class InteractionController {
  constructor() {
    this.cooldowns = {
      pat: { duration: 10000, lastTime: 0 },
      groom: { duration: 10000, lastTime: 0 },
      feed: { duration: 30000, lastTime: 0 }
    };
  }

  canInteract(type) {
    const cd = this.cooldowns[type];
    if (!cd) return false;
    return Date.now() - cd.lastTime >= cd.duration;
  }

  getRemainingCooldown(type) {
    const cd = this.cooldowns[type];
    if (!cd) return 0;
    const remaining = cd.duration - (Date.now() - cd.lastTime);
    return Math.max(0, remaining);
  }

  recordInteraction(type) {
    if (this.cooldowns[type]) {
      this.cooldowns[type].lastTime = Date.now();
    }
  }

  // 检查小马状态是否允许互动
  canInteractWithHorse(horse, type) {
    if (type === "feed") return true; // 喂养始终可以
    // 拍拍、梳理需要饥饿值>=30
    if (horse.hunger < 30) {
      return { allowed: false, reason: "小马太饿了，先喂喂它吧～" };
    }
    return { allowed: true };
  }
}

export { InteractionController };
