/**
 * Flappy Taric Game Logic
 */
export class FlappyTaric {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isGameOver = false;
        this.isGameOver = false;
        this.isStarted = false;
        this.isPaused = false;
        this.isResuming = false;
        this.resumeAnimationId = null;
        this.resumeStartTime = 0;
        this.timeScale = 1.0;
        this.score = 0;
        this.score = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 5;
        this.safeUntil = 0;
        this.highScore = parseInt(localStorage.getItem('flappy_high_score') || '0');
        this.pauseOnLeave = localStorage.getItem('flappy_pause_on_leave') !== 'false';
        this.shakeEnabled = localStorage.getItem('flappy_shake') !== 'false';
        this.isMuted = localStorage.getItem('flappy_is_muted') === 'true';
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.bird = {
            x: 50,
            y: 0,
            width: 30,
            height: 30,
            gravity: 0.05,
            velocity: 0,
            jump: -1.8
        };

        this.birdImg = new Image();
        this.birdImg.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/44.png';
        this.imgLoaded = false;
        this.birdImg.onload = () => {
            this.imgLoaded = true;
            // If game hasn't started, redraw to show the loaded icon immediately
            if (!this.isStarted && this.ctx) {
                this.render();
            }
        };

        this.pipes = [];
        this.pipeWidth = 52;
        this.pipeGap = 90;
        this.basePipeSpeed = 1.0;
        this.pipeSpeed = this.basePipeSpeed;
        this.pipeSpeed = this.basePipeSpeed;
        this.frame = 0;

        this.powerupDefinitions = [
            { id: 'shrink', name: 'Tiny Taric', desc: 'Reduces size by 15%', type: 'size' },
            { id: 'maxlife', name: 'Vitality Gem', desc: '+1 Max Diamond', type: 'life' },
            { id: 'heal', name: 'Starlight Touch', desc: 'Restore All Diamonds', type: 'life' },
            { id: 'xp', name: 'Knowledge', desc: '+50% XP Gain', type: 'xp' },
            { id: 'shield', name: 'Bastion', desc: 'Start each level with a Shield', type: 'shield' },
            { id: 'luck', name: 'Diamond Hands', desc: '5% Chance to ignore damage (Max 50%)', type: 'luck' }
        ];

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flappy-container">
                <canvas class="flappy-canvas"></canvas>
                <div class="flappy-overlay" id="flappy-start">
                    <div class="flappy-title">Flappy Taric</div>
                    <div style="margin-bottom: 20px;">Press SPACE or CLICK to Jump</div>
                    <button class="p2p-btn" id="start-btn">Start Game</button>
                    <div style="margin-top: 20px; color: #a09b8c;">High Score: ${this.highScore}</div>
                </div>
                <div class="flappy-overlay" id="flappy-over" style="display: none;">
                    <div class="flappy-title">Game Over</div>
                    <div class="flappy-score-large" id="final-score">0</div>
                    <button class="p2p-btn" id="restart-btn">Try Again</button>
                </div>
                <div class="flappy-overlay" id="flappy-levelup" style="display: none; background: rgba(0, 0, 0, 0.9);">
                    <div class="flappy-title" style="font-size: 24px; margin-bottom: 20px;">Level Up! Choose a Boon</div>
                    <div class="flappy-cards-container" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;"></div>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('.flappy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.bird.y = this.canvas.height / 2;

        this.container.querySelector('#start-btn').onclick = () => this.start();
        this.container.querySelector('#restart-btn').onclick = () => this.start();

        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
        this.canvas.addEventListener('mousedown', this.handleInput);

        // Pause on mouse leave
        this.container.addEventListener('mouseleave', () => {
            if (!this.pauseOnLeave) return;

            if (this.isResuming) {
                cancelAnimationFrame(this.resumeAnimationId);
                this.isResuming = false;
            }
            if (this.isStarted && !this.isGameOver && !this.isLevelUpState) { // Don't trigger pause logic if in menu
                this.isPaused = true;
                this.render(); // Draw pause screen
            }
        });

