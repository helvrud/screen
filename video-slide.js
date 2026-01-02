// video-slide.js
let player;

function initPlayer() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'rel': 0,
            'mute': 1,
            'enablejsapi': 1,
            'iv_load_policy': 3, // Disable annotations
            'modestbranding': 1
        },
        events: {
            'onReady': (event) => {
                event.target.mute();
            },
            'onStateChange': (event) => {
                // If the video ended, move to next slide
                if (event.data === YT.PlayerState.ENDED) {
                    nextSlide();
                }
                // If the video started playing, fade it in to avoid "previous frame flash"
                if (event.data === YT.PlayerState.PLAYING) {
                    gsap.to('#player', { opacity: 1, duration: 0.5 });
                }
            }
        }
    });
}

// Ensure function is globally accessible for the API
window.onYouTubeIframeAPIReady = initPlayer;

if (window.YT && window.YT.Player) {
    initPlayer();
}

function playVideoSlide(videoId) {
    const el = document.getElementById('slide-video');

    // 1. Hide the slide and the player initially
    gsap.set(el, { visibility: "visible", opacity: 1 });
    gsap.set('#player', { opacity: 0 });

    if (player && player.loadVideoById) {
        // 2. Load the new video
        player.loadVideoById(videoId);
        player.mute();
        player.playVideo();
    } else {
        setTimeout(() => playVideoSlide(videoId), 500);
    }
}