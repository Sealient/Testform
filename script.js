/* ══════════════════════════════════════════════
   MINECRAFT LAVA RISES — CINEMATIC JS
   ══════════════════════════════════════════════ */

// ── Cursor tracking
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot  = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.left = mouseX + 'px';
    cursorGlow.style.top  = mouseY + 'px';
});

(function animateDot() {
    dotX += (mouseX - dotX) * 0.12;
    dotY += (mouseY - dotY) * 0.12;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';
    requestAnimationFrame(animateDot);
})();

document.querySelectorAll('a, button, .radio-card, .btn-submit').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.style.width  = '18px';
        cursorDot.style.height = '18px';
        cursorDot.style.background = '#fff';
        cursorDot.style.boxShadow = '0 0 20px #f97316, 0 0 40px #ef4444';
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.style.width  = '8px';
        cursorDot.style.height = '8px';
        cursorDot.style.background = '#f97316';
        cursorDot.style.boxShadow = '0 0 12px #f97316, 0 0 24px #ef4444';
    });
});

// ── Particle canvas
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function rand(a, b) { return a + Math.random() * (b - a); }

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = rand(0, W);
        this.y = rand(0, H);
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(-0.8, -0.2);
        this.size = rand(0.5, 2);
        this.alpha = rand(0.1, 0.5);
        this.life = 1;
        this.decay = rand(0.003, 0.008);
        this.color = Math.random() > 0.5 ? '#f97316' : '#ef4444';
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.alpha = this.life * 0.5;
        if (this.life <= 0 || this.y < -10) this.reset();
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

(function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
})();

// ── Counter animation
function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ── Scroll reveal + trigger counters
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            setTimeout(() => {
                e.target.classList.add('visible');
                e.target.querySelectorAll('.stat-num').forEach(animateCounter);
            }, i * 80);
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.15, rootMargin: '-40px' });

document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));

// Trigger stat counters when hero stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.stat-num').forEach(animateCounter);
            statsObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.hero-stats').forEach(el => statsObserver.observe(el));

// ── 3D card tilt on mouse
document.querySelectorAll('.q-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(800px) rotateX(${-dy * 3}deg) rotateY(${dx * 4}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease, border-color 0.3s, box-shadow 0.3s';
    });
});

// ── Radio card selection
document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input').checked = true;
        updateProgress();
        document.getElementById('subError').classList.remove('show');
        // Ripple
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position:absolute;border-radius:50%;
            background:rgba(249,115,22,0.2);
            width:10px;height:10px;
            left:50%;top:50%;
            transform:translate(-50%,-50%) scale(0);
            animation:ripple 0.6s ease-out forwards;
            pointer-events:none;z-index:10;
        `;
        card.style.position = 'relative';
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});

// Inject ripple keyframe
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes ripple { to { transform:translate(-50%,-50%) scale(30); opacity:0; } }`;
document.head.appendChild(styleEl);

// ── Progress tracking
function updateProgress() {
    const fields = [
        document.getElementById('ign').value.trim(),
        document.getElementById('age').value.trim(),
        document.getElementById('timezone').value.trim(),
        document.querySelector('input[name="subscribed"]:checked') ? '1' : ''
    ];
    const filled = fields.filter(Boolean).length;
    const pct = Math.round((filled / 4) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressPct').textContent  = pct + '%';
}

document.querySelectorAll('.field').forEach(f => {
    f.addEventListener('input', updateProgress);
    f.addEventListener('blur', () => {
        if (f.value.trim()) {
            f.style.borderColor = 'rgba(34,197,94,0.4)';
            f.style.boxShadow   = '0 0 0 3px rgba(34,197,94,0.08)';
        }
    });
    f.addEventListener('focus', () => {
        f.style.borderColor = '';
        f.style.boxShadow   = '';
    });
});

// ── Form validation & submit
document.getElementById('submitBtn').addEventListener('click', () => {
    let valid = true;

    const ign = document.getElementById('ign');
    const ignErr = document.getElementById('ignError');
    if (!ign.value.trim()) {
        ignErr.classList.add('show');
        ign.style.borderColor = 'rgba(239,68,68,0.7)';
        valid = false;
    } else { ignErr.classList.remove('show'); }

    const age = document.getElementById('age');
    const ageErr = document.getElementById('ageError');
    const ageVal = parseInt(age.value, 10);
    if (!age.value.trim() || isNaN(ageVal) || ageVal < 1 || ageVal > 99) {
        ageErr.classList.add('show');
        age.style.borderColor = 'rgba(239,68,68,0.7)';
        valid = false;
    } else { ageErr.classList.remove('show'); }

    const tz = document.getElementById('timezone');
    const tzErr = document.getElementById('timezoneError');
    if (!tz.value.trim()) {
        tzErr.classList.add('show');
        tz.style.borderColor = 'rgba(239,68,68,0.7)';
        valid = false;
    } else { tzErr.classList.remove('show'); }

    const sub = document.querySelector('input[name="subscribed"]:checked');
    const subErr = document.getElementById('subError');
    if (!sub) {
        subErr.classList.add('show');
        valid = false;
    } else { subErr.classList.remove('show'); }

    if (!valid) {
        // Shake the button
        const btn = document.getElementById('submitBtn');
        btn.style.animation = 'none';
        btn.style.transform = 'translateX(-6px)';
        setTimeout(() => btn.style.transform = 'translateX(6px)', 60);
        setTimeout(() => btn.style.transform = 'translateX(-4px)', 120);
        setTimeout(() => btn.style.transform = 'translateX(4px)', 180);
        setTimeout(() => btn.style.transform = 'translateX(0)', 240);
        return;
    }

    // Show confirmation
    document.getElementById('confirmIgnDisplay').textContent = ign.value.trim();
    const overlay = document.getElementById('confirmOverlay');
    overlay.classList.add('show');

    // Burst particles
    for (let i = 0; i < 40; i++) {
        const p = new Particle();
        p.x = W / 2; p.y = H / 2;
        p.vy = rand(-3, -1);
        p.vx = rand(-2, 2);
        p.size = rand(1.5, 4);
        p.alpha = 0.9;
        p.decay = 0.015;
        particles.push(p);
    }
});

document.getElementById('confirmClose').addEventListener('click', () => {
    document.getElementById('confirmOverlay').classList.remove('show');
});

// ── Hero text flicker on load
window.addEventListener('load', () => {
    const desc = document.querySelector('.hero-desc');
    if (desc) {
        desc.style.opacity = '0';
        setTimeout(() => {
            desc.style.transition = 'opacity 1.5s ease';
            desc.style.opacity = '1';
        }, 1200);
    }
});
