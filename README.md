# 最简笔记 · 古典版

<img src="./web/public/note-logo.svg" alt="最简笔记标识" width="80" align="right">

**暖纸色、宋体与朱砂色，写下此刻的想法。**

最简笔记是基于 [Memos](https://github.com/usememos/memos) 的个人笔记应用，由 [@xliuweijie](https://github.com/xliuweijie) 面向日常记录场景进行界面简化，并将优化公开分享。开发过程中使用 Codex 协助实现与验证。

它沿用 Memos 的自托管、Markdown、数据存储和账号体系，围绕「打开 → 写下想法 → 保存 → 回看」减少界面里的分心元素。衍生版本基于 **Memos v0.31.0**；本仓库保留完整上游源码与 MIT 许可证。

[优化说明](docs/OPTIMIZATIONS.zh-CN.md) · [开发与部署](#开发与部署) · [上游项目](https://github.com/usememos/memos) · [MIT 许可证](LICENSE)

## 当前版本：古典版

本次发布对应本机 `restore-eff66ff` 分支的 `d77c548`「古典版本」，基于 `eff66ff`「简化编辑器」继续修改。它采用这一基线的侧栏布局，未合并上一公开版「左侧也修改」的导航收拢；这是恢复旧版本后继续迭代产生的分支差异。

| 方向 | 古典版的具体变化 |
| --- | --- |
| 浅色纸面 | 背景改为暖米色，正文使用深棕色；按钮、链接与聚焦状态采用朱砂色强调。 |
| 字体与阅读 | 标题、侧栏标签、笔记正文和编辑区域使用宋体风格字体栈，编辑正文行距为 1.8；代码块保留等宽字体。 |
| 纸纹与边框 | 页面与侧栏加入 CSS 纸纹，侧栏头尾采用双线分隔，笔记卡片与编辑器增加轻薄纸页阴影。 |
| 深色模式 | 同步采用暖墨色背景与暖铜色强调，保持浅色与深色的统一气质。 |
| 更少的表情操作入口 | 移除笔记卡片顶部和表情列表旁的新增表情按钮，以及弹出的选择面板；保留正文中的表情文字、已有表情显示与交互，以及历史数据。 |
| 简化编辑器 | 延续 `eff66ff` 的正文、保存、取消与只读可见范围提示，继续使用既有 Markdown、草稿与附件机制。 |

[古典版完整说明](docs/CLASSICAL_VERSION.zh-CN.md) · [此前极简版优化记录](docs/OPTIMIZATIONS.zh-CN.md)

改变的是前端界面与操作入口，账号、权限与数据库模式沿用原项目。本版偏向古典阅读和书写体验。

## 开发与部署

需要 **Node.js 24+、pnpm 11.0.1**；从源码运行后端还需要仓库 `go.mod` 指定的 **Go 1.27.0**。

```bash
# 前端：在仓库根目录
cd web
pnpm install --frozen-lockfile
pnpm dev
```

前端默认运行在 `http://localhost:3001`，并将 API 请求代理到 `http://localhost:8081`。后端在另一个终端从仓库根目录启动：

```bash
go run ./cmd/memos --addr 127.0.0.1 --port 8081 --data /absolute/path/to/your-notes-data
```

数据目录请放在源码仓库之外。第一次打开应用时，按页面提示创建自己的管理员账号。

### 构建包含本项目界面的 Docker 镜像

先构建前端，再使用上游提供的 Dockerfile：

```bash
# 仓库根目录
cd web
pnpm install --frozen-lockfile
pnpm release
cd ..
docker build -f scripts/Dockerfile -t minimal-notes:local .
docker run -d --name minimal-notes \
  -p 127.0.0.1:5230:5230 \
  -v minimal-notes-data:/var/opt/memos \
  minimal-notes:local
```

打开 `http://localhost:5230`。镜像会从本仓库构建，以包含这里的界面优化。本项目尚未发布预构建镜像；上游 `neosmemo/memos` 镜像提供的是上游 Memos 界面。

## 检查

```bash
cd web
pnpm lint
pnpm test
pnpm build
```

变更集中在前端。当前古典版的检查结果及未实测范围记录在 [古典版说明](docs/CLASSICAL_VERSION.zh-CN.md)。

## 致敬开源精神

感谢 [Memos](https://github.com/usememos/memos) 作者、维护者与所有贡献者，让每个人都可以在成熟的作品上学习、修改和继续创造。感谢 React、CodeMirror、Vite、Tailwind CSS 以及本项目依赖的开源工具与社区。

这个衍生版本把我在使用过程中的界面优化重新分享出来，希望它能帮助喜欢简单记录的人，也欢迎你提出建议、继续改进，或把适合更广泛场景的改动贡献回上游。

**尊重原作，注明来源，把改进继续分享。**

本仓库沿用 [MIT License](LICENSE)，保留 Memos 的原始版权声明。上游 README 保存在 [docs/UPSTREAM_README.md](docs/UPSTREAM_README.md)。
