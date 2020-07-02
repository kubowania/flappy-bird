const gameChannelName = "flappy-game";
let myPublishChannel;
let myClientId;
let gameChannel;
let OtherBirds = {};
// connect to Ably
const realtime = Ably.Realtime({
  authUrl: "/auth",
});

document.addEventListener("DOMContentLoaded", () => {
  const sky = document.querySelector(".sky");
  const bird = document.querySelector(".bird");
  const gameDisplay = document.querySelector(".game-container");
  let birdLeft = 220;
  let birdBottom = 350;
  let gravity = 2;
  let isGameOver = false;

  realtime.connection.once("connected", () => {
    myClientId = realtime.auth.clientId;
    myPublishChannel = realtime.channels.get("bird-position-" + myClientId);
    gameChannel = realtime.channels.get(gameChannelName);
    gameChannel.presence.enter();
    sendPositionUpdates();
    showOtherBirds();
  });

  function startGame() {
    birdBottom -= gravity;
    bird.style.bottom = birdBottom + "px";
    bird.style.left = birdLeft + "px";
    if (birdBottom === 0) gameOver();
  }
  let timerId = setInterval(startGame, 20);

  function control(e) {
    if (e.keyCode === 32) {
      jump();
    }
  }
  document.addEventListener("keyup", control);

  function jump() {
    if (birdBottom < 500) birdBottom += 50;
    bird.style.bottom = birdBottom + "px";
  }

  function generateObstacles() {
    let obstacleLeft = 500;
    let randomHeight = Math.random() * 60;
    let obstacleBottom = -randomHeight;

    const obstacle = document.createElement("div");

    if (!isGameOver) obstacle.classList.add("obstacle");
    gameDisplay.appendChild(obstacle);
    obstacle.style.left = obstacleLeft + "px";
    obstacle.style.bottom = obstacleBottom + "px";
    function moveObstacle() {
      obstacleLeft -= 2;
      obstacle.style.left = obstacleLeft + "px";
      if (obstacleLeft === -50) {
        clearInterval(timerId);
        gameDisplay.removeChild(obstacle);
      }
      if (
        obstacleLeft > 220 &&
        obstacleLeft < 280 &&
        birdLeft === 220 &&
        birdBottom < obstacleBottom + 210
      ) {
        gameOver();
        clearInterval(timerId);
        isGameOver = true;
      }
    }
    let timerId = setInterval(moveObstacle, 20);
    if (!isGameOver) setTimeout(generateObstacles, 3000);
  }
  generateObstacles();

  function gameOver() {
    clearInterval(timerId);
    isGameOver = true;
    document.removeEventListener("keyup", control);
  }

  function sendPositionUpdates() {
    let publishTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(publishTimer);
      }
      myPublishChannel.publish("pos", {
        bottom: parseInt(bird.style.bottom),
        left: parseInt(bird.style.left),
      });
    }, 100);
  }

  function showOtherBirds() {
    gameChannel.subscribe("game-state", (msg) => {
      for (let key in msg.data.birds) {
        if (key != myClientId) {
          let newLeft = msg.data.birds[key].left;
          let newBottom = msg.data.birds[key].bottom;
          if (OtherBirds[key]) {
            OtherBirds[key].el.style.left = newLeft + "px";
            OtherBirds[key].el.style.bottom = newBottom + "px";
          } else {
            OtherBirds[key] = {};
            OtherBirds[key].el = document.createElement("div");
            if (!isGameOver) OtherBirds[key].el.classList.add("other-bird");
            sky.appendChild(OtherBirds[key].el);
            OtherBirds[key].el.style.left = newLeft + "px";
            OtherBirds[key].el.style.bottom = newBottom + "px";
          }
        }
      }
    });
  }
});
