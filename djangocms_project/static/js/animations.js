/* animations.js */

window.activeTimeline = null;
window.currentSlideIndex = 0;
let slides = [];

function initSlides() {
    slides = document.querySelectorAll('.slide');
    console.log("Found slides:", slides.length);
    if (slides.length > 0) {
        // Reset current index just in case
        window.currentSlideIndex = 0;
        startCurrentSlide();
    } else {
        // Retry once after a short delay if no slides found (CMS race condition)
        setTimeout(() => {
            slides = document.querySelectorAll('.slide');
            if (slides.length > 0) {
                console.log("Found slides on retry:", slides.length);
                startCurrentSlide();
            }
        }, 500);
    }
}

function nextSlide() {
    if (slides.length === 0) return;
    window.currentSlideIndex = (window.currentSlideIndex + 1) % slides.length;
    startCurrentSlide();
}

function prevSlide() {
    if (slides.length === 0) return;
    window.currentSlideIndex = (window.currentSlideIndex - 1 + slides.length) % slides.length;
    startCurrentSlide();
}

function startCurrentSlide() {
    console.log("--- Switching to Slide Index:", window.currentSlideIndex);

    // Stop current animations
    if (window.activeTimeline) {
        window.activeTimeline.kill();
        window.activeTimeline = null;
    }
    gsap.killTweensOf("*");

    // Hide all slides
    gsap.set(".slide", { visibility: "hidden", opacity: 0, zIndex: 1 });

    const currentSlide = slides[window.currentSlideIndex];
    if (!currentSlide) return;

    // Show current slide
    gsap.set(currentSlide, { visibility: "visible", zIndex: 10 });

    // Animate current slide
    window.activeTimeline = gsap.timeline();
    window.activeTimeline.to(currentSlide, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
    });

    // Content animations
    const content = currentSlide.querySelector('.slide-content');
    if (content) {
        window.activeTimeline.from(content.children, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=0.5");
    }
}

// Keyboard Control
window.addEventListener('keydown', (e) => {
    // Detect edit mode or if any input/textarea is focused
    const isEditMode = document.body.classList.contains('cms-edit-mode') ||
        document.querySelector('.cms-toolbar-expanded');
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    if (isEditMode || isInputFocused) return;

    if (e.key === "ArrowRight" || e.key === " ") nextSlide();
    else if (e.key === "ArrowLeft") prevSlide();
});

/* Particles.js Configuration */
particlesJS("particles-js", {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.2, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
        "move": { "enable": true, "speed": 1.5, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
        "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
    },
    "retina_detect": true
});

// Initialize
function checkAndInit() {
    // DjangoCMS 4.x often uses 'cms-toolbar-expanded' or 'cms-ready'
    const isEditMode = document.body.classList.contains('cms-edit-mode') ||
        document.querySelector('.cms-toolbar-expanded');

    if (!isEditMode) {
        initSlides();
    } else {
        console.log("CMS Edit Mode detected, skipping slide sequencer.");
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    checkAndInit();
} else {
    document.addEventListener('DOMContentLoaded', checkAndInit);
}
