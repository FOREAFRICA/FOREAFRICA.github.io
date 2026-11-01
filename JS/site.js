/* FORE AFRICA – navbar, slideshow, reveal-on-scroll and certificate lightbox */

(function () {
  "use strict";

  /* ---------- Navbar ---------- */
  var toggle = document.getElementById("navbar-toggle");
  var menu = document.getElementById("navbar-menu");
  if (toggle && menu) {
    var setExpanded = function (open) { toggle.setAttribute("aria-expanded", String(open)); };
    toggle.addEventListener("click", function () {
      setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setExpanded(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setExpanded(false); });
  }

  /* ---------- Slideshow ----------
     Every photo on the site (logos excluded) lives in this one list. */
  var PHOTOS = [
    ["1.jpg", "Scenic view on tour", 540, 720],
    ["giraffes.jpg", "Giraffes and a golf ball: Fore Africa golf and safari tours", 720, 604],
    ["IMG_20261024_163512.jpg", "Moments from the road", 720, 540],
    ["braai and ball.png", "An African braai and a golf ball", 720, 604],
    ["2.jpg", "Scenic view on tour", 720, 540],
    ["golf swing.png", "Golf swing", 720, 604],
    ["IMG_20261025_161742.jpg", "Moments from the road", 720, 540],
    ["3.jpg", "Scenic view on tour", 720, 540],
    ["golf ball.png", "Golf ball on the tee", 720, 604],
    ["IMG_20261028_074727.jpg", "Moments from the road", 720, 540],
    ["4.jpg", "Scenic view on tour", 720, 540],
    ["IMG_20261028_210444.jpg", "Moments from the road", 720, 540],
    ["5.JPG", "Scenic view on tour", 720, 480],
    ["IMG_20261029_050428.jpg", "Moments from the road", 720, 540],
    ["6.JPG", "Scenic view on tour", 720, 480],
    ["market.jpg", "A local market", 720, 480],
    ["IMG_20261029_110132.jpg", "Moments from the road", 720, 540],
    ["7.JPG", "Scenic view on tour", 720, 480],
    ["beach.jpg", "Unspoilt Mozambique beach", 720, 539],
    ["IMG_20261029_111205.jpg", "Moments from the road", 720, 540],
    ["beach hut.jpg", "Beach hut on the coast", 720, 480],
    ["pool.jpg", "Poolside rest", 720, 458]
  ];

  window.FA_PHOTOS = PHOTOS;

  function Slideshow(root) {
    var base = root.getAttribute("data-base") || "Images/";
    var delay = parseInt(root.getAttribute("data-delay"), 10) || 5500;
    var start = parseInt(root.getAttribute("data-start"), 10) || 0;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var slides = [];
    var index = -1;
    var timer = null;
    var paused = reduceMotion;

    var stage = document.createElement("div");
    stage.className = "ss-stage";
    root.insertBefore(stage, root.firstChild);

    PHOTOS.forEach(function (p) {
      var li = document.createElement("div");
      li.className = "ss-slide";
      li.setAttribute("role", "group");
      li.setAttribute("aria-roledescription", "slide");
      var img = document.createElement("img");
      img.alt = p[1];
      img.decoding = "async";
      img.setAttribute("data-src", base + encodeURI(p[0]));
      li.appendChild(img);
      stage.appendChild(li);
      slides.push(li);
    });

    function el(tag, cls, html, attrs) {
      var n = document.createElement(tag);
      n.className = cls;
      if (html) n.innerHTML = html;
      for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
      return n;
    }

    var shade = el("div", "ss-shade");
    var prev = el("button", "ss-btn ss-prev", '<i class="fa fa-chevron-left" aria-hidden="true"></i>', { type: "button", "aria-label": "Previous photo" });
    var next = el("button", "ss-btn ss-next", '<i class="fa fa-chevron-right" aria-hidden="true"></i>', { type: "button", "aria-label": "Next photo" });
    var tools = el("div", "ss-tools");
    var pause = el("button", "ss-btn ss-pause", "", { type: "button" });
    var full = el("button", "ss-btn ss-full", '<i class="fa fa-expand" aria-hidden="true"></i>', { type: "button", "aria-label": "Toggle full screen" });
    var count = el("div", "ss-count", "", { "aria-hidden": "true" });
    var bar = el("div", "ss-progress", "<span></span>", { "aria-hidden": "true" });
    tools.appendChild(pause);
    if (root.requestFullscreen || root.webkitRequestFullscreen) tools.appendChild(full);
    [shade, prev, next, tools, count, bar].forEach(function (n) { root.appendChild(n); });
    var fill = bar.firstChild;

    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    if (!root.getAttribute("aria-label")) root.setAttribute("aria-label", "Photo slideshow");
    root.tabIndex = 0;

    function load(i) {
      var img = slides[(i + slides.length) % slides.length].firstChild;
      var src = img.getAttribute("data-src");
      if (src) { img.src = src; img.removeAttribute("data-src"); }
    }

    function restartBar() {
      fill.classList.remove("run");
      void fill.offsetWidth;
      if (!paused) fill.classList.add("run");
    }

    function schedule() {
      clearTimeout(timer);
      restartBar();
      if (!paused) timer = setTimeout(function () { show(index + 1); }, delay);
    }

    function show(i) {
      i = (i + slides.length) % slides.length;
      if (i === index) return;
      if (index >= 0) slides[index].classList.remove("is-active");
      index = i;
      load(i); load(i + 1); load(i - 1);
      slides[i].classList.add("is-active");
      slides[i].setAttribute("aria-label", (i + 1) + " of " + slides.length);
      count.textContent = (i + 1) + " / " + slides.length;
      schedule();
    }

    function renderPause() {
      pause.innerHTML = '<i class="fa fa-' + (paused ? "play" : "pause") + '" aria-hidden="true"></i>';
      pause.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
      root.classList.toggle("is-paused", paused);
    }

    pause.addEventListener("click", function () { paused = !paused; renderPause(); schedule(); });
    prev.addEventListener("click", function () { show(index - 1); });
    next.addEventListener("click", function () { show(index + 1); });
    full.addEventListener("click", function () {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
    });

    /* swipe */
    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* don't burn through photos in a hidden tab */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); fill.classList.remove("run"); }
      else schedule();
    });

    renderPause();
    show(start % slides.length);
  }

  document.querySelectorAll(".slideshow").forEach(Slideshow);

  /* ---------- Gallery ----------
     Thumbnails keep each photo's own proportions (no cropping); a click opens
     the original in a viewer that fits the whole picture to the screen. */
  var grid = document.getElementById("gallery-grid");
  var viewer = document.getElementById("viewer");
  if (grid && viewer) {
    var gBase = grid.getAttribute("data-base") || "../Images/";
    var vImg = viewer.querySelector(".viewer-img");
    var vCount = viewer.querySelector(".viewer-count");
    var vCap = viewer.querySelector(".viewer-cap");
    var cur = 0;
    var lastFocus = null;

    PHOTOS.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "g-item";
      b.style.aspectRatio = p[2] + " / " + p[3];
      b.setAttribute("aria-label", "View photo " + (i + 1) + ": " + p[1]);
      var img = document.createElement("img");
      img.src = gBase + "thumbs/" + encodeURI(p[0].replace(/\.\w+$/, "").toLowerCase() + ".jpg");
      img.alt = p[1];
      img.width = p[2]; img.height = p[3];
      img.loading = "lazy";
      b.appendChild(img);
      b.addEventListener("click", function () { openViewer(i); });
      grid.appendChild(b);
    });

    function showPhoto(i) {
      cur = (i + PHOTOS.length) % PHOTOS.length;
      var p = PHOTOS[cur];
      vImg.classList.add("is-loading");
      vImg.onload = function () { vImg.classList.remove("is-loading"); };
      vImg.src = gBase + encodeURI(p[0]);
      vImg.alt = p[1];
      vCount.textContent = (cur + 1) + " / " + PHOTOS.length;
      vCap.textContent = p[1];
      /* warm the neighbours */
      [cur + 1, cur - 1].forEach(function (n) { new Image().src = gBase + encodeURI(PHOTOS[(n + PHOTOS.length) % PHOTOS.length][0]); });
    }
    function openViewer(i) {
      lastFocus = document.activeElement;
      viewer.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      showPhoto(i);
      viewer.querySelector(".viewer-close").focus();
    }
    function closeViewer() {
      if (document.fullscreenElement) document.exitFullscreen();
      viewer.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    viewer.querySelector(".viewer-close").addEventListener("click", closeViewer);
    viewer.querySelector(".viewer-prev").addEventListener("click", function () { showPhoto(cur - 1); });
    viewer.querySelector(".viewer-next").addEventListener("click", function () { showPhoto(cur + 1); });
    var vFull = viewer.querySelector(".viewer-full");
    if (viewer.requestFullscreen) {
      vFull.addEventListener("click", function () {
        if (document.fullscreenElement) document.exitFullscreen(); else viewer.requestFullscreen();
      });
    } else vFull.hidden = true;
    viewer.querySelector(".viewer-stage").addEventListener("click", function (e) { if (e.target === this) closeViewer(); });
    document.addEventListener("keydown", function (e) {
      if (!viewer.classList.contains("is-open")) return;
      if (e.key === "Escape" && !document.fullscreenElement) closeViewer();
      else if (e.key === "ArrowLeft") showPhoto(cur - 1);
      else if (e.key === "ArrowRight") showPhoto(cur + 1);
    });
    var vx = null;
    viewer.addEventListener("touchstart", function (e) { vx = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener("touchend", function (e) {
      if (vx === null) return;
      var dx = e.changedTouches[0].clientX - vx; vx = null;
      if (Math.abs(dx) > 50) showPhoto(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (n) { io.observe(n); });
  } else {
    reveals.forEach(function (n) { n.classList.add("is-visible"); });
  }

  /* ---------- Certificate lightbox ---------- */
  var box = document.getElementById("cert-lightbox");
  var opener = document.getElementById("cert-open");
  if (box && opener) {
    var closeBtn = box.querySelector("button");
    var open = function () { box.classList.add("is-open"); closeBtn.focus(); };
    var close = function () { box.classList.remove("is-open"); opener.focus(); };
    opener.addEventListener("click", open);
    box.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
  }
})();
