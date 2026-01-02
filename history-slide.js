// history-slide.js
let historyIndex = 0;
const historyData = [
    { year: "1921", title: "Katedru fyzikální chemie založil...", img: "heyrovsky2.jpg" },
    { year: "1922", title: "Známý pro svůj objev polarografie", img: "heyrovsky1.jpg"},
    { year: "1959", title: "Nobelova cena za chemii.", img: "heyrovsky4.jpg" }
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