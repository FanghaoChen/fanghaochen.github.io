# Fanghao Chen · Homepage Redesign「根脉与航路 Roots & Routes」

动态交互式个人学术主页。设计主题：华侨华人 · 族群网络；视觉参照 mychinaroots.com 的档案文献美学。

## 目录结构

```
homepage-redesign/
├── index.html                  # 单页站点（全部六个区块）
└── assets/
    ├── style.css               # 视觉系统：宣纸/墨色/朱砂红/印章
    ├── main.js                 # 交互：航线动画、双语切换、滚动揭示、合作网络图
    ├── map-dots.js             # 世界地图点阵数据（程序生成，约 3800 点）
    ├── FanghaoChen_CV_260621.pdf
    ├── 陈方豪_暨大管院_260621.pdf
    ├── EngSur2ChnSur-mapping.zip      # 数据集一：姓氏中英对照
    ├── 涉侨族谱分布241028.rar          # 数据集二：涉侨族谱
    └── img/                    # 肖像照(business.jpg) + 公共领域档案照片
```

## 本地预览

```powershell
cd homepage-redesign
python -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/
```

直接双击 `index.html` 也能打开，但建议用本地服务器（保证字体与相对路径一致）。

## 部署到 gh-pages

本目录是自包含静态站点（无构建步骤）。部署时：

1. 将 `index.html` 与 `assets/` 复制到仓库 `gh-pages` 分支根目录；
2. 原 Jekyll 文件（`_config.yml`、`_layouts/`、`_sass/`、`*.md`、`Gemfile` 等）可删除或在分支中归档；
3. 提交推送即可，GitHub Pages 会直接托管 `index.html`；
4. 旧站的教学 PDF（第1-12讲等）未包含在本目录，若新站不加回链接则无需迁移。

## 设计说明

- **配色**：宣纸米白 `#F6F1E8` / 墨色 `#191510` / 朱砂红 `#B01E23` / 赭石 `#8A6D4B` / 金 `#C9A227`
- **字体**：Fraunces（英文展示）· Archivo（英文正文）· 思源宋体/黑体（中文）
- **首屏动画**：Canvas 绘制的"下南洋"航线网络——点阵世界地图 + 侨乡五邑（广州/潮州/泉州/江门/香港）至槟城、雅加达、泗水、曼谷、旧金山、多伦多、悉尼、毛里求斯、普拉托的弧线 + 流动光粒；城市标注按视觉布局取舍（潮州/江门只画点不标注，东南亚诸港错开锚点），避免重叠；滚出视口自动暂停，尊重 `prefers-reduced-motion`
- **双语**：默认按浏览器语言，右上角可切换，选择存入 localStorage
- **奖项印章**：朱砂圆形章（获奖贰等/壹等）、方形章（封面）

## 素材版权

- `archive-junk.jpg`：长江帆船历史照片，Wikimedia Commons，公有领域
- `archive-hk-junks.jpg`：香港帆船明信片，Wikimedia Commons，公有领域
- `archive-zupu-zhao.jpg`：《慈溪房趙族家譜》，Wikimedia Commons，CC BY-SA 4.0
- `archive-identity-cert.jpg`：1910 年美国移民局身份证件（Louie Jock Sung 雷澤森），NARA / Wikimedia Commons，公有领域
- 点阵世界地图：基于 Natural Earth（world-atlas 110m）由 `build/gen-map-dots.js` 程序生成
- 肖像照：本人提供（business.jpg）
- 首屏姓名按语言切换：英文 Fanghao Chen / 中文 陈方豪；简历链接同理（英文 CV / 中文简历）
- 导航印章用繁体「陳」，平整摆放；渡海方程英文名 SeaQuation

## 维护

- 更新论文/课程：直接编辑 `index.html` 对应区块（中英双语文本都在 `t-en` / `t-zh` 标签内）
- 重新生成地图点阵：`cd build && node gen-map-dots.js`（需联网）
- 截图脚本：`build/preview-shot.js`、`build/reshot.js`（需本机 puppeteer 环境）
