// slide_handlers.js

window.SlideHandlers = {

    // --- INTRO SLIDE ---
    "intro": function (element, completeCallback) {
        const timeline = gsap.timeline({ onComplete: completeCallback });

        timeline
            .fromTo(element,
                { opacity: 0, visibility: 'hidden' },
                {
                    visibility: 'visible',
                    opacity: 0.999,
                    duration: 1.5,
                    ease: "power2.inOut"
                }
            )
            .to(element, { opacity: 0.999, duration: 4 })
            .to(element, {
                opacity: 0,
                duration: 1,
                onComplete: () => gsap.set(element, { visibility: 'hidden' })
            });

        return timeline;
    },

    // --- HISTORY BLOCK ---
    "history": function (element, completeCallback) {
        // Note: The CMS version renders all history blocks as separate slides in the DOM sequence
        // unlike the static version which cycled arrays. This simplifies things!

        const timeline = gsap.timeline({ onComplete: completeCallback });

        timeline
            .fromTo(element, { opacity: 0, visibility: 'visible' }, { opacity: 1, duration: 1.2 })
            .to(element, { opacity: 0, duration: 0.8, delay: 4, onComplete: () => gsap.set(element, { visibility: 'hidden' }) });

        return timeline;
    },

    // --- PEOPLE GRID ---
    "people_grid": function (element, completeCallback) {
        const timeline = gsap.timeline({ onComplete: completeCallback });

        gsap.set(element, { visibility: "visible", opacity: 1, scale: 1 });

        // Find all person cards
        const cards = element.querySelectorAll('.person-animate-wrapper');
        const slots = element.querySelectorAll('.slot'); // Using the grid slots for positioning

        if (cards.length === 0) {
            // Fallback if no specific animation structure found
            timeline
                .fromTo(element, { opacity: 0 }, { opacity: 1, duration: 1 })
                .to(element, { opacity: 0, duration: 1, delay: 5 });
            return timeline;
        }

        // Reset positions
        gsap.set(cards, { opacity: 0, visibility: 'hidden', position: 'fixed', top: '50%', left: '50%', width: 0, height: 0, zIndex: 100 });
        gsap.set(element.querySelectorAll('.person-label'), { opacity: 0 });

        cards.forEach((card, i) => {
            const slot = slots[i];
            if (!slot) return;

            const rect = slot.getBoundingClientRect();
            const start = i * 2.4;
            const img = card.querySelector('img');
            const label = card.querySelector('.person-label');

            timeline
                .set(card, { visibility: 'visible' }, start)
                .to(card, { opacity: 1, width: "60vh", height: "60vh", duration: 0.7, ease: "back.out(1.2)" }, start)
                .to(label, { opacity: 1, duration: 0.5 }, start + 0.2)
                .to(label, { opacity: 0, duration: 0.3 }, start + 1.8)
                .to(card, {
                    top: rect.top + (rect.height / 2),
                    left: rect.left + (rect.width / 2),
                    width: rect.width,
                    height: rect.height,
                    duration: 1.2,
                    ease: "power3.inOut"
                }, start + 1.8);
        });

        timeline.to({}, { duration: 4 }).to(element, { opacity: 0, scale: 0.2, duration: 1 });

        return timeline;
    },

    // --- MODERN GALLERY ---
    "gallery": function (element, completeCallback) {
        const timeline = gsap.timeline({ onComplete: completeCallback });
        const slide = element;

        gsap.set(slide, { visibility: "visible", opacity: 1 });

        const items = slide.querySelectorAll('.gallery-animate-item');
        const slots = slide.querySelectorAll('.grid-item');

        // Reset
        gsap.set(items, {
            opacity: 0,
            visibility: 'hidden',
            position: 'fixed',
            top: '50%', left: '50%',
            width: 0, height: 0,
            zIndex: 100
        });

        items.forEach((item, i) => {
            const slot = slots[i];
            if (!slot) return;

            const rect = slot.getBoundingClientRect();
            const start = i * 2.8;
            const caption = item.querySelector('.gallery-caption');

            timeline
                .set(item, { visibility: 'visible' }, start)
                .to(item, {
                    opacity: 1,
                    width: "66vw",
                    height: "66vh",
                    duration: 0.8,
                    ease: "back.out(1.2)"
                }, start)
                .to(caption, { opacity: 1, duration: 0.5 }, start + 0.2)
                .to(caption, { opacity: 0, duration: 0.3 }, start + 1.8)
                .to(item, {
                    top: rect.top + (rect.height / 2),
                    left: rect.left + (rect.width / 2),
                    width: rect.width,
                    height: rect.height,
                    duration: 1.2,
                    ease: "power3.inOut"
                }, start + 1.8);
        });

        timeline
            .to({}, { duration: 4 })
            .to(slide, { opacity: 0, duration: 1 });

        return timeline;
    },

    // --- VIDEOS ---
    "youtube_embed": function (element, completeCallback) {
        const videoId = element.dataset.youtubeId;
        const sharedContainer = document.getElementById('slide-video-shared');

        // Move focus to shared container
        gsap.set(sharedContainer, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
        gsap.set('#player', { opacity: 0 });

        // Helper to bridge the end of video to callback
        window.currentVideoCompleteCallback = () => {
            gsap.to(sharedContainer, {
                opacity: 0, duration: 1, onComplete: () => {
                    gsap.set(sharedContainer, { visibility: 'hidden', pointerEvents: "none" });
                    completeCallback();
                }
            });
        };

        if (window.player && window.player.loadVideoById) {
            window.player.loadVideoById(videoId);
            window.player.mute();
            window.player.playVideo();
        } else {
            console.error("YouTube Player not initialized");
            // Retry once or skip
            setTimeout(completeCallback, 2000);
        }

        // Return a dummy timeline effectively, as control is handed to YT events
        return gsap.timeline();
    }
};

// --- YOUTUBE API SETUP ---
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'mute': 1, 'enablejsapi': 1, 'modestbranding': 1 },
        events: {
            'onStateChange': (event) => {
                if (event.data === YT.PlayerState.ENDED) {
                    if (window.currentVideoCompleteCallback) window.currentVideoCompleteCallback();
                }
                if (event.data === YT.PlayerState.PLAYING) {
                    gsap.to('#player', { opacity: 1, duration: 0.5 });
                }
            }
        }
    });
    window.player = player;
}
