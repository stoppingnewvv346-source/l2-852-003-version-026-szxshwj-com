(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var button = wrap.querySelector('[data-play-button]');
            var loaded = false;
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function hideButton() {
                button.classList.add('hide');
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        button.classList.remove('hide');
                    });
                }
            }

            function loadStream() {
                var mediaUrl = video.getAttribute('data-stream');
                if (!mediaUrl) {
                    return;
                }

                hideButton();

                if (loaded) {
                    playVideo();
                    return;
                }

                loaded = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            video.src = mediaUrl;
                            playVideo();
                        }
                    });
                    return;
                }

                video.src = mediaUrl;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            }

            button.addEventListener('click', loadStream);
            video.addEventListener('play', hideButton);
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('hide');
                }
            });
            video.addEventListener('ended', function () {
                button.classList.remove('hide');
            });
        });
    });
})();
