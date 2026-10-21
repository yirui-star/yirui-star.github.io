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
          leafPile.land(p.x, p.color, p.size);
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

  /* ---------------- 滚动入场动画 ---------------- */
  function initScrollReveal() {
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
    for (var s = 0; s < selectors.length; s++) {
      var nodes = document.querySelectorAll(selectors[s]);
      for (var n = 0; n < nodes.length; n++) items.push(nodes[n]);
    }
    if (!items.length) return;

    document.documentElement.classList.add('reveal-ready');

    var io = new IntersectionObserver(function (entries) {
      var shown = [];
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) shown.push(entries[i].target);
      }
      for (var j = 0; j < shown.length; j++) {
        shown[j].style.transitionDelay = Math.min(j * 70, 350) + 'ms';
        shown[j].classList.add('is-visible');
        io.unobserve(shown[j]);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    for (var k = 0; k < items.length; k++) {
      items[k].classList.add('reveal-item');
      io.observe(items[k]);
    }
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

  /* ---------------- 页脚落叶堆：3D 层次 + 落地 + 微风循环 ---------------- */
  function initLeafScene() {
    var footer = document.getElementById('footer');
    if (!footer || document.getElementById('leaf-pile')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'leaf-pile';
    canvas.setAttribute('aria-hidden', 'true');
    footer.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W = 0;
    var H = 240;
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

    /* 三层"山脊"轮廓：back 最高最远，front 最低最近 */
    function surfaceY(x, layer) {
      var t = x / Math.max(W, 1);
      if (layer === 0) return H - (86 + 30 * Math.sin(t * 5.6 + 0.4) + 14 * Math.sin(t * 12.3 + 2.1));
      if (layer === 1) return H - (58 + 26 * Math.sin(t * 4.7 + 1.6) + 12 * Math.sin(t * 10.1 + 0.3));
      return H - (30 + 22 * Math.sin(t * 3.9 + 2.6) + 9 * Math.sin(t * 8.2 + 1.1));
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

      var layers = [
        { depth: 46, step: 9, smin: 5, smax: 12, shade: 0.42, alpha: 0.92 },
        { depth: 60, step: 9, smin: 7, smax: 15, shade: 0.66, alpha: 0.96 },
        { depth: 74, step: 10, smin: 9, smax: 20, shade: 1, alpha: 1 }
      ];

      for (var li = 0; li < 3; li++) {
        var cfg = layers[li];
        for (var x = -20; x < W + 20; x += cfg.step * (0.7 + Math.random() * 0.6)) {
          var top = surfaceY(x, li);
          for (var y = top + 2; y < Math.min(H + 8, top + cfg.depth); y += 4 + Math.random() * 3.5) {
            var size = cfg.smin + Math.random() * (cfg.smax - cfg.smin);
            drawLeafShape(
              c,
              x + (Math.random() - 0.5) * 7,
              y + (Math.random() - 0.5) * 5,
              size,
              Math.random() * Math.PI * 2,
              shade(COLORS[(Math.random() * COLORS.length) | 0], cfg.shade),
              cfg.alpha,
              li === 2 && Math.random() < 0.55
            );
          }
        }
      }

      /* 底部压暗，让"山势"更沉 */
      var g = c.createLinearGradient(0, H - 60, 0, H);
      g.addColorStop(0, 'rgba(36, 13, 21, 0)');
      g.addColorStop(1, 'rgba(36, 13, 21, 0.55)');
      c.fillStyle = g;
      c.fillRect(0, H - 60, W, 60);

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
        phase: Math.random() * Math.PI * 2
      };
    }

    function reseed() {
      dyn = [];
      var n = Math.max(18, Math.round(W / 70));
      for (var i = 0; i < n; i++) dyn.push(makeSettled(Math.random() * W));
    }

    function gust() {
      var settled = [];
      for (var i = 0; i < dyn.length; i++) if (dyn[i].state === 'settled') settled.push(dyn[i]);

      var n = Math.min(settled.length, 1 + ((Math.random() * 2) | 0));
      for (var k = 0; k < n; k++) {
        var L = settled.splice((Math.random() * settled.length) | 0, 1)[0];
        L.state = 'blow';
        L.t = 0;
        L.dur = 130 + Math.random() * 55;
        L.dir = Math.random() < 0.5 ? -1 : 1;
        L.y0 = L.y;
        L.spin = L.dir * (Math.PI * 4 / L.dur);
      }

      var m = 1 + ((Math.random() * 2) | 0);
      for (var j = 0; j < m; j++) {
        var fromLeft = Math.random() < 0.5;
        var tx = 50 + Math.random() * Math.max(W - 100, 1);
        dyn.push({
          state: 'arrive',
          t: 0,
          dur: 110 + Math.random() * 45,
          x0: fromLeft ? -46 : W + 46,
          y0: surfaceY(tx, 2) - 80 - Math.random() * 50,
          tx: tx,
          ty: surfaceY(tx, 2) - 4,
          x: fromLeft ? -46 : W + 46,
          y: 0,
          rot: Math.random() * Math.PI * 2,
          spin: (fromLeft ? 1 : -1) * (Math.PI * 4 / 120),
          size: 9 + Math.random() * 8,
          color: COLORS[(Math.random() * COLORS.length) | 0]
        });
      }

      gustTimer = setTimeout(gust, 4200 + Math.random() * 3600);
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
          L.phase += 0.025;
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot + Math.sin(L.phase) * 0.1, L.color, 1, true);
          continue;
        }

        var k = L.t / L.dur;

        if (L.state === 'blow') {
          L.x += L.dir * (2.4 + k * 5.2);
          L.y = L.y0 - Math.sin(Math.PI * Math.min(k, 1)) * 48 + k * 10;
          L.rot += L.spin;
          var a = k < 0.8 ? 1 : Math.max(0, 1 - (k - 0.8) / 0.2);
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, a, false);
          if (k >= 1 || L.x < -90 || L.x > W + 90) dyn.splice(i, 1);
        } else if (L.state === 'arrive') {
          L.x = L.x0 + (L.tx - L.x0) * k;
          L.y = L.y0 + (L.ty - L.y0) * k - Math.sin(Math.PI * k) * 34;
          L.rot += L.spin;
          drawLeafShape(ctx, L.x, L.y, L.size, L.rot, L.color, Math.min(1, k * 4), true);
          if (k >= 1) {
            L.state = 'settled';
            L.x = L.tx;
            L.y = L.ty;
            L.rot = Math.random() * Math.PI * 2;
            L.phase = Math.random() * Math.PI * 2;
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
      }, { rootMargin: '200px 0px 200px 0px' }).observe(canvas);
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
      land: function (x, color, size) {
        if (!rect) return;
        var lx = x - rect.left;
        dyn.push({
          state: 'settled',
          x: lx,
          y: surfaceY(lx, 2) - 4,
          rot: Math.random() * Math.PI * 2,
          size: Math.min(18, (size || 12) * 0.85),
          color: 'rgb(' + color + ')',
          phase: Math.random() * Math.PI * 2
        });
        if (dyn.length > 90) {
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
      gustTimer = setTimeout(gust, 2500);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    initPetals();
    initMeteors();
    initLike();
    initWallpaperParallax();
    initScrollProgress();
    initScrollReveal();
    initRipple();
    initLeafScene();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
