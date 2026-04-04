# WithBB

一个基于 `Vite + React + TypeScript` 的情侣纪念站点，现在已经扩展出一整页“游戏乐园”。

## 现在包含什么

- 首页倒计时与纪念入口
- 时光轴
- 相册墙
- 心愿清单
- 留言板
- 游戏乐园
  - `2048`
  - `弹弓攻城`（愤怒的小鸟致敬式物理弹射玩法）
  - `贪吃蛇`
  - `记忆翻牌`
  - `海龟汤（GLM-4.6V 实时主持）`

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址通常是 `http://localhost:5173`。

## 构建与检查

```bash
npm run lint
npm run build
```

## 海龟汤的 GLM-4.6V 接入方式

- 页面内提供 `GLM-4.6V API Key` 输入框。
- Key 只保存在浏览器当前会话的 `sessionStorage` 中。
- Key 不写入源码、不写入 `.env`、不会进入 Git 提交。
- 前端直接调用智谱官方 OpenAI 兼容接口：
  - `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- 当前模型固定为：
  - `glm-4.6v`

使用方式：

1. 打开“游戏乐园”。
2. 进入“海龟汤”。
3. 输入你的 API Key。
4. 点击“开始新汤”。

## 主要依赖

- `react`
- `framer-motion`
- `lucide-react`
- `matter-js`

## 说明

- 相册与记忆翻牌默认复用 `public/pic/` 中的照片资源。
- 游戏数据中的最高分、留言、心愿等内容会保存在浏览器本地存储中。
