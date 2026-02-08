/**
 * UI components for Taric48 - 2048 Plugin
 */
import { GAME_ICON, VOLUME_ICON, MUTE_ICON } from './styles.js';
import { Game2048 } from './game2048.js';

let modal = null;
let gameInstance = null;

export function createNavbarButton(onClick) {
    const root = document.createElement('div');
    root.className = 'navigation-status-ticker has-incidents ember-view p2p-root';

    const button = document.createElement('div');
    button.className = 'ticker-button p2p-nav-item';
    button.innerHTML = GAME_ICON;
    button.title = 'Play 2048';

    button.addEventListener('click', onClick);

    root.appendChild(button);
    return root;
}

export function createHeaderButton(onClick) {
    const btn = document.createElement('div');
    btn.className = 'app-controls-button p2p-header-btn';
    btn.title = 'Play Taric48';
    btn.innerHTML = GAME_ICON;

    const svg = btn.querySelector('svg');
    if (svg) svg.classList.add('p2p-header-icon');

    btn.addEventListener('click', onClick);
    return btn;
}

export function showGameModal() {
    if (modal) return;

    const overlay = document.createElement('div');
    overlay.className = 'p2p-modal-overlay';

    overlay.innerHTML = `
        <div class="p2p-modal">
            <div class="p2p-modal-header">
                <span class="p2p-modal-title">Taric48</span>
                <div class="p2p-header-actions">
                    <button class="p2p-mute-btn" id="p2p-mute-toggle" title="Mute/Unmute">
                        ${localStorage.getItem('2048_is_muted') === 'true' ? MUTE_ICON : VOLUME_ICON}
                    </button>
                    <div class="p2p-info-wrapper">
                        <button class="p2p-info-btn">?</button>
                        <div class="p2p-info-tooltip">
                            <div class="p2p-info-list">
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_0.jpg')"></div>
                                    <span class="p2p-info-val">2</span><span>Classic Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_1.jpg')"></div>
                                    <span class="p2p-info-val">4</span><span>Emerald Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ezreal_9.jpg')"></div>
                                    <span class="p2p-info-val">8</span><span>Star Guardian Ezreal</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_3.jpg')"></div>
                                    <span class="p2p-info-val">16</span><span>Bloodstone Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_4.jpg')"></div>
                                    <span class="p2p-info-val">32</span><span>Pool Party Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Urgot_9.jpg')"></div>
                                    <span class="p2p-info-val">64</span><span>Pajama Urgot</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_9.jpg')"></div>
                                    <span class="p2p-info-val">128</span><span>Luminshield Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_18.jpg')"></div>
                                    <span class="p2p-info-val">256</span><span>Space Groove Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_27.jpg')"></div>
                                    <span class="p2p-info-val">512</span><span>Fatebreaker Taric</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Yuumi_11.jpg')"></div>
                                    <span class="p2p-info-val">1024</span><span>Heartseeker Yuumi</span>
                                </div>
                                <div class="p2p-info-item">
                                    <div class="p2p-info-img" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taric_2.jpg')"></div>
                                    <span class="p2p-info-val">2048</span><span>Fifth Age Taric</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="p2p-toggle-mode-btn" id="p2p-toggle-mode" title="Change Mode">123</button>
                    <div class="p2p-scale-controls">
                        <button class="p2p-scale-btn" id="p2p-zoom-out" title="Zoom Out">−</button>
                        <span class="p2p-scale-val" id="p2p-zoom-val">1x</span>
                        <button class="p2p-scale-btn" id="p2p-zoom-in" title="Zoom In">+</button>
                    </div>
                    <span class="p2p-close-btn">&times;</span>
                </div>
            </div>
            <div id="p2p-game-view" class="p2p-main-content">
                <!-- 2048 will be injected here -->
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    modal = overlay;
    const modalContent = overlay.querySelector('.p2p-modal');
    const header = overlay.querySelector('.p2p-modal-header');
    const gameView = overlay.querySelector('#p2p-game-view');
    const zoomIn = overlay.querySelector('#p2p-zoom-in');
    const zoomOut = overlay.querySelector('#p2p-zoom-out');
    const zoomVal = overlay.querySelector('#p2p-zoom-val');

    // Scaling Management (Fixed 3 stages)
    let currentStage = 1; // 1: Small, 2: Medium, 3: Large
    const STAGES = [
        { w: 260, h: 325, label: '1x' },
        { w: 390, h: 487.5, label: '1.5x' },
        { w: 520, h: 650, label: '2x' }
    ];

    const updateScale = () => {
        const stage = STAGES[currentStage - 1];
        modalContent.style.width = stage.w + 'px';
        modalContent.style.height = stage.h + 'px';
        zoomVal.innerText = stage.label;
        zoomIn.disabled = currentStage === 3;
        zoomOut.disabled = currentStage === 1;
    };

    zoomIn.onclick = (e) => {
        e.stopPropagation();
        if (currentStage < 3) {
            currentStage++;
            updateScale();
        }
    };

    zoomOut.onclick = (e) => {
        e.stopPropagation();
        if (currentStage > 1) {
            currentStage--;
            updateScale();
        }
    };

    // Drag Logic
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let startRect = { x: 0, y: 0 };

    header.onmousedown = (e) => {
        // Don't drag if clicking buttons
        if (e.target.closest('.p2p-scale-controls') || e.target.classList.contains('p2p-close-btn')) return;

        isDragging = true;
        const rect = modalContent.getBoundingClientRect();
        startPos = { x: e.clientX, y: e.clientY };
        startRect = { x: rect.left, y: rect.top };

        modalContent.style.transform = 'none';
        modalContent.style.margin = '0';
    };

    const onMouseMove = (e) => {
        if (isDragging) {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            let newX = startRect.x + dx;
            let newY = startRect.y + dy;

            // Client Boundaries
            const NAV_HEIGHT = 80; // Approximate height of LoL client top nav
            const windowW = window.innerWidth;
            const windowH = window.innerHeight;
            const modalRect = modalContent.getBoundingClientRect();

            // Constraint: Top (Don't cross nav bar)
            if (newY < NAV_HEIGHT) newY = NAV_HEIGHT;

            // Constraint: Left
            if (newX < 0) newX = 0;

            // Constraint: Right
            if (newX + modalRect.width > windowW) newX = windowW - modalRect.width;

            // Constraint: Bottom
            if (newY + modalRect.height > windowH) newY = windowH - modalRect.height;

            modalContent.style.left = newX + 'px';
            modalContent.style.top = newY + 'px';
        }
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initialize Game
    gameInstance = new Game2048(gameView);
    overlay.querySelector('#p2p-toggle-mode').onclick = () => {
        if (gameInstance) gameInstance.toggleMode();
    };
    updateScale(); // Initial state

    const closeHandler = () => {
        if (modalContent) {
            modalContent.classList.add('p2p-modal-closing');

            // Wait for animation to finish
            setTimeout(() => {
                if (gameInstance) {
                    gameInstance.destroy();
                    gameInstance = null;
                }
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                if (overlay.parentNode) document.body.removeChild(overlay);
                modal = null;
            }, 300); // Match CSS animation duration
        }
    };

    overlay.querySelector('.p2p-close-btn').onclick = (e) => {
        e.stopPropagation();
        closeHandler();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeHandler();
        }
    };
}
