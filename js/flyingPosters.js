/* ═══════════════════════════════════════════════════════════
   Flying Posters — Pure Canvas2D Infinite Scroll Gallery
   With 3D Twist, Click-to-Zoom, and Card Flip Animation
   Zero external dependencies. Works everywhere.
   ═══════════════════════════════════════════════════════════ */

class FlyingPosters {
  constructor(container, opts = {}) {
    this.container = container;
    this.items = opts.items || [];
    this.cardW = opts.cardWidth || 220;
    this.cardH = opts.cardHeight || 300;
    this.speed = opts.speed || 0.5;
    this.twistStrength = opts.twistStrength || 0.4;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;background:#0d0c0b;cursor:pointer;';
    this.container.appendChild(this.canvas);

    this.posters = [];
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.scrollVelocity = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.running = true;
    this.imagesLoaded = 0;
    this.time = 0;

    // Selection & flip state
    this.selectedIndex = -1;       // Which poster is zoomed
    this.isFlipped = false;        // Is the selected card showing its back?
    this.zoomProgress = 0;         // 0 = gallery view, 1 = fully zoomed
    this.flipProgress = 0;         // 0 = front, 1 = back
    this.targetZoom = 0;
    this.targetFlip = 0;
    this.selectedScreenPos = null; // {x, y} of the selected card at time of click

    this._buildPosters();
    this._bindEvents();
    this._resize();
    this._loop();
  }

  _buildPosters() {
    const count = this.items.length;
    if (!count) return;

    const cols = 3;
    this.items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const poster = {
        name: item.name || '',
        bio: item.bio || '',
        imgSrc: item.image || '',
        img: null,
        loaded: false,
        baseX: (col + 0.5) / cols + (Math.random() - 0.5) * 0.15,
        baseY: row * (this.cardH + 80) + (col * 40),
        twistAxis: Math.random() * Math.PI * 2,
        twistSpeed: 0.2 + Math.random() * 0.4,
        orbitRadius: 2 + Math.random() * 4,
        baseRotation: (Math.random() - 0.5) * 15,
        depth: 0.7 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.3 + Math.random() * 0.6,
        opacity: 0,
        targetOpacity: 1,
        // Cached screen position for hit testing
        screenX: 0,
        screenY: 0,
        screenW: 0,
        screenH: 0,
      };

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        poster.img = img;
        poster.loaded = true;
        this.imagesLoaded++;
      };
      img.onerror = () => {
        poster.loaded = true;
        this.imagesLoaded++;
      };
      img.src = item.image;

