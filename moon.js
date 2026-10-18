// 首页的字符月亮(2026-10-18):只用 - = + 1 0 五个字符,月面(月海、环形山)绕竖轴自转,
// 光照方向固定,所以明暗交界线不动、月面在转。系统开了「减弱动态效果」就停在一帧;滚出屏幕或切到后台时暂停。
(function () {
  var COLS = 100, ROWS = 53, R = 26, CW = 0.6, RAMP = " -=+10";
  var SUN = [0.78, -0.26, 0.57];
  function V(a, b, c) { var l = Math.hypot(a, b, c); return [a / l, b / l, c / l]; }
  var MARIA = [
    [V(-0.35, -0.30, 0.88), 0.42, 0.5], [V(0.25, -0.38, 0.89), 0.30, 0.46], [V(0.30, 0.05, 0.95), 0.34, 0.48],
    [V(-0.05, 0.42, 0.9), 0.26, 0.42], [V(-0.62, 0.15, 0.77), 0.22, 0.4], [V(0.7, -0.2, -0.68), 0.5, 0.45],
    [V(-0.5, 0.3, -0.81), 0.36, 0.42], [V(0.1, -0.6, -0.79), 0.28, 0.38], [V(-0.9, -0.3, -0.3), 0.3, 0.4]
  ];
  var CRATERS = [[V(0.05, 0.62, 0.78), 0.09], [V(-0.7, -0.5, 0.5), 0.07], [V(0.8, 0.3, 0.5), 0.06], [V(-0.2, 0.5, -0.84), 0.08], [V(0.6, 0.55, -0.58), 0.07]];
  function hash(a, b, c) { var s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); }
  function angle(px, py, pz, m) { var d = px * m[0] + py * m[1] + pz * m[2]; return Math.acos(Math.max(-1, Math.min(1, d))); }

  function frame(t) {
    var rot = t * 0.03, cr = Math.cos(rot), sr = Math.sin(rot), out = [];
    for (var r = 0; r < ROWS; r++) {
      var line = "";
      for (var c = 0; c < COLS; c++) {
        var y = (r - ROWS / 2 + 0.5) / R, x = (c - COLS / 2 + 0.5) * CW / R, d2 = x * x + y * y;
        if (d2 > 1) { line += " "; continue; }
        var z = Math.sqrt(1 - d2);
        var px = x * cr + z * sr, pz = -x * sr + z * cr, py = y, alb = 1, i, a;
        for (i = 0; i < MARIA.length; i++) { a = angle(px, py, pz, MARIA[i][0]); if (a < MARIA[i][1]) { var k = a / MARIA[i][1]; alb *= 1 - MARIA[i][2] * (1 - k * k); } }
        for (i = 0; i < CRATERS.length; i++) { a = angle(px, py, pz, CRATERS[i][0]); if (a < CRATERS[i][1]) alb *= a > CRATERS[i][1] * 0.7 ? 1.25 : 0.7; }
        alb *= 0.86 + 0.28 * hash(Math.round(px * 40), Math.round(py * 40), Math.round(pz * 40));
        var lit = Math.max(0, x * SUN[0] + y * SUN[1] + z * SUN[2]);
        var v = Math.max(Math.pow(lit, 0.9) * alb * 0.9, d2 > 0.9 ? 0.36 : 0.19 + 0.05 * (alb - 0.7));
        line += RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)))];
      }
      out.push(line);
    }
    return out.join("\n");
  }
  window.ThothMoon = { frame: frame, cols: COLS, rows: ROWS };

  document.addEventListener("DOMContentLoaded", function () {
    var pre = document.getElementById("moon");
    if (!pre) return;
    var box = pre.parentElement;
    // 字号跟着容器走:等宽字宽约 0.6em,行高 = 字号。
    function fit() {
      var w = box.clientWidth, h = box.clientHeight - (box.querySelector("figcaption") || { offsetHeight: 0 }).offsetHeight - 16;
      var fs = w / (COLS * 0.602);
      if (h > 120) fs = Math.min(fs, h / ROWS);
      var cap = parseFloat(getComputedStyle(pre).getPropertyValue("--moon-max")) || 13;
      fs = Math.max(2.4, Math.min(fs, cap));
      pre.style.fontSize = fs + "px";
      pre.style.lineHeight = fs + "px";
    }
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(box); else window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    var t = 40;
    pre.textContent = frame(t);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var visible = true, last = 0;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(pre);
    (function loop(now) {
      if (visible && !document.hidden && now - last > 90) { last = now; t += 1; pre.textContent = frame(t); }
      requestAnimationFrame(loop);
    })(0);
  });
})();
