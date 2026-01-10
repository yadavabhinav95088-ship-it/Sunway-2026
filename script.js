const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");

let lanes = [30, 120, 210]; // left, middle, right
let laneIndex = 1;
let score = 0;
let gameOver = false;

// Move player
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && laneIndex > 0) {
    laneIndex--;
  }
  if (e.key === "ArrowRight" && laneIndex < 2) {
    laneIndex++;
  }
  player.style.left = lanes[laneIndex] + "px";
});

// Create enemy
function createEnemy() {
  if (gameOver) return;

  let enemy = document.createElement("div");
  enemy.classList.add("enemy");

  let enemyLane = Math.floor(Math.random() * 3);
  enemy.style.left = lanes[enemyLane] + "px";
  enemy.style.top = "-120px";

  game.appendChild(enemy);

  let enemyMove = setInterval(() => {
    let enemyTop = enemy.offsetTop;
    enemy.style.top = enemyTop + 5 + "px";

    // Collision
    if (
      enemyTop > 350 &&
      enemy.style.left === player.style.left
    ) {
      alert("Game Over! Score: " + score);
      gameOver = true;
      clearInterval(enemyMove);
      location.reload();
    }

    // Remove enemy
    if (enemyTop > 500) {
      enemy.remove();
      clearInterval(enemyMove);
      score++;
      scoreText.innerText = "Score: " + score;
    }
  }, 20);
}

// Enemy generation
setInterval(createEnemy, 1500);
const game = document.getElementById("game");
const player = document.getElementById("player");

let lanes = [40, 130, 220];
let lane = 1;
let score = 0;
let speed = 5;
let gameOver = false;

// Touch controls
let startX = 0;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if (endX < startX - 40 && lane > 0) lane--;
  if (endX > startX + 40 && lane < 2) lane++;
  player.style.left = lanes[lane] + "px";
});

// Keyboard (optional)
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && lane > 0) lane--;
  if (e.key === "ArrowRight" && lane < 2) lane++;
  player.style.left = lanes[lane] + "px";
});
function createEnemy() {
  if (gameOver) return;

  let enemy = document.createElement("div");
  enemy.className = "enemy";
  let laneIndex = Math.floor(Math.random() * 3);
  enemy.style.left = lanes[laneIndex] + "px";
  game.appendChild(enemy);

  let move = setInterval(() => {
    let top = enemy.offsetTop;
    enemy.style.top = top + speed + "px";

    // Collision
    if (
      top > 360 &&
      enemy.style.left === player.style.left
    ) {
      hit();
      clearInterval(move);
    }

    if (top > 520) {
      enemy.remove();
      clearInterval(move);
      score++;
      document.getElementById("score").innerText = "Score: " + score;

      // Level system
      if (score % 10 === 0) speed++;
    }
  }, 20);
}

setInterval(createEnemy, 1500);
