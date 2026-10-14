# AGENTS.md · 站点维护规范

本文件记录本站（fanghaochen.github.io）的内容格式约定，修改 `index.html` 时必须遵守。

## 论文引用信息格式规范（2026-10-14 起）

1. **期刊名一律用黑色气泡块**：`<span class="journal-tag">期刊名</span>`，工作论文（Working Papers）与已发表论文（Publications）同样适用。
2. **期刊引用信息（journal-tag + 卷期页码/状态）独占一行**；获奖、转载、创刊号等附加说明**另起一行**，包在 `<span class="tl-note">…</span>` 中（`.tl-note` 为块级换行样式，定义于 `assets/style.css`）。
3. **“open data / 数据共享”链接**（`.tl-datalink`）属于操作入口，保留在期刊引用同一行，不挪到注记行。
4. 已有印章（`.seal` / `.mini-seal`，如“封面”“获奖”）表达过的信息，正文中**不再重复**（例如有“封面”方章就不再写“封面文章”）。
5. 中英双语文本分别置于 `t-en` / `t-zh` 标签内，注记行同样需要双语。
