(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var category = scope.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-filter-empty]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");

            if (input && initial) {
                input.value = initial;
            }

            function apply() {
                var q = normalize(input && input.value);
                var r = normalize(region && region.value);
                var t = normalize(type && type.value);
                var c = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matches = true;

                    if (q && haystack.indexOf(q) === -1) {
                        matches = false;
                    }
                    if (r && normalize(card.getAttribute("data-region")) !== r) {
                        matches = false;
                    }
                    if (t && normalize(card.getAttribute("data-type")) !== t) {
                        matches = false;
                    }
                    if (c && normalize(card.getAttribute("data-category")) !== c) {
                        matches = false;
                    }

                    card.style.display = matches ? "" : "none";
                    if (matches) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, region, type, category].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-play-button]");
        if (!video || !button || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            video.setAttribute("controls", "controls");
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        function toggle() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
