/* ── MOBILE DRAWER ───────────────────────────── */
const menuButton   = document.getElementById('menuButton');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawer  = document.getElementById('closeDrawer');
const drawerLinks  = document.querySelectorAll('.drawer-link');

function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

menuButton.addEventListener('click', openDrawer);
closeDrawer.addEventListener('click', closeMobileDrawer);
drawerOverlay.addEventListener('click', closeMobileDrawer);
drawerLinks.forEach(link => link.addEventListener('click', closeMobileDrawer));

/* ── SOLUCIONES ACCORDION ────────────────────── */
document.querySelectorAll('.solution-toggle').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.solution-card').classList.toggle('open');
    });
});

/* ── FAQ ACCORDION ───────────────────────────── */
document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const icon   = btn.querySelector('.faq-icon');
        const isOpen = !answer.classList.contains('hidden');

        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = '');

        if (!isOpen) {
            answer.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        }
    });
});
