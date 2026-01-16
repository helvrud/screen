// presentation.js

(function () {
    window.currentSlideIndex = 0;
    window.activeTimeline = null;
    window.lastReloadTime = Date.now();
    let slides = [];
    let watchdogTimer = null;

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
        if (index >= slides.length) {
            console.log("Presentation cycle complete. Reloading page for fresh content...");
            window.location.reload();
            return;
        }

        // Periodic Reload Watchdog: If total uptime > 20 minutes, reload at any slide transition
        const TWENTY_MINUTES = 20 * 60 * 1000;
        if (Date.now() - window.lastReloadTime > TWENTY_MINUTES) {
            console.log("Memory Watchdog: Uptime exceeded 20 minutes. Reloading now.");
            window.location.reload();
            return;
        }

        // Slide Watchdog: If a single slide takes > 2 minutes, force next slide (or reload)
        if (window.watchdogTimer) clearTimeout(window.watchdogTimer);
        window.watchdogTimer = setTimeout(() => {
            console.warn("Watchdog: Slide stuck for 2 minutes. Forcing next.");
            window.nextSlide();
        }, 120000);

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

        // Reset all slides to hidden and remove animation flags
        slides.forEach(s => s.classList.remove('is-animating'));
        const overlayTitle = document.getElementById('video-dynamic-title');
        if (overlayTitle) overlayTitle.classList.remove('is-animating');

        gsap.set('.cms-plugin-slide', { visibility: 'hidden', opacity: 0, zIndex: 1 });

        // Explicitly hide shared video container in case it was left open
        gsap.set('#slide-video-shared', { visibility: 'hidden', opacity: 0, zIndex: 1, pointerEvents: 'none' });

        // Bring current to front and add animation flag for GPU optimization
        currentSlideElement.classList.add('is-animating');
        gsap.set(currentSlideElement, { zIndex: 10 });

        // Update Global Side Stripe
        const deptTitle = currentSlideElement.dataset.deptTitle || "";
        const deptLogo = currentSlideElement.dataset.deptLogo || "";
        const globalTitle = document.getElementById('global-side-title');
        const globalLogo = document.getElementById('global-side-logo');

        if (globalTitle) {
            if (globalTitle.textContent !== deptTitle) {
                gsap.to(globalTitle, {
                    opacity: 0, duration: 0.3, onComplete: () => {
                        globalTitle.textContent = deptTitle;
                        gsap.to(globalTitle, { opacity: 0.7, duration: 0.3 });
                    }
                });
            }
        }

        if (globalLogo) {
            if (deptLogo) {
                globalLogo.src = deptLogo;
                globalLogo.style.display = 'block';
            } else {
                globalLogo.style.display = 'none';
            }
        }

        // Update Global Side QR
        const deptUrl = currentSlideElement.dataset.deptUrl || "";
        const globalQRContainer = document.getElementById('global-side-qr');

        if (globalQRContainer && deptUrl) {
            if (!window.globalQRCode) {
                window.globalQRCode = new QRCode(globalQRContainer, {
                    text: deptUrl,
                    width: 70,
                    height: 70,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                window.globalQRCode.clear();
                window.globalQRCode.makeCode(deptUrl);
            }
            globalQRContainer.style.display = 'block';
        } else if (globalQRContainer) {
            globalQRContainer.style.display = 'none';
        }

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

        // --- Mouse Idle Hider ---
        let idleTimer;

        function showCursor() {
            document.body.style.cursor = 'auto';
            document.body.classList.remove('kiosk-mode');

            // Also ensure arrows are visible if they rely on hover
            const arrows = document.querySelectorAll('.nav-arrow');
            arrows.forEach(a => a.style.opacity = ''); // Reset to CSS default (or visible)

            // PAUSE PRESENTATION
            if (window.activeTimeline) {
                window.activeTimeline.pause();
            }
            // Pause YouTube if active
            if (window.player && typeof window.player.pauseVideo === 'function') {
                // Check if current slide is video type to avoid pausing if it wasn't playing?
                // Actually, safer to just try pausing if player exists.
                // But wait, if we pause, we need to know if we should resume.
                // For simplicity: yes, resume if it was playing. But simpler: just pause/play.
                try {
                    const state = window.player.getPlayerState();
                    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                        window.player.pauseVideo();
                        window.wasVideoPlaying = true;
                    }
                } catch (e) { }
            }

            clearTimeout(idleTimer);
            idleTimer = setTimeout(hideCursor, 5000);
        }

        function hideCursor() {
            document.body.style.cursor = 'none';
            document.body.classList.add('kiosk-mode');

            // Optional: Hide arrows too for cleaner look
            const arrows = document.querySelectorAll('.nav-arrow');
            arrows.forEach(a => a.style.opacity = '0');

            // RESUME PRESENTATION
            if (window.activeTimeline) {
                window.activeTimeline.play();
            }
            if (window.player && window.wasVideoPlaying && typeof window.player.playVideo === 'function') {
                window.player.playVideo();
                window.wasVideoPlaying = false;
            }
        }

        window.addEventListener('mousemove', showCursor);
        window.addEventListener('mousedown', showCursor);
        window.addEventListener('touchstart', showCursor);

        // Start timer
        showCursor();
    });

    // --- YOUTUBE API SETUP ---
    // --- YOUTUBE API SETUP ---
    // Moved to presentation.html head to ensure timely execution
})();
