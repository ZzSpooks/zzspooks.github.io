/**
 * konami-snake.js — Easter Egg Konami Code (↑ ↑ ↓ ↓ ← → ← → B A)
 * Ouvre un mini-jeu Snake néon dans une pop-up animée.
 */

document.addEventListener('DOMContentLoaded', () => {
    const KONAMI_SEQUENCE = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a'
    ];

    const modal = document.getElementById('snake-modal');
    const closeBtn = document.getElementById('snake-close-btn');
    const canvas = document.getElementById('snake-canvas');
    const scoreEl = document.getElementById('snake-score');
    const highScoreEl = document.getElementById('snake-highscore');
    const overlay = document.getElementById('snake-overlay');
    const overlayTitle = document.getElementById('snake-overlay-title');
    const overlaySub = document.getElementById('snake-overlay-sub');
    const actionBtn = document.getElementById('snake-action-btn');
    const pauseBtn = document.getElementById('snake-pause-btn');

    if (!modal || !canvas) return;

    const ctx = canvas.getContext('2d');
    const GRID_SIZE = 20;
    const BASE_SPEED_MS = 125;
    const MIN_SPEED_MS = 68;
    const STORAGE_KEY = 'mg_snake_highscore';

    let konamiCursor = 0;
    let gameLoopId = null;
    let isOpen = false;
    let isPaused = false;
    let isGameOver = false;

    let snake = [];
    let direction = { x: 1, y: 0 };
    let inputQueue = [];
    let food = { x: 14, y: 10 };
    let score = 0;
    let highScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
    let currentSpeed = BASE_SPEED_MS;

    if (highScoreEl) {
        highScoreEl.textContent = String(highScore);
    }

    // Adaptation Retina / HiDPI pour un rendu net du canvas
    const setupCanvasDpi = () => {
        const size = 380;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return size;
    };

    const LOGICAL_SIZE = setupCanvasDpi();
    const CELL_SIZE = LOGICAL_SIZE / GRID_SIZE;

    /**
     * Détection du Konami Code
     */
    document.addEventListener('keydown', (event) => {
        if (isOpen) {
            handleGameKeydown(event);
            return;
        }

        if (event.key === 'Shift' || event.key === 'CapsLock') return;

        const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        const expected = KONAMI_SEQUENCE[konamiCursor];

        if (pressed === expected) {
            konamiCursor += 1;
            if (konamiCursor === KONAMI_SEQUENCE.length) {
                konamiCursor = 0;
                openSnakeModal();
            }
        } else {
            // Permet de récupérer si l'utilisateur appuie sur ↑ pour recommencer la séquence
            konamiCursor = pressed === KONAMI_SEQUENCE[0] ? 1 : 0;
        }
    });

    const openSnakeModal = () => {
        isOpen = true;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        resetAndStartGame();
        closeBtn?.focus();
    };

    const closeSnakeModal = () => {
        isOpen = false;
        stopLoop();
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const resetAndStartGame = () => {
        stopLoop();
        snake = [
            { x: 9, y: 10 },
            { x: 8, y: 10 },
            { x: 7, y: 10 }
        ];
        direction = { x: 1, y: 0 };
        inputQueue = [];
        score = 0;
        currentSpeed = BASE_SPEED_MS;
        isPaused = false;
        isGameOver = false;

        updateScoreUI();
        spawnFood();
        hideOverlay();
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        draw();
        scheduleNextTick();
    };

    const stopLoop = () => {
        if (gameLoopId !== null) {
            clearTimeout(gameLoopId);
            gameLoopId = null;
        }
    };

    const scheduleNextTick = () => {
        stopLoop();
        if (!isOpen || isPaused || isGameOver) return;
        gameLoopId = setTimeout(() => {
            stepGame();
            draw();
            if (!isGameOver && !isPaused) {
                scheduleNextTick();
            }
        }, currentSpeed);
    };

    const togglePause = () => {
        if (!isOpen || isGameOver) return;
        isPaused = !isPaused;

        if (isPaused) {
            stopLoop();
            if (pauseBtn) pauseBtn.textContent = 'Reprendre';
            showOverlay('PAUSE', 'Appuyez sur Espace ou Reprendre pour continuer.', 'Reprendre', false);
        } else {
            if (pauseBtn) pauseBtn.textContent = 'Pause';
            hideOverlay();
            scheduleNextTick();
        }
    };

    const stepGame = () => {
        if (inputQueue.length > 0) {
            direction = inputQueue.shift();
        }

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        // Collision murs
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            triggerGameOver();
            return;
        }

        // Collision corps (sauf la queue si elle avance sans grandir)
        const willEat = head.x === food.x && head.y === food.y;
        const bodyToCheck = willEat ? snake : snake.slice(0, -1);
        if (bodyToCheck.some((seg) => seg.x === head.x && seg.y === head.y)) {
            triggerGameOver();
            return;
        }

        snake.unshift(head);

        if (willEat) {
            score += 10;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem(STORAGE_KEY, String(highScore));
            }
            currentSpeed = Math.max(MIN_SPEED_MS, BASE_SPEED_MS - Math.floor(score / 20) * 4);
            updateScoreUI();
            spawnFood();
        } else {
            snake.pop();
        }
    };

    const triggerGameOver = () => {
        isGameOver = true;
        stopLoop();
        showOverlay(
            'GAME OVER',
            `Score final : ${score} pts — Record : ${highScore} pts`,
            'Rejouer',
            true
        );
    };

    const spawnFood = () => {
        const freeCells = [];
        for (let x = 0; x < GRID_SIZE; x += 1) {
            for (let y = 0; y < GRID_SIZE; y += 1) {
                if (!snake.some((seg) => seg.x === x && seg.y === y)) {
                    freeCells.push({ x, y });
                }
            }
        }
        if (freeCells.length === 0) {
            triggerGameOver();
            return;
        }
        food = freeCells[Math.floor(Math.random() * freeCells.length)];
    };

    const queueDirection = (nextDir) => {
        const lastPlanned = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
        const isOpposite = nextDir.x === -lastPlanned.x && nextDir.y === -lastPlanned.y;
        const isSame = nextDir.x === lastPlanned.x && nextDir.y === lastPlanned.y;

        if (!isOpposite && !isSame && inputQueue.length < 2) {
            inputQueue.push(nextDir);
        }
    };

    const handleGameKeydown = (event) => {
        const key = event.key;

        if (key === 'Escape') {
            event.preventDefault();
            closeSnakeModal();
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            event.preventDefault();
        }

        if (key === ' ' || key.toLowerCase() === 'p') {
            if (isGameOver) {
                resetAndStartGame();
            } else {
                togglePause();
            }
            return;
        }

        if (key === 'Enter' && isGameOver) {
            resetAndStartGame();
            return;
        }

        if (isPaused || isGameOver) return;

        const lower = key.toLowerCase();
        if (key === 'ArrowUp' || lower === 'w' || lower === 'z') {
            queueDirection({ x: 0, y: -1 });
        } else if (key === 'ArrowDown' || lower === 's') {
            queueDirection({ x: 0, y: 1 });
        } else if (key === 'ArrowLeft' || lower === 'a' || lower === 'q') {
            queueDirection({ x: -1, y: 0 });
        } else if (key === 'ArrowRight' || lower === 'd') {
            queueDirection({ x: 1, y: 0 });
        }
    };

    const draw = () => {
        // Fond noir profond
        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

        // Grille subtile
        ctx.strokeStyle = 'rgba(28, 37, 54, 0.45)';
        ctx.lineWidth = 1;
        for (let i = 1; i < GRID_SIZE; i += 1) {
            const pos = i * CELL_SIZE;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, LOGICAL_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(LOGICAL_SIZE, pos);
            ctx.stroke();
        }

        // Pomme / Nœud de données néon
        const fx = food.x * CELL_SIZE + CELL_SIZE / 2;
        const fy = food.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(fx, fy, CELL_SIZE * 0.34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Serpent
        snake.forEach((seg, index) => {
            const pad = index === 0 ? 1.5 : 2.5;
            const x = seg.x * CELL_SIZE + pad;
            const y = seg.y * CELL_SIZE + pad;
            const size = CELL_SIZE - pad * 2;
            const ratio = 1 - index / Math.max(snake.length + 2, 6);

            ctx.save();
            if (index === 0) {
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#00d4ff';
            } else {
                ctx.fillStyle = `rgba(0, 212, 255, ${Math.max(0.28, ratio * 0.85)})`;
            }

            drawRoundedRect(ctx, x, y, size, size, 4);
            ctx.fill();
            ctx.restore();
        });
    };

    const updateScoreUI = () => {
        if (scoreEl) scoreEl.textContent = String(score);
        if (highScoreEl) highScoreEl.textContent = String(highScore);
    };

    const showOverlay = (title, sub, btnText, gameOverStyle) => {
        if (!overlay) return;
        if (overlayTitle) {
            overlayTitle.textContent = title;
            overlayTitle.classList.toggle('is-gameover', Boolean(gameOverStyle));
        }
        if (overlaySub) overlaySub.textContent = sub;
        if (actionBtn) actionBtn.textContent = btnText;
        overlay.classList.add('is-visible');
    };

    const hideOverlay = () => {
        overlay?.classList.remove('is-visible');
    };

    // Boutons UI de la modale
    closeBtn?.addEventListener('click', closeSnakeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeSnakeModal();
        }
    });

    pauseBtn?.addEventListener('click', togglePause);
    actionBtn?.addEventListener('click', () => {
        if (isGameOver) {
            resetAndStartGame();
        } else if (isPaused) {
            togglePause();
        }
    });

    // D-pad tactile (mobile / tablette)
    document.querySelectorAll('.dpad-btn[data-dir]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (isPaused || isGameOver) return;
            const dir = btn.dataset.dir;
            if (dir === 'up') queueDirection({ x: 0, y: -1 });
            if (dir === 'down') queueDirection({ x: 0, y: 1 });
            if (dir === 'left') queueDirection({ x: -1, y: 0 });
            if (dir === 'right') queueDirection({ x: 1, y: 0 });
        });
    });

    // Swipe tactile sur le canvas
    let touchStart = null;
    canvas.addEventListener(
        'touchstart',
        (e) => {
            const touch = e.touches[0];
            touchStart = { x: touch.clientX, y: touch.clientY };
        },
        { passive: true }
    );

    canvas.addEventListener(
        'touchend',
        (e) => {
            if (!touchStart || isPaused || isGameOver) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStart.x;
            const dy = touch.clientY - touchStart.y;
            touchStart = null;

            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                queueDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
            } else {
                queueDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
            }
        },
        { passive: true }
    );
});

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
