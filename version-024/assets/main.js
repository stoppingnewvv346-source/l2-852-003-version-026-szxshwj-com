(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var yearSelect = area.querySelector('[data-year-filter]');
    var typeSelect = area.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
    var empty = area.querySelector('[data-empty]');

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
