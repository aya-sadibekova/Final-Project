const API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
const shownIDs = new Set();

let allObjectIDs = [];

const leftDiv = document.getElementById("leftArtwork");
const rightDiv = document.getElementById("rightArtwork");
const gameDiv = document.getElementById("game");
const overlay = document.getElementById("overlay");
const scoreDiv = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
const highscoreDisplay = document.getElementById("highscore");

async function fetchAllObjectIDs() {
  if (allObjectIDs.length === 0) {
    const searchRes = await fetch(
      `${API_BASE}/search?q=&hasImages=true&medium=Paintings`
    );
    const data = await searchRes.json();
    allObjectIDs = Array.isArray(data.objectIDs) ? data.objectIDs : [];
    if (allObjectIDs.length === 0) {
      alert("No artworks found. Please try again later.");
    }
  }
}

async function fetchRandomPainting() {
  while (allObjectIDs.length) {
    const randomIndex = Math.floor(Math.random() * allObjectIDs.length);
    const randomID = allObjectIDs[randomIndex];

    if (shownIDs.has(randomID)) continue;

    try {
      const paintingRes = await fetch(`${API_BASE}/objects/${randomID}`);
      const painting = await paintingRes.json();

      if (
        painting.primaryImageSmall &&
        painting.objectBeginDate &&
        parseInt(painting.objectBeginDate)
      ) {
        shownIDs.add(randomID);
        return {
          id: randomID,
          title: painting.title,
          image: painting.primaryImageSmall,
          year: parseInt(painting.objectBeginDate),
          objectDate: painting.objectBeginDate,
          department: painting.department,
          culture: painting.culture,
          objectURL: painting.objectURL,
          artistDisplayName: painting.artistDisplayName,
          medium: painting.medium,
        };
      }
    } catch (err) {
      console.error("Failed to fetch painting", err);
    }
  }

  return null;
}

function renderPaintingCard(element, painting, enableLearnMore = false) {
  element.innerHTML = `
    <img src="${painting.image}" class="card-img-top" alt="${painting.title}">
    <div class="card-body">
      <h5 class="card-title">${painting.title}</h5>
      <button class="btn btn-sm btn-outline-info mt-2 learn-more-btn ${
        enableLearnMore ? "" : "d-none"
      }">Learn More</button>
    </div>
  `;

  const btn = element.querySelector(".learn-more-btn");
  btn.onclick = () => showLearnMore(painting);

  element.classList.remove("correct", "wrong");
}

function handleClick(choice, left, right) {
  const correctSide = left.year < right.year ? "left" : "right";
  const isCorrect = choice === correctSide;

  if (correctSide === "left") {
    leftDiv.classList.add("correct");
    rightDiv.classList.add("wrong");
  } else {
    rightDiv.classList.add("correct");
    leftDiv.classList.add("wrong");
  }

  leftDiv.onclick = null;
  rightDiv.onclick = null;

  leftDiv.querySelector(".learn-more-btn").classList.remove("d-none");
  rightDiv.querySelector(".learn-more-btn").classList.remove("d-none");

  if (!isCorrect) {
    endGame();
  } else {
    score++;
    scoreDiv.textContent = `Score: ${score}`;

    document.getElementById("nextButton").classList.remove("d-none");
  }
}

function nextRound() {
  document.getElementById("nextButton").classList.add("d-none");
  loadGame();
}

function showOverlay(show) {
  overlay.classList.toggle("d-none", !show);
}

function endGame() {
  showOverlay(false);
  gameDiv.classList.add("d-none");
  gameOverDiv.classList.remove("d-none");

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  highscoreDisplay.textContent = `Your Score: ${score} | High Score: ${highScore}`;
}

async function loadGame() {
  showOverlay(true);
  gameOverDiv.classList.add("d-none");

  await fetchAllObjectIDs();

  const left = await fetchRandomPainting();
  const right = await fetchRandomPainting();

  if (!left || !right) {
    endGame();
    return;
  }

  renderPaintingCard(leftDiv, left);
  renderPaintingCard(rightDiv, right);

  leftDiv.onclick = () => handleClick("left", left, right);
  rightDiv.onclick = () => handleClick("right", left, right);

  showOverlay(false);
}

function startGame() {
  document.getElementById("startScreen").classList.add("d-none");
  document.getElementById("header").classList.remove("d-none");
  scoreDiv.classList.remove("d-none");
  gameDiv.classList.remove("d-none");
  score = 0;
  shownIDs.clear();
  scoreDiv.textContent = `Score: ${score}`;
  loadGame();
}
