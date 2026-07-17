/* ═══════════════════════════════════════════════════════
   Fanghao Chen · Roots & Routes — interactions
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Language toggle ─────────────────────────────── */
  var langBtn = document.getElementById('langToggle');
  function currentLang() { return document.body.dataset.lang === 'zh' ? 'zh' : 'en'; }
  function setLang(lang) {
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    langBtn.textContent = lang === 'zh' ? 'EN' : '中文';
    try { localStorage.setItem('fhc-lang', lang); } catch (e) {}
  }
  (function initLang() {
    var saved = null;
    try { saved = localStorage.getItem('fhc-lang'); } catch (e) {}
    var lang = saved || ((navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');
    setLang(lang);
  })();
  langBtn.addEventListener('click', function () {
    setLang(currentLang() === 'zh' ? 'en' : 'zh');
  });

  /* ── 2. Nav: scrolled state + active section ────────── */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var secObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = '#' + en.target.id;
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(function (s) { secObserver.observe(s); });

  /* ── 3. Reveal on scroll (staggered) ────────────────── */
  var revealObserver = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; });
    batch.forEach(function (en, i) {
      en.target.style.transitionDelay = (i * 70) + 'ms';
      en.target.classList.add('in');
      revealObserver.unobserve(en.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ── 4. Hero canvas: diaspora network ───────────────── */
  var CITIES = [
    // 侨乡 origins
    { en: 'Guangzhou',   zh: '广州',     lon: 113.26, lat: 23.13, hub: true, lab: { a: 'end', dx: -9, dy: -7 } },
    { en: 'Chaozhou',    zh: '潮州',     lon: 116.62, lat: 23.66, hub: true, lab: { hide: true } },
    { en: 'Quanzhou',    zh: '泉州',     lon: 118.68, lat: 24.87, hub: true, lab: { a: 'start', dx: 8, dy: -8 } },
    { en: 'Jiangmen',    zh: '江门',     lon: 113.08, lat: 22.58, hub: true, lab: { hide: true } },
    { en: 'Hong Kong',   zh: '香港',     lon: 114.17, lat: 22.32, hub: true, lab: { a: 'middle', dx: 0, dy: 18 } },
    // destinations
    { en: 'Penang',      zh: '槟城',     lon: 100.33, lat: 5.41,   label: true, lab: { a: 'start', dx: 7, dy: 12 } },
    { en: 'Jakarta',     zh: '雅加达',   lon: 106.85, lat: -6.21,  label: true, lab: { a: 'end', dx: -7, dy: 3 } },
    { en: 'Surabaya',    zh: '泗水',     lon: 114.22, lat: -7.25,  label: true, lab: { a: 'start', dx: 7, dy: 3 } },
    { en: 'Bangkok',     zh: '曼谷',     lon: 100.50, lat: 13.76,  label: true, lab: { a: 'end', dx: -7, dy: -6 } },
    { en: 'San Francisco', zh: '旧金山', lon: -122.42, lat: 37.77, label: true, lab: { a: 'end', dx: -7, dy: -4 } },
    { en: 'Toronto',     zh: '多伦多',   lon: -79.38, lat: 43.65,  label: true, lab: { a: 'start', dx: 8, dy: 14 } },
    { en: 'Sydney',      zh: '悉尼',     lon: 151.21, lat: -33.87, label: true, lab: { a: 'start', dx: 7, dy: 3 } },
    { en: 'Mauritius',   zh: '毛里求斯', lon: 57.55,  lat: -20.16, label: true, lab: { a: 'start', dx: 7, dy: 3 } },
    { en: 'Prato',       zh: '普拉托',   lon: 11.10,  lat: 43.88,  label: true, lab: { a: 'start', dx: 7, dy: -4 } }
  ];
  var ARCS = [
    [0, 9], [4, 9], [0, 10], [3, 10], [1, 8], [2, 5],
    [2, 6], [1, 7], [0, 11], [2, 12], [4, 13]
  ];

  var canvas = document.getElementById('netCanvas');
  if (canvas && window.MAP_DOTS) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, rafId = null, running = false;
    var particles = [];

    function project(lon, lat) {
      var mx = W * 0.05, my = H * 0.09;
      return [
        mx + (lon + 180) / 360 * (W - 2 * mx),
        my + (90 - lat) / 180 * (H - 2 * my)
      ];
    }
    function arcPath(a, b) {
      var p1 = project(a.lon, a.lat), p2 = project(b.lon, b.lat);
      var dx = p2[0] - p1[0], dy = p2[1] - p1[1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      var lift = Math.min(dist * 0.28, H * 0.16) + 14;
      return { p1: p1, p2: p2, cx: (p1[0] + p2[0]) / 2, cy: (p1[1] + p2[1]) / 2 - lift, len: dist };
    }
    function bez(g, t) {
      var u = 1 - t;
      return [
        u * u * g.p1[0] + 2 * u * t * g.cx + t * t * g.p2[0],
        u * u * g.p1[1] + 2 * u * t * g.cy + t * t * g.p2[1]
      ];
    }

    var geos = [];
    function rebuild() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geos = ARCS.map(function (pr) { return arcPath(CITIES[pr[0]], CITIES[pr[1]]); });
      particles = [];
      ARCS.forEach(function (pr, i) {
        var n = geos[i].len > 500 ? 2 : 1;
        for (var k = 0; k < n; k++) {
          particles.push({
            g: i,
            t: Math.random(),
            speed: (0.0016 + Math.random() * 0.0012) * (420 / Math.max(geos[i].len, 220)),
            trail: []
          });
        }
      });
    }

    function drawFrame(time) {
      ctx.clearRect(0, 0, W, H);
      var lang = currentLang();

      // land dots
      ctx.fillStyle = 'rgba(243,235,220,0.13)';
      var dots = window.MAP_DOTS;
      for (var i = 0; i < dots.length; i++) {
        var p = project(dots[i][0], dots[i][1]);
        ctx.fillRect(p[0], p[1], 1.6, 1.6);
      }
      // shimmering dots
      if (time) {
        ctx.fillStyle = 'rgba(243,235,220,0.28)';
        for (var s = 0; s < dots.length; s += 37) {
          var ph = (time * 0.0004 + s) % 1;
          var a = Math.sin(ph * Math.PI);
          if (a <= 0.05) continue;
          ctx.globalAlpha = a * 0.5;
          var q = project(dots[s][0], dots[s][1]);
          ctx.fillRect(q[0], q[1], 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      // arcs
      ctx.strokeStyle = 'rgba(201,162,39,0.18)';
      ctx.lineWidth = 1;
      geos.forEach(function (g) {
        ctx.beginPath();
        ctx.moveTo(g.p1[0], g.p1[1]);
        ctx.quadraticCurveTo(g.cx, g.cy, g.p2[0], g.p2[1]);
        ctx.stroke();
      });

      // particles with trails
      particles.forEach(function (pt) {
        var g = geos[pt.g];
        pt.t += pt.speed;
        if (pt.t > 1) { pt.t = 0; pt.trail.length = 0; }
        var pos = bez(g, pt.t);
        pt.trail.push(pos);
        if (pt.trail.length > 14) pt.trail.shift();
        for (var j = 0; j < pt.trail.length; j++) {
          var al = (j / pt.trail.length) * 0.5;
          ctx.fillStyle = 'rgba(232,178,58,' + al.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(pt.trail[j][0], pt.trail[j][1], 1.4, 0, 6.2832);
          ctx.fill();
        }
        ctx.save();
        ctx.shadowColor = 'rgba(232,178,58,0.9)';
        ctx.shadowBlur = 7;
        ctx.fillStyle = '#F5C85C';
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 2.1, 0, 6.2832);
        ctx.fill();
        ctx.restore();
      });

      // city nodes + labels
      CITIES.forEach(function (c) {
        var p = project(c.lon, c.lat);
        if (c.hub) {
          ctx.save();
          ctx.shadowColor = 'rgba(214,69,69,0.9)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#D64545';
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3.4, 0, 6.2832);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = 'rgba(243,235,220,0.85)';
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2, 0, 6.2832);
          ctx.fill();
        }
        var lc = c.lab || {};
        if ((c.hub || c.label) && !lc.hide) {
          ctx.font = '600 10px Archivo, "Noto Sans SC", sans-serif';
          ctx.fillStyle = c.hub ? 'rgba(243,235,220,0.85)' : 'rgba(243,235,220,0.45)';
          ctx.textAlign = lc.a || 'start';
          ctx.fillText(lang === 'zh' ? c.zh : c.en.toUpperCase(), p[0] + (lc.dx != null ? lc.dx : 7), p[1] + (lc.dy != null ? lc.dy : 3));
          ctx.textAlign = 'start';
        }
      });
    }

    function loop(time) {
      drawFrame(time);
      rafId = running ? requestAnimationFrame(loop) : null;
    }
    function start() { if (!running && !reducedMotion) { running = true; rafId = requestAnimationFrame(loop); } }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

    rebuild();
    if (reducedMotion) { drawFrame(0); } else { start(); }

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { rebuild(); if (reducedMotion) drawFrame(0); }, 200);
    });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (reducedMotion) return;
        if (en.isIntersecting) start(); else stop();
      });
    }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      if (reducedMotion) return;
      if (document.hidden) stop(); else start();
    });
  }

  /* ── 5. Collaboration network graph (SVG) ───────────── */
  var PEOPLE = [
    { id: 'fc', x: 500, y: 300, r: 40, init: 'FC', cls: 'center',
      name: 'Fanghao Chen 陈方豪', affEn: 'Jinan University', affZh: '暨南大学' },
    { id: 'xz', x: 292, y: 148, r: 31, init: 'XZ', cls: 'advisor',
      name: 'Xiaobo Zhang 张晓波', affEn: 'PKU Guanghua / IFPRI · PhD advisor', affZh: '北京大学光华管理学院 / IFPRI · 博士生导师',
      url: 'https://www.gsm.pku.edu.cn/jsjjxq.jsp?urltype=tree.TreeTempUrl&wbtreeid=1141&user_id=x.zhang' },
    { id: 'lb', x: 708, y: 148, r: 31, init: 'LB', cls: 'advisor',
      name: 'Loren Brandt', affEn: 'University of Toronto · advisor', affZh: '多伦多大学 · 导师',
      url: 'https://brandt.economics.utoronto.ca/' },
    { id: 'lx', x: 500, y: 84, r: 26, init: 'LX', cls: '',
      name: 'Lixin Colin Xu 徐立新', affEn: 'Cheung Kong Graduate School of Business', affZh: '长江商学院',
      url: 'https://english.ckgsb.edu.cn/faculty/lixin-colin-xu/' },
    { id: 'gd', x: 106, y: 276, r: 26, init: 'GD', cls: '',
      name: 'Gilles Duranton', affEn: 'Wharton / LSE / CEPR', affZh: '宾夕法尼亚大学沃顿商学院 / LSE / CEPR',
      url: 'http://real-faculty.wharton.upenn.edu/duranton/' },
    { id: 'dl', x: 196, y: 448, r: 26, init: 'DL', cls: '',
      name: 'Denggao Long 龙登高', affEn: 'Tsinghua University', affZh: '清华大学',
      url: 'https://www.tioe.tsinghua.edu.cn/info/1179/1308.htm' },
    { id: 'rx', x: 388, y: 492, r: 26, init: 'RX', cls: '',
      name: 'Ruichi Xiong 熊瑞驰', affEn: 'Wuhan University', affZh: '武汉大学',
      url: 'https://www.ruichixiong.com/' },
    { id: 'zf', x: 612, y: 492, r: 26, init: 'ZF', cls: '',
      name: 'Zhongchen Fan 樊仲琛', affEn: 'Xi’an Jiaotong University', affZh: '西安交通大学',
      url: 'http://sef.xjtu.edu.cn/info/1086/18778.htm' },
    { id: 'bx', x: 804, y: 448, r: 26, init: 'BX', cls: '',
      name: 'Bin Xie 谢斌', affEn: 'Jinan University', affZh: '暨南大学',
      url: 'http://binxie.weebly.com/' },
    { id: 'jy', x: 894, y: 276, r: 26, init: 'JY', cls: '',
      name: 'Jingjing Ye 叶菁菁', affEn: 'Zhongnan University of Economics & Law', affZh: '中南财经政法大学',
      url: 'https://csxy.zuel.edu.cn/2022/0903/c7501a305013/pagem.htm' }
  ];

  var svg = document.getElementById('collabGraph');
  var tip = document.getElementById('graphTip');
  if (svg && tip) {
    var NS = 'http://www.w3.org/2000/svg';
    var center = PEOPLE[0];
    PEOPLE.slice(1).forEach(function (p) {
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', center.x); line.setAttribute('y1', center.y);
      line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
      line.setAttribute('class', p.cls === 'advisor' ? 'g-edge g-edge-adv' : 'g-edge');
      svg.appendChild(line);
    });
    PEOPLE.forEach(function (p) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'g-node' + (p.cls ? ' ' + p.cls : ''));
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', p.r);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', p.x); t.setAttribute('y', p.y);
      t.textContent = p.init;
      var lb = document.createElementNS(NS, 'text');
      lb.setAttribute('x', p.x); lb.setAttribute('y', p.y + p.r + 17);
      lb.setAttribute('class', 'g-label');
      lb.textContent = p.name.split(' ')[0] === 'Fanghao' ? 'Fanghao Chen' : p.name;
      g.appendChild(c); g.appendChild(t); g.appendChild(lb);
      svg.appendChild(g);

      if (p.url) {
        g.addEventListener('mouseenter', function () {
          var wrap = svg.parentElement.getBoundingClientRect();
          var sx = wrap.width / 1000, sy = wrap.width / 1000;
          tip.innerHTML = '<b>' + p.name + '</b><br>' +
            (currentLang() === 'zh' ? p.affZh : p.affEn) +
            '<br><span style="color:#C9A227">' + (currentLang() === 'zh' ? '点击访问主页 ↗' : 'Click to visit ↗') + '</span>';
          tip.hidden = false;
          var tx = p.x * sx + 18, ty = p.y * sy - 20;
          tip.style.left = Math.min(tx, wrap.width - 250) + 'px';
          tip.style.top = Math.max(ty - tip.offsetHeight, 6) + 'px';
        });
        g.addEventListener('mouseleave', function () { tip.hidden = true; });
        g.addEventListener('click', function () { window.open(p.url, '_blank', 'noopener'); });
      }
    });
  }
})();
