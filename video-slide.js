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
            'mute': 1, // <--- CRITICAL: Mute to allow autoplay
            'enablejsapi': 1
        },
        events: {
            'onReady': (event) => {
                event.target.mute(); // Ensure muted on ready
            },
            'onStateChange': (event) => {
                if (event.data === YT.PlayerState.ENDED) nextSlide();
            }
        }
    });
}

// Ensure function is globally accessible for the API
window.onYouTubeIframeAPIReady = initPlayer;

// Safety check: If API loaded before this script, init manually
if (window.YT && window.YT.Player) {
    initPlayer();
}

function playVideoSlide(videoId) {
    const el = document.getElementById('slide-video');
    gsap.set(".slide", { visibility: "hidden", opacity: 0 });
    gsap.set(el, { visibility: "visible", opacity: 1 });

    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        player.playVideo();
        player.mute(); // Double-ensure it's muted so it doesn't stay black
    } else {
        // If API isn't ready yet, wait and try again
        setTimeout(() => playVideoSlide(videoId), 500);
    }
}