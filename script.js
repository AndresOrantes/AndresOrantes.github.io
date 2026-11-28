(() => {
    'use strict';

    // =========================================================================
    // 1. Mobile Navigation Drawer & Active Nav Scrollspy
    // =========================================================================
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (menuToggleBtn && mobileNavDrawer) {
        menuToggleBtn.addEventListener('click', () => {
            const isOpen = mobileNavDrawer.classList.toggle('is-open');
            menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        mobileNavDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                mobileNavDrawer.classList.remove('is-open');
                menuToggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const observedSections = ['about', 'experience', 'projects', 'education', 'continuined', 'contact']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if ('IntersectionObserver' in window && observedSections.length > 0) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const activeId = entry.target.id;
                        navItems.forEach((link) => {
                            link.classList.toggle('is-active', link.dataset.nav === activeId);
                        });
                    }
                });
            },
            { rootMargin: '-30% 0px -55% 0px', threshold: 0.05 }
        );

        observedSections.forEach((sec) => observer.observe(sec));
    }

    // =========================================================================
    // 2. Projects Section — See All Toggle & Glassmorphic Geometric Modal
    // =========================================================================
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const hiddenProjects = projectCards.filter((card) => card.classList.contains('hidden-project'));
    const seeMoreProjectsBtn = document.getElementById('seeMoreProjectsBtn');
    const seeMoreProjectsLabel = document.getElementById('seeMoreProjectsLabel');
    let showingAllProjects = false;

    if (seeMoreProjectsBtn) {
        const featuredCount = projectCards.length - hiddenProjects.length;
        if (hiddenProjects.length === 0) {
            seeMoreProjectsBtn.parentElement.hidden = true;
        } else {
            seeMoreProjectsLabel.textContent = `See All Projects (${projectCards.length})`;
            seeMoreProjectsBtn.addEventListener('click', () => {
                showingAllProjects = !showingAllProjects;
                hiddenProjects.forEach((card) => {
                    card.classList.toggle('hidden-project', !showingAllProjects);
                });
                seeMoreProjectsBtn.classList.toggle('is-expanded', showingAllProjects);
                seeMoreProjectsLabel.textContent = showingAllProjects
                    ? `Show Featured Projects (${featuredCount})`
                    : `See All Projects (${projectCards.length})`;
            });
        }
    }

    const modal = document.getElementById('projectModal');
    const modalFrame = document.getElementById('modalFrame');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const prevProjectBtn = document.getElementById('prevProjectBtn');
    const nextProjectBtn = document.getElementById('nextProjectBtn');
    const modalCategoryTop = document.getElementById('modalCategoryTop');
    const modalStatusBadge = document.getElementById('modalStatusBadge');
    const modalIcon = document.getElementById('modalIcon');
    const modalCategory = document.getElementById('modalCategory');
    const modalTechStack = document.getElementById('modalTechStack');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalActionArea = document.getElementById('modalActionArea');

    let activeProjectIdx = 0;
    let isClosingModal = false;
    let lastFocusedCard = null;

    function populateModal(idx) {
        const card = projectCards[idx];
        if (!card) return;
        activeProjectIdx = idx;

        const title = card.dataset.title || '';
        const category = card.dataset.category || '';
        const status = card.dataset.status || '';
        const iconClass = card.dataset.icon || 'fa-solid fa-code';
        const repoUrl = card.dataset.repo || '';
        const isPrivate = card.dataset.private === 'true';
        const stackItems = (card.dataset.stack || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        modalCategoryTop.textContent = category;
        modalCategory.textContent = category;
        modalTitle.textContent = title;
        modalIcon.className = iconClass;

        if (status) {
            modalStatusBadge.textContent = status;
            modalStatusBadge.hidden = false;
        } else {
            modalStatusBadge.hidden = true;
        }

        const detailsEl = card.querySelector('.project-details');
        modalDescription.innerHTML = detailsEl ? detailsEl.innerHTML : '';

        modalTechStack.innerHTML = '';
        stackItems.forEach((tag) => {
            const span = document.createElement('span');
            span.className = 'tech-chip';
            span.textContent = tag;
            modalTechStack.appendChild(span);
        });

        modalActionArea.innerHTML = '';
        if (isPrivate) {
            const ndaBadge = document.createElement('span');
            ndaBadge.className = 'modal-nda-badge';
            ndaBadge.innerHTML = '<i class="fa-solid fa-lock" aria-hidden="true"></i> Private Repository (NDA)';
            modalActionArea.appendChild(ndaBadge);
        } else if (repoUrl) {
            const repoLink = document.createElement('a');
            repoLink.className = 'btn btn--compact';
            repoLink.href = repoUrl;
            repoLink.target = '_blank';
            repoLink.rel = 'noopener noreferrer';
            repoLink.innerHTML = 'GitHub Repository <span aria-hidden="true">&#8599;</span>';
            modalActionArea.appendChild(repoLink);
        }
    }

    function replayUnmaskAnimation() {
        modalFrame.classList.remove('is-unmasking');
        void modalFrame.offsetWidth;
        modalFrame.classList.add('is-unmasking');
    }

    function openProjectModal(idx) {
        if (!modal || isClosingModal) return;
        lastFocusedCard = projectCards[idx] || null;
        populateModal(idx);
        modal.classList.remove('is-closing');
        modal.classList.add('is-open');
        replayUnmaskAnimation();
        document.body.style.overflow = 'hidden';
        if (closeModalBtn) closeModalBtn.focus();
    }

    function closeProjectModal() {
        if (!modal || !modal.classList.contains('is-open') || isClosingModal) return;
        isClosingModal = true;
        modalFrame.classList.remove('is-unmasking');
        modal.classList.remove('is-open');
        modal.classList.add('is-closing');
        window.setTimeout(() => {
            modal.classList.remove('is-closing');
            document.body.style.overflow = '';
            isClosingModal = false;
            if (lastFocusedCard) lastFocusedCard.focus();
        }, 155);
    }

    projectCards.forEach((card, idx) => {
        card.addEventListener('click', () => openProjectModal(idx));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProjectModal(idx);
            }
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeProjectModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProjectModal();
        });
    }

    if (prevProjectBtn) {
        prevProjectBtn.addEventListener('click', () => {
            const prevIdx = (activeProjectIdx - 1 + projectCards.length) % projectCards.length;
            populateModal(prevIdx);
            replayUnmaskAnimation();
        });
    }

    if (nextProjectBtn) {
        nextProjectBtn.addEventListener('click', () => {
            const nextIdx = (activeProjectIdx + 1) % projectCards.length;
            populateModal(nextIdx);
            replayUnmaskAnimation();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('is-open')) {
            if (e.key === 'Escape') closeProjectModal();
            else if (e.key === 'ArrowLeft' && prevProjectBtn) prevProjectBtn.click();
            else if (e.key === 'ArrowRight' && nextProjectBtn) nextProjectBtn.click();
        } else if (e.key === 'Escape' && mobileNavDrawer && mobileNavDrawer.classList.contains('is-open')) {
            mobileNavDrawer.classList.remove('is-open');
            if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // =========================================================================
    // 3. Continuing Education — Auto Type & Skill Filters + Inline Courses + See More
    // =========================================================================
    const CERT_INITIAL_LIMIT = 3;
    const certCells = Array.from(document.querySelectorAll('#continuingEdGrid .wire-cell'));
    const certTypeFiltersEl = document.getElementById('certTypeFilters');
    const certSkillFiltersEl = document.getElementById('certSkillFilters');
    const certEmptyEl = document.getElementById('continuingEdEmpty');
    const certMoreWrapEl = document.getElementById('continuingEdMoreWrap');
    const seeMoreCertsBtn = document.getElementById('seeMoreCertsBtn');
    const seeMoreCertsLabel = document.getElementById('seeMoreCertsLabel');
    const resetCertFiltersBtn = document.getElementById('resetCertFiltersBtn');

    let activeCertType = 'all';
    let activeCertSkill = 'all';
    let showingAllCerts = false;

    if (certCells.length > 0 && certTypeFiltersEl && certSkillFiltersEl) {
        // Parse skills from each card's data-skills attribute
        const allSkillsSet = new Set();
        certCells.forEach((cell) => {
            const skills = (cell.dataset.skills || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            cell._skills = skills;
            skills.forEach((sk) => allSkillsSet.add(sk));

            // Wire inline "+ N Courses" toggle if present
            const toggleBtn = cell.querySelector('.wire-toggle');
            const courseLinks = cell.querySelectorAll('.wire-course-list li');
            if (toggleBtn && courseLinks.length > 0) {
                toggleBtn.textContent = `+ ${courseLinks.length} Courses`;
                toggleBtn.addEventListener('click', () => {
                    const isOpen = cell.classList.toggle('is-open');
                    toggleBtn.setAttribute('aria-expanded', String(isOpen));
                    toggleBtn.textContent = isOpen
                        ? '− Hide Courses'
                        : `+ ${courseLinks.length} Courses`;
                });
            }
        });

        const allSkills = Array.from(allSkillsSet);

        function renderCardSkillButtons() {
            certCells.forEach((cell) => {
                const container = cell.querySelector('.wire-skills');
                if (!container) return;
                container.innerHTML = '';
                cell._skills.forEach((skill) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'wire-skill-btn' + (activeCertSkill === skill ? ' is-active' : '');
                    btn.textContent = skill;
                    btn.addEventListener('click', () => {
                        activeCertSkill = activeCertSkill === skill ? 'all' : skill;
                        showingAllCerts = false;
                        updateCertUI();
                    });
                    container.appendChild(btn);
                });
            });
        }

        function renderCertFilterBars() {
            const counts = {
                all: certCells.length,
                track: certCells.filter((c) => c.dataset.type === 'track').length,
                course: certCells.filter((c) => c.dataset.type === 'course').length,
                cert: certCells.filter((c) => c.dataset.type === 'cert').length
            };

            const typeDefs = [
                { key: 'all', label: `All (${counts.all})` },
                { key: 'track', label: `Tracks (${counts.track})` },
                { key: 'course', label: `Courses (${counts.course})` },
                { key: 'cert', label: `Certifications (${counts.cert})` }
            ];

            certTypeFiltersEl.innerHTML = '';
            typeDefs.forEach(({ key, label }) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'filter-pill' + (activeCertType === key ? ' is-active' : '');
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    activeCertType = key;
                    showingAllCerts = false;
                    updateCertUI();
                });
                certTypeFiltersEl.appendChild(btn);
            });

            certSkillFiltersEl.innerHTML = '';
            ['all', ...allSkills].forEach((skill) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'skill-pill' + (activeCertSkill === skill ? ' is-active' : '');
                btn.textContent = skill === 'all' ? 'All Skills' : skill;
                btn.addEventListener('click', () => {
                    activeCertSkill = skill;
                    showingAllCerts = false;
                    updateCertUI();
                });
                certSkillFiltersEl.appendChild(btn);
            });
        }

        function applyCertVisibility() {
            const matching = certCells.filter((cell) => {
                const matchType = activeCertType === 'all' || cell.dataset.type === activeCertType;
                const matchSkill = activeCertSkill === 'all' || cell._skills.includes(activeCertSkill);
                return matchType && matchSkill;
            });

            const visibleSet = new Set(
                showingAllCerts ? matching : matching.slice(0, CERT_INITIAL_LIMIT)
            );

            certCells.forEach((cell) => {
                cell.classList.toggle('is-hidden', !visibleSet.has(cell));
            });

            if (certEmptyEl) {
                certEmptyEl.hidden = matching.length > 0;
            }

            if (certMoreWrapEl && seeMoreCertsBtn && seeMoreCertsLabel) {
                if (matching.length > CERT_INITIAL_LIMIT) {
                    certMoreWrapEl.hidden = false;
                    const remaining = matching.length - CERT_INITIAL_LIMIT;
                    seeMoreCertsBtn.classList.toggle('is-expanded', showingAllCerts);
                    seeMoreCertsLabel.textContent = showingAllCerts
                        ? `Show Fewer (${CERT_INITIAL_LIMIT})`
                        : `See More Credentials (+${remaining})`;
                } else {
                    certMoreWrapEl.hidden = true;
                }
            }
        }

        function updateCertUI() {
            renderCertFilterBars();
            renderCardSkillButtons();
            applyCertVisibility();
        }

        if (seeMoreCertsBtn) {
            seeMoreCertsBtn.addEventListener('click', () => {
                showingAllCerts = !showingAllCerts;
                applyCertVisibility();
            });
        }

        if (resetCertFiltersBtn) {
            resetCertFiltersBtn.addEventListener('click', () => {
                activeCertType = 'all';
                activeCertSkill = 'all';
                showingAllCerts = false;
                updateCertUI();
            });
        }

        updateCertUI();
    }
})();
