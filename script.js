// 3D CAR RACING GAME - SIMPLIFIED WORKING VERSION

// Game Variables
let scene, camera, renderer;
let car, carWheels = [];
let road;
let keyboard = {};
let touchControls = {};
let lastTime = 0;

// Game State
let gameState = {
    isRunning: false,
    isGameOver: false,
    currentLap: 1,
    totalLaps: 3,
    startTime: 0,
    currentTime: 0
};

// Car Physics
let carPhysics = {
    speed: 0,
    maxSpeed: 0.5,
    acceleration: 0.002,
    brakePower: 0.005,
    steering: 0,
    maxSteering: 0.05,
    rotation: 0,
    x: 0,
    y: 0.5,
    z: 0
};

// Mobile detection
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// DOM Elements
let loadingScreen, startScreen, gameOverScreen;
let speedValue, speedBar, scoreDisplay;
let leftBtn, rightBtn, accelerateBtn, brakeBtn;
let startBtn, restartBtn;

// Initialize Game
function init() {
    console.log("Initializing game...");
    
    // Get DOM elements
    loadingScreen = document.getElementById('loadingScreen');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    speedValue = document.querySelector('.speed-value');
    speedBar = document.querySelector('.speed-bar');
    scoreDisplay = document.getElementById('score');
    
    leftBtn = document.getElementById('leftBtn');
    rightBtn = document.getElementById('rightBtn');
    accelerateBtn = document.getElementById('accelerateBtn');
    brakeBtn = document.getElementById('brakeBtn');
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    
    // Initialize Three.js
    initThreeJS();
    
    // Create game world
    createWorld();
    
    // Create car
    createCar();
    
    // Create track
    createTrack();
    
    // Setup lighting
    setupLighting();
    
    // Setup controls
    setupControls();
    
    // Start animation
    animate();
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    }, 500);
}

// Initialize Three.js
function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create game world
function createWorld() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7c3a });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);
}

// Create car
function createCar() {
    const carGroup = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(3, 1, 5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff3300 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    carGroup.add(body);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        
        if (i < 2) {
            wheel.position.y = 0.3;
            wheel.position.z = 1.8;
            wheel.position.x = i === 0 ? -1.5 : 1.5;
        } else {
            wheel.position.y = 0.3;
            wheel.position.z = -1.8;
            wheel.position.x = i === 2 ? -1.5 : 1.5;
        }
        
        carWheels.push(wheel);
        carGroup.add(wheel);
    }
    
    car = carGroup;
    scene.add(car);
    car.position.set(carPhysics.x, carPhysics.y, carPhysics.z);
}

// Create track
function createTrack() {
    // Road
    const roadGeometry = new THREE.PlaneGeometry(20, 200);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    scene.add(road);
    
    // Road markings
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
    // Center line
    for (let z = -100; z < 100; z += 10) {
        const points = [
            new THREE.Vector3(0, 0.02, z),
            new THREE.Vector3(0, 0.02, z + 5)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
    }
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);
}

// Setup controls
function setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        keyboard[e.key.toLowerCase()] = true;
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keyboard[e.key.toLowerCase()] = false;
    });
    
    // Touch controls
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls.left = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls.left = false; });
    leftBtn.addEventListener('mousedown', () => { touchControls.left = true; });
    leftBtn.addEventListener('mouseup', () => { touchControls.left = false; });
    leftBtn.addEventListener('mouseleave', () => { touchControls.left = false; });
    
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls.right = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls.right = false; });
    rightBtn.addEventListener('mousedown', () => { touchControls.right = true; });
    rightBtn.addEventListener('mouseup', () => { touchControls.right = false; });
    rightBtn.addEventListener('mouseleave', () => { touchControls.right = false; });
    
    accelerateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls.accelerate = true; });
    accelerateBtn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls.accelerate = false; });
    accelerateBtn.addEventListener('mousedown', () => { touchControls.accelerate = true; });
    accelerateBtn.addEventListener('mouseup', () => { touchControls.accelerate = false; });
    accelerateBtn.addEventListener('mouseleave', () => { touchControls.accelerate = false; });
    
    brakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls.brake = true; });
    brakeBtn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls.brake = false; });
    brakeBtn.addEventListener('mousedown', () => { touchControls.brake = true; });
    brakeBtn.addEventListener('mouseup', () => { touchControls.brake = false; });
    brakeBtn.addEventListener('mouseleave', () => { touchControls.brake = false; });
    
    // Game buttons
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Mobile instructions
    if (isMobile) {
        document.getElementById('mobileInstructions').style.display = 'block';
    }
}

// Window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start game
function startGame() {
    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.startTime = Date.now();
    gameState.currentLap = 1;
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Reset car position
    carPhysics.x = 0;
    carPhysics.y = 0.5;
    carPhysics.z = -90;
    carPhysics.speed = 0;
    carPhysics.steering = 0;
    carPhysics.rotation = 0;
    
    car.position.set(carPhysics.x, carPhysics.y, carPhysics.z);
    car.rotation.y = 0;
}

