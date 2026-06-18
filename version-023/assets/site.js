
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const initNav = () => {
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('[data-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
    }
  };

  const initHero = () => {
    const carousel = qs('[data-hero-carousel]');
    if (!carousel) return;

    const slides = qsa('.hero-slide', carousel);
    const dotsWrap = qs('[data-hero-dots]', carousel);
    if (!slides.length) return;

    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      if (dotsWrap) {
        qsa('.carousel-dot', dotsWrap).forEach((dot, i) => dot.classList.toggle('active', i === index));
      }
    };

    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" type="button" aria-label="切换幻灯片 ${i + 1}" data-slide-dot="${i}"></button>`).join('');
      dotsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-slide-dot]');
        if (!btn) return;
        show(Number(btn.dataset.slideDot));
      });
    }

    const prev = qs('[data-hero-prev]', carousel);
    const next = qs('[data-hero-next]', carousel);
    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));

    show(0);
    setInterval(() => show(index + 1), 5000);
  };

  const applySort = (container, sortValue) => {
    const cards = qsa('.movie-card', container);
    const sorted = cards.slice().sort((a, b) => {
      const yearA = Number(a.dataset.year || 0);
      const yearB = Number(b.dataset.year || 0);
      const titleA = a.dataset.title || '';
      const titleB = b.dataset.title || '';
      if (sortValue === 'title-asc') return titleA.localeCompare(titleB, 'zh-Hans-CN');
      if (sortValue === 'title-desc') return titleB.localeCompare(titleA, 'zh-Hans-CN');
      if (sortValue === 'year-asc') return yearA - yearB;
      return yearB - yearA;
    });
    sorted.forEach((card) => container.appendChild(card));
  };

  const initFilterBox = () => {
    qsa('[data-filter-box]').forEach((box) => {
      const input = qs('[data-search-input]', box);
      const sort = qs('[data-sort-select]', box);
      const container = qs('[data-filter-target]', box);
      if (!input || !sort || !container) return;

      const run = () => {
        const term = (input.value || '').trim().toLowerCase();
        const cards = qsa('.movie-card', container);
        cards.forEach((card) => {
          const hay = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.tags,
          ].join(' ').toLowerCase();
          card.style.display = !term || hay.includes(term) ? '' : 'none';
        });
        applySort(container, sort.value);
      };

      input.addEventListener('input', run);
      sort.addEventListener('change', run);
      run();
    });
  };

  const initPlayer = () => {
    const shell = qs('[data-player-shell]');
    const video = qs('[data-hls-video]');
    if (!shell || !video) return;

    const src = video.dataset.hlsSrc || '';
    const fallback = video.dataset.fallbackSrc || '';
    const playBtn = qs('[data-play-button]', shell);
    const overlay = qs('[data-play-overlay]', shell);
    const useSrc = () => {
      if (src) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, () => {
            if (fallback && !video.src) video.src = fallback;
          });
          window.__siteHls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (fallback) {
          video.src = fallback;
        }
      }
    };

    useSrc();

    const start = async () => {
      try {
        await video.play();
        if (overlay) overlay.style.display = 'none';
      } catch (e) {
        // keep overlay visible if autoplay/play is blocked
      }
    };

    if (playBtn) playBtn.addEventListener('click', start);
    video.addEventListener('play', () => { if (overlay) overlay.style.display = 'none'; });
  };

  const initGlobalSearch = () => {
    const form = qs('[data-global-search-form]');
    const input = qs('[data-global-search-input]');
    const results = qs('[data-global-search-results]');
    if (!form || !input || !results || !window.MOVIE_CATALOG) return;

    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');

    const render = (items) => {
      results.innerHTML = items.map((m) => `
        <a class="movie-card" href="${m.href}" data-title="${m.title}" data-genre="${m.genre}" data-year="${m.year}" data-tags="${(m.tags || []).join(' ')}" data-region="${m.region}" data-type="${m.type}">
          <div class="movie-poster" style="background-image: linear-gradient(180deg, rgba(8,15,34,.12) 0%, rgba(8,15,34,.72) 100%), linear-gradient(135deg, rgba(99,102,241,.58), rgba(236,72,153,.24)), url('./${m.poster}');">
            <span class="movie-badge">${m.year}</span>
            <span class="movie-play">查看详情</span>
          </div>
          <div class="movie-meta">
            <div class="movie-title">${m.title}</div>
            <div class="movie-sub">${m.type} · ${m.region}</div>
            <div class="movie-tags">${(m.tags || []).slice(0, 3).map((t) => `<span>${t}</span>`).join('')}</div>
          </div>
        </a>
      `).join('');
    };

    const search = () => {
      const term = (input.value || '').trim().toLowerCase();
      const items = !term
        ? window.MOVIE_CATALOG.slice(0, 60)
        : window.MOVIE_CATALOG.filter((m) => {
            const hay = [
              m.title,
              m.genre,
              m.region,
              m.type,
              m.one_line,
              ...(m.tags || [])
            ].join(' ').toLowerCase();
            return hay.includes(term);
          });
      render(items.slice(0, 240));
      const count = qs('[data-global-search-count]');
      if (count) count.textContent = `${items.length}`;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      search();
      const url = new URL(location.href);
      url.searchParams.set('q', input.value.trim());
      history.replaceState({}, '', url);
    });
    input.addEventListener('input', search);
    search();
  };

  ready(() => {
    initNav();
    initHero();
    initFilterBox();
    initPlayer();
    initGlobalSearch();
  });
})();
