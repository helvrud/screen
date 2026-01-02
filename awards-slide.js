// awards-slide.js

const awardsData = [
    {
        image: "images/shamzy_neuron_1.jpg",
        title: "Neuron Award",
        recipient: "Mariya Shamzhy"
    },
    {
        image: "images/Neuron_Eliasova.png",
        title: "Neuron Award",
        recipient: "Pavla Eliášová"
    },
    {
        image: "images/Eliasova_Women_in_Science.jpg",
        title: "Women in Science",
        recipient: "L'Oréal-UNESCO | Pavla Eliášová"
    }
];

const awardElements = [];

function setupAwardsSlide() {
    const container = document.getElementById('awards-container');
    if (!container) return;

    awardsData.forEach((award, i) => {
        const card = document.createElement('div');
        card.className = 'award-card';
        card.innerHTML = `
            <div class="award-image-container">
                <img src="${award.image}" alt="${award.title}">
            </div>
            <div class="award-info">
                <h3 class="award-title">${award.title}</h3>
                <p class="award-recipient">${award.recipient}</p>
            </div>
        `;
        container.appendChild(card);
        awardElements.push(card);
    });
}

function playAwardsSlide() {
    const slide = document.getElementById('slide-awards');
    const container = document.getElementById('awards-container');

    gsap.set(slide, { visibility: "visible", opacity: 1 });

    window.activeTimeline = gsap.timeline({ onComplete: nextSlide });

    // Reset cards
    gsap.set(awardElements, { opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" });

    // Header animation
    window.activeTimeline.fromTo("#slide-awards .title-large",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    window.activeTimeline.fromTo("#slide-awards .content-text",
        { opacity: 0 },
        { opacity: 1, duration: 1 }, "-=0.5"
    );

    // Cards staggered appearance
    awardElements.forEach((card, i) => {
        window.activeTimeline.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 2.0, // Increased from 1.2
            ease: "back.out(1.2)"
        }, "-=1.2"); // Increased stagger overlap slightly but duration makes it feel much slower
    });

    // Hold and fade out
    window.activeTimeline
        .to({}, { duration: 5 })
        .to(slide, { opacity: 0, duration: 1 });
}
