// history-slide.js
let historyIndex = 0;
const historyData = [
    { year: "1921", title: "Katedru fyzikální chemie založil v roce 1921 prof. Jaroslav Heyrovský", img: "images/heyrovsky2.jpg" },
    { year: "1922", title: "Známý pro svůj objev polarografie", img: "images/heyrovsky1.jpg" },
    { year: "1959", title: "za který mu byla v roce 1959 udělena Nobelova cena za chemii.", img: "images/heyrovsky4.jpg" }
];

function playHistorySequence(isRestart = true) {
    if (isRestart) historyIndex = 0; // Reset index when slide starts fresh

    const data = historyData[historyIndex];
    const el = document.getElementById('slide-history');

    if (!el || !data) {
        historyIndex = 0;
        nextSlide();
        return;
    }

    el.style.backgroundImage = `url('${data.img}')`;
    document.getElementById('history-year').innerText = data.year;
    document.getElementById('history-title').innerText = data.title;

    window.activeTimeline = gsap.timeline({
        onComplete: () => {
            historyIndex++;
            playHistorySequence(false); // Don't reset index during the sequence
        }
    });

    window.activeTimeline
        .fromTo(el, { opacity: 0, visibility: 'visible' }, { opacity: 1, duration: 1.2 })
        .to(el, { opacity: 0, duration: 0.8, delay: 4 });
}