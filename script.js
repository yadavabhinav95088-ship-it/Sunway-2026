
// ============================================
// 3D CAR RACING GAME - COMPLETE
// ============================================

// Game State
let gameState = {
    isRunning: false,
    isGameOver: false,
    isPaused: false,
    currentLap: 1,
    totalLaps: 3,
    lapTimes: [],
    startTime: 0,
    currentTime: 0,
    difficulty: 'medium'
};

// Game Variables
let scene, camera, renderer, controls;
let car, road, world;
let keyboard = {};
let touchControls = {};
let lastTime = 0;
let gameSpeed = 1;

// Car Physics
let carPhysics = {
    speed: 0,
    maxSpeed: 0.5,
    acceleration: 0.002,
    deceleration: 0.001,
    brakePower: 0.005,
    steering: 0,
    maxSteering: 0.05,
    steeringSpeed: 0.002,
    friction: 0.98,
    rotation: 0,
    position: new THREE.Vector3(0, 0.5, 0)
};

// Track Data
let track = {
    width: 20,
    length: 200,
    segments: [],
    checkpoints: []
};

// Mobile tilt control
let alpha = 0;
let beta = 0;
let gamma = 0;
let isMobile = false;

// Three.js Objects
let carBody, carWheels = [];
let roadMesh, roadLines = [];
let obstacles = [];
let trees = [];
let buildings = [];

// DOM Elements
let loadingScreen, startScreen, gameOverScreen;
let speedometer, speedValue, speedBar, scoreDisplay;
let leftBtn, rightBtn, accelerateBtn, brakeBtn;
let startBtn, restartBtn, difficultySelect;

// Initialize the game
function init() {
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
    difficultySelect = document.getElementById('difficultySelect');
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize Three.js
    initThreeJS();
    
    // Create game world
    createWorld();
    
    // Create car
    createCar();
    
    // Create track
    createTrack();
    
    // Add lighting
    setupLighting();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup device orientation for mobile tilt
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        setupDeviceOrientation();
    }
    
    // Start game loop
    animate();
    
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    }, 1000);
}

// Initialize Three.js
function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 200);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create game world
function createWorld() {
    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3a7c3a 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Create the car
function createCar() {
    const carGroup = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(3, 1, 5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff3300,
        roughness: 0.8
    });
    carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.castShadow = true;
    carBody.position.y = 0.5;
    carGroup.add(carBody);
    
    // Car roof
    const roofGeometry = new THREE.BoxGeometry(2, 0.5, 2.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x222222 
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.25;
    roof.position.z = -0.5;
    roof.castShadow = true;
    carGroup.add(roof);
    
    // Car windows
    const windowGeometry = new THREE.BoxGeometry(2.1, 0.3, 1.5);
    const windowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.y = 1.05;
    windowMesh.position.z = 0.5;
    carGroup.add(windowMesh);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x222222 
    });
    
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        
        if (i < 2) { // Front wheels
            wheel.position.y = 0.3;
            wheel.position.z = 1.8;
            wheel.position.x = i === 0 ? -1.5 : 1.5;
        } else { // Rear wheels
            wheel.position.y = 0.3;
            wheel.position.z = -1.8;
            wheel.position.x = i === 2 ? -1.5 : 1.5;
        }
        
        wheel.castShadow = true;
        carWheels.push(wheel);
        carGroup.add(wheel);
    }
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffcc 
    });
    
    const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightLeft.position.set(-1, 0.5, 2.5);
    carGroup.add(headlightLeft);
    
    const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightRight.position.set(1, 0.5, 2.5);
    carGroup.add(headlightRight);
    
    // Tail lights
    const taillightGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const taillightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000 
    });
    
    const taillightLeft = new THREE.Mesh(taillightGeometry, taillightMaterial);
    taillightLeft.position.set(-1, 0.5, -2.5);
    carGroup.add(taillightLeft);
    
    const taillightRight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    taillightRight.position.set(1, 0.5, -2.5);
    carGroup.add(taillightRight);
    
    car = carGroup;
    scene.add(car);
    
    // Set initial position
    car.position.copy(carPhysics.position);
}

// Create the race track
function createTrack() {
    // Road geometry
    const roadGeometry = new THREE.PlaneGeometry(track.width, track.length);
    const roadMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x333333,
        roughness: 0.9
    });
    
    roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.01;
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
    
    // Create road markings
    createRoadMarkings();
    
    // Create barriers
    createBarriers();
    
    // Create checkpoints
    createCheckpoints();
    
    // Create scenery
    createScenery();
}

// Create road markings
function createRoadMarkings() {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
    // Center line
    for (let z = -track.length/2; z < track.length/2; z += 10) {
        const points = [];
        points.push(new THREE.Vector3(0, 0.02, z));
        points.push(new THREE.Vector3(0, 0.02, z + 5));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        roadLines.push(line);
        scene.add(line);
    }
    
    // Edge lines
    const edgeLineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
    // Left edge
    for (let z = -track.length/2; z < track.length/2; z += 15) {
        const points = [];
        points.push(new THREE.Vector3(-track.width/2, 0.02, z));
        points.push(new THREE.Vector3(-track.width/2, 0.02, z + 7.5));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, edgeLineMaterial);
        roadLines.push(line);
        scene.add(line);
    }
    
    // Right edge
    for (let z = -track.length/2; z < track.length/2; z += 15) {
        const points = [];
        points.push(new THREE.Vector3(track.width/2, 0.02, z));
        points.push(new THREE.Vector3(track.width/2, 0.02, z + 7.5));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, edgeLineMaterial);
        roadLines.push(line);
        scene.add(line);
    }
}

