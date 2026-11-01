// Tehuti 网站的动效和指南导航(2026-10-18)。全部是锦上添花:没有 JS 或者系统开了「减弱动态效果」时,页面照样完整可用。
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (!reduce) root.classList.add("motion");

  document.addEventListener("DOMContentLoaded", function () {
    // 1. 顶栏:往下滚之后贴住顶部,底下出一条细线。
    var header = document.querySelector("header.site");
    var progress = document.querySelector(".progress span");
    function measureHeader() {
      if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
    measureHeader();
    window.addEventListener("resize", measureHeader);
    function onScroll() {
      var y = window.scrollY || 0;
      if (header) header.classList.toggle("scrolled", y > 8);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 2. 内容滚进来时轻轻浮上来。只给每个可见语言段里的块级元素加。
    var revealObserver = null;
    if (!reduce && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    }
    function armReveal() {
      if (!revealObserver) return;
      document.querySelectorAll("section[lang].on > *:not(.in), .facts:not(.in), .rows > a:not(.in)").forEach(function (el, i) {
        if (el.closest(".hero, .poster")) return;
        el.classList.add("reveal");
        el.style.transitionDelay = Math.min(i % 6, 5) * 40 + "ms";
        revealObserver.observe(el);
      });
    }

    // 4. 使用指南:侧边(电脑)/ 顶部横条(手机)导航,跟着滚动高亮当前一节。
    var nav = document.querySelector(".guide-nav");
    function buildGuideNav() {
      if (!nav) return;
      var section = document.querySelector("section[lang].on") || document.querySelector("section[lang]");
      if (!section) return;
      var heads = section.querySelectorAll("h2[id]");
      var title = section.querySelector("h1");
      nav.innerHTML = "";
      var label = document.createElement("div");
      label.className = "guide-nav-title";
      label.textContent = title ? title.textContent : "";
      nav.appendChild(label);
      var list = document.createElement("ol");
      heads.forEach(function (h) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        var num = h.querySelector(".num");
        var n = document.createElement("span");
        n.className = "n";
        n.textContent = num ? num.textContent : "";
        a.appendChild(n);
        a.appendChild(document.createTextNode(h.textContent.replace(num ? num.textContent : "", "").trim()));
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          var offset = (header ? header.offsetHeight : 0) + 20;
          if (window.innerWidth < 900) offset += nav.offsetHeight;
          var top = h.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
          history.replaceState(null, "", "#" + h.id);
        });
        li.appendChild(a);
        list.appendChild(li);
      });
      nav.appendChild(list);

      window.dispatchEvent(new Event("scroll"));
    }

    // 语言切换时重建导航、重新挂动效(lang.js 换完语言会发这个事件)。
    document.addEventListener("thoth:lang", function () { buildGuideNav(); armReveal(); });
    buildGuideNav();
    armReveal();
    // 滚动时高亮当前一节:标题越过视口上方三分之一就算到了这一节。
    if (nav) {
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var section = document.querySelector("section[lang].on");
          if (!section) return;
          var current = null;
          section.querySelectorAll("h2[id]").forEach(function (h) {
            if (h.getBoundingClientRect().top < window.innerHeight * 0.35) current = h.id;
          });
          nav.querySelectorAll("a").forEach(function (a, i) {
            var on = current ? a.getAttribute("href") === "#" + current : i === 0;
            if (on !== a.classList.contains("active")) {
              a.classList.toggle("active", on);
              if (on && nav.scrollWidth > nav.clientWidth) {
                nav.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
              }
            }
          });
        });
      }, { passive: true });
    }
  });
})();
