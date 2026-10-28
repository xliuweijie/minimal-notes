# 最简笔记 · Minimal Notes

<img src="./web/public/note-logo.svg" alt="最简笔记标识" width="80" align="right">

**只管写下来。简单记录，轻松回看。**

最简笔记是基于 [Memos](https://github.com/usememos/memos) 的个人笔记应用，由 [@xliuweijie](https://github.com/xliuweijie) 面向日常记录场景进行界面简化，并将优化公开分享。开发过程中使用 Codex 协助实现与验证。

它沿用 Memos 的自托管、Markdown、数据存储和账号体系，围绕「打开 → 写下想法 → 保存 → 回看」减少界面里的分心元素。衍生版本基于 **Memos v0.31.0**；本仓库保留完整上游源码与 MIT 许可证。

[优化说明](docs/OPTIMIZATIONS.zh-CN.md) · [开发与部署](#开发与部署) · [上游项目](https://github.com/usememos/memos) · [MIT 许可证](LICENSE)

## 我的优化

| 方向 | 这次具体做了什么 |
| --- | --- |
| 更专注的编辑器 | 面板主要保留正文、保存、按场景显示的取消，以及只读的可见范围提示；收起格式工具栏、插入菜单、录音和时间调整入口。 |
| 更直接的侧边导航 | 核心入口收敛为笔记、搜索、归档，保留写笔记和用户菜单；移除首页侧边统计、标签区及日历、地图、附件等全局导航入口。 |
| 一致的应用标识 | 统一「最简笔记」名称、笔记图标、页面标题、登录页、关于页、系统设置默认值和 Web App Manifest。 |
| 更贴近日常记录的文案 | 使用「写笔记」「写下此刻的想法」等中文表达，并同步调整涉及品牌名称的英文文案。 |
| 保留数据与编辑能力 | 继续使用已有的保存、草稿恢复、Markdown、编辑快捷键与附件处理机制。隐藏高级操作入口不等于删除上游 API 或数据结构。 |

这是个人记录场景的产品取舍。需要日历、地图、复杂格式工具或更完整协作入口的用户，可以选择上游 Memos。详细变更与验证范围见 [优化说明](docs/OPTIMIZATIONS.zh-CN.md)。

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

变更集中在前端。检查结果及未实测范围记录在 [优化说明](docs/OPTIMIZATIONS.zh-CN.md)。

## 致敬开源精神

感谢 [Memos](https://github.com/usememos/memos) 作者、维护者与所有贡献者，让每个人都可以在成熟的作品上学习、修改和继续创造。感谢 React、CodeMirror、Vite、Tailwind CSS 以及本项目依赖的开源工具与社区。

这个衍生版本把我在使用过程中的界面优化重新分享出来，希望它能帮助喜欢简单记录的人，也欢迎你提出建议、继续改进，或把适合更广泛场景的改动贡献回上游。

**尊重原作，注明来源，把改进继续分享。**

本仓库沿用 [MIT License](LICENSE)，保留 Memos 的原始版权声明。上游 README 保存在 [docs/UPSTREAM_README.md](docs/UPSTREAM_README.md)。
