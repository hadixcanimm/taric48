/**
 * Tetric implementation for Taric48 - Tetric
 */
export class Tetris {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'tetris-canvas';
        this.container.appendChild(this.canvas);

        // Game Over Overlay (like Flappy Taric)
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'tetris-overlay';
        gameOverDiv.id = 'tetris-over';
        gameOverDiv.style.display = 'none';
        gameOverDiv.innerHTML = `
            <div class="tetris-game-over-panel">
                <div class="tetris-title">GAME OVER</div>
                <div class="tetris-score-display" id="tetris-final-score">Score: 0</div>
                <button class="p2p-btn" id="tetris-restart-btn">RESTART</button>
            </div>
        `;
        this.container.appendChild(gameOverDiv);
        this.gameOverOverlay = gameOverDiv;
        this.finalScoreDisplay = gameOverDiv.querySelector('#tetris-final-score');
        gameOverDiv.querySelector('#tetris-restart-btn').onclick = () => this.reset();

        this.cols = 10;
        this.rows = 20;
        this.grid = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;

        this.blockSize = 0;
        this.padding = 20;

        // Settings
        this.settings = {
            muted: localStorage.getItem('tetris_is_muted') === 'true',
            shake: localStorage.getItem('tetris_shake') !== 'false'
        };

        this.colors = {
            I: '#00eaff', J: '#3b59ff', L: '#ff9d00', O: '#f0e6d2', S: '#1ed760', T: '#c8aa6e', Z: '#ff4c55'
        };

        this.shapes = {
            I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
        };

        this.piece = null;
        this.nextPiece = null;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        // Effects state
        this.clearingLines = []; // indices of lines being cleared
        this.clearAnimTimer = 0;
        this.hardDropActive = false;
        this.hardDropTargetY = 0;

        // Audio Context for procedural effects
        this.audioCtx = null;

