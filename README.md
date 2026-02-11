# 养只小马 🐴

马年春节主题虚拟宠物养成游戏

## 在线体验

🎮 [点击这里开始游戏](https://xulilong.github.io/mypony/)

## 功能特色

- 🎨 SVG 渲染的可爱小马宠物
- 🎮 5个趣味小游戏：
  - 一马当先（赛马竞猜）
  - 马上有喜（消除游戏）
  - 马不停蹄（跳跃游戏）
  - 马上有钱（接草料）
  - 万马奔腾（节奏游戏）
- 🎁 签到系统和成就系统
- 🎨 装饰收集和定制
- 📱 移动端触摸控制优化
- 🎴 分享卡片生成

## 技术栈

- 纯 Vanilla JavaScript (ES6 模块)
- SVG + Canvas 2D 渲染
- localStorage 数据持久化
- 无需构建工具，直接运行

## 本地运行

```bash
# 使用 Python
python -m http.server 8000

# 或使用 npx
npx serve .
```

然后访问 `http://localhost:8000`

## 开发

项目采用模块化架构，无需编译：

- `index.html` - 应用入口
- `js/` - JavaScript 模块
- `css/` - 样式文件
- `assets/` - 资源文件

## License

MIT
