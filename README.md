# P4G 人格面具合成查询

女神异闻录人格面具图鉴与合成配方查询工具。支持按名称/阿尔克那/技能搜索，展示属性技能和显示合体配方。

## 快速开始

```bash
pnpm install
pnpm dev          # 开发：http://127.0.0.1:5173
pnpm build        # 构建到 dist/
pnpm preview      # 预览构建结果
```

```bash
pnpm data:all
```

**手动补图后：**

```bash
# 将 png 放入 public/assets/personas/ 后执行
pnpm images:register
```

## 项目结构

```
shared/
  aliases.json          # 统一名称/阿尔克那别名（前后端共用）
public/
  data/personas.json    # 人格面具图鉴
  data/fusion.json      # 合体配方 + 规则矩阵
  assets/personas/      # 头像 p001.png … p205.png
src/
  App.tsx               # 主界面
  fusion.ts             # 合成索引（18183 recipes + GameGene specials）
  aliases.ts            # 名称/搜索别名
tools/
  build-data.cjs        # 解析 GameGene HTML
  fetch-fusion-18183.cjs
  fetch-images.cjs
  register-local-images.cjs
```
