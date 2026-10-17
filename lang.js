// 三种语言放在同一页,按浏览器语言显示一种;右上角可以切。没有 JS 时三种都显示。
// 顶栏、页脚这类共用的短文字用 data-zh / data-ja / data-en 切换。
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var saved = null;
  try { saved = localStorage.getItem("thoth.lang"); } catch (e) {}
  var nav = (navigator.language || "en").toLowerCase();
  var guess = nav.indexOf("zh") === 0 ? "zh" : nav.indexOf("ja") === 0 ? "ja" : "en";
  function show(lang) {
    document.querySelectorAll("section[lang]").forEach(function (s) {
      s.classList.toggle("on", s.getAttribute("lang").indexOf(lang) === 0);
    });
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });
    document.querySelectorAll("nav.lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
    root.setAttribute("lang", lang === "zh" ? "zh-Hans" : lang);
    try { localStorage.setItem("thoth.lang", lang); } catch (e) {}
    document.dispatchEvent(new Event("thoth:lang"));
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("nav.lang button").forEach(function (b) {
      b.addEventListener("click", function () { show(b.dataset.lang); });
    });
    show(saved || guess);
  });
})();