      this.posters.push(poster);
    });

    this.totalHeight = Math.ceil(count / 3) * (this.cardH + 80) + 200;
  }

  _bindEvents() {
    this._onWheel = (e) => {
      if (this.selectedIndex >= 0) return; // Don't scroll when zoomed
      this.targetScrollY += e.deltaY * 0.8;
      e.preventDefault();
    };
    this.container.addEventListener('wheel', this._onWheel, { passive: false });

    this._touchStartY = 0;
    this._onTouchStart = (e) => {
      this._touchStartY = e.touches[0].clientY;
    };
    this._onTouchMove = (e) => {
      if (this.selectedIndex >= 0) return;
      const dy = this._touchStartY - e.touches[0].clientY;
      this._touchStartY = e.touches[0].clientY;
      this.targetScrollY += dy * 1.5;
    };
    this.container.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.container.addEventListener('touchmove', this._onTouchMove, { passive: true });

    this._onMouseMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      this.mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    };
    this.container.addEventListener('mousemove', this._onMouseMove);

    // Click handler for zoom & flip
    this._onClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (this.selectedIndex >= 0) {
        // Already zoomed: toggle flip or deselect
        if (this.isFlipped) {
          // Click on back → deselect (close)
          this.isFlipped = false;
          this.targetFlip = 0;
          this.selectedIndex = -1;
          this.targetZoom = 0;
          this._autoScroll = true;
        } else {
          // Click on front → flip to back
          this.isFlipped = true;
          this.targetFlip = 1;
        }
      } else {
        // Not zoomed: check if a poster was clicked
        const hit = this._hitTest(clickX, clickY);
        if (hit >= 0) {
          this.selectedIndex = hit;
          this.targetZoom = 1;
          this.isFlipped = false;
          this.targetFlip = 0;
          this._autoScroll = false;
          // Store clicked position for smooth zoom animation
          const p = this.posters[hit];
          this.selectedScreenPos = { x: p.screenX, y: p.screenY };
        }
      }
    };
    this.canvas.addEventListener('click', this._onClick);

    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);
    this._autoScroll = true;
  }

  _hitTest(clickX, clickY) {
    // Test in reverse order (topmost first)
    for (let i = this.posters.length - 1; i >= 0; i--) {
      const p = this.posters[i];
      const hw = p.screenW / 2;
      const hh = p.screenH / 2;
      if (
        clickX >= p.screenX - hw && clickX <= p.screenX + hw &&
        clickY >= p.screenY - hh && clickY <= p.screenY + hh
      ) {
        return i;
      }
    }
    return -1;
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  _loop(timestamp = 0) {
    if (!this.running) return;
    requestAnimationFrame((t) => this._loop(t));

    this.time = timestamp;

    if (this._autoScroll) {
      this.targetScrollY += this.speed;
    }

    const prevScroll = this.scrollY;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.06;
    this.scrollVelocity = this.scrollY - prevScroll;

    // Animate zoom and flip
    this.zoomProgress += (this.targetZoom - this.zoomProgress) * 0.08;
    this.flipProgress += (this.targetFlip - this.flipProgress) * 0.07;

    // Clean up selection when fully dezoom'd
    if (this.selectedIndex >= 0 && this.targetZoom === 0 && this.zoomProgress < 0.01) {
      this.selectedIndex = -1;
      this.zoomProgress = 0;
      this.flipProgress = 0;
    }

    this._draw(timestamp);
  }

  _draw(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    this._drawGrain(ctx, w, h, time);

    // Sort by depth
    const sortedPosters = this.posters
      .map((p, i) => ({ poster: p, index: i }))
      .sort((a, b) => {
        // Selected card always on top
        if (a.index === this.selectedIndex) return 1;
        if (b.index === this.selectedIndex) return -1;
        return a.poster.depth - b.poster.depth;
      });

    sortedPosters.forEach(({ poster: p, index: i }) => {
      let y = p.baseY - this.scrollY;
      y = ((y % this.totalHeight) + this.totalHeight) % this.totalHeight;
      y = y - this.totalHeight / 2 + h / 2;

      if (y < -this.cardH * 2 || y > h + this.cardH * 1.5) return;

      const x = p.baseX * w;
      const scrollInfluence = (y - h / 2) / (h / 2);
      const timeWave = time * 0.001;

      // Twist (only when not zoomed on this card)
      const isSelected = i === this.selectedIndex;
      const zoomLerp = isSelected ? this.zoomProgress : 0;

      const twistRotation = scrollInfluence * 25 * this.twistStrength * (1 - zoomLerp);
      const orbitRotation = Math.sin(timeWave * p.twistSpeed + p.twistAxis) * p.orbitRadius * (1 - zoomLerp);
      const velocityTwist = this.scrollVelocity * 0.8 * (1 - zoomLerp);
      const totalRotation = (p.baseRotation + twistRotation + orbitRotation + velocityTwist) * (1 - zoomLerp);

      const perspectiveScale = 1.0 - Math.abs(scrollInfluence) * 0.25;
      const depthScale = p.depth * perspectiveScale;

      const skewX = scrollInfluence * 0.15 * this.twistStrength * (1 - zoomLerp);
      const skewY = Math.sin(timeWave * p.wobbleSpeed + p.wobblePhase) * 0.05 * (1 - zoomLerp);

      const parallaxX = this.mouseX * 40 * p.depth * (1 - zoomLerp);
      const parallaxY = this.mouseY * 20 * p.depth * (1 - zoomLerp);
      const wobbleX = Math.sin(timeWave * p.wobbleSpeed + p.wobblePhase) * 10 * p.depth * (1 - zoomLerp);
      const wobbleY = Math.cos(timeWave * p.wobbleSpeed * 0.7 + p.wobblePhase) * 6 * (1 - zoomLerp);

      // Opacity
      const distFromCenter = Math.abs(scrollInfluence);
      p.targetOpacity = isSelected ? 1 : (this.selectedIndex >= 0 ? 0.15 : 1.0 - distFromCenter * 0.5);
      p.opacity += (p.targetOpacity - p.opacity) * 0.08;

      let finalX = x + wobbleX + parallaxX;
      let finalY = y + wobbleY + parallaxY;

      // Zoom interpolation: move card to center and scale up
      const zoomScale = 1 + zoomLerp * 1.2; // Scale up 2.2x
      const zoomCardScale = depthScale * zoomScale;
      if (isSelected && zoomLerp > 0) {
        finalX = finalX + (w / 2 - finalX) * zoomLerp;
        finalY = finalY + (h / 2 - finalY) * zoomLerp;
      }

      // Store screen position for hit testing
      p.screenX = finalX;
      p.screenY = finalY;
      p.screenW = this.cardW * zoomCardScale;
      p.screenH = this.cardH * zoomCardScale;

      ctx.save();
      ctx.translate(finalX, finalY);

      // Card flip: scaleX goes 1 → 0 → -1 for flip effect
      const flipScaleX = Math.cos(this.flipProgress * Math.PI);
      const showBack = isSelected && flipScaleX < 0;

      // Apply twist + zoom + flip
      const rotRad = totalRotation * Math.PI / 180;
      ctx.transform(
        zoomCardScale * Math.cos(rotRad) * Math.abs(flipScaleX),
        zoomCardScale * Math.sin(rotRad) + skewY,
        -zoomCardScale * Math.sin(rotRad) + skewX,
        zoomCardScale * Math.cos(rotRad),
        0, 0
      );

      ctx.globalAlpha = Math.max(0.05, p.opacity);

      // Shadow
      ctx.shadowColor = isSelected ? 'rgba(200,169,110,0.3)' : 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = isSelected ? 40 : (25 + Math.abs(totalRotation) * 0.5);
      ctx.shadowOffsetX = isSelected ? 0 : totalRotation * 0.3;
      ctx.shadowOffsetY = isSelected ? 15 : (8 + Math.abs(scrollInfluence) * 10);

      const cw = this.cardW;
      const ch = this.cardH;

      if (showBack) {
        // ═══ BACK SIDE (Bio) ═══
        this._drawCardBack(ctx, p, i, cw, ch, time);
      } else {
        // ═══ FRONT SIDE (Photo) ═══
        this._drawCardFront(ctx, p, i, cw, ch, time);
      }

      ctx.restore();
    });

    // Vignette
    this._drawVignette(ctx, w, h);

    // Instruction hint when zoomed
    if (this.selectedIndex >= 0 && this.zoomProgress > 0.5) {
      ctx.save();
      ctx.globalAlpha = 0.5 * Math.min(1, (this.zoomProgress - 0.5) * 4);
      ctx.fillStyle = '#c8a96e';
      ctx.font = 'italic 14px Cormorant Garamond, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const hintText = this.isFlipped ? '✦ click to close ✦' : '✦ click to reveal traveler ✦';
      ctx.fillText(hintText, w / 2, h - 30);
      ctx.restore();
    }
  }

  _drawCardFront(ctx, p, i, cw, ch, time) {
    // Reset shadow for inner content
    ctx.fillStyle = '#faf5ed';
    this._roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 4);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const imgPad = 12;
    const imgW = cw - imgPad * 2;
    const imgH = ch - 70;

    if (p.loaded && p.img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-cw / 2 + imgPad, -ch / 2 + imgPad, imgW, imgH);
      ctx.clip();

      const aspect = p.img.width / p.img.height;
      let drawW = imgW;
      let drawH = imgW / aspect;
      if (drawH < imgH) {
        drawH = imgH;
        drawW = imgH * aspect;
      }
      const offsetX = (imgW - drawW) / 2;
      const offsetY = (imgH - drawH) / 2;

      ctx.drawImage(p.img, -cw / 2 + imgPad + offsetX, -ch / 2 + imgPad + offsetY, drawW, drawH);
      ctx.restore();
    } else if (!p.loaded) {
      const shimmer = 0.5 + Math.sin(time * 0.003 + i) * 0.15;
      ctx.fillStyle = `rgba(26,25,23,${shimmer})`;
      ctx.fillRect(-cw / 2 + imgPad, -ch / 2 + imgPad, imgW, imgH);
    }

    ctx.fillStyle = '#1a1917';
    ctx.font = 'italic 18px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name, 0, ch / 2 - 32);

    ctx.fillStyle = 'rgba(26,25,23,0.3)';
    ctx.font = '9px monospace';
    ctx.fillText(`WW/24/${String(i + 1).padStart(3, '0')}`, 0, ch / 2 - 12);
  }

  _drawCardBack(ctx, p, i, cw, ch, time) {
    // Dark elegant back
    ctx.fillStyle = '#1a1917';
    this._roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 4);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Decorative border
    ctx.strokeStyle = '#c8a96e';
    ctx.lineWidth = 1;
    this._roundRect(ctx, -cw / 2 + 10, -ch / 2 + 10, cw - 20, ch - 20, 2);
    ctx.stroke();

    // Corner ornament
    ctx.fillStyle = 'rgba(200,169,110,0.15)';
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 0, -ch / 2 + 35);

    // Name
    ctx.fillStyle = '#c8a96e';
    ctx.font = 'italic 22px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name, 0, -ch / 2 + 65);

    // Thin line separator
    ctx.strokeStyle = 'rgba(200,169,110,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-cw / 4, -ch / 2 + 80);
    ctx.lineTo(cw / 4, -ch / 2 + 80);
    ctx.stroke();

    // Bio text (word-wrapped)
    ctx.fillStyle = '#d4cfc6';
    ctx.font = 'italic 13px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const maxWidth = cw - 44;
    const lineHeight = 18;
    const words = p.bio.split(' ');
    let line = '';
    let yPos = -ch / 2 + 95;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, 0, yPos);
        line = word;
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, 0, yPos);
    }

    // Dispatch number at bottom
    ctx.fillStyle = 'rgba(200,169,110,0.25)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`DISPATCH WW/24/${String(i + 1).padStart(3, '0')}`, 0, ch / 2 - 18);

    // Bottom ornament
    ctx.fillStyle = 'rgba(200,169,110,0.15)';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('— ✦ —', 0, ch / 2 - 30);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _drawGrain(ctx, w, h, time) {
    if (Math.floor(time / 80) % 2 === 0) return;
    ctx.save();
    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 1.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  _drawVignette(ctx, w, h) {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
    gradient.addColorStop(0, 'rgba(13,12,11,0)');
    gradient.addColorStop(0.6, 'rgba(13,12,11,0.15)');
    gradient.addColorStop(1, 'rgba(13,12,11,0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  destroy() {
    this.running = false;
    this.container.removeEventListener('wheel', this._onWheel);
    this.container.removeEventListener('touchstart', this._onTouchStart);
    this.container.removeEventListener('touchmove', this._onTouchMove);
    this.container.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('click', this._onClick);
    window.removeEventListener('resize', this._onResize);
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

// Export for both ES modules and regular scripts
if (typeof window !== 'undefined') {
  window.FlyingPosters = FlyingPosters;
}
