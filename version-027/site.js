
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setActiveNav() {
    const path = location.pathname.split('\\').join('/');
    $$('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const match = path.endsWith('/') ? path + 'index.html' : path;
      if (match.endsWith(href) || (href === 'index.html' && (match === '/' || match.endsWith('/index.html')))) {
        a.classList.add('active');
      }
    });
  }

  function initMobileNav() {
    const btn = $('[data-menu-toggle]');
    const links = $('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }

  function initHeroSlider() {
    const slides = $$('.hero-slide');
    if (!slides.length) return;
    let active = 0;
    const show = (i) => {
      slides.forEach((el, idx) => el.style.display = idx === i ? 'block' : 'none');
    };
    show(0);
    if (slides.length > 1) {
      setInterval(() => {
        active = (active + 1) % slides.length;
        show(active);
      }, 4500);
    }
  }

  function initFilters() {
    const root = $('[data-filter-root]');
    if (!root) return;
    const cards = $$('[data-movie-card]', root);
    const input = $('[data-search-input]', root);
    const genre = $('[data-genre-filter]', root);
    const region = $('[data-region-filter]', root);
    const year = $('[data-year-filter]', root);
    const count = $('[data-result-count]', root);

    function apply() {
      const q = (input?.value || '').trim().toLowerCase();
      const g = genre?.value || '';
      const r = region?.value || '';
      const y = year?.value || '';
      let visible = 0;
      cards.forEach(card => {
        const text = (card.dataset.search || '').toLowerCase();
        const ok = (!q || text.includes(q))
          && (!g || card.dataset.genre === g)
          && (!r || card.dataset.region === r)
          && (!y || card.dataset.year === y);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (count) count.textContent = visible;
    }

    [input, genre, region, year].forEach(el => el && el.addEventListener('input', apply));
    apply();
  }

  function initSearchPage() {
    const app = $('[data-search-page]');
    if (!app) return;
    const resultBox = $('[data-search-results]', app);
    const info = $('[data-search-info]', app);
    const qInput = $('[name="q"]', app);
    const genre = $('[name="genre"]', app);
    const region = $('[name="region"]', app);
    const year = $('[name="year"]', app);
    let movies = window.__MOVIES__ || [];

    function render(list) {
      if (!resultBox) return;
      if (!list.length) {
        resultBox.innerHTML = '<div class="panel">没有找到匹配影片，请尝试更换关键词。</div>';
        if (info) info.textContent = '0';
        return;
      }
      if (info) info.textContent = String(list.length);
      resultBox.innerHTML = list.map(movie => `
        <article class="movie-card" style="${movie.tone}">
          <a class="movie-poster" href="${movie.slug}">
            <span class="year">${movie.year}</span>
            <div>
              <h3>${movie.title}</h3>
              <p>${movie.region} · ${movie.genre}</p>
            </div>
            <div>
              <p>${movie.one_line}</p>
            </div>
          </a>
          <div class="movie-meta">
            <div class="meta-line">
              <span>${movie.type}</span>
              <span>热度 ${movie.score}</span>
            </div>
            <p class="desc">${movie.summary}</p>
          </div>
        </article>
      `).join('');
    }

    function doSearch() {
      const q = (qInput?.value || '').trim().toLowerCase();
      const g = genre?.value || '';
      const r = region?.value || '';
      const y = year?.value || '';
      const list = movies.filter(m => {
        const text = (m.search_blob || '').toLowerCase();
        return (!q || text.includes(q)) && (!g || m.primary_genre === g) && (!r || m.region === r) && (!y || String(m.year) === y);
      }).slice(0, 240);
      render(list);
    }

    const params = new URLSearchParams(location.search);
    if (params.get('q') && qInput) qInput.value = params.get('q');
    if (params.get('genre') && genre) genre.value = params.get('genre');
    if (params.get('region') && region) region.value = params.get('region');
    if (params.get('year') && year) year.value = params.get('year');

    [qInput, genre, region, year].forEach(el => el && el.addEventListener('input', doSearch));
    doSearch();
  }

  function initPlayer() {
    const player = $('[data-player]');
    if (!player) return;
    const video = $('video', player);
    const sourceButtons = $$('.source-btn', player);
    const playBtn = $('[data-play-now]', player);
    const sources = window.__PLAYER_SOURCES__ || [];

    function loadSource(src) {
      if (!video || !src) return;
      if (src.endsWith('.m3u8') && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    sourceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sourceButtons.forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        loadSource(btn.dataset.src);
        video.play().catch(() => {});
      });
    });

    if (playBtn) playBtn.addEventListener('click', () => video && video.play().catch(() => {}));
    if (sources.length) loadSource(sources[0]);
  }

  function initCounters() {
    $$('[data-counter]').forEach(el => {
      const target = Number(el.dataset.counter || 0);
      if (!target) return;
      const step = Math.max(1, Math.round(target / 48));
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString('zh-CN');
          clearInterval(timer);
        } else {
          el.textContent = current.toLocaleString('zh-CN');
        }
      }, 16);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMobileNav();
    initHeroSlider();
    initFilters();
    initSearchPage();
    initPlayer();
    initCounters();
  });
})();