        this.init();
        this.onResize();
        window.addEventListener('resize', this.onResize.bind(this));

        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);

        this.loop = this.loop.bind(this);
        this.requestId = requestAnimationFrame(this.loop);
    }

    init() {
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = new Array(this.cols).fill(null);
        }
        this.spawnPiece();
    }

    reset() {
        this.gameOverOverlay.style.display = 'none';
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = new Array(this.cols).fill(null);
        }
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = performance.now();
        this.piece = null;
        this.nextPiece = null;
        this.spawnPiece();
        this.loop(this.lastTime);
        this.playSound('start');
    }

    onResize() {
        if (!this.container) return;
        const parent = this.container.getBoundingClientRect();
        if (parent.width === 0 || parent.height === 0) return;
        this.canvas.width = parent.width;
        this.canvas.height = parent.height;
        const boardAreaW = this.canvas.width * 0.62;
        const boardAreaH = this.canvas.height - 40;
        this.blockSize = Math.floor(Math.min(boardAreaW / this.cols, boardAreaH / this.rows));
        this.render();
    }

    spawnPiece() {
        if (!this.nextPiece) this.nextPiece = this.randomPiece();
        if (!this.nextPiece2) this.nextPiece2 = this.randomPiece();
        this.piece = this.nextPiece;
        this.nextPiece = this.nextPiece2;
        this.nextPiece2 = this.randomPiece();
        this.piece.x = Math.floor(this.cols / 2) - Math.floor(this.piece.shape[0].length / 2);
        this.piece.y = 0;
        if (this.collide()) this.gameOver();
    }

    randomPiece() {
        const types = 'IJLOSTZ';
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type,
            shape: JSON.parse(JSON.stringify(this.shapes[type])),
            color: this.colors[type],
            x: 0, y: 0
        };
    }

    collide(offsetY = 0, offsetX = 0, customShape = null) {
        const { shape: s, x: px, y: py } = this.piece;
        const shape = customShape || s;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const nextX = px + x + offsetX;
                    const nextY = py + y + offsetY;
                    if (nextX < 0 || nextX >= this.cols || nextY >= this.rows || (nextY >= 0 && this.grid[nextY][nextX])) return true;
                }
            }
        }
        return false;
    }

    rotate() {
        const oldShape = this.piece.shape;
        const n = oldShape.length;
        const newShape = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) newShape[x][n - 1 - y] = oldShape[y][x];
        }
        const oldX = this.piece.x;
        this.piece.shape = newShape;
        let offset = 1;
        while (this.collide()) {
            this.piece.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (Math.abs(offset) > n) {
                this.piece.shape = oldShape;
                this.piece.x = oldX;
                return;
            }
        }
        this.playSound('rotate');
    }

    drop() {
        if (this.clearingLines.length > 0) return;
        this.piece.y++;
        if (this.collide()) {
            this.piece.y--;
            this.merge();
            this.spawnPiece();
            this.checkLines();
            this.playSound('drop');
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        if (this.clearingLines.length > 0 || this.hardDropActive) return;
        this.hardDropActive = true;
        this.playSound('hardDrop');

        let targetY = 0;
        while (!this.collide(targetY + 1)) targetY++;
        this.hardDropTargetY = this.piece.y + targetY;

        // Fast fall animation in loop
    }

    merge() {
        const { shape, x: px, y: py, color } = this.piece;
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value && py + y >= 0) this.grid[py + y][px + x] = color;
            });
        });
    }

    checkLines() {
        const found = [];
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) found.push(y);
        }
        if (found.length > 0) {
            this.clearingLines = found;
            this.clearAnimTimer = 200; // ms
            this.playSound('clear');
        }
    }

    removeLines() {
        this.clearingLines.sort((a, b) => a - b).forEach(y => {
            this.grid.splice(y, 1);
            this.grid.unshift(new Array(this.cols).fill(null));
        });
        const lineScores = [0, 100, 300, 500, 800];
        this.score += lineScores[this.clearingLines.length] * this.level;
        this.lines += this.clearingLines.length;
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        this.clearingLines = [];
    }

    togglePause() {
        if (this.isGameOver) return false;
        if (this.isPaused) this.resume();
        else this.pause();
        return this.isPaused;
    }

    pause() {
        if (this.isGameOver) return;
        this.isPaused = true;
        cancelAnimationFrame(this.requestId);
        this.render();
    }

    resume() {
        if (this.isGameOver) return;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    handleKeyDown(e) {
        if (this.isGameOver || this.isPaused || this.clearingLines.length > 0) return;
        const key = e.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') {
            this.piece.x--;
            if (this.collide()) this.piece.x++;
            else this.playSound('move');
        } else if (key === 'arrowright' || key === 'd') {
            this.piece.x++;
            if (this.collide()) this.piece.x--;
            else this.playSound('move');
        } else if (key === 'arrowdown' || key === 's') {
            this.drop();
        } else if (key === 'arrowup' || key === 'w') {
            this.rotate();
        } else if (key === ' ') {
            this.hardDrop();
        }
    }

    loop(time = 0) {
        if (this.isGameOver || this.isPaused) return;
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (this.clearingLines.length > 0) {
            this.clearAnimTimer -= deltaTime;
            if (this.clearAnimTimer <= 0) this.removeLines();
        } else if (this.hardDropActive) {
            // Move piece down quickly (e.g. 2 blocks per frame)
            for (let i = 0; i < 2; i++) {
                if (this.piece.y < this.hardDropTargetY) {
                    this.piece.y++;
                } else {
                    this.hardDropActive = false;
                    this.merge();
                    this.spawnPiece();
                    this.checkLines();
                    this.triggerShake();
                    break;
                }
            }
        } else {
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) this.drop();
        }

        this.render();
        this.requestId = requestAnimationFrame(this.loop);
    }

    triggerShake() {
        if (!this.settings.shake) return;
        const modal = this.container.closest('.p2p-modal');
        if (modal) {
            modal.classList.remove('shake-anim');
            void modal.offsetWidth; // trigger reflow
            modal.classList.add('shake-anim');
            setTimeout(() => modal.classList.remove('shake-anim'), 300);
        }
    }

    playSound(type) {
        if (this.settings.muted) return;
        try {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            const now = this.audioCtx.currentTime;
            switch (type) {
                case 'move':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(220, now);
                    gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.start(); osc.stop(now + 0.05); break;
                case 'rotate':
                    osc.type = 'square'; osc.frequency.setValueAtTime(330, now);
                    gain.gain.setValueAtTime(0.03, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(); osc.stop(now + 0.08); break;
                case 'drop':
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(110, now);
                    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(); osc.stop(now + 0.1); break;
                case 'hardDrop':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now);
                    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(); osc.stop(now + 0.2); break;
                case 'clear':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(); osc.stop(now + 0.3); break;
                case 'start':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(261.6, now);
                    osc.frequency.exponentialRampToValueAtTime(523.2, now + 0.5);
                    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    osc.start(); osc.stop(now + 0.5); break;
            }
        } catch (e) { }
    }

    render() {
        const bgGrad = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);
        bgGrad.addColorStop(0, '#0a0c10'); bgGrad.addColorStop(1, '#010a13');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const sidebarX = (this.cols * this.blockSize) + 30;
        const sideW = this.canvas.width - sidebarX - 10;
        this.drawHUDSection('NEXT', sidebarX, 20, sideW, 110);
        this.drawHUDSection('SCORE', sidebarX, 145, sideW, 65);
        this.drawHUDSection('LEVEL', sidebarX, 225, sideW, 65);

        const offsetX = 15; const offsetY = 20;
        const boardW = this.cols * this.blockSize; const boardH = this.rows * this.blockSize;

        // Draw Board Background Grid
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(200, 170, 110, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.moveTo(offsetX + x * this.blockSize, offsetY);
            this.ctx.lineTo(offsetX + x * this.blockSize, offsetY + boardH);
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.moveTo(offsetX, offsetY + y * this.blockSize);
            this.ctx.lineTo(offsetX + boardW, offsetY + y * this.blockSize);
        }
        this.ctx.stroke();

        this.ctx.strokeStyle = '#6b5826';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX - 2, offsetY - 2, boardW + 4, boardH + 4);

        // Outer glow for the board
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(200, 170, 110, 0.2)';
        this.ctx.strokeRect(offsetX - 2, offsetY - 2, boardW + 4, boardH + 4);
        this.ctx.shadowBlur = 0;

        // Draw Settled Blocks
        this.grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    if (this.clearingLines.includes(y)) {
                        // Flashing effect for clearing lines
                        const alpha = Math.sin(Date.now() / 30) * 0.5 + 0.5;
                        this.drawBlock(offsetX + x * this.blockSize, offsetY + y * this.blockSize, `rgba(255,255,255,${alpha})`);
                    } else {
                        this.drawBlock(offsetX + x * this.blockSize, offsetY + y * this.blockSize, color);
                    }
                }
            });
        });

        // Draw Ghost Piece
        if (this.piece && !this.hardDropActive) {
            let ghostY = 0; while (!this.collide(ghostY + 1)) ghostY++;
            this.piece.shape.forEach((row, ry) => {
                row.forEach((v, rx) => {
                    if (v) this.drawGhostBlock(offsetX + (this.piece.x + rx) * this.blockSize, offsetY + (this.piece.y + ry + ghostY) * this.blockSize, this.piece.color);
                });
            });
        }

        // Draw Current Piece
        if (this.piece) {
            this.piece.shape.forEach((row, y) => {
                row.forEach((v, x) => {
                    if (v) this.drawBlock(offsetX + (this.piece.x + x) * this.blockSize, offsetY + (this.piece.y + y) * this.blockSize, this.piece.color);
                });
            });
        }

        if (this.nextPiece) {
            this.drawMiniPiece(this.nextPiece.type, sidebarX + sideW / 2, 70, Math.min(sideW * 0.5, 45));
        }
        if (this.nextPiece2) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.2;
            this.ctx.filter = 'grayscale(1) brightness(0.6)';
            this.drawMiniPiece(this.nextPiece2.type, sidebarX + sideW / 2, 106, Math.min(sideW * 0.25, 22));
            this.ctx.restore();
        }
        this.ctx.textAlign = 'center'; this.ctx.fillStyle = '#f0e6d2'; this.ctx.font = 'bold 18px Beaufort for LOL';
        this.ctx.fillText(this.score.toLocaleString(), sidebarX + sideW / 2, 190);
        this.ctx.fillText(this.level.toString(), sidebarX + sideW / 2, 270);

        if (this.isGameOver) {
            // Update overlay and show it
            this.finalScoreDisplay.textContent = `Score: ${this.score}`;
            this.gameOverOverlay.style.display = 'flex';
        } else {
            this.gameOverOverlay.style.display = 'none';
        }

        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(1, 10, 19, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.font = 'bold 32px Beaufort for LOL';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawHUDSection(l, x, y, w, h) {
        // Hextech Panel
        this.ctx.fillStyle = 'rgba(1, 10, 19, 0.8)';
        this.ctx.fillRect(x, y, w, h);

        // Inner gradient
        const grad = this.ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, 'rgba(200, 170, 110, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, w, h);

        this.ctx.strokeStyle = '#463714'; this.ctx.lineWidth = 1; this.ctx.strokeRect(x, y, w, h);

        // Corner details
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.lineWidth = 2;
        // Top-left corner
        this.ctx.beginPath(); this.ctx.moveTo(x, y + 10); this.ctx.lineTo(x, y); this.ctx.lineTo(x + 10, y); this.ctx.stroke();
        // Bottom-right corner
        this.ctx.beginPath(); this.ctx.moveTo(x + w, y + h - 10); this.ctx.lineTo(x + w, y + h); this.ctx.lineTo(x + w - 10, y + h); this.ctx.stroke();

        this.ctx.fillStyle = '#c8aa6e'; this.ctx.font = 'bold 10px Beaufort for LOL'; this.ctx.textAlign = 'left';
        this.ctx.fillText(l, x + 8, y + 14);
        this.ctx.strokeStyle = 'rgba(200, 170, 110, 0.2)'; this.ctx.beginPath(); this.ctx.moveTo(x + 5, y + 18); this.ctx.lineTo(x + w - 5, y + 18); this.ctx.stroke();
    }

    drawBlock(x, y, c, s = this.blockSize) {
        const p = 1.5;
        const b = s - p * 2;

        // Main Glow/Refraction Layer
        this.ctx.save();
        this.ctx.translate(x + p, y + p);

        // Base background for depth
        this.ctx.fillStyle = '#010a13';
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, b, b, 2);
        this.ctx.fill();

        // Color foundation
        const grad = this.ctx.createRadialGradient(b / 2, b / 2, 0, b / 2, b / 2, b);
        grad.addColorStop(0, c);
        grad.addColorStop(1, this.adjustColor(c, -40));
        this.ctx.fillStyle = grad;
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, b, b, 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;

        // Facets (Crystalline reflections)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 0.8;

        // X-cross for diamond cut
        this.ctx.beginPath();
        this.ctx.moveTo(2, 2); this.ctx.lineTo(b - 2, b - 2);
        this.ctx.moveTo(b - 2, 2); this.ctx.lineTo(2, b - 2);
        this.ctx.stroke();

        // Inner diamond highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.beginPath();
        this.ctx.moveTo(b / 2, 4); this.ctx.lineTo(b - 4, b / 2);
        this.ctx.lineTo(b / 2, b - 4); this.ctx.lineTo(4, b / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Top-left sparkle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(b * 0.3, b * 0.3, b * 0.1, 0, Math.PI * 2);
        this.ctx.fill();

        // Hextech frame
        this.ctx.strokeStyle = this.adjustColor(c, 20);
        this.ctx.lineWidth = 1.1;
        this.ctx.strokeRect(0, 0, b, b);

        this.ctx.restore();
    }

    adjustColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
    }

    drawGhostBlock(x, y, c) {
        this.ctx.strokeStyle = c;
        this.ctx.setLineDash([2, 2]);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4);
        this.ctx.setLineDash([]);

        this.ctx.globalAlpha = 0.05;
        this.ctx.fillStyle = c;
        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
        this.ctx.globalAlpha = 1;
    }

    drawMiniPiece(t, cx, cy, mw) {
        const sh = this.shapes[t]; const sz = Math.floor(mw / Math.max(sh.length, 3));
        const sx = cx - (sh[0].length * sz) / 2; const sy = cy - (sh.length * sz) / 2;
        sh.forEach((row, y) => { row.forEach((v, x) => { if (v) this.drawBlock(sx + x * sz, sy + y * sz, this.colors[t], sz); }); });
    }

    gameOver() { this.isGameOver = true; this.render(); }

    updateSettings(s) { this.settings = { ...this.settings, ...s }; }

    destroy() {
        cancelAnimationFrame(this.requestId);
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
        if (this.restartBtn.parentNode) this.restartBtn.parentNode.removeChild(this.restartBtn);
        if (this.audioCtx) this.audioCtx.close();
    }
}
