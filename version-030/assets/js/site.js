
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function initNav() {
    const btn = qs('[data-menu-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    const shell = qs('[data-hero-carousel]');
    if (!shell) return;
    const slides = qsa('[data-hero-slide]', shell);
    const dots = qsa('[data-hero-dot]', shell);
    const prev = qs('[data-hero-prev]', shell);
    const next = qs('[data-hero-next]', shell);
    if (!slides.length) return;
    let idx = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if (idx < 0) idx = 0;
    let timer = null;
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    function nextSlide() { show(idx + 1); }
    function start() { stop(); timer = setInterval(nextSlide, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if (prev) prev.addEventListener('click', function () { show(idx - 1); start(); });
    if (next) next.addEventListener('click', function () { show(idx + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', function () { show(i); start(); }));
    shell.addEventListener('mouseenter', stop);
    shell.addEventListener('mouseleave', start);
    show(idx);
    start();
  }

  function tokenMatches(card, state) {
    const title = (card.dataset.title || '').toLowerCase();
    const tags = (card.dataset.tags || '').toLowerCase();
    const genre = (card.dataset.genre || '').toLowerCase();
    const year = (card.dataset.year || '').toLowerCase();
    const region = (card.dataset.region || '').toLowerCase();
    const type = (card.dataset.type || '').toLowerCase();
    const all = [title, tags, genre, year, region, type].join(' ');
    const q = (state.q || '').toLowerCase().trim();
    const genreFilter = (state.genre || '').toLowerCase().trim();
    const yearFilter = (state.year || '').toLowerCase().trim();
    const typeFilter = (state.type || '').toLowerCase().trim();
    if (q && !all.includes(q)) return false;
    if (genreFilter && !all.includes(genreFilter)) return false;
    if (yearFilter && yearFilter !== 'all' && year !== yearFilter) return false;
    if (typeFilter && typeFilter !== 'all' && !type.includes(typeFilter)) return false;
    return true;
  }

  function initFilters() {
    const bars = qsa('[data-filter-bar]');
    if (!bars.length) return;
    bars.forEach(function (bar) {
      const cards = qsa('[data-card]', bar.closest('main') || document);
      if (!cards.length) return;
      const qInput = qs('[name="q"]', bar);
      const genreSel = qs('[name="genre"]', bar);
      const yearSel = qs('[name="year"]', bar);
      const typeSel = qs('[name="type"]', bar);
      const resultEl = qs('[data-result-count]', bar.closest('main') || document);
      const state = { q: '', genre: '', year: 'all', type: 'all' };
      function apply() {
        let visible = 0;
        cards.forEach(function (card) {
          const ok = tokenMatches(card, state);
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (resultEl) resultEl.textContent = visible;
      }
      function sync() {
        state.q = qInput ? qInput.value : '';
        state.genre = genreSel ? genreSel.value : '';
        state.year = yearSel ? yearSel.value : 'all';
        state.type = typeSel ? typeSel.value : 'all';
        apply();
      }
      const syncDebounced = debounce(sync, 120);
      if (qInput) qInput.addEventListener('input', syncDebounced);
      if (genreSel) genreSel.addEventListener('change', sync);
      if (yearSel) yearSel.addEventListener('change', sync);
      if (typeSel) typeSel.addEventListener('change', sync);
      const params = new URLSearchParams(location.search);
      if (qInput && params.get('q')) qInput.value = params.get('q');
      if (genreSel && params.get('genre')) genreSel.value = params.get('genre');
      if (yearSel && params.get('year')) yearSel.value = params.get('year');
      if (typeSel && params.get('type')) typeSel.value = params.get('type');
      sync();
    });
  }

  function initPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const overlay = qs('[data-player-overlay]', shell);
    const playBtn = qs('[data-player-play]', shell);
    const source = shell.getAttribute('data-hls-src') || (video && video.dataset.src) || '';
    const poster = shell.getAttribute('data-poster') || '';
    if (!video || !source) return;
    if (poster) video.poster = poster;
    let hls = null;

    function attach() {
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startPlay() {
      if (overlay) overlay.style.display = 'none';
      if (playBtn) playBtn.style.display = 'none';
      if (!video.src && !hls) attach();
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    shell.addEventListener('click', function (evt) {
      const target = evt.target;
      if (target.closest('[data-player-overlay]') || target.closest('[data-player-play]')) {
        startPlay();
      }
    });

    attach();
    if (overlay) overlay.addEventListener('click', startPlay);
    if (playBtn) playBtn.addEventListener('click', startPlay);
    video.addEventListener('play', function () {
      if (overlay) overlay.style.display = 'none';
      if (playBtn) playBtn.style.display = 'none';
    });
  }

  function initTabs() {
    qsa('[data-tab-group]').forEach(function (group) {
      const buttons = qsa('[data-tab]', group);
      const panels = qsa('[data-panel]', group);
      if (!buttons.length || !panels.length) return;
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const key = btn.getAttribute('data-tab');
          buttons.forEach(b => b.classList.toggle('active', b === btn));
          panels.forEach(p => p.classList.toggle('active', p.getAttribute('data-panel') === key));
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeroCarousel();
    initFilters();
    initPlayer();
    initTabs();
  });
})();
