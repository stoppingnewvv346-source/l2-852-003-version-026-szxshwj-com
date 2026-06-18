(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && mobile && header) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("is-open");
        header.classList.toggle("is-open", open);
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });

    restart();
  }

  function initImageFallbacks() {
    selectAll(".image-frame img").forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".image-frame");
        if (frame) {
          frame.classList.add("is-missing");
        }
        image.remove();
      });
    });
  }

  function initPageFilter() {
    selectAll("[data-page-filter]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var count = panel.querySelector("[data-filter-count]");
      var grid = document.querySelector("[data-card-grid]");
      if (!input || !grid) {
        return;
      }
      var cards = selectAll("[data-card]", grid);
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var matched = !keyword || text.indexOf(keyword) >= 0;
          card.classList.toggle("is-hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }
      });
    });
  }

  function cardHtml(movie, root) {
    var href = root + "movie/" + movie.id + ".html";
    var cover = root + movie.coverNumber + ".jpg";
    return [
      '<article class="movie-card movie-card--small" data-card>',
      '<a class="movie-card__link" href="' + href + '">',
      '<div class="image-frame movie-card__cover">',
      '<img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div class="movie-card__shade"></div>',
      '<div class="movie-card__play"><span class="icon-play" aria-hidden="true"></span></div>',
      '<div class="movie-card__badges">',
      '<span class="badge badge--gold">' + escapeHtml(movie.genreRaw) + '</span>',
      '<span class="badge badge--dark">' + escapeHtml(movie.year || "精选") + '</span>',
      '</div>',
      '<div class="movie-card__duration">' + escapeHtml(movie.duration) + '</div>',
      '</div>',
      '<div class="movie-card__body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine || movie.summary || "") + '</p>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIES) {
      return;
    }

    var root = document.body.getAttribute("data-root") || "./";
    var input = page.querySelector("[data-search-input]");
    var region = page.querySelector("[data-region-select]");
    var type = page.querySelector("[data-type-select]");
    var year = page.querySelector("[data-year-select]");
    var status = page.querySelector("[data-search-status]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);

    if (params.get("q") && input) {
      input.value = params.get("q");
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var matched = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.genreRaw,
          movie.tags,
          movie.oneLine,
          movie.year
        ].join(" ").toLowerCase();
        return (!keyword || haystack.indexOf(keyword) >= 0) &&
          (!regionValue || movie.regionGroup === regionValue) &&
          (!typeValue || movie.typeGroup === typeValue) &&
          (!yearValue || String(movie.year) === yearValue);
      }).slice(0, 120);

      if (status) {
        status.textContent = "找到 " + matched.length + " 条结果" + (matched.length >= 120 ? "，已显示前 120 条" : "");
      }
      if (results) {
        results.innerHTML = matched.map(function (movie) {
          return cardHtml(movie, root);
        }).join("");
        initImageFallbacks();
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    if (params.get("q")) {
      render();
    }
  }

  function initPlayer() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video[data-video-src]");
      var toggle = player.querySelector("[data-player-toggle]");
      if (!video) {
        return;
      }

      var source = video.getAttribute("data-video-src");
      var hls = null;
      var initialized = false;

      function initialize() {
        if (initialized || !source) {
          return;
        }
        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playOrPause() {
        initialize();
        if (video.paused) {
          video.play().catch(function () {
            video.controls = true;
          });
        } else {
          video.pause();
        }
      }

      if (toggle) {
        toggle.addEventListener("click", playOrPause);
      }
      video.addEventListener("click", playOrPause);
      video.addEventListener("play", function () {
        if (toggle) {
          toggle.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (toggle) {
          toggle.classList.remove("is-hidden");
        }
      });
      video.addEventListener("loadedmetadata", function () {
        video.controls = true;
      });
      initialize();
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initImageFallbacks();
    initPageFilter();
    initSearchPage();
    initPlayer();
  });
})();
