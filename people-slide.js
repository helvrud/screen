// people-slide.js
const peopleData = [
    { file: "images/person_JC.jpg", name: "prof. Ing. Jiří Čejka, DrSc." },
    { file: "images/person_FU.jpg", name: "Prof. RNDr. Filip Uhlík, Ph.D." },
    { file: "images/person_MO.jpg", name: "Doc. Maksym Opanasenko, Ph.D." },
    { file: "images/person_MS.jpg", name: "Doc. Mariya Shamzhy, Ph.D." },
    { file: "images/person_JP.jpg", name: "Ing. Jan Přech, Ph.D." }
];

const elements = [];

function setupPeopleGrid() {
    const slide = document.getElementById('slide-people');
    const gridContainer = document.getElementById('grid-container');

    peopleData.forEach((person, i) => {
        // Create the slot in the grid
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.id = `slot-${i}`;
        gridContainer.appendChild(slot);

        // Create the image and label in the slide container (for fixed positioning animations)
        const img = document.createElement('img');
        img.src = person.file; img.className = 'person-photo';
        slide.appendChild(img);

        const label = document.createElement('div');
        label.className = 'name-label';
        label.innerText = person.name;
        slide.appendChild(label);

        elements.push({ img, label, slot: slot });
    });
}

function playPeopleSlide() {
    const el = document.getElementById('slide-people');
    gsap.set(el, { visibility: "visible", opacity: 1, scale: 1 });

    window.activeTimeline = gsap.timeline({ onComplete: nextSlide });

    // Reset positions
    gsap.set(elements.map(e => e.img), { opacity: 0, visibility: 'hidden', top: '50%', left: '50%', width: '0vh', height: '0vh' });

    elements.forEach((obj, i) => {
        const rect = obj.slot.getBoundingClientRect();
        const start = i * 2.4;

        window.activeTimeline
            .set([obj.img, obj.label], { visibility: 'visible' }, start)
            .to(obj.img, { opacity: 1, width: "60vh", height: "60vh", duration: 0.7, ease: "back.out(1.2)" }, start)
            .to(obj.label, { opacity: 1, duration: 0.5 }, start + 0.2)
            .to(obj.label, { opacity: 0, duration: 0.3 }, start + 1.8)
            .to(obj.img, {
                top: rect.top + (rect.height / 2),
                left: rect.left + (rect.width / 2),
                width: rect.width, height: rect.height,
                duration: 1.2, ease: "power3.inOut"
            }, start + 1.8);
    });

    window.activeTimeline.to({}, { duration: 4 }).to(el, { opacity: 0, scale: 0.2, duration: 1 });
}