class RacingUI {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.time = 0;
        this.lapTime = 0;
        this.lap = 1;
        this.maxLaps = 3;
        this.speed = 0;
        this.rpm = 0;
        this.gear = 1;
        this.boost = 100;
        this.score = 0;
        this.position = 1;
        this.totalPlayers = 4;
        
        this.lastTime = 0;
        this.isPaused = false;
        this.keys = {};
        this.touchStart = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateMiniMap = this.updateMiniMap.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop);
        
        // Load saved options
        this.soundVolume = localStorage.getItem('soundVol') || 80;
        this.musicVolume = localStorage.getItem('musicVol') || 70;
        this.soundSlider.value = this.soundVolume;
        this.musicSlider.value = this.musicVolume;
    }
    
    cacheElements() {
        this.menuScreen = document.getElementById('menuScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.optionsScreen = document.getElementById('optionsScreen');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.startBtn = document.getElementById('startBtn');
        this.optionsBtn = document.getElementById('optionsBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.restartRaceBtn = document.getElementById('restartRaceBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.menuFromOverBtn = document.getElementById('menuFromOverBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        this.soundSlider = document.getElementById('soundSlider');
        this.musicSlider = document.getElementById('musicSlider');
        
        // HUD elements
        this.timerEl = document.querySelector('.timer');
        this.positionEl = document.querySelector('.position');
        this.speedNeedle = document.getElementById('speedNeedle');
        this.speedValue = document.getElementById('speedValue');
        this.digitalSpeed = document.getElementById('digitalSpeed');
        this.rpmBar = document.getElementById('rpmBar');
        this.rpmValue = document.getElementById('rpmValue');
        this.gearEl = document.querySelector('.gear');
        this.boostFill = document.getElementById('boostFill');
        this.scoreEl = document.querySelector('.score');
        this.finalTimeEl = document.getElementById('finalTime');
        this.finalPositionEl = document.getElementById('finalPosition');
        this.finalScoreEl = document.getElementById('finalScore');
        this.miniMapCanvas = document.getElementById('miniMap');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
    }
    
    bindEvents() {
        // Buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.optionsBtn.addEventListener('click', () => this.showScreen('options'));
        this.backToMenuBtn.addEventListener('click', () => this.showScreen('menu'));
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.restartRaceBtn.addEventListener('click', () => this.restartGame());
        this.menuBtn.addEventListener('click', () => this.showScreen('menu'));
        this.menuFromOverBtn.addEventListener('click', () => this.showScreen('menu'));
        
        // Sliders
        this.soundSlider.addEventListener('input', (e) => {
            this.soundVolume = e.target.value;
            localStorage.setItem('soundVol', this.soundVolume);
        });
        this.musicSlider.addEventListener('input', (e) => {
            this.musicVolume = e.target.value;
            localStorage.setItem('musicVol', this.musicVolume);
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') this.useBoost();
            if (e.code === 'KeyP') this.togglePause();
            if (e.code === 'KeyR' && this.gameState === 'gameover') this.restartGame();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStart = { x: touch.clientX, y: touch.clientY };
            if (this.gameState === 'playing') this.useBoost();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touchStart.x) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStart.x;
            if (Math.abs(deltaX) > 50) {
                this.steer(deltaX > 0 ? 'right' : 'left');
                this.touchStart = { x: touch.clientX, y: touch.clientY };
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            this.touchStart = { x: 0, y: 0 };
        });
    }
    
    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        switch(screen) {
            case 'menu': this.menuScreen.classList.add('active'); break;
            case 'game': this.gameScreen.classList.add('active'); break;
            case 'gameover': this.gameOverScreen.classList.add('active'); break;
            case 'options': this.optionsScreen.classList.add('active'); break;
        }
        this.gameState = screen;
    }
    
    startGame() {
        this.resetStats();
        this.showScreen('game');
        this.gameState = 'playing';
        this.lastTime = performance.now();
    }
    
    restartGame() {
        this.resetStats();
        this.gameState = 'playing';
    }
    
    resetStats() {
        this.time = 0;
        this.lapTime = 0;
        this.lap = 1;
        this.speed = 0;
        this.rpm = 0;
        this.gear = 1;
        this.boost = 100;
        this.score = 0;
        this.position = 1;
    }
    
    togglePause() {
        if (this.gameState !== 'playing') return;
        this.isPaused = !this.isPaused;
        this.pauseOverlay.classList.toggle('hidden', !this.isPaused);
    }
    
    steer(direction) {
        // Visual steering feedback
        if (direction === 'left') {
            document.body.style.setProperty('--steer', '-5deg');
        } else {
            document.body.style.setProperty('--steer', '5deg');
        }
        setTimeout(() => {
            document.body.style.setProperty('--steer', '0deg');
        }, 200);
    }
    
    useBoost() {
        if (this.boost > 0) {
            this.boost -= 10;
            this.speed = Math.min(320, this.speed + 50);
            this.score += 100;
        }
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const millis = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        // Update time
        this.time += deltaTime;
        this.lapTime += deltaTime;
        
        // Simulate race progress
        this.speed = Math.sin(this.time * 0.01) * 150 + 180 + Math.random() * 20;
        this.speed = Math.max(0, Math.min(320, this.speed));
        this.rpm = (this.speed / 320) * 8000;
        this.gear = Math.min(6, Math.floor(this.speed / 50) + 1);
        
        // Boost regen
        this.boost = Math.min(100, this.boost + deltaTime * 0.1);
        
        // Score
        this.score += Math.floor(this.speed * deltaTime * 0.01);
        
        // Lap logic
        if (this.lapTime > 90000) { // 90s per lap
            this.lap++;
            this.lapTime = 0;
            if (this.lap > this.maxLaps) {
                this.gameOver();
                return;
            }
        }
        
        // Position simulation
        this.position = Math.floor(Math.sin(this.time * 0.005) * 2) + 1;
        this.position = Math.max(1, Math.min(this.totalPlayers, this.position));
        
        this.updateHUD();
    }
    
    updateHUD() {
        // Timer
        this.timerEl.textContent = this.formatTime(this.time);
        
        // Position
        this.positionEl.textContent = `P${this.position} / ${this.totalPlayers}`;
        
        // Speedometer
        const speedDeg = (this.speed / 320) * 180 - 90;
        this.speedNeedle.style.transform = `translate(-50%, -100%) rotate(${speedDeg}deg)`;
        this.speedValue.textContent = Math.floor(this.speed);
        this.digitalSpeed.textContent = Math.floor(this.speed).toString().padStart(3, '0');
        
        // RPM
        this.rpmBar.style.width = `${(this.rpm / 8000) * 100}%`;
        this.rpmValue.textContent = Math.floor(this.rpm / 1000);
        
        // Gear
        this.gearEl.textContent = this.gear;
        
        // Boost
        this.boostFill.style.width = `${this.boost}%`;
        
        // Score
        this.scoreEl.textContent = `SCORE: ${this.score.toLocaleString()}`;
        
        // Lap
        document.querySelector('.lap-current').textContent = `LAP ${this.lap}/${this.maxLaps}`;
        document.querySelector('.lap-time').textContent = this.formatTime(this.lapTime);
    }
    
    updateMiniMap() {
        const ctx = this.miniMapCtx;
        const w = 120, h = 120;
        ctx.clearRect(0, 0, w, h);
        
        // Track
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        // Player
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(w/2 + Math.sin(this.time * 0.05) * 40, h/2 - Math.cos(this.time * 0.05) * 40, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Opponents
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `hsl(${120 + i * 60}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(w/2 + Math.sin(this.time * 0.03 + i) * 35, h/2 - Math.cos(this.time * 0.03 + i) * 35, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        this.finalTimeEl.textContent = this.formatTime(this.time);
        this.finalPositionEl.textContent = `${['1st', '2nd', '3rd', '4th'][this.position - 1]} PLACE`;
        this.finalScoreEl.textContent = `SCORE: ${this.score.toLocaleString()}`;
        this.showScreen('gameover');
    }
    
    gameLoop(currentTime) {
        const deltaTime = Math.min(16, currentTime - this.lastTime);
        this.lastTime = currentTime;
        
        // Input handling
        if (this.gameState === 'playing' && !this.isPaused) {
            if (this.keys['ArrowLeft']) this.steer('left');
            if (this.keys['ArrowRight']) this.steer('right');
        }
        
        this.update(deltaTime);
        this.updateMiniMap();
        
        this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    new RacingUI();
});

// Prevent zoom on mobile
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
