/* --- CONFIGURATION --- */
const modernImagesData = [
    { file: "lab1.jpg", class: "", name: "Laboratoř pokročilé katalýzy" }, 
    { file: "lab2.jpg", class: "",  name: ""  },  
    { file: "lab3.jpg", class: "",  name: ""  },  
    { file: "lab4.jpg", class: "",         name: ""  },        
    { file: "lab5.jpg", class: "m-tall",  name: ""  },
    { file: "lab6.jpg", class: "",         name: ""  }
];

const peopleData = [
    { file: "person_FU.jpg", name: "Head of Dept: Prof. RNDr. Filip Uhlík, Ph.D." },
    { file: "person_JC.jpg", name: "prof. Ing. Jiří Čejka, DrSc." },
    { file: "person_MO.jpg", name: "Doc. Maksym Opanasenko, Ph.D." },
    { file: "person_MS.jpg", name: "Doc. Mariya Shamzhy, Ph.D." },
    { file: "person_JP.jpg", name: "Ing. Jan Přech, Ph.D." }
];

const historyData = [
    { year: "1921", title: "Katedru fyzikální chemie založil v roce 1921 prof. Jaroslav Heyrovský", img: "heyrovsky2.jpg" },
    { year: "1922", title: "Známý pro svůj objev polarografie", img: "heyrovsky1.jpg"},
    { year: "1959", title: "za který mu byla v roce 1959 udělena Nobelova cena za chemii.", img: "heyrovsky4.jpg", video: "ITUxwtxtc5Y" }
];

/* --- STATE MANAGEMENT --- */
let player, activeTimeline, currentSlideIndex = 0, historyIndex = 0;
const peopleElements = []; 
const modernElements = [];

/* --- INITIALIZATION --- */

function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
}

function setupPortraitsGrid() {
    const gridSlide = document.getElementById('slide-grid');
    if(!gridSlide) return;
    peopleData.forEach((person, i) => {
        const img = document.createElement('img');
        img.src = person.file; img.className = 'person-photo';
        gridSlide.appendChild(img);

        const label = document.createElement('div');
        label.className = 'name-label';
        label.innerText = person.name;
        gridSlide.appendChild(label);

        peopleElements.push({ img, label, slot: document.getElementById(`slot-${i}`) });
    });
}

function setupModernGrid() {
    const gridSlide = document.getElementById('slide-modern');
    const container = document.getElementById('modern-grid-container');
    if(!gridSlide || !container) return;

    modernImagesData.forEach((data, i) => {
        // 1. Create the slot
        const slot = document.createElement('div');
        slot.className = 'm-slot';
        container.appendChild(slot);

        // 2. Create the image
        const img = document.createElement('img');
        img.src = data.file;
        img.className = 'modern-photo';
        
        // 3. FIX: Set slot aspect ratio based on actual image size
        const tempImg = new Image();
        tempImg.src = data.file;
        tempImg.onload = () => {
            const ratio = tempImg.naturalWidth / tempImg.naturalHeight;
            slot.style.aspectRatio = `${ratio}`;
        };

        gridSlide.appendChild(img);

        // 4. Create label
        const label = document.createElement('div');
        label.className = 'name-label'; 
        label.innerText = data.name || ""; 
        gridSlide.appendChild(label);

        modernElements.push({ img, slot, label });
    });
}

/* --- YOUTUBE API --- */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%', width: '100%',
        playerVars: { 'autoplay': 1, 'mute': 1, 'controls': 0, 'rel': 0, 'enablejsapi': 1 },
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) {
        if (player._callback) {
            const cb = player._callback; player._callback = null; cb();
        } else {
            nextSlide();
        }
    }
}

/* --- ANIMATION ENGINE --- */
const slideSequence = [
    { id: 'slide-intro',   func: () => playSimpleFade('slide-intro') },
    { id: 'slide-history', func: playHistorySequence },
    { id: 'slide-modern',  func: () => playUniversalGrid('slide-modern', modernElements) },
    { id: 'slide-grid',    func: () => playUniversalGrid('slide-grid', peopleElements) },
    { id: 'slide-awards',  func: () => playSimpleFade('slide-awards') },
    { id: 'video-1',       func: () => playVideoSlide("aIls-MJEnHs") },
    { id: 'video-2',       func: () => playVideoSlide("hV2Ne1M-xM4") }
];