        // Resume on mouse enter with ripple effect
        this.container.addEventListener('mouseenter', () => {
            if (this.isPaused && !this.isResuming && !this.isLevelUpState) { // Don't resume if in level up menu
                this.isResuming = true;
                this.resumeStartTime = performance.now();

                const animateResume = (now) => {
                    if (!this.isResuming) return;

                    const elapsed = now - this.resumeStartTime;
                    if (elapsed >= 500) { // 0.5s duration
                        this.isResuming = false;
                        this.isPaused = false;
                        this.timeScale = 0.1; // Start in slow motion
                        this.loop();
                    } else {
                        this.render();
                        this.resumeAnimationId = requestAnimationFrame(animateResume);
                    }
                };
                this.resumeAnimationId = requestAnimationFrame(animateResume);
            }
        });

        this.render();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    start() {
        this.isStarted = true;
        this.isGameOver = false;
        this.isLevelUpState = false;
        this.score = 0;
        this.pipes = [];
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.timeScale = 1.0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 5;
        this.safeUntil = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.activePowerups = {}; // keys: id, values: count
        this.xpMultiplier = 1.0;

        // Reset Bird Size
        this.bird.width = 30;
        this.bird.height = 30;

        this.shieldUntil = 0;
        this.invincibleUntil = 0;
        this.beamActive = false;
        this.container.querySelector('#flappy-start').style.display = 'none';
        this.container.querySelector('#flappy-over').style.display = 'none';
        this.loop();
    }

    handleInput(e) {
        if (e.type === 'keydown' && e.code !== 'Space') return;
        if (e.type === 'mousedown') e.preventDefault();

        // Prevent input if paused or resuming
        if (!this.isStarted || this.isGameOver || this.isPaused || this.isResuming) return;

        this.bird.velocity = this.bird.jump;
        this.playSound('jump');
    }

