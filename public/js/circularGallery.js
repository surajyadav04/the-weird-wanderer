/**
 * CircularGallery — Vanilla JS 3D Wheel
 * Author: The Weird Wanderer
 */

class CircularGallery {
    constructor(container, items) {
        this.container = container;
        this.items = items;
        this.currentIndex = 0;
        this.radius = 600; // Distance from center
        this.rotation = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startRotation = 0;

        this.init();
    }

    init() {
        this.container.classList.add('circular-gallery');
        this.wheel = document.createElement('div');
        this.wheel.className = 'circular-gallery__wheel';
        this.container.appendChild(this.wheel);

        this.renderItems();
        this.renderIndicators();
        this.setupEvents();
        this.updateWheel(0);
    }

    renderItems() {
        const angleStep = 360 / this.items.length;
        
        this.items.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'circular-gallery__item';
            
            const angle = index * angleStep;
            el.style.transform = `rotateY(${angle}deg) translateZ(${this.radius}px)`;
            
            if (item.type === 'video') {
                el.innerHTML = `
                    <video src="${item.url}" poster="${item.thumbnail || ''}" muted loop playsinline></video>
                    <div class="circular-gallery__item-title">${item.title}</div>
                `;
            } else {
                el.innerHTML = `
                    <img src="${item.url}" alt="${item.title}" loading="lazy">
                    <div class="circular-gallery__item-title">${item.title}</div>
                `;
            }

            el.addEventListener('click', () => this.goTo(index));
            this.wheel.appendChild(el);
        });
    }

    renderIndicators() {
        this.indicatorContainer = document.createElement('div');
        this.indicatorContainer.className = 'circular-gallery__indicators';
        
        this.items.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'circular-gallery__dot';
            dot.addEventListener('click', () => this.goTo(index));
            this.indicatorContainer.appendChild(dot);
        });
        
        this.container.appendChild(this.indicatorContainer);
    }

    updateWheel(delta = 0) {
        this.rotation += delta;
        this.wheel.style.transform = `rotateY(${-this.rotation}deg)`;

        // Update active states
        const angleStep = 360 / this.items.length;
        this.currentIndex = Math.round(this.rotation / angleStep) % this.items.length;
        if (this.currentIndex < 0) this.currentIndex += this.items.length;

        const itemEls = this.wheel.querySelectorAll('.circular-gallery__item');
        itemEls.forEach((el, index) => {
            const isActive = index === this.currentIndex;
            el.classList.toggle('is-active', isActive);
            
            const video = el.querySelector('video');
            if (video) {
                if (isActive) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });

        const dots = this.indicatorContainer.querySelectorAll('.circular-gallery__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    stop() {
        const itemEls = this.wheel.querySelectorAll('.circular-gallery__item');
        itemEls.forEach(el => {
            const video = el.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    goTo(index) {
        const angleStep = 360 / this.items.length;
        const targetRotation = index * angleStep;
        
        // Find shortest path
        let diff = (targetRotation - (this.rotation % 360) + 540) % 360 - 180;
        this.rotation += diff;
        
        this.updateWheel(0);
    }

    setupEvents() {
        // Drag events
        this.container.addEventListener('pointerdown', e => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.startRotation = this.rotation;
            this.container.classList.add('is-dragging');
        });

        window.addEventListener('pointermove', e => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.startX;
            const rotationDelta = deltaX * 0.2; // Sensitivity
            this.rotation = this.startRotation - rotationDelta;
            this.updateWheel(0);
        });

        window.addEventListener('pointerup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.container.classList.remove('is-dragging');
            
            // Snap to nearest item
            const angleStep = 360 / this.items.length;
            this.rotation = Math.round(this.rotation / angleStep) * angleStep;
            this.updateWheel(0);
        });

        // Wheel scroll
        this.container.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = e.deltaY * 0.1;
            this.rotation += delta;
            this.updateWheel(0);
            
            // Debounced snap
            clearTimeout(this.snapTimeout);
            this.snapTimeout = setTimeout(() => {
                const angleStep = 360 / this.items.length;
                this.rotation = Math.round(this.rotation / angleStep) * angleStep;
                this.updateWheel(0);
            }, 200);
        }, { passive: false });
    }
}

// Make it globally available
window.CircularGallery = CircularGallery;
