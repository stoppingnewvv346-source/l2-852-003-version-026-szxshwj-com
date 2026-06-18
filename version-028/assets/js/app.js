(function () {
  var header = document.querySelector('[data-header]');
  var button = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (button && mobileNav) {
    button.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var sliders = document.querySelectorAll('[data-hero-slider]');
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  });

  var filterGroups = document.querySelectorAll('[data-filter-group]');
  filterGroups.forEach(function (group) {
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
    var targetSelector = group.getAttribute('data-filter-target');
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-filter');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === btn);
        });
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' ');
          card.style.display = value === 'all' || text.indexOf(value) !== -1 ? '' : 'none';
        });
      });
    });
  });

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot) {
    var queryInput = searchRoot.querySelector('[data-search-query]');
    var regionSelect = searchRoot.querySelector('[data-search-region]');
    var typeSelect = searchRoot.querySelector('[data-search-type]');
    var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-search-card]'));
    var empty = searchRoot.querySelector('[data-search-empty]');

    function applySearch() {
      var q = (queryInput.value || '').trim().toLowerCase();
      var region = regionSelect.value;
      var type = typeSelect.value;
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var text = title + ' ' + genre + ' ' + cardRegion.toLowerCase() + ' ' + cardType.toLowerCase();
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [queryInput, regionSelect, typeSelect].forEach(function (item) {
      item.addEventListener('input', applySearch);
      item.addEventListener('change', applySearch);
    });
    applySearch();
  }

  window.setupMoviePlayer = function (playUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('movie-play-overlay');
    var ready = false;
    var hlsInstance = null;

    function bindVideo() {
      if (!video || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
    }

    function play() {
      if (!video) {
        return;
      }
      bindVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