// Create barriers along the track
function createBarriers() {
    const barrierGeometry = new THREE.BoxGeometry(0.5, 1, 1);
    const barrierMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xcccccc 
    });
    
    // Left barriers
    for (let z = -track.length/2; z < track.length/2; z += 5) {
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(-track.width/2 - 1, 0.5, z);
        barrier.castShadow = true;
        barrier.receiveShadow = true;
        obstacles.push(barrier);
        scene.add(barrier);
    }
    
    // Right barriers
    for (let z = -track.length/2; z < track.length/2; z += 5) {
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(track.width/2 + 1, 0.5, z);
        barrier.castShadow = true;
        barrier.receiveShadow = true;
        obstacles.push(barrier);
        scene.add(barrier);
    }
}

// Create checkpoints for lap counting
function createCheckpoints() {
    const checkpointGeometry = new THREE.BoxGeometry(15, 2, 1);
    const checkpointMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
    });
    
    // Start/finish line
    const startLine = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
    startLine.position.set(0, 1, -track.length/2 + 10);
    startLine.userData = { type: 'checkpoint', id: 0 };
    track.checkpoints.push(startLine);
    scene.add(startLine);
    
    // Mid-track checkpoint
    const midCheckpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
    midCheckpoint.position.set(0, 1, track.length/2 - 10);
    midCheckpoint.userData = { type: 'checkpoint', id: 1 };
    track.checkpoints.push(midCheckpoint);
    scene.add(midCheckpoint);
}

// Create scenery (trees, buildings, etc.)
function createScenery() {
    // Trees
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7c3a });
    
    for (let i = 0; i < 50; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * track.length;
        
        // Avoid placing trees on the road
        if (Math.abs(x) < track.width/2 + 5 && Math.abs(z) < track.length/2) {
            continue;
        }
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, 3, z);
        leaves.castShadow = true;
        
        trees.push(trunk, leaves);
        scene.add(trunk);
        scene.add(leaves);
    }
    
    // Buildings (in the distance)
    for (let i = 0; i < 10; i++) {
        const buildingWidth = 5 + Math.random() * 10;
        const buildingHeight = 10 + Math.random() * 20;
        const buildingDepth = 5 + Math.random() * 10;
        
        const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: Math.random() * 0xffffff 
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        // Place buildings far from the track
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        building.position.set(x, buildingHeight/2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        
        buildings.push(building);
        scene.add(building);
    }
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Hemisphere light for more natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3a7c3a, 0.3);
    scene.add(hemisphereLight);
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (event) => {
        keyboard[event.key.toLowerCase()] = true;
        
        // Prevent arrow keys from scrolling the page
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (event) => {
        keyboard[event.key.toLowerCase()] = false;
    });
    
    // Touch controls
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.left = false;
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.right = false;
    });
    
    accelerateBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.accelerate = true;
    });
    
    accelerateBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.accelerate = false;
    });
    
    brakeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.brake = true;
    });
    
    brakeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.brake = false;
    });
    
    // Mouse controls (for desktop testing)
    leftBtn.addEventListener('mousedown', () => { touchControls.left = true; });
    leftBtn.addEventListener('mouseup', () => { touchControls.left = false; });
    leftBtn.addEventListener('mouseleave', () => { touchControls.left = false; });
    
    rightBtn.addEventListener('mousedown', () => { touchControls.right = true; });
    rightBtn.addEventListener('mouseup', () => { touchControls.right = false; });
    rightBtn.addEventListener('mouseleave', () => { touchControls.right = false; });
    
    accelerateBtn.addEventListener('mousedown', () => { touchControls.accelerate = true; });
    accelerateBtn.addEventListener('mouseup', () => { touchControls.accelerate = false; });
    accelerateBtn.addEventListener('mouseleave', () => { touchControls.accelerate = false; });
    
    brakeBtn.addEventListener('mousedown', () => { touchControls.brake = true; });
    brakeBtn.addEventListener('mouseup', () => { touchControls.brake = false; });
    brakeBtn.addEventListener('mouseleave', () => { touchControls.brake = false; });
    
    // Game buttons
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Device orientation (mobile tilt)
    window.addEventListener('deviceorientation', handleDeviceOrientation);
}

// Setup device orientation for iOS
function setupDeviceOrientation() {
    const permissionBtn = document.createElement('button');
    permissionBtn.textContent = 'Enable Tilt Controls';
    permissionBtn.style.cssText = `
        position: absolute;
        bottom: 200px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        background: #ff3300;
        color: white;
        border: none;
        border-radius: 5px;
        z-index: 1000;
    `;
    
    permissionBtn.addEventListener('click', () => {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    permissionBtn.remove();
                }
            })
            .catch(console.error);
    });
    
    document.body.appendChild(permissionBtn);
}

// Handle device orientation for tilt controls
function handleDeviceOrientation(event) {
    alpha = event.alpha; // compass direction
    beta = event.beta;   // front-back tilt
    gamma = event.gamma; // left-right tilt
    
    // Use gamma for steering
    if (Math.abs(gamma) > 5) {
        carPhysics.steering = THREE.MathUtils.clamp(
            -gamma / 50,
            -carPhysics.maxSteering,
            carPhysics.maxSteering
        );
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the game
function startGame() {
    gameState.difficulty = difficultySelect.value;
    
    // Set difficulty
    switch(gameState.difficulty) {
        case 'easy':
            carPhysics.maxSpeed = 0.4;
            carPhysics.acceleration = 0.0015;
            break;
        case 'medium':
            carPhysics.maxSpeed = 0.5;
            carPhysics.acceleration = 0.002;
            break;
        case 'hard':
            carPhysics.maxSpeed = 0.6;
            carPhysics.acceleration = 0.0025;
            break;
    }
    
    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.startTime = Date.now();
    gameState.currentLap = 1;
    gameState.lapTimes = [];
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
        
