// src/user/js/particles.js
document.addEventListener('DOMContentLoaded', () => {
    const heroWrap = document.querySelector('.hero-wrap');
    if (!heroWrap) return;

    // Ensure heroWrap is positioned relative to contain absolute canvas
    const computedStyle = window.getComputedStyle(heroWrap);
    if (computedStyle.position === 'static') {
        heroWrap.style.position = 'relative';
    }
    heroWrap.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    
    // Insert as first child so it sits behind the content
    heroWrap.insertBefore(canvas, heroWrap.firstChild);

    // Make sure hero content sits above canvas
    const heroContent = heroWrap.querySelector('section');
    if (heroContent) {
        heroContent.style.position = 'relative';
        heroContent.style.zIndex = '1';
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = heroWrap.offsetWidth;
        height = heroWrap.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * -0.5 - 0.1; // Drift upwards
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 65, 145, ${this.opacity})`; // Neon pink
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FF4191';
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(Math.floor(width / 15), 80); // Responsive amount
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
});
