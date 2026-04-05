/* ═══════════════════════════════════════════════════════════
   The Weird Wanderer — Train Window Memory Experience
   Fully Automated Injector + GSF Master Timeline
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── 1. Configuration & Data ───────────────────────────────
    const CONFIG = {
        destId: 'kutch',
        selector: '.site-footer', 
        containerClass: 'train-window-experience',
        memoryCount: window.innerWidth < 768 ? 15 : 32, 
        assets: {
            trip: 'assets/trip-timelapse.mp4',
            rain: 'assets/rain-timelapse.mp4',
            fallback: 'assets/kutch-panorama.png'
        }
    };

    // Helper to get random positions
    const getRandomPos = () => ({
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 20,
        rotation: (Math.random() - 0.5) * 8,
        scale: 0.7 + Math.random() * 0.5
    });

    // ── 2. Initialization ─────────────────────────────────────
    const init = () => {
        const footer = document.querySelector(CONFIG.selector);
        if (!footer) return;
        
        const trainExp = document.createElement('div');
        trainExp.className = CONFIG.containerClass;
        trainExp.innerHTML = `
            <div class="window-sticky">
                <div class="outside-world">
                    <video id="tripVideo" class="video-layer" playsinline muted loop 
                        poster="${CONFIG.assets.fallback}">
                        <source src="${CONFIG.assets.trip}" type="video/mp4">
                    </video>
                    <video id="rainVideo" class="video-layer" playsinline muted loop>
                        <source src="${CONFIG.assets.rain}" type="video/mp4">
                    </video>
                    <img src="${CONFIG.assets.fallback}" class="fallback" alt="fallback">
                </div>
                <div class="window-frame"></div>
                <div class="reflection-layer"></div>
                <div class="final-text">
                    <h2>This is how we felt back to hostel from our trip</h2>
                </div>
            </div>
        `;

        document.body.insertBefore(trainExp, footer);

        generateReflections(trainExp.querySelector('.reflection-layer'));
        setupTimeline(trainExp);
    };

    // ── 3. Reflection Generator ───────────────────────────────
    const generateReflections = (container) => {
        if (typeof getPhotosFor !== 'function') return;
        
        const kutchPhotos = getPhotosFor(CONFIG.destId);
        if (!kutchPhotos.length) return;

        let items = [];
        for (let i = 0; i < Math.ceil(CONFIG.memoryCount / kutchPhotos.length); i++) {
            items = items.concat(kutchPhotos);
        }
        items = items.sort(() => 0.5 - Math.random()).slice(0, CONFIG.memoryCount);

        items.forEach((item, index) => {
            const memory = document.createElement('div');
            memory.className = 'memory-item';
            const pos = getRandomPos();
            
            memory.style.left = `${pos.x}%`;
            memory.style.top = `${pos.y}%`;
            memory.style.transform = `rotate(${pos.rotation}deg) scale(${pos.scale})`;
            
            memory.innerHTML = `
                <img src="${item.url}" alt="${item.title}" loading="lazy">
                <span>${item.title || 'Kutch Memory'}</span>
            `;
            
            container.appendChild(memory);
        });
    };

    // ── 4. Master Timeline (GSAP) ──────────────────────────────
    const setupTimeline = (container) => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.error('GSAP/ScrollTrigger not found.');
            return;
        }

        const tripVideo = container.querySelector('#tripVideo');
        const rainVideo = container.querySelector('#rainVideo');
        const sticky = container.querySelector('.window-sticky');
        const reflections = container.querySelectorAll('.memory-item');
        const text = container.querySelector('.final-text');

        // Ensure videos are loaded or have metadata for duration
        const scrubVideo = (video, progress, start, end) => {
            if (!video || isNaN(video.duration)) return;
            const range = end - start;
            const localProgress = Math.max(0, Math.min(1, (progress - start) / range));
            video.currentTime = localProgress * video.duration;
        };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5, // Smoother follow
                pin: sticky,
                onUpdate: (self) => {
                    const p = self.progress;
                    scrubVideo(tripVideo, p, 0, 0.6);
                    scrubVideo(rainVideo, p, 0.4, 1.0);
                }
            }
        });

        // 1. Vibration
        gsap.set(sticky, { transformOrigin: "center center" });
        const vibration = gsap.fromTo(sticky, 
            { x: -0.4, y: -0.4 }, 
            { x: 0.4, y: 0.4, duration: 0.08, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }
        );

        const obs = new IntersectionObserver((entries) => {
            entries[0].isIntersecting ? vibration.play() : vibration.pause();
        }, { threshold: 0.05 });
        obs.observe(container);

        // 2. Video Blending (Cross-fade between Trip and Rain)
        tl.to(tripVideo, { opacity: 1, duration: 0.05 }, 0);
        tl.to(tripVideo, { opacity: 0, duration: 0.2 }, 0.4); // Start fading out at 40%
        tl.fromTo(rainVideo, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.45); // Start fading in at 45%

        // 3. Memory Reflections
        reflections.forEach((ref, index) => {
            const start = 0.02 + (index * (0.85 / reflections.length)); 
            const duration = 0.12; 

            tl.fromTo(ref, 
                { opacity: 0, y: 50, scale: 0.85, filter: "blur(10px)" },
                { opacity: 0.7, y: 0, scale: 1, filter: "blur(2px)", duration: duration, ease: "sine.inOut" }, start);
            
            tl.to(ref, { opacity: 0, y: -60, scale: 1.15, filter: "blur(10px)", duration: duration, ease: "sine.inOut" }, start + duration);
        });

        // 4. Final Text
        tl.fromTo(text, 
            { opacity: 0, y: 40, scale: 0.9, filter: "blur(4px)" },
            { opacity: 0.95, y: 0, scale: 1, filter: "blur(0px)", duration: 0.05, ease: "power2.out" }, 0.92);
        
        tl.to(text, { opacity: 0, y: -20, duration: 0.03, ease: "power2.in" }, 0.98);
    };

    // ── 5. Integration ────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
    } else {
        setTimeout(init, 500);
    }

})();
