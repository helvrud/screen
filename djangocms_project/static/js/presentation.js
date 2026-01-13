// presentation.js

(function () {
    window.currentSlideIndex = 0;
    window.activeTimeline = null;
    let slides = [];

    function initPresentation() {
        console.log("initPresentation called");
        // Collect all potential slides from the DOM
        slides = Array.from(document.querySelectorAll('.cms-plugin-slide'));

        if (slides.length === 0) {
            console.warn("No slides found. Make sure plugins are added.");
            return;
        }

        console.log(`Presentation initialized with ${slides.length} slides.`);

        // Log all found slides for debugging
        slides.forEach((slide, idx) => {
            console.log(`Slide ${idx}:`, slide.dataset.slideType, slide);
        });

        // Start the first slide
        playSlide(0);
    }

    function playSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        console.log(`playSlide request: ${index} (current: ${window.currentSlideIndex})`);

        window.currentSlideIndex = index;
        const currentSlideElement = slides[index];

        if (!currentSlideElement) {
            console.error(`Slide element at index ${index} is undefined!`);
            return;
        }

        const slideType = currentSlideElement.dataset.slideType;

        console.log(`Playing slide ${index}: ${slideType}`);

        // Cleanup previous state
        if (window.activeTimeline) {
            console.log("Killing active timeline");
            window.activeTimeline.kill();
            window.activeTimeline = null;
        }

        // Stop any video overrides
        if (window.player && window.player.stopVideo) {
            window.player.stopVideo();
        }

        // Reset all slides to hidden (except the current one we are about to animate handles itself usually)
        gsap.set('.cms-plugin-slide', { visibility: 'hidden', opacity: 0, zIndex: 1 });

        // Bring current to front (z-index)
        gsap.set(currentSlideElement, { zIndex: 10 });

        // Dispatch to handler
        if (window.SlideHandlers && window.SlideHandlers[slideType]) {
            console.log(`Dispatching to handler: SlideHandlers.${slideType}`);
            window.activeTimeline = window.SlideHandlers[slideType](
                currentSlideElement,
                window.nextSlide // Callback when done
            );
        } else {
            console.error(`No handler for slide type: ${slideType}`);
            console.log("Available handlers:", window.SlideHandlers);
            // Fallback: just show it for 5 seconds then next
            gsap.set(currentSlideElement, { visibility: 'visible', opacity: 1 });
            setTimeout(window.nextSlide, 5000);
        }
    }

    window.nextSlide = function () {
        console.log("window.nextSlide called");
        if (slides.length === 0) {
            console.warn("nextSlide: No slides to navigate");
            return;
        }
        playSlide(window.currentSlideIndex + 1);
    };

    window.prevSlide = function () {
        console.log("window.prevSlide called");
        if (slides.length === 0) return;
        playSlide(window.currentSlideIndex - 1);
    };

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        // Only navigate if not typing in an input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === "ArrowRight" || e.key === " ") {
                console.log("Key Right/Space pressed");
                window.nextSlide();
            }
            else if (e.key === "ArrowLeft") {
                console.log("Key Left pressed");
                window.prevSlide();
            }
        }
    });

    // Wait for everything to load (images, CMS injections)
    window.addEventListener('load', () => {
        console.log("Window Load event fired");

        // Double check GSAP
        if (typeof gsap === 'undefined') {
            console.error("GSAP not loaded!");
            return;
        }
        initPresentation();
    });
})();
