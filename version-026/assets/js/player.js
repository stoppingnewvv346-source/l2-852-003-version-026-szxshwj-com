(function () {
    window.initMoviePlayer = function (videoId, streamUrl, maskId) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        var attached = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            attachStream();

            if (mask) {
                mask.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.setAttribute("controls", "controls");
                });
            }
        }

        if (mask) {
            mask.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (mask) {
                mask.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (mask) {
                mask.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
