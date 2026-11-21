document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.green-hint-trigger');
    const cards = document.querySelectorAll('.floating-hint-card');

    function closeAllHints() {
        cards.forEach(card => card.classList.remove('active'));
        triggers.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }

    // 1. Zöld rávezető kérdések lebegő lapjainak nyitása/zárása a kapcsolódó sor mellett
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();

            const targetId = trigger.getAttribute('data-target');
            const targetCard = document.getElementById(targetId);
            if (!targetCard) return;

            const isAlreadyOpen = targetCard.classList.contains('active');
            closeAllHints();

            if (!isAlreadyOpen) {
                const parentRow = trigger.closest('.content-row');
                const parentCol = trigger.closest('.margin-col');

                if (parentRow && parentCol && window.innerWidth > 900) {
                    const rowRect = parentRow.getBoundingClientRect();
                    const colRect = parentCol.getBoundingClientRect();
                    const offsetTop = rowRect.top - colRect.top;
                    targetCard.style.top = `${offsetTop}px`;
                } else {
                    targetCard.style.top = '';
                }

                targetCard.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Magára a lebegő lapra kattintva ne záródjon be, de mellé kattintva eltűnik
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    document.addEventListener('click', () => {
        closeAllHints();
    });

    // 2. Fejtörő fejjel lefelé megoldásának kapcsolása
    const togglePuzzleBtn = document.getElementById('togglePuzzleBtn');
    const puzzleSolution = document.getElementById('puzzleSolution');

    if (togglePuzzleBtn && puzzleSolution) {
        togglePuzzleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = puzzleSolution.hasAttribute('hidden');

            if (isHidden) {
                puzzleSolution.removeAttribute('hidden');
                togglePuzzleBtn.setAttribute('aria-expanded', 'true');
                togglePuzzleBtn.textContent = '🔼 Megoldás elrejtése';
            } else {
                puzzleSolution.setAttribute('hidden', '');
                togglePuzzleBtn.setAttribute('aria-expanded', 'false');
                togglePuzzleBtn.textContent = '🔄 Megoldás megtekintése (fejjel lefelé)';
            }
        });
    }

    // 3. Emlékeztető modális ablak kezelése
    const openReminderBtn = document.getElementById('openReminderBtn');
    const closeReminderBtn = document.getElementById('closeReminderBtn');
    const reminderModal = document.getElementById('reminderModal');

    if (openReminderBtn && reminderModal) {
        openReminderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllHints();
            reminderModal.classList.add('active');
        });
    }

    if (closeReminderBtn && reminderModal) {
        closeReminderBtn.addEventListener('click', () => {
            reminderModal.classList.remove('active');
        });
    }

    if (reminderModal) {
        reminderModal.addEventListener('click', (e) => {
            if (e.target === reminderModal) {
                reminderModal.classList.remove('active');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllHints();
            if (reminderModal) {
                reminderModal.classList.remove('active');
            }
        }
    });
});