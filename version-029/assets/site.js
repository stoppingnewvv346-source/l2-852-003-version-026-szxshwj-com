(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobile = document.querySelector('[data-mobile-nav]');

        if (toggle && mobile) {
            toggle.addEventListener('click', function () {
                mobile.classList.toggle('open');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');
        if (slider) {
            var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
            var current = 0;

            function setSlide(next) {
                current = next;
                slides.forEach(function (slide, index) {
                    slide.classList.toggle('active', index === current);
                });
                dots.forEach(function (dot, index) {
                    dot.classList.toggle('active', index === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                    setSlide(next);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    setSlide((current + 1) % slides.length);
                }, 5200);
            }
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var clear = root.querySelector('[data-filter-clear]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
            var empty = root.querySelector('[data-empty-state]');

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var matched = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-category') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var show = !keyword || text.indexOf(keyword) !== -1;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        matched += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', matched === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                    applyFilter();
                }
            }

            if (clear && input) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    applyFilter();
                    input.focus();
                });
            }
        });
    });
})();
