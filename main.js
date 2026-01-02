// main.js
window.activeTimeline = null;
window.currentSlideIndex = 0;

const slideSequence = [
    { name: "Intro", func: () => playSimpleFade('slide-intro') },
    { name: "History", func: playHistorySequence },
    { name: "Video", func: () => playVideoSlide("ITUxwtxtc5Y") },
    { name: "Modern", func: playModernSlide },
    { name: "Video", func: () => playVideoSlide("hV2Ne1M-xM4") },
    { name: "People", func: playPeopleSlide }, // Matches function in people-slide.js
    { name: "Awards", func: playAwardsSlide },
    { name: "Video", func: () => playVideoSlide("3rmbcK2Jkmw") },
    { name: "Video", func: () => playVideoSlide("aIls-MJEnHs") }
];

function nextSlide() {
    window.currentSlideIndex = (window.currentSlideIndex + 1) % slideSequence.length;
    startCurrentSlide();
}

function prevSlide() {
    window.currentSlideIndex = (window.currentSlideIndex - 1 + slideSequence.length) % slideSequence.length;
    startCurrentSlide();
}

function startCurrentSlide() {
    console.log("--- Switching to Slide:", slideSequence[window.currentSlideIndex].name);

    if (window.activeTimeline) {
        window.activeTimeline.kill();
        window.activeTimeline = null;
    }

    gsap.killTweensOf("*");

    // Stop YouTube video if it's playing
    if (typeof player !== 'undefined' && player.stopVideo) {
        player.stopVideo();
    }

    gsap.set(".slide", { clearProps: "opacity,visibility,z-index" });
    gsap.set(".slide", { visibility: "hidden", opacity: 0 });

    slideSequence[window.currentSlideIndex].func();
}

// Initialization
window.onload = () => {
    if (typeof setupPeopleGrid === 'function') setupPeopleGrid();
    if (typeof setupModernGrid === 'function') setupModernGrid();
    if (typeof setupAwardsSlide === 'function') setupAwardsSlide();
    startCurrentSlide();
};

// Global Keyboard Control
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight" || e.key === " ") nextSlide();
    else if (e.key === "ArrowLeft") prevSlide();
});