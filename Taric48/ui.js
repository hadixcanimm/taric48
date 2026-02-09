/**
 * UI components for Taric48 - 2048 Plugin
 */
import { GAME_ICON, VOLUME_ICON, MUTE_ICON, SETTINGS_ICON, NUM_ICON } from './styles.js';
import { Game2048 } from './game2048.js';
import { FlappyTaric } from './flappyTaric.js';
import { Tetris } from './tetris.js';

// Global state to allow multiple windows and restoration
let modalCount = 0;
const closedWindowsLog = [];
const activeModals = {};

export function createNavbarButton(onClick) {
    const root = document.createElement('div');
    root.className = 'navigation-status-ticker has-incidents ember-view p2p-root';

    const button = document.createElement('div');
    button.className = 'ticker-button p2p-nav-item';
    button.innerHTML = GAME_ICON;
    button.title = 'Play Games';

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

export function showGameModal(gameType = 'taric48') {
    // Prevent multiple instances
    if (activeModals[gameType]) {
        const existing = activeModals[gameType];
        if (existing.show) existing.show();
        if (existing.shake) existing.shake();
        return;
    }

    let gameInstance = null;
    let activeGameType = gameType;
    let hasInteractedWithLauncher = false;
    let lastTaskbarPos = null;
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let startRect = { x: 0, y: 0 };

    const overlay = document.createElement('div');
    overlay.className = 'p2p-modal-overlay';

    overlay.innerHTML = `
        <div class="p2p-modal p2p-animate-enter ${gameType === 'flappy' ? 'flappy' : (gameType === 'tetris' ? 'tetris' : '')}">
            <div class="p2p-modal-header">
                <span class="p2p-modal-title">Games</span>
                <div class="p2p-header-actions">
                    <button class="p2p-header-action-btn" id="p2p-header-action" style="${gameType === 'tetris' ? '' : 'display:none'}">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <div class="p2p-settings-container">
                        <button class="p2p-settings-btn" id="p2p-settings-toggle" title="Settings">
                            ${SETTINGS_ICON}
                        </button>
                        <div class="p2p-settings-menu" id="p2p-settings-menu">
                            <div class="p2p-setting-item">
                                <span>Sound</span>
                                <label class="p2p-toggle-switch">
                                    <input type="checkbox" id="p2p-setting-muted" ${localStorage.getItem(gameType + '_is_muted') !== 'true' ? 'checked' : ''}>
                                    <span class="p2p-toggle-slider"></span>
                                </label>
                            </div>
                            <div class="p2p-settings-extra"></div>
                        </div>
                    </div>
                    <div class="p2p-info-wrapper">
                        <div class="p2p-info-btn" id="p2p-game-btn" role="button" aria-label="Game Info & Launcher">?</div>
                        <div class="p2p-info-tooltip">
                            <div id="p2p-guide-content"></div>
                        </div>
                    </div>
                    <div class="p2p-scale-controls">
                        <button class="p2p-scale-btn" id="p2p-zoom-out" title="Zoom Out">−</button>
                        <span class="p2p-scale-val" id="p2p-zoom-val">1x</span>
                        <button class="p2p-scale-btn" id="p2p-zoom-in" title="Zoom In">+</button>
                    </div>
                    <span class="p2p-minimize-btn" title="Minimize">_</span>
                    <span class="p2p-close-btn">&times;</span>
                </div>
            </div>
            <div id="p2p-game-view" class="p2p-main-content"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const modalContent = overlay.querySelector('.p2p-modal');
    modalContent.addEventListener('animationend', () => {
        modalContent.classList.remove('p2p-animate-enter');
    }, { once: true });

    modalContent.style.top = (100 + (modalCount % 6) * 40) + 'px';
    modalContent.style.left = (280 + (modalCount % 6) * 40) + 'px';
    modalCount++;

    const header = overlay.querySelector('.p2p-modal-header');
    const gameView = overlay.querySelector('#p2p-game-view');
    const zoomIn = overlay.querySelector('#p2p-zoom-in');
    const zoomOut = overlay.querySelector('#p2p-zoom-out');
    const zoomVal = overlay.querySelector('#p2p-zoom-val');
    const guideContent = overlay.querySelector('#p2p-guide-content');
    const settingsExtra = overlay.querySelector('.p2p-settings-extra');
    const actionBtn = overlay.querySelector('#p2p-header-action');

    const updatePauseIcon = (isPaused) => {
        if (activeGameType !== 'tetris') return;
        actionBtn.innerHTML = isPaused
            ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
            : '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    };

    let currentStage = 1;
    let STAGES = [];

    const initGame = (type) => {
        if (gameInstance) gameInstance.destroy();
        gameView.innerHTML = '';
        activeGameType = type;

        // Set Stages based on type
        if (type === 'flappy') {
            STAGES = [
                { w: 480, h: 320, label: '1x' },
                { w: 624, h: 416, label: '1.3x' },
                { w: 768, h: 512, label: '1.6x' }
            ];
        } else if (type === 'tetris') {
            STAGES = [
                { w: 350, h: 400, label: '1x' },
                { w: 455, h: 520, label: '1.3x' },
                { w: 560, h: 640, label: '1.6x' }
            ];
        } else {
            STAGES = [
                { w: 260, h: 325, label: '1x' },
                { w: 390, h: 487.5, label: '1.5x' },
                { w: 520, h: 650, label: '2x' }
            ];
        }

        if (type === 'taric48') gameInstance = new Game2048(gameView);
        else if (type === 'flappy') gameInstance = new FlappyTaric(gameView);
        else if (type === 'tetris') gameInstance = new Tetris(gameView);

        // Update Title
        const titleEl = overlay.querySelector('.p2p-modal-title');
        if (titleEl) {
            if (type === 'tetris') titleEl.innerText = 'Tetric';
            else titleEl.innerText = type === 'flappy' ? 'Flappy Taric' : 'Taric48';
        }

        // Update Guide
        updateGuide(type);
        updateExtraSettings(type);
        updateScale();

        // Update Header Button Visibility
        actionBtn.style.display = type === 'tetris' ? 'flex' : 'none';
        if (type === 'tetris') updatePauseIcon(false);
    };

    const updateGuide = (type) => {
        if (type === 'taric48') {
            const mappings = [
                { v: 2, n: 'Taric', id: 'Taric', s: 0 },
                { v: 4, n: 'Emerald', id: 'Taric', s: 1 },
                { v: 8, n: 'Ezreal', id: 'Ezreal', s: 9 },
                { v: 16, n: 'Fifth Age', id: 'Taric', s: 3 },
                { v: 32, n: 'Bloodstone', id: 'Taric', s: 4 },
                { v: 64, n: 'Urgot', id: 'Urgot', s: 9 },
                { v: 128, n: 'Pool Party', id: 'Taric', s: 9 },
                { v: 256, n: 'Luminshield', id: 'Taric', s: 18 },
                { v: 512, n: 'Space Groove', id: 'Taric', s: 27 },
                { v: 1024, n: 'Yuumi', id: 'Yuumi', s: 11 },
                { v: 2048, n: 'Armor Art', id: 'Taric', s: 2 }
            ];

            guideContent.innerHTML = `
                <div style="color: #c8aa6e; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #463714; padding-bottom: 5px; display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">🎮</span> SKIN MAPPINGS
                </div>
                <div style="font-size: 11px; margin-bottom: 10px; color: #f0e6d2; opacity: 0.8;">Merge gems to unlock these skins:</div>
                <div class="p2p-info-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; padding: 5px 0;">
                    ${mappings.map(m => `
                        <div class="p2p-info-item" style="border-bottom: 1px solid rgba(200, 170, 110, 0.1); padding: 4px 0;">
                            <div class="p2p-info-img" style="background-image: url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${m.id}_${m.s}.jpg); background-size: 160%; background-position: center 10%;"></div>
                            <span class="p2p-info-val" style="min-width: 25px; font-size: 11px; margin-left: 4px;">${m.v}</span>
                            <span style="opacity: 0.9; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;" title="${m.n}">${m.n}</span>
                        </div>
                    `).join('')}
                </div>`;
        }
        else if (type === 'flappy') {
            guideContent.innerHTML = `
                <div style="color: #c8aa6e; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #463714; padding-bottom: 4px;">🎮 FLAPPY TARIC GUIDE</div>
                <div style="font-size: 11px; color: #f0e6d2; line-height: 1.5; text-align: left;">
                    <p>• Jump with <b>Space</b> or <b>Left Click</b>.</p>
                    <p>• Scoring: Pass through pipes.</p>
                    <p>• Level Up: Offers 3 unique cards.</p>
                </div>`;
        } else if (type === 'tetris') {
            guideContent.innerHTML = `
                <div style="color: #c8aa6e; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #463714; padding-bottom: 4px;">🎮 TETRIC</div>
                <div style="font-size: 11px; color: #f0e6d2; line-height: 1.5; text-align: left;">
                    <p>• <b>Arrows</b> or <b>WASD</b>: Move/Rotate</p>
                    <p>• <b>Space</b>: Hard Drop</p>
                    <p>• Clear rows for high score.</p>
                </div>`;
        }
    };

    const updateExtraSettings = (type) => {
        settingsExtra.innerHTML = '';
        if (type === 'taric48') {
            settingsExtra.innerHTML = `
                <div class="p2p-setting-item"><span>Skin / Mode</span><button class="p2p-btn" id="p2p-toggle-skin" style="font-size:10px; min-height: 20px; padding: 0 10px;">CHANGE</button></div>
                <div class="p2p-setting-item"><span>Particles</span><label class="p2p-toggle-switch"><input type="checkbox" id="p2p-setting-particles" ${localStorage.getItem('2048_particles') !== 'false' ? 'checked' : ''}><span class="p2p-toggle-slider"></span></label></div>
                <div class="p2p-setting-item"><span>Vibration</span><label class="p2p-toggle-switch"><input type="checkbox" id="p2p-setting-vibration" ${localStorage.getItem('2048_vibration') !== 'false' ? 'checked' : ''}><span class="p2p-toggle-slider"></span></label></div>`;

            overlay.querySelector('#p2p-toggle-skin').onclick = (e) => {
                e.stopPropagation();
                if (gameInstance && gameInstance.toggleMode) {
                    gameInstance.toggleMode();
                    if (gameInstance.playSound) gameInstance.playSound('move');
                }
            };
        } else if (type === 'flappy') {
            settingsExtra.innerHTML = `
                <div class="p2p-setting-item"><span>Shake</span><label class="p2p-toggle-switch"><input type="checkbox" id="p2p-setting-shake" ${localStorage.getItem('flappy_shake') !== 'false' ? 'checked' : ''}><span class="p2p-toggle-slider"></span></label></div>
                <div class="p2p-setting-item"><span>Auto-Pause</span><label class="p2p-toggle-switch"><input type="checkbox" id="p2p-setting-pause" ${localStorage.getItem('flappy_pause_on_leave') !== 'false' ? 'checked' : ''}><span class="p2p-toggle-slider"></span></label></div>`;
        } else if (type === 'tetris') {
            settingsExtra.innerHTML = `
                <div class="p2p-setting-item"><span>Screen Shake</span><label class="p2p-toggle-switch"><input type="checkbox" id="p2p-setting-shake" ${localStorage.getItem('tetris_shake') !== 'false' ? 'checked' : ''}><span class="p2p-toggle-slider"></span></label></div>`;
        }
    };

    const updateScale = () => {
        const stage = STAGES[currentStage - 1];
        modalContent.style.width = stage.w + 'px';
        modalContent.style.height = stage.h + 'px';
        zoomVal.innerText = stage.label;
        zoomIn.disabled = currentStage === 3;
        zoomOut.disabled = currentStage === 1;
    };

    zoomIn.onclick = (e) => { e.stopPropagation(); if (currentStage < 3) { currentStage++; updateScale(); } };
    zoomOut.onclick = (e) => { e.stopPropagation(); if (currentStage > 1) { currentStage--; updateScale(); } };

    // Header Logic
    header.onmousedown = (e) => {
        if (e.target.closest('.p2p-header-actions') || e.target.classList.contains('p2p-close-btn')) return;
        isDragging = true;
        const rect = modalContent.getBoundingClientRect();
        startPos = { x: e.clientX, y: e.clientY };
        startRect = { x: rect.left, y: rect.top };
        modalContent.style.transform = 'none';
        modalContent.style.margin = '0';
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        let newX = startRect.x + (e.clientX - startPos.x);
        let newY = startRect.y + (e.clientY - startPos.y);
        const NAV_HEIGHT = 80;
        if (newY < NAV_HEIGHT) newY = NAV_HEIGHT;
        if (newX < 0) newX = 0;
        if (newX + modalContent.offsetWidth > window.innerWidth) newX = window.innerWidth - modalContent.offsetWidth;
        if (newY + modalContent.offsetHeight > window.innerHeight) newY = window.innerHeight - modalContent.offsetHeight;
        modalContent.style.left = newX + 'px';
        modalContent.style.top = newY + 'px';
    };

    const onMouseUp = () => { isDragging = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initialize Game
    initGame(gameType);

    // Context Menu / Launcher
    const gameBtn = overlay.querySelector('#p2p-game-btn');
    const triggerLauncher = (e) => { e.preventDefault(); e.stopPropagation(); openLauncher(); };
    gameBtn.addEventListener('contextmenu', triggerLauncher);
    gameBtn.onclick = () => {
        if (!hasInteractedWithLauncher) { openLauncher(); hasInteractedWithLauncher = true; }
        else if (closedWindowsLog.length > 0) showGameModal(closedWindowsLog.pop());
        else openLauncher();
    };

    const openLauncher = () => { showLauncherModal((newType) => showGameModal(newType)); };

    actionBtn.onclick = (e) => {
        e.stopPropagation();
        if (gameInstance && activeGameType === 'tetris') {
            const isPaused = gameInstance.togglePause();
            updatePauseIcon(isPaused);
        }
    };

    const triggerShake = () => {
        // Bring to front
        overlay.style.zIndex = '10001';
        setTimeout(() => { overlay.style.zIndex = '9999'; }, 1000); // Temporary boost

        modalContent.classList.remove('shake-anim');
        void modalContent.offsetWidth;
        modalContent.classList.add('shake-anim');
        setTimeout(() => modalContent.classList.remove('shake-anim'), 500);
    };

    let activeTbItem = null;

    const showHandler = () => {
        if (overlay.style.display === 'none') {
            overlay.style.display = 'block';
            if (activeTbItem) {
                activeTbItem.remove();
                activeTbItem = null;
            }
        }
        // Force bring to front (simple way: move to end of body)
        document.body.appendChild(overlay);
    };

    // Track instance
    activeModals[activeGameType] = {
        shake: triggerShake,
        show: showHandler
    };

    // Minimize logic
    const minimizeHandler = (e) => {
        if (e) e.stopPropagation();
        if (gameInstance) {
            gameInstance.pause();
            updatePauseIcon(true);
        }
        overlay.style.display = 'none';
        if (activeTbItem) activeTbItem.remove();

        let tb = document.querySelector('.p2p-taskbar');
        if (!tb) {
            tb = document.createElement('div');
            tb.className = 'p2p-taskbar';
            document.body.appendChild(tb);
        }

        const tbItem = document.createElement('div');
        tbItem.className = 'p2p-taskbar-item';
        activeTbItem = tbItem;
        const icon = activeGameType === 'flappy' ? '🐦' : (activeGameType === 'tetris' ? '🧩' : '💎');
        tbItem.innerHTML = `<span>${icon}</span>`;

        // Use last position or default to bottom left
        const existingCount = tb.querySelectorAll('.p2p-taskbar-item').length;
        let currentPos = lastTaskbarPos || { x: 30, y: window.innerHeight - 100 - (existingCount * 60) };
        tbItem.style.position = 'fixed';
        tbItem.style.left = currentPos.x + 'px';
        tbItem.style.top = currentPos.y + 'px';

        let isTbDragging = false;
        let tbStartMouse = { x: 0, y: 0 };
        let tbStartRect = { x: 0, y: 0 };
        let hasMoved = false;

        tbItem.onmousedown = (me) => {
            me.preventDefault();
            me.stopPropagation();
            isTbDragging = true;
            hasMoved = false;
            tbStartMouse = { x: me.clientX, y: me.clientY };
            const rect = tbItem.getBoundingClientRect();
            tbStartRect = { x: rect.left, y: rect.top };
        };

        const onTbMouseMove = (me) => {
            if (!isTbDragging) return;
            const dx = me.clientX - tbStartMouse.x;
            const dy = me.clientY - tbStartMouse.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
            let nx = tbStartRect.x + dx;
            let ny = tbStartRect.y + dy;
            nx = Math.max(10, Math.min(window.innerWidth - 60, nx));
            ny = Math.max(10, Math.min(window.innerHeight - 60, ny));
            tbItem.style.left = nx + 'px';
            tbItem.style.top = ny + 'px';
            lastTaskbarPos = { x: nx, y: ny };
        };

        const onTbMouseUp = () => {
            if (!isTbDragging) return;
            isTbDragging = false;
            window.removeEventListener('mousemove', onTbMouseMove);
            window.removeEventListener('mouseup', onTbMouseUp);
            if (!hasMoved) {
                showHandler();
            }
        };

        window.addEventListener('mousemove', onTbMouseMove);
        window.addEventListener('mouseup', onTbMouseUp);

        tb.appendChild(tbItem);
    };

    overlay.querySelector('.p2p-minimize-btn').onclick = minimizeHandler;

    // Close
    const closeHandler = () => {
        modalContent.classList.add('p2p-modal-closing');
        setTimeout(() => {
            if (gameInstance) gameInstance.destroy();
            delete activeModals[activeGameType]; // Clean up
            closedWindowsLog.push(activeGameType);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            overlay.remove();
        }, 300);
    };

    overlay.querySelector('.p2p-close-btn').onclick = closeHandler;

    const settingsMenu = overlay.querySelector('#p2p-settings-menu');

    // Link settings with modal events
    const updateGameSettings = () => {
        if (!gameInstance) return;
        const settings = {
            muted: !overlay.querySelector('#p2p-setting-muted').checked,
        };

        if (activeGameType === 'taric48') {
            settings.particles = overlay.querySelector('#p2p-setting-particles')?.checked;
            settings.vibration = overlay.querySelector('#p2p-setting-vibration')?.checked;
        } else if (activeGameType === 'flappy') {
            settings.shake = overlay.querySelector('#p2p-setting-shake')?.checked;
            settings.pauseOnLeave = overlay.querySelector('#p2p-setting-pause')?.checked;
        } else if (activeGameType === 'tetris') {
            settings.shake = overlay.querySelector('#p2p-setting-shake')?.checked;
        }

        gameInstance.updateSettings(settings);

        // Save
        localStorage.setItem(activeGameType + '_is_muted', settings.muted);
        if (activeGameType === 'taric48') {
            localStorage.setItem('2048_particles', settings.particles);
            localStorage.setItem('2048_vibration', settings.vibration);
        } else if (activeGameType === 'flappy') {
            localStorage.setItem('flappy_shake', settings.shake);
            localStorage.setItem('flappy_pause_on_leave', settings.pauseOnLeave);
        } else if (activeGameType === 'tetris') {
            localStorage.setItem('tetris_shake', settings.shake);
        }
    };

    settingsMenu.addEventListener('change', updateGameSettings);

    const settingsToggle = overlay.querySelector('#p2p-settings-toggle');
    settingsToggle.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        settingsMenu.classList.toggle('visible');
    };

    // Close settings if clicked outside
    overlay.onclick = (e) => {
        if (!e.target.closest('.p2p-settings-container')) {
            settingsMenu.classList.remove('visible');
        }
    };
}

export function showLauncherModal(onSelect) {
    const overlay = document.createElement('div');
    overlay.className = 'p2p-modal-overlay';
    overlay.style.zIndex = '40000';
    overlay.innerHTML = `
        <div class="p2p-modal p2p-launcher-modal" style="position: fixed; top: 150px; left: 320px;">
            <div class="p2p-modal-header">
                <span class="p2p-modal-title">Game Launcher</span>
                <span class="p2p-close-btn">&times;</span>
            </div>
            <div class="p2p-launcher-grid">
                <div class="p2p-launcher-item" data-game="taric48">
                    <div class="p2p-launcher-icon">💎</div>
                    <div class="p2p-launcher-name">Taric48</div>
                    <div class="p2p-launcher-desc">Merge gems to reach 2048</div>
                </div>
                <div class="p2p-launcher-item" data-game="tetris">
                    <div class="p2p-launcher-icon">🧩</div>
                    <div class="p2p-launcher-name">Tetric</div>
                    <div class="p2p-launcher-desc">Stack crystals in lines</div>
                </div>
                <div class="p2p-launcher-item" data-game="flappy">
                    <div class="p2p-launcher-icon">🐦</div>
                    <div class="p2p-launcher-name">Flappy Taric</div>
                    <div class="p2p-launcher-desc">Fly between the pipes</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const modalContent = overlay.querySelector('.p2p-modal');
    const header = overlay.querySelector('.p2p-modal-header');

    // Dragging Logic for Launcher
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let startRect = { x: 0, y: 0 };

    header.onmousedown = (e) => {
        if (e.target.classList.contains('p2p-close-btn')) return;
        isDragging = true;
        const rect = modalContent.getBoundingClientRect();
        startPos = { x: e.clientX, y: e.clientY };
        startRect = { x: rect.left, y: rect.top };
        modalContent.style.transform = 'none';
        modalContent.style.margin = '0';
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        let newX = startRect.x + (e.clientX - startPos.x);
        let newY = startRect.y + (e.clientY - startPos.y);
        if (newY < 80) newY = 80;
        if (newX < 0) newX = 0;
        if (newX + modalContent.offsetWidth > window.innerWidth) newX = window.innerWidth - modalContent.offsetWidth;
        if (newY + modalContent.offsetHeight > window.innerHeight) newY = window.innerHeight - modalContent.offsetHeight;
        modalContent.style.left = newX + 'px';
        modalContent.style.top = newY + 'px';
    };

    const onMouseUp = () => { isDragging = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const cleanup = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        overlay.remove();
    };

    overlay.querySelectorAll('.p2p-launcher-item').forEach(item => {
        item.onclick = () => { onSelect(item.getAttribute('data-game')); cleanup(); };
    });

    overlay.querySelector('.p2p-close-btn').onclick = cleanup;
    overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
}
