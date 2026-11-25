/**
 * main.js — Navigation, Scroll Spy, Animations au défilement & Visionneuse CV
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressAndHeader();
    initMobileNav();
    initScrollSpy();
    initRevealAnimations();
    initCardSpotlight();
    initCvModal();
});

/**
 * Barre de progression en haut de page + ombre discrète sur le header
 */
function initScrollProgressAndHeader() {
    const progressBar = document.getElementById('scroll-progress');
    const header = document.getElementById('site-header');

    const updateOnScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

        if (progressBar) {
            progressBar.style.width = `${progress.toFixed(2)}%`;
        }
        if (header) {
            header.classList.toggle('is-scrolled', scrollTop > 16);
        }
    };

    window.addEventListener('scroll', updateOnScroll, { passive: true });
    updateOnScroll();
}

/**
 * Menu burger responsive (mobile)
 */
function initMobileNav() {
    const toggleBtn = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-links');

    if (!toggleBtn || !navMenu) return;

    const closeMenu = () => {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
            closeMenu();
            toggleBtn.focus();
        }
    });
}

/**
 * Scroll Spy — Met en surbrillance le lien de la section visible
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    if (!sections.length || !navLinks.length) return;

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const isMatch = link.getAttribute('data-section') === id;
            link.classList.toggle('is-active', isMatch);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        {
            rootMargin: '-35% 0px -55% 0px',
            threshold: 0
        }
    );

    sections.forEach((section) => observer.observe(section));
}

/**
 * Apparition fluide des blocs au défilement
 */
function initRevealAnimations() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.08
        }
    );

    revealEls.forEach((el) => observer.observe(el));
}

/**
 * Effet spotlight discret suivant le curseur sur les cartes
 */
function initCardSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.addEventListener('mousemove', (event) => {
        const card = event.target.closest('.tech-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
}

/**
 * Modale d'aperçu plein écran pour le CV
 */
function initCvModal() {
    const openBtn = document.getElementById('cv-open-modal');
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('cv-modal-close');

    if (!openBtn || !modal || !closeBtn) return;

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}
