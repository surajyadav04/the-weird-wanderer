/**
 * TravelerReveal — Image Reveal on Hover
 * Inspired by Codrops
 */

class TravelerReveal {
    constructor() {
        this.containerSpec = { width: 300, height: 400 };
        this.revealContainer = null;
        this.revealImg = null;
        this.links = document.querySelectorAll('.story-characters__link');
        
        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        if (window.innerWidth <= 768) return; // Disable on small screens
        
        this.createRevealElements();
        this.setupEvents();
        this.animate();
    }

    createRevealElements() {
        this.revealContainer = document.createElement('div');
        this.revealContainer.className = 'reveal-container';
        
        this.revealImg = document.createElement('img');
        this.revealImg.className = 'reveal-container__img';
        
        this.revealContainer.appendChild(this.revealImg);
        document.body.appendChild(this.revealContainer);
    }

    setupEvents() {
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const imgUrl = link.dataset.image;
                if (imgUrl) {
                    this.revealImg.src = imgUrl;
                    this.revealContainer.classList.add('is-visible');
                }
            });

            link.addEventListener('mouseleave', () => {
                this.revealContainer.classList.remove('is-visible');
            });
        });
    }

    animate() {
        // Smooth follow math (lerp)
        const lerp = (a, b, n) => (1 - n) * a + n * b;
        
        this.pos.x = lerp(this.pos.x, this.mouse.x, 0.1);
        this.pos.y = lerp(this.pos.y, this.mouse.y, 0.1);
        
        // Offset to center the image on cursor
        const x = this.pos.x - (this.containerSpec.width / 2);
        const y = this.pos.y - (this.containerSpec.height / 2);
        
        if (this.revealContainer) {
            this.revealContainer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Auto-init for simplicity if data is present
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.story-characters__link')) {
        new TravelerReveal();
    }
});

window.TravelerReveal = TravelerReveal;
