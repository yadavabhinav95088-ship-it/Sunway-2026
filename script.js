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