// Restart game
function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

// Update game
function updateGame() {
    if (!gameState.isRunning) return;
    
    // Update time
    gameState.currentTime = Date.now() - gameState.startTime;
    
    // Update score
    updateScore();
    
    // Check boundaries
    if (carPhysics.z > 100) {
        carPhysics.z = -100;
        gameState.currentLap++;
        if (gameState.currentLap > gameState.totalLaps) {
            endGame();
        }
    }
}

// Update score display
function updateScore() {
    const seconds = Math.floor(gameState.currentTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    scoreDisplay.textContent = `Lap: ${gameState.currentLap}/${gameState.totalLaps} | Time: ${minutes}:${secs.toString().padStart(2, '0')}`;
}

// End game
function endGame() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    
    const totalSeconds = Math.floor(gameState.currentTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('finalTime').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    gameOverScreen.style.display = 'flex';
}

// Update car physics
function updateCar(deltaTime) {
    if (!gameState.isRunning) return;
    
    // Acceleration
    if (keyboard['arrowup'] || keyboard['w'] || touchControls.accelerate) {
        carPhysics.speed += carPhysics.acceleration * deltaTime;
    }
    
    // Braking
    if (keyboard['arrowdown'] || keyboard['s'] || touchControls.brake) {
        carPhysics.speed -= carPhysics.brakePower * deltaTime;
    }
    
    // Steering
    if (keyboard['arrowleft'] || keyboard['a'] || touchControls.left) {
        carPhysics.steering = carPhysics.maxSteering;
    } else if (keyboard['arrowright'] || keyboard['d'] || touchControls.right) {
        carPhysics.steering = -carPhysics.maxSteering;
    } else {
        carPhysics.steering *= 0.9; // Smooth steering return
    }
    
    // Clamp speed
    carPhysics.speed = Math.max(0, Math.min(carPhysics.speed, carPhysics.maxSpeed));
    
    // Update rotation
    if (Math.abs(carPhysics.speed) > 0.01) {
        carPhysics.rotation -= carPhysics.steering * carPhysics.speed * 20 * deltaTime;
    }
    
    // Update position
    const moveDistance = carPhysics.speed * deltaTime * 100;
    carPhysics.x += Math.sin(carPhysics.rotation) * moveDistance;
    carPhysics.z += Math.cos(carPhysics.rotation) * moveDistance;
    
    // Keep car on road
    carPhysics.x = Math.max(-10, Math.min(10, carPhysics.x));
    
    // Update car position and rotation
    car.position.set(carPhysics.x, carPhysics.y, carPhysics.z);
    car.rotation.y = carPhysics.rotation;
    
    // Update wheels
    updateWheels(deltaTime);
    
    // Update speedometer
    updateSpeedometer();
}

// Update wheels
function updateWheels(deltaTime) {
    const wheelRotation = carPhysics.speed * deltaTime * 50;
    
    for (const wheel of carWheels) {
        wheel.rotation.x -= wheelRotation;
    }
    
    // Front wheels steering
    if (carWheels.length >= 2) {
        carWheels[0].rotation.y = carPhysics.steering * 2;
        carWheels[1].rotation.y = carPhysics.steering * 2;
    }
}

// Update speedometer
function updateSpeedometer() {
    const speedKmh = Math.abs(carPhysics.speed * 200);
    speedValue.textContent = Math.floor(speedKmh);
    
    const speedPercent = (speedKmh / (carPhysics.maxSpeed * 200)) * 100;
    speedBar.style.width = `${speedPercent}%`;
}

// Update camera
function updateCamera() {
    if (!gameState.isRunning) return;
    
    // Camera follows car from behind
    const cameraDistance = 15;
    const cameraHeight = 10;
    
    const cameraX = carPhysics.x + Math.sin(carPhysics.rotation) * cameraDistance;
    const cameraZ = carPhysics.z + Math.cos(carPhysics.rotation) * cameraDistance;
    
    camera.position.x += (cameraX - camera.position.x) * 0.1;
    camera.position.z += (cameraZ - camera.position.z) * 0.1;
    camera.position.y = cameraHeight;
    
    camera.lookAt(carPhysics.x, carPhysics.y + 2, carPhysics.z);
}

// Animation loop
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    const deltaTime = Math.min(currentTime - lastTime, 100) / 16;
    lastTime = currentTime;
    
    if (gameState.isRunning) {
        updateCar(deltaTime);
        updateGame();
        updateCamera();
    }
    
    renderer.render(scene, camera);
}

// Initialize on load
window.addEventListener('load', init);

// Prevent default behaviors
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') e.preventDefault();
});
        
