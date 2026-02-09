/**
 * 2048 Game Logic for Pengu Loader
 * Refactored for Animations
 */
import { VOLUME_ICON, MUTE_ICON, USER_ICON, NUM_ICON } from './styles.js';

class Tile {
    constructor(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
        this.previousPosition = null;
        this.mergedFrom = null;
        this.isNew = true;
        this.id = Tile.idCounter++;
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }

    serialize() {
        return {
            position: { x: this.x, y: this.y },
            value: this.value,
            id: this.id // Persist ID to keep DOM association
        };
    }
}
Tile.idCounter = 1;

export class Game2048 {
    static TILE_CONFIG = {
        2: { id: 'Taric', skin: 0 },
        4: { id: 'Taric', skin: 1 },
        8: { id: 'Ezreal', skin: 9 },
        16: { id: 'Taric', skin: 3 },
        32: { id: 'Taric', skin: 4 },
        64: { id: 'Urgot', skin: 9 },
        128: { id: 'Taric', skin: 9 },
        256: { id: 'Taric', skin: 18 },
        512: { id: 'Taric', skin: 27 },
        1024: { id: 'Yuumi', skin: 11 },
        2048: { id: 'Taric', skin: 2 },
        4096: { id: 'Taric', skin: 0 }
    };

    constructor(container) {
        this.container = container;
        this.tiles = [];
        this.score = 0;
        this.isGameOver = false;
        this.isTextMode = false;
        this.isMoving = false; // Prevention lock
        this.combo = 0;
        this.comboTimeout = null;
        this.comboDuration = 2000; // 2 seconds to keep combo

        // Settings
        this.isParticlesEnabled = localStorage.getItem('2048_particles') !== 'false'; // Default true
        this.isVibrationEnabled = localStorage.getItem('2048_vibration') !== 'false'; // Default true

        // Restore state or new game
        const savedState = JSON.parse(localStorage.getItem('2048_state_v2'));
        if (savedState) {
            this.score = savedState.score;
            this.isGameOver = savedState.isGameOver;
            this.isTextMode = savedState.isTextMode;
            if (savedState.tiles) {
                this.tiles = savedState.tiles.map(t => {
                    const tile = new Tile(t.position, t.value);
                    tile.id = t.id;
                    if (tile.id >= Tile.idCounter) Tile.idCounter = tile.id + 1;
                    return tile;
                });
            }
        }

        this.bestScore = parseInt(localStorage.getItem('2048_best_score') || '0');
        this.isMuted = localStorage.getItem('2048_is_muted') === 'true';

        // Audio initialization - Premium Hextech/Crystal sounds
        this.audio = {
            move: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),  // Premium Hextech swipe
            merge: new Audio('https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3'), // Clean mechanical chime
            combo: new Audio('https://assets.mixkit.co/active_storage/sfx/3004/3004-preview.mp3'), // Minimal notification
            gameOver: new Audio('https://assets.mixkit.co/active_storage/sfx/3003/3003-preview.mp3') // Low thud/pulse
        };
        // Pre-set volume (Balanced & Clean)
        this.audio.move.volume = 0.6;
        this.audio.merge.volume = 0.5;
        this.audio.combo.volume = 0.4;
        this.audio.gameOver.volume = 0.5;

        // Tiktak for combos (Tick tock clock close up)
        this.tiktak = new Audio('https://assets.mixkit.co/active_storage/sfx/1059/1059-preview.mp3');
        this.tiktak.volume = 0.5;
        this.tiktak.loop = true; // Enable native looping

