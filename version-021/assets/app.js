
(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initHeroSlider() {
    const slider = qs("[data-hero-slider]");
    if (!slider) return;

    const slides = qsa("[data-hero-slide]", slider);
    const dotsWrap = qs("[data-hero-dots]", slider);
    const prevBtn = qs("[data-hero-prev]", slider);
    const nextBtn = qs("[data-hero-next]", slider);

    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((el) => el.classList.contains("active")));
    if (index < 0) index = 0;

    const dots = slides.map((_, i) => {
      const btn = document.createElement("button");
      btn.className = "hero-dot" + (i === index ? " active" : "");
      btn.type = "button";
      btn.setAttribute("aria-label", "切换到第 " + (i + 1) + " 张海报");
      btn.addEventListener("click", () => go(i));
      dotsWrap && dotsWrap.appendChild(btn);
      return btn;
    });

    function paint() {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
      slider.setAttribute("data-hero-index", String(index));
    }

    function go(next) {
      index = (next + slides.length) % slides.length;
      paint();
      restart();
    }

    let timer = null;
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(index + 1), 5200);
    }

    prevBtn && prevBtn.addEventListener("click", () => go(index - 1));
    nextBtn && nextBtn.addEventListener("click", () => go(index + 1));

    slider.addEventListener("mouseenter", () => timer && clearInterval(timer));
    slider.addEventListener("mouseleave", restart);

    paint();
    restart();
  }

  function initFilter(root) {
    const scope = root || document;
    const input = qs("[data-filter-input]", scope);
    const yearSelect = qs("[data-year-filter]", scope);
    const typeSelect = qs("[data-type-filter]", scope);
    const regionSelect = qs("[data-region-filter]", scope);
    const cards = qsa("[data-filter-item]", scope);
    const countNode = qs("[data-filter-count]", scope);

    if (!input && !yearSelect && !typeSelect && !regionSelect) return;

    function apply() {
      const term = (input?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "";
      const type = typeSelect?.value || "";
      const region = regionSelect?.value || "";
      let visible = 0;

      cards.forEach((card) => {
        const text = (
          (card.getAttribute("data-title") || "") + " " +
          (card.getAttribute("data-genre") || "") + " " +
          (card.getAttribute("data-region") || "") + " " +
          (card.getAttribute("data-type") || "") + " " +
          (card.textContent || "")
        ).toLowerCase();

        const ok = (!term || text.includes(term)) &&
          (!year || card.getAttribute("data-year") === year) &&
          (!type || card.getAttribute("data-type") === type) &&
          (!region || card.getAttribute("data-region") === region);

        card.classList.toggle("hidden", !ok);
        if (ok) visible += 1;
      });

      if (countNode) countNode.textContent = String(visible);
    }

    input && input.addEventListener("input", apply);
    yearSelect && yearSelect.addEventListener("change", apply);
    typeSelect && typeSelect.addEventListener("change", apply);
    regionSelect && regionSelect.addEventListener("change", apply);
    apply();
  }

  function initVideoPlayer() {
    const video = qs("video[data-hls]");
    if (!video) return;

    const hlsSrc = video.getAttribute("data-hls") || "";
    const mp4Src = video.getAttribute("data-mp4") || "";
    const playBtn = qs("[data-play-toggle]");
    const tip = qs("[data-player-tip]");

    function setSrc() {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          tip && (tip.textContent = "HLS 已就绪，点击播放即可观看。");
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = mp4Src;
          }
        });
      } else {
        video.src = mp4Src;
        video.preload = "metadata";
        tip && (tip.textContent = "已启用本地 MP4 播放源。若浏览器支持 HLS，也会自动切换。");
      }
    }

    setSrc();

    function togglePlay() {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    playBtn && playBtn.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
  }

  function initStickyTools() {
    const topBtn = qs("[data-back-top]");
    topBtn && topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function init() {
    initHeroSlider();
    qsa("[data-filter-root]").forEach((root) => initFilter(root));
    initVideoPlayer();
    initStickyTools();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
