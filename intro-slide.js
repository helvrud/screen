// intro-slide.js
function playSimpleFade(id) {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Use the global window.activeTimeline
    window.activeTimeline = gsap.timeline({ onComplete: nextSlide });

    window.activeTimeline
        // 1. Force a clean start with .fromTo
        .fromTo(el, 
            { opacity: 0, visibility: 'hidden' }, 
            { 
                visibility: 'visible', 
                opacity: 0.999, // FIX: Prevents "Stacking Context" flicker at 1.0
                duration: 1.5,
                ease: "power2.inOut"
            }
        )
        // 2. Hold the slide
        .to(el, { opacity: 0.999, duration: 4 }) 
        
        // 3. Fade out
        .to(el, { 
            opacity: 0, 
            duration: 1, 
            onComplete: () => gsap.set(el, { visibility: 'hidden' }) 
        });
}