const API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
let score = 0;

const leftDiv = document.getElementById("leftArtwork");
const rightDiv = document.getElementById("rightArtwork");
const gameDiv = document.getElementById("game");
const scoreDiv = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
function startGame() {
  document.getElementById("startScreen").classList.add("d-none");
  document.getElementById("header").classList.remove("d-none");
  scoreDiv.classList.remove("d-none");
  gameDiv.classList.remove("d-none");
  score = 0;
  shownIDs.clear();
  scoreDiv.textContent = `Score: ${score}`;
}
