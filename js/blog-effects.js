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
    var PETAL_COLORS = ['255, 61, 127', '255, 111, 165', '255, 138, 92', '255, 201, 60', '176, 107, 255', '255, 94, 156'];

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
        size: 7 + Math.random() * 7,
        vy: 0.36 + Math.random() * 0.6,
        vx: -0.2 + Math.random() * 0.4,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.018,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: -0.012 + Math.random() * 0.024,
        alpha: 0.72 + Math.random() * 0.26,
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
      ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.95, -s * 0.1, s * 0.72, s * 0.3);
      ctx.bezierCurveTo(s * 0.5, s * 0.6, s * 0.15, s * 0.5, 0, 0);
      ctx.shadowColor = 'rgba(' + p.color + ',0.6)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha.toFixed(3) + ')';
      ctx.fill();
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
    var METEOR_COLORS = ['255, 224, 130', '127, 227, 255', '217, 166, 255', '255, 158, 199'];

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

  function boot() {
    initPetals();
    initMeteors();
    initLike();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