        this.init();
    }

    saveGame() {
        const state = {
            tiles: this.tiles.map(t => t.serialize()),
            score: this.score,
            isGameOver: this.isGameOver,
            isTextMode: this.isTextMode,
            isMuted: this.isMuted,
            isParticlesEnabled: this.isParticlesEnabled,
            isVibrationEnabled: this.isVibrationEnabled
        };
        localStorage.setItem('2048_state_v2', JSON.stringify(state));
        localStorage.setItem('2048_is_muted', this.isMuted);
        localStorage.setItem('2048_particles', this.isParticlesEnabled);
        localStorage.setItem('2048_vibration', this.isVibrationEnabled);
    }

    init() {
        this.container.innerHTML = `
            <div class="g2048-container">
                <div class="g2048-header">
                    <div class="g2048-score-container">
                        <div class="g2048-score-box">
                            <span class="label">SCORE</span>
                            <span id="g2048-score">0</span>
                        </div>
                        <div class="g2048-score-box">
                            <span class="label">BEST</span>
                            <span id="g2048-best">${this.bestScore}</span>
                        </div>
                    </div>
                    <button id="g2048-reset" class="p2p-btn">New Game</button>
                </div>
                <div class="g2048-board-wrapper">
                    <div id="g2048-combo" class="g2048-combo-wrapper">
                        <div id="g2048-combo-text" class="g2048-combo-text">Combo x2</div>
                        <div class="g2048-combo-timer-bg">
                            <div id="g2048-combo-timer" class="g2048-combo-timer-bar"></div>
                        </div>
                    </div>
                    <div id="g2048-board" class="g2048-board">
                        ${Array(16).fill('<div class="g2048-grid-cell"></div>').join('')}
                        <div class="g2048-tile-layer"></div>
                    </div>
                    <div id="g2048-overlay" class="g2048-overlay" style="display: none;">
                        <div class="g2048-message">Game Over!</div>
                        <button id="g2048-restart-overlay" class="p2p-btn">Try Again</button>
                    </div>
                </div>
                <div class="g2048-footer">
                    <span>Use arrow keys or swipe with mouse to play.</span>
                </div>
            </div>
        `;

        this.tileLayer = this.container.querySelector('.g2048-tile-layer');
        this.scoreElement = this.container.querySelector('#g2048-score');
        this.bestElement = this.container.querySelector('#g2048-best');

        this.container.querySelector('#g2048-reset').onclick = () => this.restart();
        this.container.querySelector('#g2048-restart-overlay').onclick = () => this.restart();

        if (this.isGameOver) {
            this.container.querySelector('#g2048-overlay').style.display = 'flex';
        }

        if (this.tiles.length === 0) {
            this.addRandomTile();
            this.addRandomTile();
        }

        // Sync toggle button on start
        const toggleBtn = document.getElementById('p2p-toggle-mode');
        if (toggleBtn) {
            if (this.isTextMode) toggleBtn.innerText = '123';
            else toggleBtn.innerHTML = USER_ICON;
        }

        this.render();

        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);

        // Swipe Support
        this.swipeStart = null;
        this.board = this.container.querySelector('#g2048-board');

        this.onMouseDown = (e) => {
            this.swipeStart = { x: e.clientX, y: e.clientY };
        };

        this.onMouseUp = (e) => {
            if (!this.swipeStart) return;
            const dx = e.clientX - this.swipeStart.x;
            const dy = e.clientY - this.swipeStart.y;
            this.swipeStart = null;

            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            const minMove = 30;

            if (absX > absY && absX > minMove) {
                this.triggerMove(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else if (absY > absX && absY > minMove) {
                this.triggerMove(dy > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        };

        this.board.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    destroy() {
        window.removeEventListener('keydown', this.handleInput);
        if (this.board) this.board.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    triggerMove(key) {
        if (this.isGameOver) return;
        const fakeEvent = { key, preventDefault: () => { } };
        this.handleInput(fakeEvent);
    }

    playSound(type) {
        if (this.isMuted) return;
        const sound = this.audio[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => { });
        }
    }

    startTiktak() {
        if (this.combo < 3 || this.isGameOver || this.isMuted) {
            this.stopTiktak();
            return;
        }

        // Calculate playback speed and volume based on combo
        // Base speed at x3 is 1.0. Increases linearly.
        let speed = 1.0 + (this.combo - 3) * 0.08;
        let volume = 0.7 + (this.combo - 3) * 0.05;

        // Cap values for safety/quality
        this.tiktak.playbackRate = Math.min(speed, 3.5);
        this.tiktak.volume = Math.min(volume, 1.0);

        if (this.tiktak.paused) {
            this.tiktak.play().catch(() => { });
        }
    }

    stopTiktak() {
        this.tiktak.pause();
        this.tiktak.currentTime = 0;
    }

    pause() {
        // 2048 doesn't have an active game loop to stop, but this stub
        // prevents errors when the UI calls .pause() on minimize.
    }

    restart() {
        this.tiles = [];
        this.score = 0;
        this.isGameOver = false;
        this.isMoving = false;
        this.resetCombo();
        this.container.querySelector('#g2048-overlay').style.display = 'none';
        this.addRandomTile();
        this.addRandomTile();
        this.saveGame();
        this.render();
    }

    // --- Core Logic ---

    // Build the 4x4 grid from current tiles for logic operations
    buildGrid() {
        const grid = Array(4).fill().map(() => Array(4).fill(null));
        this.tiles.forEach(tile => {
            if (tile.x >= 0 && tile.x < 4 && tile.y >= 0 && tile.y < 4) {
                grid[tile.y][tile.x] = tile;
            }
        });
        return grid;
    }

    addRandomTile() {
        const grid = this.buildGrid();
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!grid[r][c]) emptyCells.push({ x: c, y: r });
            }
        }
        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const tile = new Tile({ x, y }, Math.random() < 0.9 ? 2 : 4);
            this.tiles.push(tile);
        }
    }

    prepareTiles() {
        this.tiles.forEach(tile => {
            tile.mergedFrom = null;
            tile.isNew = false;
            tile.savePosition();
        });
    }

    moveTile(tile, cell) {
        this.tiles.forEach(t => {
            if (t.id === tile.id) {
                t.updatePosition(cell);
            }
        });
    }

    move(vector) {
        // vector: { x: 0, y: -1 } for Up, etc.
        const grid = this.buildGrid();
        let moved = false;
        let mergesThisTurn = 0;

        this.prepareTiles();

        // Traverse in correct order
        const traversals = { x: [], y: [] };
        for (let pos = 0; pos < 4; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        traversals.y.forEach(y => {
            traversals.x.forEach(x => {
                const cell = { x, y };
                const tile = grid[y][x];

                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector, grid);
                    const next = positions.next;

                    if (next && next.y >= 0 && next.y < 4 && next.x >= 0 && next.x < 4 &&
                        grid[next.y][next.x] &&
                        grid[next.y][next.x].value === tile.value &&
                        !grid[next.y][next.x].mergedFrom) {

                        // Merge
                        const merged = new Tile(next, tile.value * 2);
                        const other = grid[next.y][next.x];

                        merged.mergedFrom = [tile, other];
                        merged.shouldSparkle = true;

                        this.tiles.push(merged);

                        // Remove old tiles from active list but keep them for animation (logic via mergedFrom)
                        // Actually better to keep them in 'tiles' but mark them?
                        // Simplified: Update tile positions for animation, but remove them from 'this.tiles' and let render function separate them?
                        // No, simplest: Remove them from `this.tiles` immediately, but they are referenced in `merged.mergedFrom`.
                        // Render iterates `this.tiles`, and if `mergedFrom` exists, it ALSO renders those children.

                        this.tiles = this.tiles.filter(t => t.id !== tile.id && t.id !== other.id);

                        // Update positions of formatting tiles to target
                        tile.updatePosition(next);
                        other.updatePosition(next); // It's already there but just for consistency

                        // Update grid for further processing THIS turn
                        grid[y][x] = null;
                        grid[next.y][next.x] = merged;

                        // Multiplier based on current combo
                        let multiplier = 1;
                        if (this.combo >= 25) multiplier = 3.0;
                        else if (this.combo >= 14) multiplier = 2.0;
                        else if (this.combo >= 7) multiplier = 1.5;
                        else if (this.combo >= 2) multiplier = 1.2;

                        this.score += Math.floor(merged.value * multiplier);
                        moved = true;
                        mergesThisTurn++;
                    } else {
                        // Move safe
                        this.moveTile(tile, positions.farthest);
                        grid[y][x] = null;
                        grid[positions.farthest.y][positions.farthest.x] = tile;

                        if (x !== positions.farthest.x || y !== positions.farthest.y) {
                            moved = true;
                        }
                    }
                }
            });
        });

        return { moved, merges: mergesThisTurn };
    }

    findFarthestPosition(cell, vector, grid) {
        let previous;
        // Progress in direction until obstacle
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (
            cell.x >= 0 && cell.x < 4 &&
            cell.y >= 0 && cell.y < 4 &&
            !grid[cell.y][cell.x]
        );
        return {
            farthest: previous,
            next: cell // Used to check merge
        };
    }

    handleInput(e) {
        if (this.isGameOver || this.isMoving) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
        else return;

        this.isMoving = true; // Lock
        let vector;
        if (e.key === 'ArrowUp') vector = { x: 0, y: -1 };
        else if (e.key === 'ArrowDown') vector = { x: 0, y: 1 };
        else if (e.key === 'ArrowLeft') vector = { x: -1, y: 0 };
        else if (e.key === 'ArrowRight') vector = { x: 1, y: 0 };

        const moveResult = this.move(vector);
        if (moveResult.moved) {
            this.playSound('move');
            if (moveResult.merges > 0) {
                this.playSound('merge');
                this.triggerCombo(moveResult.merges);
            }
            this.render(); // Triggers CSS transition

            // Wait for animation then spawn new tile
            setTimeout(() => {
                this.addRandomTile();
                this.render();

                if (this.checkGameOver()) {
                    this.isGameOver = true;
                    this.resetCombo();
                    this.clearAllSparkles();
                    this.stopTiktak();
                    this.playSound('gameOver');
                    this.container.querySelector('#g2048-overlay').style.display = 'flex';
                }
                this.saveGame();
                this.isMoving = false; // Unlock
            }, 120);
        } else {
            this.isMoving = false; // Unlock if no move possible
        }
    }

    checkGameOver() {
        if (this.tiles.length < 16) return false;

        const grid = this.buildGrid();
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const val = grid[y][x] ? grid[y][x].value : 0;
                // Check right
                if (x < 3) {
                    const right = grid[y][x + 1] ? grid[y][x + 1].value : 0;
                    if (val === right) return false;
                }
                // Check down
                if (y < 3) {
                    const down = grid[y + 1][x] ? grid[y + 1][x].value : 0;
                    if (val === down) return false;
                }
            }
        }
        return true;
    }

    toggleMode() {
        this.isTextMode = !this.isTextMode;
        const btn = document.getElementById('p2p-toggle-mode');
        if (btn) {
            if (this.isTextMode) {
                btn.innerHTML = '';
                btn.innerText = '123';
            } else {
                btn.innerHTML = USER_ICON;
            }
        }

        // Wipe all tile contents to prevent theme overlap
        this.tileLayer.querySelectorAll('.g2048-tile').forEach(el => {
            el.innerHTML = '';
            el.innerText = '';
            el.style.backgroundImage = 'none';
            el.removeAttribute('data-render-mode');
        });

        this.render();
        this.saveGame();
    }

    // --- Rendering ---

    render() {
        // Sync DOM with this.tiles

        // 1. Mark all existing tiles as candidates for removal
        const existingDoms = Array.from(this.tileLayer.children);
        const retainedIds = new Set();

        // Helper to update/create tile DOM
        const applyTileStyle = (tile, tileElement, isSource = false) => {
            // Position calculations for 4x4 grid with 2.5% gaps
            const left = tile.x * 25.625;
            const top = tile.y * 25.625;

            tileElement.style.left = `${left}%`;
            tileElement.style.top = `${top}%`;

            // Content
            tileElement.className = `g2048-tile tile-${tile.value}`;
            if (tile.mergedFrom) tileElement.classList.add('g2048-merged');
            if (tile.isNew) tileElement.classList.add('g2048-new');
            if (this.isGameOver) tileElement.style.filter = 'brightness(0.5) saturate(0.5)';

            if (tile.shouldSparkle) {
                this.createSparkle(tile.x, tile.y);
                tile.shouldSparkle = false;
            }

            // Handle content based on mode
            const mode = this.isTextMode ? 'text' : 'skin';
            if (tileElement.getAttribute('data-render-mode') !== mode) {
                tileElement.innerHTML = '';
                tileElement.innerText = '';
                tileElement.style.backgroundImage = 'none';
                tileElement.setAttribute('data-render-mode', mode);
            }

            const conf = Game2048.TILE_CONFIG[tile.value] || { id: 'Taric', skin: 0 };

            // Hide text/overlays for source tiles during merge animation to prevent clutter
            if (isSource) {
                tileElement.innerText = '';
                const overlay = tileElement.querySelector('.g2048-tile-overlay');
                if (overlay) overlay.style.display = 'none';

                if (this.isTextMode) {
                    tileElement.style.backgroundImage = 'none';
                } else {
                    tileElement.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${conf.id}_${conf.skin}.jpg)`;
                    tileElement.style.backgroundSize = 'cover';
                    tileElement.style.backgroundPosition = 'top center';
                }
                return;
            }

            if (this.isTextMode) {
                tileElement.innerText = tile.value;
                tileElement.style.backgroundImage = 'none';
            } else {
                tileElement.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${conf.id}_${conf.skin}.jpg)`;
                tileElement.style.backgroundSize = 'cover';
                tileElement.style.backgroundPosition = 'top center';

                let overlay = tileElement.querySelector('.g2048-tile-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'g2048-tile-overlay';
                    tileElement.appendChild(overlay);
                }
                overlay.style.display = 'block';
                overlay.innerText = tile.value;
            }
        };

        this.tiles.forEach(tile => {
            let tileDom = document.getElementById(`g2048-tile-${tile.id}`);
            if (!tileDom) {
                tileDom = document.createElement('div');
                tileDom.id = `g2048-tile-${tile.id}`;
                this.tileLayer.appendChild(tileDom);
            }
            applyTileStyle(tile, tileDom, false); // Target tiles
            retainedIds.add(tileDom.id);

            if (tile.mergedFrom) {
                tile.mergedFrom.forEach(source => {
                    let sourceDom = document.getElementById(`g2048-tile-${source.id}`);
                    if (!sourceDom) {
                        sourceDom = document.createElement('div');
                        sourceDom.id = `g2048-tile-${source.id}`;
                        this.tileLayer.appendChild(sourceDom);
                    }
                    applyTileStyle(source, sourceDom, true); // Source tiles
                    retainedIds.add(sourceDom.id);
                });
            }
        });

        // Remove DOMs that are no longer in use
        existingDoms.forEach(dom => {
            if (!retainedIds.has(dom.id)) {
                dom.remove();
            }
        });

        this.scoreElement.innerText = this.score;
        this.saveBestScore();
    }

    saveBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048_best_score', this.bestScore);
            if (this.bestElement) this.bestElement.textContent = this.bestScore;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveGame();
        if (this.isMuted) {
            this.stopTiktak();
        } else if (this.combo >= 3) {
            this.startTiktak();
        }
    }
    createSparkle(x, y) {
        if (this.isGameOver || !this.isParticlesEnabled) return;
        const board = this.container.querySelector('#g2048-board');
        if (!board) return;

        // Tile stride is 25.625% (Cell 23.125% + Gap 2.5%)
        // Center of tile: (x * 25.625) + (23.125 / 2)
        const boardRect = board.getBoundingClientRect();
        const centerX = (x * 0.25625 * boardRect.width) + (0.115625 * boardRect.width);
        const centerY = (y * 0.25625 * boardRect.height) + (0.115625 * boardRect.height);

        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'g2048-sparkle';

            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const duration = 0.5 + Math.random() * 0.5;

            sparkle.style.left = `${centerX}px`;
            sparkle.style.top = `${centerY}px`;
            sparkle.style.setProperty('--dx', `${dx}px`);
            sparkle.style.setProperty('--dy', `${dy}px`);
            sparkle.style.setProperty('--sparkle-duration', `${duration}s`);

            board.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), duration * 1000);
        }
    }

    triggerCombo(merges) {
        this.combo += merges;
        const comboWrapper = this.container.querySelector('#g2048-combo');
        const comboText = this.container.querySelector('#g2048-combo-text');
        const comboTimer = this.container.querySelector('#g2048-combo-timer');
        const boardWrapper = this.container.querySelector('.g2048-board-wrapper');

        // Dynamic difficulty: refined curve to be less punishing
        let currentDuration = 2500 - (this.combo * 40);
        if (this.combo >= 7) currentDuration -= 100;
        if (this.combo >= 14) currentDuration -= 150;
        if (this.combo >= 25) currentDuration -= 200;
        const finalDuration = Math.max(800, currentDuration);

        let multiplierText = "1.0x";
        if (this.combo >= 25) multiplierText = "3.0x";
        else if (this.combo >= 14) multiplierText = "2.0x";
        else if (this.combo >= 7) multiplierText = "1.5x";
        else if (this.combo >= 2) multiplierText = "1.2x";

        comboText.innerText = `Combo x${this.combo} (${multiplierText})`;
        comboWrapper.classList.add('visible');

        // Reset and trigger timer animation
        comboTimer.classList.remove('running');
        void comboTimer.offsetWidth; // Force reflow
        comboTimer.style.setProperty('--combo-duration', `${finalDuration}ms`);
        comboTimer.classList.add('running');

        if (this.combo >= 2) this.playSound('combo');
        if (this.combo >= 3) {
            boardWrapper.classList.add('high-combo');
            this.startTiktak();
        }

        // Intensity scaling logic
        let edgeDensity = Math.min(this.combo, 15);
        if (this.combo >= 20) edgeDensity *= 2;
        this.createEdgeSparkle(edgeDensity);

        // Shake stage (x14+)
        const modal = this.container.closest('.p2p-modal');
        if (modal && this.isVibrationEnabled) {
            if (this.combo >= 14) modal.classList.add('shake');
            else modal.classList.remove('shake');
        }

        // Client sparkles stage (x25+)
        if (this.combo >= 25 && this.isParticlesEnabled) {
            this.createClientSparkle(5);
        }

        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => this.resetCombo(), finalDuration);
    }

    resetCombo() {
        this.combo = 0;
        this.stopTiktak();
        const comboWrapper = this.container.querySelector('#g2048-combo');
        const boardWrapper = this.container.querySelector('.g2048-board-wrapper');
        const modal = this.container.closest('.p2p-modal');
        if (comboWrapper) comboWrapper.classList.remove('visible');
        if (boardWrapper) boardWrapper.classList.remove('high-combo');
        if (modal) modal.classList.remove('shake');
    }

    createEdgeSparkle(intensity) {
        if (this.isGameOver || !this.isParticlesEnabled) return;
        const board = this.container.querySelector('#g2048-board');
        if (!board) return;
        const boardRect = board.getBoundingClientRect();

        let count = Math.min(5 + intensity * 2, 30); // Cap density
        if (this.combo >= 7) count = Math.min(count * 1.5, 45);
        if (this.combo >= 20) count = Math.min(count * 2, 60);

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'g2048-sparkle';

            // Randomly pick an edge
            const edge = Math.floor(Math.random() * 4);
            let startX, startY;
            if (edge === 0) { // Top
                startX = Math.random() * boardRect.width;
                startY = 0;
            } else if (edge === 1) { // Right
                startX = boardRect.width;
                startY = Math.random() * boardRect.height;
            } else if (edge === 2) { // Bottom
                startX = Math.random() * boardRect.width;
                startY = boardRect.height;
            } else { // Left
                startX = 0;
                startY = Math.random() * boardRect.height;
            }

            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 60;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const duration = 0.6 + Math.random() * 0.6;

            sparkle.style.left = `${startX}px`;
            sparkle.style.top = `${startY}px`;
            sparkle.style.setProperty('--dx', `${dx}px`);
            sparkle.style.setProperty('--dy', `${dy}px`);
            sparkle.style.setProperty('--sparkle-duration', `${duration}s`);

            board.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), duration * 1000);
        }
    }

    createClientSparkle(intensity) {
        if (this.isGameOver || !this.isParticlesEnabled) return;
        const count = Math.min(10 + intensity * 5, 50); // Cap client sparkles
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'g2048-sparkle';
            sparkle.style.position = 'fixed';
            sparkle.style.zIndex = '20000';

            const edge = Math.floor(Math.random() * 4);
            let startX, startY;
            if (edge === 0) { startX = Math.random() * windowW; startY = 0; }
            else if (edge === 1) { startX = windowW; startY = Math.random() * windowH; }
            else if (edge === 2) { startX = Math.random() * windowW; startY = windowH; }
            else { startX = 0; startY = Math.random() * windowH; }

            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 100;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const duration = 0.8 + Math.random() * 0.8;

            sparkle.style.left = `${startX}px`;
            sparkle.style.top = `${startY}px`;
            sparkle.style.setProperty('--dx', `${dx}px`);
            sparkle.style.setProperty('--dy', `${dy}px`);
            sparkle.style.setProperty('--sparkle-duration', `${duration}s`);

            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), duration * 1000);
        }
    }

    clearAllSparkles() {
        document.querySelectorAll('.g2048-sparkle').forEach(el => el.remove());
    }

    updateSettings(settings) {
        if (settings.particles !== undefined) this.isParticlesEnabled = settings.particles;
        if (settings.vibration !== undefined) {
            this.isVibrationEnabled = settings.vibration;
            if (!this.isVibrationEnabled) {
                const modal = this.container.closest('.p2p-modal');
                if (modal) modal.classList.remove('shake');
            }
        }
        if (settings.muted !== undefined) {
            if (this.isMuted !== settings.muted) this.toggleMute();
        }
        this.saveGame();
    }
}
