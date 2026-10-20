/* ============================================================
   博客自定义特效：花瓣飘落 + 流星 + 点赞按钮
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- 花瓣飘落 ---------------- */
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

  /* ---------------- 页脚落叶堆 ---------------- */
  function initLeafPile() {
    var footer = document.getElementById('footer');
    if (!footer || document.getElementById('leaf-pile')) return;

    var LEAF_COLORS = ['#c0392b', '#d35400', '#e2703a', '#f0a63c', '#c9a227', '#8b4a2b', '#a0522d', '#e88a4a'];
    var parts = ['<svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">'];
    var i, x, y, s, r, c, dur, delay, lift;

    for (i = 0; i < 26; i++) {
      x = Math.random() * 1600;
      y = 152 + Math.random() * 44;
      s = 0.65 + Math.random() * 0.5;
      r = (Math.random() * 360) | 0;
      c = LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0];
      dur = (3.2 + Math.random() * 2.6).toFixed(2);
      delay = (-Math.random() * 4).toFixed(2);
      parts.push(
        '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + r + ') scale(' + s.toFixed(2) + ')">' +
        '<path class="pile-leaf" style="animation-duration:' + dur + 's;animation-delay:' + delay + 's" d="M0 0 Q 16 -10 0 -26 Q -16 -10 0 0 Z" fill="' + c + '" opacity="0.75"/>' +
        '</g>'
      );
    }

    for (i = 0; i < 24; i++) {
      x = Math.random() * 1600;
      y = 168 + Math.random() * 30;
      s = 0.95 + Math.random() * 0.6;
      r = (Math.random() * 360) | 0;
      c = LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0];
      dur = (3 + Math.random() * 2.4).toFixed(2);
      delay = (-Math.random() * 4).toFixed(2);
      lift = i < 6 ? ' lift' : '';
      parts.push(
        '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + r + ') scale(' + s.toFixed(2) + ')">' +
        '<path class="pile-leaf' + lift + '" style="animation-duration:' + dur + 's;animation-delay:' + delay + 's" d="M0 0 Q 18 -11 0 -30 Q -18 -11 0 0 Z" fill="' + c + '"/>' +
        '<path d="M0 -3 L0 -26" stroke="rgba(255,235,200,0.35)" stroke-width="1.2" fill="none"/>' +
        '</g>'
      );
    }
    parts.push('</svg>');

    var pile = document.createElement('div');
    pile.id = 'leaf-pile';
    pile.setAttribute('aria-hidden', 'true');
    pile.innerHTML = parts.join('');

    for (i = 0; i < 3; i++) {
      var breeze = document.createElement('div');
      breeze.className = 'breeze-leaf';
      breeze.style.animationDelay = (i * 4.1 + 1.5).toFixed(1) + 's';
      breeze.style.bottom = (16 + i * 18) + 'px';
      breeze.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2 Q 20 8 12 22 Q 4 8 12 2 Z" fill="' + LEAF_COLORS[i + 1] + '"/></svg>';
      pile.appendChild(breeze);
    }

    footer.appendChild(pile);
  }

  function boot() {
    initPetals();
    initMeteors();
    initLike();
    initWallpaperParallax();
    initScrollProgress();
    initScrollReveal();
    initRipple();
    initLeafPile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
