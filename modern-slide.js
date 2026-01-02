// modern-slide.js

const modernImagesData = [
    { file: "lab1.2000px.jpg", name: "Lab 1" },
    { file: "lab2.2000px.jpg", name: "Lab 2" },
    { file: "lab3.2000px.jpg", name: "Lab 3" },
    { file: "lab4.2000px.jpg", name: "Lab 4" },
    { file: "lab5.2000px.jpg", name: "Lab 5" },
    { file: "lab6.2000px.jpg", name: "Soft-Matter Theory Group" }
];

const modernElements = [];

function setupModernGrid() {
    const container = document.getElementById('modern-grid-container');
    const slide = document.getElementById('slide-modern');
    if (!container) return;

    modernImagesData.forEach((data, i) => {
        // Create the slot in the 3x2 grid
        const slot = document.createElement('div');
        slot.className = 'slot'; // Reusing generic slot style
        slot.id = `modern-slot-${i}`;
        container.appendChild(slot);

        // Create the image and label in the slide container (for fixed positioning animations)
        const img = document.createElement('img');
        img.src = data.file;
        img.className = 'modern-photo';
        slide.appendChild(img);

        const label = document.createElement('div');
        label.className = 'name-label';
        label.innerText = data.name || "";
        slide.appendChild(label);

        modernElements.push({ img, slot, label });
    });
}

function playModernSlide() {
    const slide = document.getElementById('slide-modern');
    gsap.set(slide, { visibility: "visible", opacity: 1 });

    window.activeTimeline = gsap.timeline({ onComplete: nextSlide });

    // CRITICAL: Reset all positions and states at start of every cycle
    // This prevents the "buggy second run" where elements might be left in end-statestates
    gsap.set(modernElements.map(e => e.img), {
        opacity: 0,
        visibility: 'hidden',
        top: '50%', left: '50%',
        width: '60vh', height: '40vh', // Start size
        scale: 1
    });
    gsap.set(modernElements.map(e => e.label), { opacity: 0, visibility: 'hidden' });

    modernElements.forEach((obj, i) => {
        const rect = obj.slot.getBoundingClientRect();
        // Slightly faster cadence than people slide
        const start = i * 3.5;

        window.activeTimeline
            // 1. Appear in center
            .set([obj.img, obj.label], { visibility: 'visible' }, start)
            .to(obj.img, { opacity: 1, duration: 0.8, ease: "back.out(1.2)" }, start)

            // 2. Show Label
            .to(obj.label, { opacity: 1, duration: 0.5 }, start + 0.2)

            // 3. Hide Label
            .to(obj.label, { opacity: 0, duration: 0.3 }, start + 2.5)

            // 4. Move to Grid Slot
            .to(obj.img, {
                top: rect.top + (rect.height / 2),
                left: rect.left + (rect.width / 2),
                width: rect.width,
                height: rect.height,
                duration: 1.2,
                ease: "power3.inOut"
            }, start + 2.5);
    });

    // Hold final state then fade out
    window.activeTimeline
        .to({}, { duration: 4 })
        .to(slide, { opacity: 0, duration: 1 });
}