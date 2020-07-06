document.addEventListener('DOMContentLoaded', () => {
  const bird = document.querySelector('.bird')
  const gameDisplay = document.querySelector('.game-container')
  const ground = document.querySelector('.ground-moving')
  let birdLeft = 220
  let birdBottom = 100
  let gravity = 2
  let isGameOver = false
  let gap = 430

  function startGame() {
    birdBottom -= gravity
    bird.style.bottom = birdBottom + 'px'
    bird.style.left = birdLeft + 'px'
    if (birdBottom === 0) gameOver()
  }
  let timerId = setInterval(startGame, 20)

  function control(e) {
    if (e.keyCode === 32) {
        jump()
    }
  }
  document.addEventListener('keyup', control)

  function jump() {
    if (birdBottom < 500) birdBottom += 50
    bird.style.bottom = birdBottom + 'px'
  }

  function generateObstacles() {
    let obstacleLeft = 500
    let randomHeight = Math.random() * 60
    let obstacleBottom = - randomHeight

    const obstacle = document.createElement('div')
    const topObstacle = document.createElement('div')
    if (!isGameOver) {
      obstacle.classList.add('obstacle')
      topObstacle.classList.add('topObstacle')
    }

    gameDisplay.appendChild(obstacle)
    gameDisplay.appendChild(topObstacle)
    obstacle.style.left = obstacleLeft + 'px'
    obstacle.style.bottom = obstacleBottom + 'px'
    topObstacle.style.left = obstacleLeft + 'px'
    topObstacle.style.bottom = obstacleBottom + gap + 'px'
    function moveObstacle () {
      obstacleLeft -=2
      obstacle.style.left = obstacleLeft + 'px'
      topObstacle.style.left = obstacleLeft + 'px'
      if (obstacleLeft === -50) {
        clearInterval(timerId)
        gameDisplay.removeChild(obstacle)
        gameDisplay.removeChild(topObstacle)
      }
      console.log(birdBottom) 
      console.log(obstacleBottom + gap)
      if (
        obstacleLeft > 200 && obstacleLeft < 280 && birdLeft === 220 && 
        (birdBottom < obstacleBottom + 210 || birdBottom > obstacleBottom + gap - 150)
        ) {
        gameOver() 
        clearInterval(timerId)
        isGameOver = true
      }
    }
    let timerId = setInterval(moveObstacle, 20)
    if (!isGameOver) setTimeout(generateObstacles, 3000)
  }
  generateObstacles()


  function gameOver() {
      clearInterval(timerId)
      isGameOver = true
      document.removeEventListener('keyup', control)
      ground.classList.add('ground')
      ground.classList.remove('ground-moving')
  }

})
