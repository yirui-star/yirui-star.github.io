/* ============================================================
   博客自定义特效：落叶 + 流星 + 点赞 + 页脚落叶堆（3D 场景）
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* 页脚落叶场景（由 initLeafScene 赋值，供飘落落叶判断"落地"） */
  var leafPile = null;

  /* ---------------- 落叶飘落（全屏层） ---------------- */
  function initPetals() {
    if (reduceMotion || document.getElementById('petal-canvas')) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'petal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var count = window.innerWidth < 768 ? 14 : 26;
    var petals = [];
    var PETAL_COLORS = ['255, 111, 60', '240, 166, 60', '200, 60, 40', '176, 90, 40', '230, 200, 90', '160, 70, 30'];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makePetal(fromTop) {
      return {
        x: Math.random() * W,
        y: fromTop ? -30 - Math.random() * 80 : Math.random() * H,
        size: 9 + Math.random() * 9,
        vy: 0.36 + Math.random() * 0.6,
        vx: -0.2 + Math.random() * 0.4,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.018,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: -0.012 + Math.random() * 0.024,
        alpha: 0.8 + Math.random() * 0.18,
        color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]
      };
    }

    function drawPetal(p) {
      var s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.62, -s * 0.55, 0, -s * 1.2);
      ctx.quadraticCurveTo(-s * 0.62, -s * 0.55, 0, 0);
      ctx.shadowColor = 'rgba(' + p.color + ',0.55)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha.toFixed(3) + ')';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(0, -s * 1.05);
      ctx.strokeStyle = 'rgba(255, 240, 210, ' + (p.alpha * 0.5).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.sway += p.swaySpeed;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.55;
        p.rot += p.rotSpeed;

        if (leafPile && leafPile.hit(p.x, p.y)) {
          leafPile.land(p.x, p.color, p.size, p.rot, p.y);
          petals[i] = makePetal(true);
          continue;
        }
        if (p.y > H + 40 || p.x < -60 || p.x > W + 60) {
          petals[i] = makePetal(true);
          continue;
        }
        drawPetal(p);
      }
    }

    resize();
    for (var i = 0; i < count; i++) petals.push(makePetal(false));
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
  }

  /* ---------------- 流星 ---------------- */
  function initMeteors() {
    if (reduceMotion || document.getElementById('meteor-canvas')) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'meteor-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var meteors = [];
    var METEOR_COLORS = ['255, 214, 130', '255, 160, 90', '255, 130, 150', '255, 190, 120'];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      meteors.push({
        x: W * (0.3 + Math.random() * 0.7),
        y: Math.random() * H * 0.45,
        len: 120 + Math.random() * 140,
        vx: -2.9 - Math.random() * 2.6,
        vy: 1.8 + Math.random() * 1.2,
        life: 0,
        maxLife: 90 + Math.random() * 50,
        color: METEOR_COLORS[(Math.random() * METEOR_COLORS.length) | 0]
      });
    }

    function drawMeteor(m) {
      var t = m.life / m.maxLife;
      var alpha = Math.sin(Math.PI * Math.min(t * 1.15, 1)) * 0.95;
      if (alpha <= 0.01) return;
      var norm = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
      var tx = m.x - (m.vx / norm) * m.len;
      var ty = m.y - (m.vy / norm) * m.len;
      var g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(' + m.color + ',' + alpha.toFixed(3) + ')');
      g.addColorStop(0.45, 'rgba(' + m.color + ',' + (alpha * 0.4).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + m.color + ',0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.4, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(' + m.color + ',' + alpha.toFixed(3) + ')';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(' + m.color + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;
        if (m.life > m.maxLife || m.x < -250 || m.y > H + 120) {
          meteors.splice(i, 1);
          continue;
        }
        drawMeteor(m);
      }
    }

    function schedule() {
      setTimeout(function () {
        if (!document.hidden) {
          spawn();
          if (Math.random() < 0.45) setTimeout(spawn, 400 + Math.random() * 600);
        }
        schedule();
      }, 2200 + Math.random() * 3800);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
    setTimeout(function () { spawn(); schedule(); }, 900);
  }

  /* ---------------- 点赞按钮 ---------------- */
  function initLike() {
    if (document.getElementById('like-btn')) return;
    var key = 'yr-blog-like:' + location.pathname;
    var btn = document.createElement('button');
    btn.id = 'like-btn';
    btn.type = 'button';
    btn.title = '喜欢这篇内容？点个赞吧';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>' +
      '</svg><span class="like-count">0</span>';
    var count = 0;
    try { count = parseInt(window.localStorage.getItem(key) || '0', 10) || 0; } catch (e) {}
    btn.querySelector('.like-count').textContent = count;

    btn.addEventListener('click', function () {
      count += 1;
      try { window.localStorage.setItem(key, String(count)); } catch (e) {}
      btn.querySelector('.like-count').textContent = count;
      btn.classList.remove('liked-pop');
      void btn.offsetWidth;
      btn.classList.add('liked-pop');
      var plus = document.createElement('span');
      plus.className = 'like-plus';
      plus.textContent = '+1';
      btn.appendChild(plus);
      setTimeout(function () { if (plus.parentNode) plus.parentNode.removeChild(plus); }, 900);
    });

    document.body.appendChild(btn);
  }

  /* ---------------- 背景随滚动视差 ---------------- */
  function initWallpaperParallax() {
    if (reduceMotion) return;
    var root = document.documentElement;
    var target = 0;
    var current = 0;
    var rafId = null;

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      target = -Math.min(y * 0.16, 80);
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    function loop() {
      var diff = target - current;
      current += diff * 0.1;
      if (Math.abs(diff) > 0.15) {
        root.style.setProperty('--wall-y', current.toFixed(2) + 'px');
        rafId = requestAnimationFrame(loop);
      } else {
        current = target;
        root.style.setProperty('--wall-y', target.toFixed(2) + 'px');
        rafId = null;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------------- 顶部阅读进度条 ---------------- */
  function initScrollProgress() {
    if (document.getElementById('scroll-progress')) return;
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      bar.style.width = p.toFixed(2) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------- 滚动驱动动画（由远及近 + 双向联动） ---------------- */
  function initScrollMotion() {
    if (reduceMotion) return;

    var selectors = [
      '.recent-post-item',
      '#aside-content .card-widget',
      '#article-container > h2',
      '#article-container > h3',
      '#article-container > p',
      '#article-container > ul',
      '#article-container > ol',
      '#article-container > blockquote',
      '#article-container > .highlight',
      '#article-container > table',
      '#article-container > img'
    ];

    var items = [];
    var seen = [];
    for (var s = 0; s < selectors.length; s++) {
      var nodes = document.querySelectorAll(selectors[s]);
      for (var n = 0; n < nodes.length; n++) {
        var el = nodes[n];
        if (seen.indexOf(el) !== -1) continue;
        seen.push(el);
        var isCard = el.classList.contains('recent-post-item');
        var isAside = !isCard && !!el.closest('#aside-content');
        items.push({
          el: el,
          top: 0,
          h: 0,
          cur: -1,
          ampY: isCard ? 58 : isAside ? 42 : 30,
          ampS: isCard ? 0.09 : isAside ? 0.07 : 0.035,
          ampR: isCard ? 3.2 : isAside ? 2.2 : 1,
          begun: false
        });
        el.classList.add('motion-el');
      }
    }
    if (!items.length) return;

    function measure() {
      var sy = window.pageYOffset || 0;
      for (var i = 0; i < items.length; i++) {
        var r = items[i].el.getBoundingClientRect();
        items[i].top = r.top + sy;
        items[i].h = r.height;
      }
    }

    function apply(it, c) {
      var y = (1 - c) * it.ampY;
      var sc = 1 - (1 - c) * it.ampS;
      var rot = (1 - c) * it.ampR;
      it.el.style.setProperty('--my', y.toFixed(2) + 'px');
      it.el.style.setProperty('--ms', sc.toFixed(4));
      it.el.style.setProperty('--mr', rot.toFixed(2) + 'deg');
      it.el.style.opacity = (0.05 + 0.95 * c).toFixed(3);
    }

    var hero = document.querySelector('#page-header.full_page');
    var heroTitle = document.getElementById('site-title');
    var heroSub = document.getElementById('site-subtitle');

    function heroFrame(sy, vh) {
      if (!hero) return;
      var p = sy / (vh * 0.55);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var e = 1 - Math.pow(1 - p, 2.2);
      if (heroTitle) {
        heroTitle.style.transform = 'translate3d(0,' + (-e * 74).toFixed(2) + 'px,0) scale(' + (1 - e * 0.06).toFixed(4) + ')';
        heroTitle.style.opacity = (1 - e * 0.92).toFixed(3);
      }
      if (heroSub) {
        heroSub.style.transform = 'translate3d(0,' + (-e * 52).toFixed(2) + 'px,0)';
        heroSub.style.opacity = (1 - e * 0.95).toFixed(3);
      }
    }

    var rafId = null;

    function loop() {
      rafId = null;
      var vh = window.innerHeight;
      var sy = window.pageYOffset || 0;
      var moving = false;

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var rel = it.top - sy;

        /* 远离视口：直接落到终态，避免无谓计算 */
        if (rel > vh * 1.7) {
          if (!it.begun) continue;
          if (it.cur !== 0) { it.cur = 0; apply(it, 0); }
          continue;
        }
        if (rel + it.h < -vh * 0.5) {
          if (it.cur !== 1) { it.cur = 1; apply(it, 1); }
          continue;
        }

        it.begun = true;

        /* 进度：元素顶部从视口 94% 处进入，到 52% 处完全就位 */
        var raw = (vh * 0.94 - rel) / (vh * 0.42);
        var p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
        var eased = 1 - Math.pow(1 - p, 3);
        var d = eased - it.cur;
        if (Math.abs(d) > 0.0012) {
          it.cur += d * 0.14;
          moving = true;
        } else {
          it.cur = eased;
        }
        apply(it, it.cur);
      }

      heroFrame(sy, vh);

      if (moving) rafId = requestAnimationFrame(loop);
    }

    function kick() {
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    measure();
    kick();

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () { measure(); kick(); });
    window.addEventListener('load', function () { measure(); kick(); });
    setTimeout(function () { measure(); kick(); }, 900);
  }

  /* ---------------- 点击水波纹 ---------------- */
  function initRipple() {
    if (reduceMotion) return;

    var hosts = document.querySelectorAll('.recent-post-item, #rightside > div > button, #rightside > div > a');
    for (var i = 0; i < hosts.length; i++) {
      (function (el) {
        el.classList.add('ripple-host');
        el.addEventListener('pointerdown', function (ev) {
          var rect = el.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height) * 2;
          var span = document.createElement('span');
          span.className = 'ripple';
          span.style.width = size + 'px';
          span.style.height = size + 'px';
          span.style.left = (ev.clientX - rect.left - size / 2) + 'px';
          span.style.top = (ev.clientY - rect.top - size / 2) + 'px';
          el.appendChild(span);
          setTimeout(function () {
            if (span.parentNode) span.parentNode.removeChild(span);
          }, 700);
        });
      })(hosts[i]);
    }
  }

  /* ---------------- 页脚落叶堆：3D 层次 + 软着陆 + 微风循环 ---------------- */
  function initLeafScene() {
    var footer = document.getElementById('footer');
    if (!footer || document.getElementById('leaf-pile')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'leaf-pile';
    canvas.setAttribute('aria-hidden', 'true');
    footer.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W = 0;
    var H = 280;
    var base = null;
    var dyn = [];
    var rect = null;
    var visible = false;
    var gustTimer = null;
    var COLORS = ['#c0392b', '#d35400', '#e2703a', '#f0a63c', '#c9a227', '#8b4a2b', '#a0522d', '#e88a4a'];

    function shade(hex, f) {
      var r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
      var g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
      var b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    /* 四层"山脊"轮廓：0 最远最高，3 最近最低 */
    function surfaceY(x, layer) {
      var t = x / Math.max(W, 1);
      if (layer === 0) return H - (108 + 34 * Math.sin(t * 5.6 + 0.4) + 16 * Math.sin(t * 12.3 + 2.1));
      if (layer === 1) return H - (76 + 30 * Math.sin(t * 4.7 + 1.6) + 14 * Math.sin(t * 10.1 + 0.3));
      if (layer === 2) return H - (44 + 24 * Math.sin(t * 3.9 + 2.6) + 10 * Math.sin(t * 8.2 + 1.1));
      return H - (18 + 10 * Math.sin(t * 3.1 + 1.2) + 5 * Math.sin(t * 7.3 + 2.7));
    }

    function drawLeafShape(c, x, y, size, rot, color, alpha, vein) {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.rotate(rot);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(size * 0.62, -size * 0.55, 0, -size * 1.15);
      c.quadraticCurveTo(-size * 0.62, -size * 0.55, 0, 0);
      c.fillStyle = color;
      c.fill();
      if (vein) {
        c.beginPath();
        c.moveTo(0, -2);
        c.lineTo(0, -size * 0.95);
        c.strokeStyle = 'rgba(255, 235, 205, 0.28)';
        c.lineWidth = 1;
        c.stroke();
      }
      c.restore();
    }

    function buildBase() {
      if (!W) return;
      var off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(W * dpr));
      off.height = Math.round(H * dpr);
      var c = off.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* 最远的深色"山体"，让叶子之间有厚度感 */
      c.beginPath();
      c.moveTo(-20, H);
      for (var bx = -20; bx <= W + 20; bx += 14) c.lineTo(bx, surfaceY(bx, 0) + 30);
      c.lineTo(W + 20, H);
      c.closePath();
      c.fillStyle = 'rgba(52, 20, 18, 0.62)';
      c.fill();

      var layers = [
        { depth: 58, step: 8, smin: 5, smax: 11, shade: 0.38, alpha: 0.92 },
        { depth: 76, step: 8, smin: 7, smax: 14, shade: 0.58, alpha: 0.96 },
        { depth: 96, step: 8, smin: 9, smax: 17, shade: 0.8, alpha: 1 },
        { depth: 54, step: 9, smin: 12, smax: 20, shade: 1, alpha: 1 }
      ];

      for (var li = 0; li < layers.length; li++) {
        var cfg = layers[li];
        for (var x = -20; x < W + 20; x += cfg.step * (0.65 + Math.random() * 0.7)) {
          var top = surfaceY(x, li);
          for (var y = top + 2; y < Math.min(H + 8, top + cfg.depth); y += 3.5 + Math.random() * 3) {
            var size = cfg.smin + Math.random() * (cfg.smax - cfg.smin);
            drawLeafShape(
              c,
              x + (Math.random() - 0.5) * 7,
              y + (Math.random() - 0.5) * 5,
              size,
              Math.random() * Math.PI * 2,
              shade(COLORS[(Math.random() * COLORS.length) | 0], cfg.shade),
              cfg.alpha,
              li >= 2 && Math.random() < 0.5
            );
          }
        }
      }

      /* 底部压暗，坐实"重量" */
      var g = c.createLinearGradient(0, H - 70, 0, H);
      g.addColorStop(0, 'rgba(34, 12, 20, 0)');
      g.addColorStop(1, 'rgba(34, 12, 20, 0.6)');
      c.fillStyle = g;
      c.fillRect(0, H - 70, W, 70);

      base = off;
    }

    function makeSettled(x) {
      var lx = Math.max(6, Math.min(W - 6, x));
      return {
        state: 'settled',
        x: lx,
        y: surfaceY(lx, 2) - 4,
        rot: Math.random() * Math.PI * 2,
        size: 9 + Math.random() * 9,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        phase: Math.random() * Math.PI * 2,
        hops: 0
      };
    }

    function reseed() {
      dyn = [];
      var n = Math.max(24, Math.round(W / 42));
      for (var i = 0; i < n; i++) dyn.push(makeSettled(Math.random() * W));
    }

    /* 软着陆：带着原有角度缓慢落下 + 轻微回弹，不再瞬间定格 */
    function startLanding(L, sx, sy, tx, ty) {
      L.state = 'landing';
      L.t = 0;
      L.dur = 26 + ((Math.random() * 12) | 0);
      L.x0 = sx;
      L.sy = sy;
      L.tx = tx;
      L.ty = ty;
      L.bounce = 1.2 + Math.random() * 2.4;
      L.spin = (Math.random() - 0.5) * 0.03;
    }

    function gust() {
      var settled = [];
      for (var i = 0; i < dyn.length; i++) if (dyn[i].state === 'settled') settled.push(dyn[i]);

      var n = Math.min(settled.length, Math.random() < 0.8 ? 1 : 2);
      for (var k = 0; k < n; k++) {
        var L = settled.splice((Math.random() * settled.length) | 0, 1)[0];
        L.hops = (L.hops || 0) + 1;

        var nearEdge = L.x < 70 || L.x > W - 70;
        if (L.hops >= 3 || nearEdge) {
          /* 飞出去：转两整圈，从左右边缘离开 */
          L.state = 'blow';
          L.t = 0;
          L.dur = 320 + Math.random() * 120;
          L.dir = L.x < W / 2 ? -1 : 1;
          L.y0 = L.y;
          L.spin = L.dir * (Math.PI * 2.6 / L.dur);
        } else {
          /* 转个圈：回到原处附近，或者往一侧挪一点 */
          L.state = 'swirl';
          L.t = 0;
          L.dur = 240 + Math.random() * 120;
          L.cx = L.x;
          L.cy = L.y - 16;
          L.r = 6 + Math.random() * 7;
          L.ang0 = Math.random() * Math.PI * 2;
          L.dir = Math.random() < 0.5 ? -1 : 1;
          L.turns = 0.6 + Math.random() * 0.4;
          L.spin = L.dir * (Math.PI * 2.4 / L.dur);
          L.homeX = L.x;
          L.backHome = Math.random() < 0.55;
        }
      }

      var m = 1 + ((Math.random() * 2) | 0);
      for (var j = 0; j < m; j++) {
        var fromLeft = Math.random() < 0.5;
        var tx2 = 50 + Math.random() * Math.max(W - 100, 1);
        var ty2 = surfaceY(tx2, 2) - 4;
        dyn.push({
          state: 'arrive',
          t: 0,
          dur: 180 + Math.random() * 70,
          x0: fromLeft ? -46 : W + 46,
          y0: surfaceY(tx2, 2) - 70 - Math.random() * 30,
          tx: tx2,
          ty: ty2,
          x: fromLeft ? -46 : W + 46,
          y: 0,
          rot: Math.random() * Math.PI * 2,
          spin: (fromLeft ? 1 : -1) * (Math.PI * 2.6 / 200),
          size: 9 + Math.random() * 8,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          hops: 0
        });
      }

      gustTimer = setTimeout(gust, 5500 + Math.random() * 3000);
    }

    function frame() {
      requestAnimationFrame(frame);
      if (document.hidden || !visible || !base) return;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);

      for (var i = dyn.length - 1; i >= 0; i--) {
        var L = dyn[i];
        L.t = (L.t || 0) + 1;

        if (L.state === 'settled') {
          L.phase += 0.012;
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot + Math.sin(L.phase) * 0.06, L.color, 1, true);
          continue;
        }

        if (L.state === 'landing') {
          var kl = Math.min(L.t / L.dur, 1);
          L.x = L.x0 + (L.tx - L.x0) * kl;
          L.y = L.sy + (L.ty - L.sy) * kl - Math.sin(Math.PI * kl) * L.bounce;
          L.rot += L.spin * (1 - kl);
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, 1, true);
          if (kl >= 1) {
            L.state = 'settled';
            L.x = L.tx;
            L.y = L.ty;
            L.phase = Math.random() * Math.PI * 2;
            L.spin = 0;
          }
          continue;
        }

        var k = L.t / L.dur;

        if (L.state === 'swirl') {
          var ang = L.ang0 + L.dir * Math.PI * 2 * L.turns * k;
          L.x = L.cx + Math.cos(ang) * L.r;
          L.y = L.cy + Math.sin(ang) * L.r * 0.7;
          L.rot += L.spin;
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, 1, false);
          if (k >= 1) {
            var nx = L.backHome
              ? L.homeX + (Math.random() - 0.5) * 14
              : L.homeX + L.dir * (22 + Math.random() * 34);
            nx = Math.max(16, Math.min(W - 16, nx));
            startLanding(L, L.x, L.y, nx, surfaceY(nx, 2) - 4);
          }
        } else if (L.state === 'blow') {
          L.x += L.dir * (0.9 + k * 2.0);
          L.y = L.y0 - Math.sin(Math.PI * Math.min(k, 1)) * 34 + k * 7;
          L.rot += L.spin;
          var a = k < 0.82 ? 1 : Math.max(0, 1 - (k - 0.82) / 0.18);
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, a, false);
          if (k >= 1 || L.x < -90 || L.x > W + 90) dyn.splice(i, 1);
        } else if (L.state === 'arrive') {
          L.x = L.x0 + (L.tx - L.x0) * k;
          L.y = L.y0 + (L.ty - L.y0) * k - Math.sin(Math.PI * k) * 34;
          L.rot += L.spin;
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, Math.min(1, k * 4), true);
          if (k >= 1) {
            startLanding(L, L.tx, L.ty - 10, L.tx + (Math.random() - 0.5) * 10, L.ty);
          }
        }
      }
    }

    function resize() {
      W = Math.round(footer.clientWidth);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.round(H * dpr);
      canvas.style.width = '100%';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rect = canvas.getBoundingClientRect();
      buildBase();
      reseed();
    }

    var rectTimer = null;
    function refreshRect() {
      if (rectTimer) return;
      rectTimer = setTimeout(function () {
        rectTimer = null;
        rect = canvas.getBoundingClientRect();
      }, 120);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !base) buildBase();
      }, { rootMargin: '240px 0px 240px 0px' }).observe(canvas);
    } else {
      visible = true;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', refreshRect, { passive: true });

    leafPile = {
      hit: function (x, y) {
        if (!visible || !rect || !base) return false;
        if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
        var lx = x - rect.left;
        if (lx < -20 || lx > W + 20) return false;
        return y >= rect.top + surfaceY(lx, 2) - 4;
      },
      land: function (x, color, size, rot, yVp) {
        if (!rect) return;
        var lx = x - rect.left;
        var ty = surfaceY(lx, 2) - 4;
        var sy = typeof yVp === 'number' ? Math.min(yVp - rect.top, ty - 2) : ty - 20;
        var L = {
          state: 'landing',
          t: 0,
          rot: rot || 0,
          size: Math.min(18, (size || 12) * 0.85),
          color: 'rgb(' + color + ')',
          hops: 0
        };
        startLanding(L, lx, sy, lx + (Math.random() - 0.5) * 12, ty);
        dyn.push(L);
        if (dyn.length > 110) {
          for (var i = 0; i < dyn.length; i++) {
            if (dyn[i].state === 'settled') {
              dyn.splice(i, 1);
              break;
            }
          }
        }
      }
    };

    if (!reduceMotion) {
      gustTimer = setTimeout(gust, 4000);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    initPetals();
    initMeteors();
    initLike();
    initWallpaperParallax();
    initScrollProgress();
    initScrollMotion();
    initRipple();
    initLeafScene();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
