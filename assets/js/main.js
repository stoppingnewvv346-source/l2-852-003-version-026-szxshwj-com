(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    var filterScope = document.querySelector("[data-filter-scope]");

    if (filterScope) {
        var searchInput = document.querySelector("[data-filter-search]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (searchInput && q) {
            searchInput.value = q;
        }

        function cardMatchesYear(card, value) {
            if (!value) {
                return true;
            }

            var year = card.getAttribute("data-year") || "";

            if (value === "2010") {
                return /^201/.test(year);
            }

            if (value === "2000") {
                return /^200/.test(year);
            }

            return year.indexOf(value) !== -1;
        }

        function applyFilters() {
            var text = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchText = !text || haystack.indexOf(text) !== -1;
                var matchType = !type || cardType.indexOf(type) !== -1;
                var matchYear = cardMatchesYear(card, year);
                card.classList.toggle("is-hidden", !(matchText && matchType && matchYear));
            });
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