    updateSettings(settings) {
        if (settings.pauseOnLeave !== undefined) {
            this.pauseOnLeave = settings.pauseOnLeave;
        }
        if (settings.muted !== undefined) {
            this.isMuted = settings.muted;
            if (!this.isMuted && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        }
        if (settings.shake !== undefined) {
            this.shakeEnabled = settings.shake;
        }
    }

    triggerShake() {
        if (!this.shakeEnabled) return;
        const modal = this.container.closest('.p2p-modal');
        if (modal) {
            modal.classList.remove('shake-anim');
            // Use requestAnimationFrame to re-add class in next frame
            // This avoids synchronous reflow which might cause flickering
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modal.classList.add('shake-anim');
                    setTimeout(() => modal.classList.remove('shake-anim'), 300);
                });
            });
        }
    }

    playSound(type) {
        if (this.isMuted) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'jump') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'score') {
            // Ode to Joy Melody (C Major)
            // E E F G | G F E D | C C D E | E D D
            const notes = [
                1046.50, // 0: C6
                1174.66, // 1: D6
                1318.51, // 2: E6
                1396.91, // 3: F6
                1567.98, // 4: G6
            ];
            const melody = [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1];
            const noteIndex = melody[this.score % melody.length];
            const baseFreq = notes[noteIndex];

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.05); // Rapid up (Fifth above approx)

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'crash') {
            osc.type = 'sawtooth'; // Harsh sound
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    update() {
        if (!this.isStarted || this.isGameOver) return;

        // Ramp up timeScale smoothly
        if (this.timeScale < 1.0) {
            this.timeScale += 0.02;
            if (this.timeScale > 1.0) this.timeScale = 1.0;
        }

        // Dynamic Difficulty - Smooth linear progression
        this.pipeSpeed = this.basePipeSpeed + (this.score * 0.05);

        // Update pipes with initial delay and dynamic distance
        // Research suggests opening the gap as speed increases to maintain reaction window
        const targetDistance = 180 + (this.pipeSpeed - this.basePipeSpeed) * 60;

        let shouldSpawn = false;
        const now = performance.now();
        const isSafe = now < this.safeUntil;

        if (this.frame > 150 && !isSafe) {
            if (this.pipes.length === 0) {
                shouldSpawn = true;
            } else {
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (this.canvas.width - lastPipe.x >= targetDistance) {
                    shouldSpawn = true;
                }
            }
        }

        this.bird.velocity += this.bird.gravity * this.timeScale;
        this.bird.y += this.bird.velocity * this.timeScale;

        if (this.bird.y + this.bird.height > this.canvas.height) {
            this.handleCollision('ground');
        } else if (this.bird.y < 0) {
            this.handleCollision('ceiling');
        }

        if (shouldSpawn) {
            const minH = 20; // More room at the top
            const maxH = this.canvas.height - this.pipeGap - 20; // More room at the bottom
            const h = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
            this.pipes.push({
                x: this.canvas.width,
                top: h,
                passed: false
            });
        }

        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.pipeSpeed * this.timeScale;

            // Collision with pipes
            if (
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + this.pipeWidth &&
                (this.bird.y < pipe.top || this.bird.y + this.bird.height > pipe.top + this.pipeGap)
            ) {
                this.handleCollision(pipe);
            }

            // Score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.addXP(1);
                this.playSound('score');
                this.triggerShake();
            }

            // Remove offscreen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(index, 1);
            }
        });

        if (this.beamActive) {
            this.beamX += 60 * this.timeScale; // Faster beam
            const beamWorldX = this.bird.x + this.bird.width + this.beamX;

            // Destroy pipes hit by beam
            this.pipes.forEach(pipe => {
                if (!pipe.fading && pipe.x < beamWorldX) {
                    pipe.fading = true;
                    pipe.fadeStart = performance.now();
                }
            });

            if (beamWorldX > this.canvas.width + 200) {
                this.beamActive = false;
            }
        }

        // Remove fully faded pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            if (this.pipes[i].fading) {
                if (performance.now() - this.pipes[i].fadeStart > 400) { // 0.4s fade duration
                    this.pipes.splice(i, 1);
                }
            }
        }

        this.frame++;
    }

    addXP(amount) {
        this.xp += amount * this.xpMultiplier;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    handleCollision(target) {
        const now = performance.now();

        // Handle physical interactions regardless of invincibility
        if (target && typeof target === 'object') {
            // It's a pipe -> Destroy it
            if (!target.fading) {
                target.fading = true;
                target.fadeStart = now;
            }
        } else if (target === 'ground') {
            // Bounce off ground
            if (this.lives > 0 || (now < this.invincibleUntil)) { // Only bounce if not game over (or if invincible from previous hit)
                this.bird.velocity = -2.0; // Bounce up (slightly stronger than jump)
                this.bird.y = this.canvas.height - this.bird.height;
            }
        } else if (target === 'ceiling') {
            // Bounce off ceiling
            if (this.lives > 0 || (now < this.invincibleUntil)) {
                this.bird.velocity = 0.5; // Gentle bounce down
                this.bird.y = 0;
            }
        }

        if (now < this.safeUntil || now < this.invincibleUntil) return;

        // Luck Powerup (Diamond Hands) - Chance to ignore damage
        if (this.activePowerups['luck']) {
            const chance = Math.min(0.5, this.activePowerups['luck'] * 0.05); // 5% per stack, max 50%
            if (Math.random() < chance) {
                this.invincibleUntil = now + 500; // Brief grace period
                return; // Damage ignored!
            }
        }

        if (now < this.shieldUntil) {
            // Shield breaks
            this.shieldUntil = 0;
            this.invincibleUntil = now + 1000;
            this.playSound('crash'); // Shield break sound
            return;
        }

        this.lives--;
        this.playSound('crash');

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.invincibleUntil = now + 2000; // 2s invincibility
            this.triggerShake();
        }
    }

    levelUp() {
        this.isPaused = true;
        this.isLevelUpState = true;
        this.showLevelUpMenu();
    }

    showLevelUpMenu() {
        const overlay = this.container.querySelector('#flappy-levelup');
        const cardsContainer = overlay.querySelector('.flappy-cards-container');
        cardsContainer.innerHTML = '';

        // Pick 3 UNIQUE random powerups (filter out maxed luck)
        let pool = [...this.powerupDefinitions];
        if ((this.activePowerups['luck'] || 0) >= 10) {
            pool = pool.filter(p => p.id !== 'luck');
        }
        const shuffled = pool.sort(() => 0.5 - Math.random());
        const options = shuffled.slice(0, 3);

        options.forEach(opt => {
            const count = this.activePowerups[opt.id] || 0;
            const countBadge = count > 0 ? `<div style="position: absolute; top: -10px; right: -10px; background: #c8aa6e; color: #000; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #fff;">x${count}</div>` : '';

            const card = document.createElement('div');
            card.className = 'flappy-card';
            card.style.cssText = `
                background: linear-gradient(135deg, #1e2328, #0a0a0c);
                border: 2px solid #c8aa6e;
                border-radius: 8px;
                padding: 10px;
                width: 100px;
                cursor: not-allowed;
                transition: transform 0.3s, box-shadow 0.3s, opacity 0.5s;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                pointer-events: none;
                opacity: 0;
                transform: translateY(20px);
            `;
            card.innerHTML = `
                ${countBadge}
                <div style="font-size: 13px; font-weight: bold; color: #f0e6d2; margin-bottom: 5px;">${opt.name}</div>
                <div style="font-size: 10px; color: #a09b8c;">${opt.desc}</div>
            `;

            // Entry Animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);

            // Enable Clicking after 1s
            setTimeout(() => {
                card.style.pointerEvents = 'auto';
                card.style.cursor = 'pointer';
            }, 1000);

            card.onmouseenter = () => {
                if (card.style.pointerEvents === 'auto') {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 5px 15px rgba(200, 170, 110, 0.3)';
                }
            };
            card.onmouseleave = () => {
                if (card.style.pointerEvents === 'auto') {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                }
            };
            card.onclick = () => this.selectPowerup(opt);

            cardsContainer.appendChild(card);
        });

        overlay.style.display = 'flex';
    }

    selectPowerup(powerup) {
        // Apply Powerup
        this.activePowerups[powerup.id] = (this.activePowerups[powerup.id] || 0) + 1;

        if (powerup.id === 'shrink') {
            this.bird.width *= 0.85;
            this.bird.height *= 0.85;
        } else if (powerup.id === 'maxlife') {
            this.maxLives++;
        } else if (powerup.id === 'heal') {
            this.lives = this.maxLives;
        } else if (powerup.id === 'xp') {
            this.xpMultiplier += 0.5;
        }

        // Resume Level Up Flow
        this.container.querySelector('#flappy-levelup').style.display = 'none';
        this.isPaused = false;
        this.isLevelUpState = false;
        this.loop();

        // Trigger Level Up Effects
        this.level++;
        this.xp = 0;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

        // Visuals
        this.beamActive = true;
        this.beamX = 0;
        this.safeUntil = performance.now() + 1500;

        // Base reward (Heal or Shield) - Logic modified to always give shield if full health or specific powerup
        // Base reward (Heal or Shield) - 5s base + 1s per extra stack
        if (this.activePowerups['shield'] || this.lives >= this.maxLives) {
            const stacks = this.activePowerups['shield'] || 1;
            const extraTime = (stacks - 1) * 1000;
            this.shieldUntil = performance.now() + 5000 + extraTime;
        } else {
            this.lives++;
        }

        this.playSound('score');
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background (Simple Targon Gradient)
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#1e2328');
        grad.addColorStop(1, '#010a13');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Beam Effect (Thin intense laser)
        if (this.beamActive) {
            this.ctx.save();
            const beamY = this.bird.y + this.bird.height / 2;
            const beamLen = this.beamX;

            // Outer Glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ffff';

            // Main Beam
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.bird.x + this.bird.width, beamY - 2, beamLen, 4);

            // Inner Core
            this.ctx.fillStyle = '#ccffff';
            this.ctx.fillRect(this.bird.x + this.bird.width, beamY - 1, beamLen, 2);

            this.ctx.restore();
        }

        // Draw Pipes (Hextech Pillars)
        const now = performance.now();
        this.pipes.forEach(pipe => {
            if (pipe.destroyed) return; // Should not happen with new logic but safe to keep

            this.ctx.save();

            if (pipe.fading) {
                // White Flash Fade Effect
                const fadeProgress = (now - pipe.fadeStart) / 400;
                // Fade out opacity
                this.ctx.globalAlpha = 1 - fadeProgress;
            }

            const capHeight = 24;

            // Pipe Body Gradient (Metallic Gold)
            const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            gradient.addColorStop(0, '#594a25');   // Darker edge
            gradient.addColorStop(0.2, '#917032');  // Mid-dark
            gradient.addColorStop(0.5, '#c8aa6e');  // Highlight center
            gradient.addColorStop(0.8, '#917032');  // Mid-dark
            gradient.addColorStop(1, '#594a25');   // Darker edge

            this.ctx.strokeStyle = '#010a13'; // Dark border for definition
            this.ctx.lineWidth = 2;

            // --- Top Pipe ---
            // Draw Body
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pipe.x + 4, 0, this.pipeWidth - 8, pipe.top - capHeight);
            this.ctx.strokeRect(pipe.x + 4, -2, this.pipeWidth - 8, pipe.top - capHeight + 2);

            // Draw Cap (The end facing the bird)
            this.ctx.fillStyle = '#785a28';
            this.ctx.fillRect(pipe.x, pipe.top - capHeight, this.pipeWidth, capHeight);
            this.ctx.strokeRect(pipe.x, pipe.top - capHeight, this.pipeWidth, capHeight);

            // Cap Detail (Inner Glow/Highlight)
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.fillRect(pipe.x + 6, pipe.top - capHeight + 6, this.pipeWidth - 12, capHeight - 12);
            this.ctx.fillStyle = '#f0e6d2'; // Shine
            this.ctx.fillRect(pipe.x + 10, pipe.top - capHeight + 8, 4, 4);

            // --- Bottom Pipe ---
            // Draw Cap
            this.ctx.fillStyle = '#785a28';
            this.ctx.fillRect(pipe.x, pipe.top + this.pipeGap, this.pipeWidth, capHeight);
            this.ctx.strokeRect(pipe.x, pipe.top + this.pipeGap, this.pipeWidth, capHeight);

            // Cap Detail
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.fillRect(pipe.x + 6, pipe.top + this.pipeGap + 6, this.pipeWidth - 12, capHeight - 12);
            this.ctx.fillStyle = '#f0e6d2'; // Shine
            this.ctx.fillRect(pipe.x + 10, pipe.top + this.pipeGap + 8, 4, 4);

            // Draw Body
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pipe.x + 4, pipe.top + this.pipeGap + capHeight, this.pipeWidth - 8, this.canvas.height);
            this.ctx.strokeRect(pipe.x + 4, pipe.top + this.pipeGap + capHeight, this.pipeWidth - 8, this.canvas.height);

            if (pipe.fading) {
                // Anime White Flash Effect
                // Draw white silhouette over everything we just drew for this pipe
                this.ctx.globalCompositeOperation = 'source-atop';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(pipe.x, 0, this.pipeWidth, this.canvas.height);

                // Also can use globalAlpha from before to fade the WHOLE thing out
            }

            this.ctx.restore();
        });

        // Draw Bird (Taric Icon)
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);

        // Rotate based on velocity for juice
        const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.bird.velocity * 0.1)));
        this.ctx.rotate(rotation);

        if (this.imgLoaded) {
            // Draw actual Taric icon
            this.ctx.drawImage(
                this.birdImg,
                -this.bird.width / 2,
                -this.bird.height / 2,
                this.bird.width,
                this.bird.height
            );

            // Damage Flash Effect (Red Tint)
            if (performance.now() < this.invincibleUntil) {
                const remaining = this.invincibleUntil - performance.now();
                let showRed = true;

                // Blink in the last 1 second (Fast Blink, 100ms cycle)
                if (remaining < 1000) {
                    if (Math.floor(performance.now() / 100) % 2 === 0) showRed = false;
                }

                if (showRed) {
                    this.ctx.globalCompositeOperation = 'source-atop';
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
                    this.ctx.fillRect(-this.bird.width / 2, -this.bird.height / 2, this.bird.width, this.bird.height);
                    this.ctx.globalCompositeOperation = 'source-over';
                }
            }

            // Crystal glow border
            this.ctx.strokeStyle = '#c8aa6e';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-this.bird.width / 2, -this.bird.height / 2, this.bird.width, this.bird.height);
        } else {
            // Fallback: Simplified Taric Icon (Blue square with eyes)
            this.ctx.fillStyle = '#005a82';
            this.ctx.strokeStyle = '#c8aa6e';
            this.ctx.beginPath();
            this.ctx.roundRect(-this.bird.width / 2, -this.bird.height / 2, this.bird.width, this.bird.height, 5);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = '#f0e6d2';
            this.ctx.fillRect(5, -5, 4, 4); // Eyes in rotated space
        }
        this.ctx.restore();

        // Draw Shield
        if (performance.now() < this.shieldUntil) {
            const remaining = this.shieldUntil - performance.now();
            let showShield = true;

            // Blink in the last 1 second
            if (remaining < 1000) {
                if (Math.floor(performance.now() / 100) % 2 === 0) showShield = false;
            }

            if (showShield) {
                this.ctx.save();
                this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.bird.width * 0.8, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        // Safe Mode Visual
        if (performance.now() < this.safeUntil && !this.beamActive) {
            this.ctx.save();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`LEVEL ${this.level}!`, this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.restore();
        }

        // Draw Score & HUD
        if (this.isStarted && !this.isGameOver) {
            // Draw Score
            this.ctx.fillStyle = '#f0e6d2';
            this.ctx.font = 'bold 32px Beaufort for LOL, Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.score, this.canvas.width / 2, 50);

            // Draw Lives (Gems)
            for (let i = 0; i < this.maxLives; i++) {
                // Use Taric Blue for lives instead of Red
                this.ctx.fillStyle = i < this.lives ? '#00eaff' : '#334455';
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;

                const lx = 20 + i * 25;
                const ly = 30;
                const size = 6;
                const height = 10;

                this.ctx.beginPath();
                this.ctx.moveTo(lx, ly - height); // Top
                this.ctx.lineTo(lx + size, ly);   // Right
                this.ctx.lineTo(lx, ly + height); // Bottom
                this.ctx.lineTo(lx - size, ly);   // Left
                this.ctx.closePath();

                this.ctx.fill();
                this.ctx.stroke();

                // Shine
                if (i < this.lives) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.moveTo(lx, ly - height + 3);
                    this.ctx.lineTo(lx + 2, ly - 2);
                    this.ctx.lineTo(lx, ly);
                    this.ctx.lineTo(lx - 2, ly - 2);
                    this.ctx.fill();
                }
            }

            // Draw XP Bar
            const barHeight = 6;
            const barY = this.canvas.height - barHeight;
            const progress = Math.min(1, this.xp / this.xpToNextLevel);

            // Bar Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, barY, this.canvas.width, barHeight);

            // Bar Fill (Gold/Hextech)
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.fillRect(0, barY, this.canvas.width * progress, barHeight);

            // Level Text & Multiplier
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'left';
            let lvlText = `Lvl ${this.level}`;
            if (this.xpMultiplier > 1.0) lvlText += ` (XP x${this.xpMultiplier.toFixed(1)})`;
            this.ctx.fillText(lvlText, 5, barY - 4);
        }


        // Draw Pause Overlay
        if (this.isPaused && !this.isLevelUpState) {
            if (this.isResuming) {
                // Ripple Effect (Water touch)
                const now = performance.now();
                const progress = Math.min(1, (now - this.resumeStartTime) / 500);
                const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.6;

                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

                // Expanding Ring 1
                this.ctx.beginPath();
                this.ctx.arc(0, 0, progress * maxRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(200, 170, 110, ${1 - progress})`; // Gold fade
                this.ctx.lineWidth = 10 * (1 - progress);
                this.ctx.stroke();

                // Expanding Ring 2 (Delayed)
                if (progress > 0.3) {
                    const p2 = (progress - 0.3) / 0.7;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p2 * maxRadius * 0.8, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `rgba(240, 230, 210, ${1 - p2})`; // Light fade
                    this.ctx.lineWidth = 6 * (1 - p2);
                    this.ctx.stroke();
                }

                this.ctx.restore();
            } else {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                this.ctx.fillStyle = '#f0e6d2';
                this.ctx.font = 'bold 30px Beaufort for LOL';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            }
        }
    }

    loop() {
        if (this.isGameOver || this.isPaused) return;
        this.update();
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.isGameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappy_high_score', this.highScore);
        }
        this.container.querySelector('#flappy-over').style.display = 'flex';
        this.container.querySelector('#final-score').innerText = this.score;
        cancelAnimationFrame(this.animationId);
    }

    destroy() {
        window.removeEventListener('keydown', this.handleInput);
        this.canvas.removeEventListener('mousedown', this.handleInput);
        cancelAnimationFrame(this.animationId);
    }
}
