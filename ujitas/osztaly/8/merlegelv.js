document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('[data-modal]');
    let lastTriggerEl = null;

    function openModal(modal, triggerEl) {
        if (!modal) return;
        lastTriggerEl = triggerEl || document.activeElement;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const closeBtn = modal.querySelector('.close-solution');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    function closeModal(modal) {
        if (!modal) return;

        if (modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
            lastTriggerEl.focus();
        }
    }

    triggers.forEach((trigger) => {
        const targetId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(targetId);

        trigger.addEventListener('click', () => openModal(modal, trigger));

        if (trigger.tagName !== 'BUTTON') {
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(modal, trigger);
                }
            });
        }
    });

    document.querySelectorAll('.solution-overlay').forEach((overlay) => {
        const closeBtn = overlay.querySelector('.close-solution');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(overlay));
        }
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const opened = document.querySelector('.solution-overlay.open');
            if (opened) closeModal(opened);
        }
    });
});