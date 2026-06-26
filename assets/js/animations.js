/* ── REVEAL SCROLL ───────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── SKILLS TICKER (clonado infinito) ────────── */
const skillsTrack = document.getElementById('skills-track');
if (skillsTrack) {
    Array.from(skillsTrack.children).forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        skillsTrack.appendChild(clone);
    });
}

/* ── CONTADORES ANIMADOS ─────────────────────── */
const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el       = entry.target;
        const target   = parseInt(el.dataset.target, 10);
        const suffix   = el.dataset.suffix || '';
        let current    = 0;
        const steps    = 1500 / 20;
        const increment = target / steps;

        const tick = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.ceil(current) + suffix;
                setTimeout(tick, 20);
            } else {
                el.textContent = target + suffix;
            }
        };

        tick();
        observer.unobserve(el);
    });
}, { threshold: 0.7 });

document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

/* ── PROCESO (notificaciones rotativas) ──────── */
const processContainer = document.getElementById('processPhone');
if (processContainer) {
    const notifications = Array.from(processContainer.querySelectorAll('.process-notification'));
    if (notifications.length > 0) {
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % notifications.length;
            const nextIndex = (currentIndex + 1) % notifications.length;
            notifications.forEach((notif, i) => {
                notif.classList.remove('active', 'next', 'away');
                if (i === currentIndex)  notif.classList.add('active');
                else if (i === nextIndex) notif.classList.add('next');
                else                      notif.classList.add('away');
            });
        }, 3500);
    }
}
