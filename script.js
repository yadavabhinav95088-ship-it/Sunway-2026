// --- ULTRA LIGHTING ---
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048; // High-res shadows
sun.shadow.mapSize.height = 2048;
scene.add(sun);

const ambient = new THREE.AmbientLight(0x404040, 2); // Bright fill light
scene.add(ambient);

// --- DYNAMIC FLOOR (Infinite Look) ---
const floorGeo = new THREE.PlaneGeometry(15, 1000);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- ANIMATION LOOP ---
let score = 0;
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth Lane Switching
    const targetX = playerLane * laneWidth;
    player.position.x += (targetX - player.position.x) * 0.15;

    // Movement Simulation
    score += 1;
    document.getElementById('ui').innerText = "SCORE: " + score.toString().padStart(4, '0');

    renderer.render(scene, camera);
}
animate();