function goToSlide(index) {
    if (index >= slideSequence.length) index = 0;
    if (index < 0) index = slideSequence.length - 1;
    currentSlideIndex = index;
    if (activeTimeline) activeTimeline.kill();
    gsap.killTweensOf("*");
    gsap.set(".slide", { visibility: "hidden", opacity: 0 });
    if (player && player.pauseVideo) player.pauseVideo();
    slideSequence[currentSlideIndex].func();
}

function nextSlide() { goToSlide(currentSlideIndex + 1); }
function prevSlide() { goToSlide(currentSlideIndex - 1); }

function playSimpleFade(id) {
    const el = document.getElementById(id);
    activeTimeline = gsap.timeline({ onComplete: nextSlide });
    activeTimeline.to(el, { visibility: 'visible', opacity: 1, duration: 1.5 })
                  .to(el, { opacity: 0, duration: 1, delay: 4 });
}

function playHistorySequence() {
    if (historyIndex >= historyData.length) {
        historyIndex = 0; nextSlide(); return;
    }
    const data = historyData[historyIndex];
    const el = document.getElementById('slide-history');
    el.style.backgroundImage = `url('${data.img}')`;
    document.getElementById('history-year').innerText = data.year;
    document.getElementById('history-title').innerText = data.title;

    activeTimeline = gsap.timeline({
        onComplete: () => {
            if (data.video) {
                playVideoSlide(data.video, () => { historyIndex++; playHistorySequence(); });
            } else {
                historyIndex++; playHistorySequence();
            }
        }
    });
    activeTimeline.to(el, { visibility: 'visible', opacity: 1, duration: 1.2 })
                  .to(el, { opacity: 0, duration: 0.8, delay: 4 });
}

function playUniversalGrid(slideId, elementsArray) {
    const el = document.getElementById(slideId);
    gsap.set(el, { visibility: "visible", opacity: 1 });
    
    activeTimeline = gsap.timeline({ onComplete: nextSlide });

    elementsArray.forEach((obj, i) => {
        const startTime = i * 4.0; 

        activeTimeline
            .set([obj.img, obj.label], { visibility: 'visible', opacity: 0, scale: 0.5 }, startTime)
            .to(obj.img, { 
                opacity: 1, 
                scale: 1, 
                width: obj.img.classList.contains('modern-photo') ? "auto" : "65vh",
                // width: "65vh", // Large size in center
                height: "65vh", 
                duration: 0.8, 
                ease: "back.out" 
            }, startTime)


            // Inside the loop in playUniversalGrid
            // activeTimeline
            //     .set([obj.img, obj.label], { visibility: 'visible', opacity: 0 })
            //     .to(obj.img, { 
            //         opacity: 1, // Explicitly solid
            //         scale: 1, 
            //         // Force width to auto for modern photos to prevent "container stretch"
            //         width: obj.img.classList.contains('modern-photo') ? "auto" : "60vh",
            //         height: "70vh", 
            //         duration: 0.8, 
            //         ease: "back.out(1.2)" 
            //     }, startTime);
            .to(obj.label, { opacity: 1, duration: 0.4 }, startTime + 0.2)
            
            // .to(obj.label, { opacity: 0, duration: 0.3 }, startTime + 2.5)
            .to(obj.img, { 
                top: () => {
                    const rect = obj.slot.getBoundingClientRect();
                    return rect.top + (rect.height / 2);
                },
                left: () => {
                    const rect = obj.slot.getBoundingClientRect();
                    return rect.left + (rect.width / 2);
                },
                width: () => obj.slot.offsetWidth,
                height: () => obj.slot.offsetHeight,
                duration: 1.2,
                ease: "power2.inOut"
            }, startTime + 2.5);
    });

    activeTimeline.to(el, { opacity: 0, duration: 1 }, "+=2");
}

function playVideoSlide(videoId, callback) {
    gsap.set(".slide", { visibility: "hidden", opacity: 0 });
    gsap.set("#slide-video", { visibility: "visible", opacity: 1 });
    player._callback = callback;
    player.loadVideoById(videoId);
    player.playVideo();
}

/* --- KEYBOARD NAVIGATION --- */
document.addEventListener('keydown', e => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
});

window.onload = () => {
    setupModernGrid();
    setupPortraitsGrid();

    loadYouTubeAPI();
    setTimeout(() => goToSlide(0), 500);
}