/* 🌍 The Weird Wanderer — Multi-Climate Atmospheric System */

(function () {
    'use strict';

    const CLIMATES = [
        { id: 'none', label: 'Clear', icon: '⠿' },
        { id: 'snow', label: 'Snow', icon: '❄' },
        { id: 'rain', label: 'Rain', icon: '🌧' },
        { id: 'dust', label: 'Dust', icon: '𖦹' },
        { id: 'fog', label: 'Fog', icon: '🌫' }
    ];

    /* 🎵 Procedural Atmospheric Audio Engine */
    class ClimateAudio {
        constructor() {
            this.ctx = null;
            this.master = null;
            this.currentSource = null;
            this.states = {
                rain: { type: 'noise', filter: 800, mod: 0.15, gain: 0.08 },
                snow: { type: 'noise', filter: 3000, mod: 0.05, gain: 0.02 },
                dust: { type: 'brown', filter: 400, mod: 0.4, gain: 0.12 },
                fog: { type: 'drone', freq: 60, filter: 150, gain: 0.1 }
            };
        }

        async init() {
            if (this.ctx) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.connect(this.ctx.destination);
            this.master.gain.setValueAtTime(0, this.ctx.currentTime);
        }

        async set(mode) {
            await this.init();
            if (this.ctx.state === 'suspended') await this.ctx.resume();

            // Fade out current
            this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);

            setTimeout(() => {
                if (this.currentSource) {
                    this.currentSource.stop();
                    this.currentSource = null;
                }

                if (mode === 'none') return;

                const config = this.states[mode];
                if (!config) return;

                this.master.gain.linearRampToValueAtTime(config.gain, this.ctx.currentTime + 1.2);

                if (config.type === 'noise' || config.type === 'brown') {
                    this.currentSource = this.createNoise(config);
                } else if (config.type === 'drone') {
                    this.currentSource = this.createDrone(config);
                }

                if (this.currentSource) this.currentSource.start();
            }, 1200);
        }

        createNoise(config) {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                if (config.type === 'brown') {
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; // Brown noise volume comp
                } else {
                    data[i] = white;
                }
            }

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = config.type === 'brown' ? 'lowpass' : (config.id === 'snow' ? 'highpass' : 'lowpass');
            filter.frequency.value = config.filter;

            // Amplitude modulation for "gusts" or "patter"
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = config.type === 'brown' ? 0.2 : 0.8;
            lfoGain.gain.value = config.mod;

            lfo.connect(lfoGain);
            const midGain = this.ctx.createGain();
            midGain.gain.value = 1.0 - config.mod;
            lfoGain.connect(midGain.gain);

            source.connect(filter);
            filter.connect(midGain);
            midGain.connect(this.master);

            lfo.start();
            return { stop: () => { source.stop(); lfo.stop(); }, start: () => source.start() };
        }

        createDrone(config) {
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();

            osc1.type = 'sine';
            osc2.type = 'sawtooth';
            osc1.frequency.value = config.freq;
            osc2.frequency.value = config.freq * 1.01; // Detune

            filter.type = 'lowpass';
            filter.frequency.value = config.filter;
            filter.Q.value = 5;

            const g1 = this.ctx.createGain();
            g1.gain.value = 0.5;

            osc1.connect(g1);
            osc2.connect(g1);
            g1.connect(filter);
            filter.connect(this.master);

            return {
                stop: () => { osc1.stop(); osc2.stop(); },
                start: () => { osc1.start(); osc2.start(); }
            };
        }
    }

    const audio = new ClimateAudio();

    let currentModeIdx = 0;
    let particles = [];
    let animId;
    let canvas, ctx, toggle, iconEl, statusEl;

    function init() {
        canvas = document.getElementById('snowCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'snowCanvas';
            canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999; display:none;';
            document.body.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');

        toggle = document.getElementById('climateToggle');
        iconEl = document.getElementById('climateIcon');
        statusEl = document.getElementById('climateStatus');

        if (toggle) {
            toggle.addEventListener('click', () => {
                currentModeIdx = (currentModeIdx + 1) % CLIMATES.length;
                updateUI();
                start();
                audio.set(CLIMATES[currentModeIdx].id);
            });
        }

        window.addEventListener('resize', () => {
            if (CLIMATES[currentModeIdx].id !== 'none') setupParticles();
        });

        // Initial state check - look for saved preference if any
        const saved = localStorage.getItem('wanderer-climate');
        if (saved) {
            const idx = CLIMATES.findIndex(c => c.id === saved);
            if (idx !== -1) {
                currentModeIdx = idx;
                updateUI();
                start();
                // Note: cannot start audio here automatically due to browser policy
            }
        }
    }

    function updateUI() {
        const climate = CLIMATES[currentModeIdx];
        if (statusEl) statusEl.textContent = climate.label;
        if (iconEl) iconEl.textContent = climate.icon;
        localStorage.setItem('wanderer-climate', climate.id);
    }

    function setupParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const mode = CLIMATES[currentModeIdx].id;

        if (mode === 'none') {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        let count = mode === 'fog' ? 20 : Math.floor(window.innerWidth / 8);

        for (let i = 0; i < count; i++) {
            if (mode === 'snow') {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 2.5 + 0.5,
                    d: Math.random() * 100,
                    v: Math.random() * 0.8 + 0.2
                });
            } else if (mode === 'rain') {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    l: Math.random() * 20 + 10,
                    v: Math.random() * 12 + 8,
                    o: Math.random() * 0.3 + 0.2
                });
            } else if (mode === 'dust') {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.5 + 0.2,
                    vx: Math.random() * 3 + 2,
                    vy: Math.random() * 1 - 0.5,
                    o: Math.random() * 0.6 + 0.2
                });
            } else if (mode === 'fog') {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 200 + 150,
                    vx: Math.random() * 0.6 - 0.3,
                    vy: Math.random() * 0.3 - 0.15,
                    o: Math.random() * 0.08 + 0.02
                });
            }
        }
    }

    function start() {
        cancelAnimationFrame(animId);
        setupParticles();
        if (CLIMATES[currentModeIdx].id !== 'none') loop();
    }

    function loop() {
        draw();
        animId = requestAnimationFrame(loop);
    }

    function draw() {
        if (!canvas || !ctx) return;
        const mode = CLIMATES[currentModeIdx].id;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (mode === 'snow') {
            ctx.fillStyle = "rgba(240, 236, 228, 0.7)";
            ctx.beginPath();
            for (let p of particles) {
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            }
            ctx.fill();
        } else if (mode === 'rain') {
            ctx.strokeStyle = "rgba(240, 236, 228, 0.5)";
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            for (let p of particles) {
                ctx.beginPath();
                ctx.globalAlpha = p.o;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.v * 0.05, p.y + p.l);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        } else if (mode === 'dust') {
            ctx.fillStyle = "rgba(200, 169, 110, 0.8)"; // Accent color
            for (let p of particles) {
                ctx.beginPath();
                ctx.globalAlpha = p.o;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        } else if (mode === 'fog') {
            for (let p of particles) {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                grad.addColorStop(0, `rgba(240, 236, 228, ${p.o})`);
                grad.addColorStop(1, 'rgba(240, 236, 228, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        update();
    }

    function update() {
        const mode = CLIMATES[currentModeIdx].id;
        for (let p of particles) {
            if (mode === 'snow') {
                p.y += p.v;
                p.x += Math.sin(p.d) * 0.4;
                p.d += 0.01;
                if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
            } else if (mode === 'rain') {
                p.y += p.v;
                p.x += p.v * 0.05;
                if (p.y > canvas.height) { p.y = -p.l; p.x = Math.random() * canvas.width; }
            } else if (mode === 'dust') {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x > canvas.width) { p.x = -10; p.y = Math.random() * canvas.height; }
            } else if (mode === 'fog') {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -p.r) p.x = canvas.width + p.r;
                if (p.x > canvas.width + p.r) p.x = -p.r;
                if (p.y < -p.r) p.y = canvas.height + p.r;
                if (p.y > canvas.height + p.r) p.y = -p.r;
            }
        }
    }

    // Auto-init on load
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

})();
