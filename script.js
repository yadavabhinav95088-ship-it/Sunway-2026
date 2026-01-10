// Basic Three.js Setup to verify it works
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a simple box so you can see something
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 1. Create a Floor (The Track)
const floorGeo = new THREE.PlaneGeometry(20, 1000);
const floorMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2; // Lay it flat
scene.add(floor);

// 2. Create the Player (Blue Cube)
const playerGeo = new THREE.BoxGeometry(1, 1, 1);
const playerMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 0.5; // Sit on top of floor
scene.add(player);

camera.position.set(0, 3, 6);
camera.lookAt(player.position);

// 3. Simple Movement Logic
let score = 0;
function animate() {
    requestAnimationFrame(animate);
    
    // Make the floor "move" to simulate running
    floor.position.z += 0.2;
    if (floor.position.z > 100) floor.position.z = 0;

    // Update Score UI
    score++;
    document.getElementById('ui').innerText = "SCORE: " + score.toString().padStart(4, '0');

    renderer.render(scene, camera);
}
animate();

// 4. Mobile Controls (Tap left/right side of screen)
window.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2) {
        player.position.x -= 1; // Move Left
    } else {
        player.position.x += 1; // Move Right
    }
});
    
