window.addEventListener("load", function () {
  const loading = this.document.getElementById('loading')
  loading.style.display = 'none'
  
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1024;
  canvas.height = 567;
  const startBtn = document.getElementById("startBtn");
  const bestScoreResetBtn = this.document.getElementById("resetHScoreBtn");
  const layerImg1 = document.getElementById("layerImg1");
  const layerImg2 = document.getElementById("layerImg2");
  const layerImg3 = document.getElementById("layerImg3");
  const layerImg4 = document.getElementById("layerImg4");
  const layerImg5 = document.getElementById("layerImg5");
  const playerImg = document.getElementById("playerImg");
  const snailEnemyIng = document.getElementById("snailEnemy");
  const flyingEnemyImg = document.getElementById("flyingEnemy");

  let gameSpeed = 0;
  let gameRate = 0;
  let hue = 0;
  let opacity = 1;
  let gravity = 0;
  let score = 0;
  let highScore = localStorage.getItem("spookyStrollerScore") || 0;
  let scrollOffset = 0;

  let player;
  let enemySnails = [];
  let flyingEnemies = [];
  let particles = [];
  let dustParticles = [];
  let keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
    jump: {
      pressed: false,
    },
  };

  //background start
  class BackGround {
    constructor(image, speedModify) {
      this.pos = {
        x: 0,
        y: 0,
      };
      this.image = image;
      this.width = 2400;
      this.height = 567;
      this.speedModify = speedModify;
      this.speed = gameSpeed * this.speedModify;
    }
    update() {
      this.speed = gameSpeed * this.speedModify;
      //this.pos.x -= gameSpeed * this.speedModify
      if (this.pos.x <= -this.width) {
        this.pos.x = 0;
      }
      this.pos.x = Math.floor(this.pos.x - this.speed);
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.pos.x,
        this.pos.y,
        this.width,
        this.height
      );
      ctx.drawImage(
        this.image,
        this.pos.x + this.width,
        this.pos.y,
        this.width,
        this.height
      );
    }
  }
  const bgImg1 = new BackGround(layerImg1, 0.2);
  const bgImg2 = new BackGround(layerImg2, 0.4);
  const bgImg3 = new BackGround(layerImg3, 0.6);
  const bgImg4 = new BackGround(layerImg4, 0.8);
  const bgImg5 = new BackGround(layerImg5, 1);

  let bgImgs = [bgImg1, bgImg2, bgImg3, bgImg4, bgImg5];

  //background end

  //player Start
  class Player {
    constructor() {
      this.pos = {
        x: 250,
        y: canvas.height - 200,
      };
      this.vel = {
        x: 0,
        y: 0,
      };
      this.gravity = 0.7;
      this.width = 100;
      this.height = 90;
      this.color = "white";
      this.image = playerImg;
      this.spriteWidth = 200;
      this.spriteHeight = 200;

      this.frameRate = 0;
      this.maxFrames = 7;
      this.frameX = 0;
      this.frameY = 0;
    }
    update() {
      this.pos.y += this.vel.y;
      //this.pos.x += this.vel.x;
      this.frameRate++;

      if (this.frameRate % 10 == 0) {
        if (this.frameX >= this.maxFrames) {
          this.frameX = 0;
        }
      }
      if (keys.right.pressed || keys.jump.pressed) {
        this.frameX += 1;
      } else {
        this.frameX += 0;
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      //ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.pos.x,
        this.pos.y - 15,
        this.spriteWidth * 0.6,
        this.spriteHeight * 0.6
      );
    }
    edges() {
      if (this.pos.y + this.vel.y <= canvas.height - 200) {
        this.vel.y += this.gravity;
      } else {
        this.vel.y = 0;
      }
    }
  }
  player = new Player();

  //player end
  //particle classes start

  class Particle {
    constructor() {
      this.x = player.pos.x;
      this.y = player.pos.y + 50;
      this.color = "hsla(" + hue + ", 50%, 50%, " + opacity + ")";
      this.size = Math.random() * 20 + 10;
      this.spreadY = Math.random() * 5.75 + -5.75;
      this.spreadX = Math.random() * 5.75 + -5.75;
    }
    update() {
      this.x -= 15;
      this.y += this.spreadY;
    }
    show() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  function handleParticles() {
    particles.push(new Particle());
  }

  //DustParticles

  class DustParticle {
    constructor() {
      this.x = player.pos.x + 45;
      this.y = player.pos.y + 100;
      this.color = "hsla(0, 00%, 70%, 0.9)";
      this.size = Math.random() * 3 + 2.5;
      this.spreadX = Math.random() * 50.75 + -50.75;
      this.spreadY = Math.random() * 2.75 + 2.75;
    }
    update() {
      this.x -= 5;
      this.spreadY -= gravity;
      this.y -= this.spreadY;
    }
    show() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  function handleDustParticles() {
    for (let i = 0; i < 1; i++) {
      dustParticles.push(new DustParticle());
    }
  }

  //particle classes end

  //Snail Enemies Start
  class SnailEnemy {
    constructor() {
      this.width = 100;
      this.height = 65;
      this.pos = {
        x: canvas.width + 100,
        y: canvas.height - (this.height + 100),
      };

      this.image = snailEnemyIng;
      this.spriteWidth = 160;
      this.spriteHeight = 119;
      this.frameRate = 0;
      this.maxFrames = 5;
      this.frameX = 0;
      this.frameY = 0;
    }
    draw() {
      ctx.fillStyle = "white";
      //ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.pos.x,
        this.pos.y - 3,
        this.spriteWidth * 0.6,
        this.spriteHeight * 0.6
      );
    }
    update() {
      this.pos.x -= 5;
      this.frameRate++;
      this.frameX++;

      if (this.frameRate % 3 == 0) {
        if (this.frameX >= this.maxFrames) {
          this.frameX = 0;
        }
      }
    }
  }

  function handleEnemySnails() {
    let inter = 550;
    if (gameRate % inter == 0) {
      enemySnails.push(new SnailEnemy());
    }
    console.log(enemySnails.length);
  }
  function playerSnailEnemyCollision() {
    for (let i = 0; i < enemySnails.length; i++) {
      if (
        player.pos.x + player.width >= enemySnails[i].pos.x &&
        player.pos.x <= enemySnails[i].pos.x + enemySnails[i].width &&
        player.pos.y + player.height >= enemySnails[i].pos.y
      ) {
        enemySnails[i].pos.x = player.pos.x + player.width;
        loseCondition();
      }
    }
  }

  function playerFlyingEnemyCollision() {
    for (let i = 0; i < flyingEnemies.length; i++) {
      if (
        player.pos.y <= flyingEnemies[i].pos.y + flyingEnemies[i].height &&
        player.pos.y >= flyingEnemies[i].pos.y &&
        player.pos.x + player.width >= flyingEnemies[i].pos.x &&
        player.pos.x <= flyingEnemies[i].pos.x + flyingEnemies[i].width
      ) {
        score += 10;
        flyingEnemies.splice(i, 1);
        console.log(score);
      }
    }
  }

  //flying enemies start
  class FlyingEnemy {
    constructor() {
      this.width = 90;
      this.height = 50;
      this.angle = 0;
      this.pos = {
        x: canvas.width + 200,
        y: Math.floor(Math.random() * (300 - 50) + 50),
      };
      this.vel = {
        x: Math.random() * 2.5 + +1.5,
        y: 0,
      };

      this.image = flyingEnemyImg;
      this.spriteWidth = 266;
      this.spriteHeight = 188;

      this.frameRate = 0;
      this.maxFrames = 5;
      this.frameX = 0;
      this.frameY = 0;
    }
    update() {
      this.pos.x -= this.vel.x;
      this.pos.y += Math.sin(this.angle) * 3;
      this.frameX++;
      this.frameRate++;
      this.angle += Math.random() * 0.5;

      if (this.frameRate % 3 == 0) {
        if (this.frameX >= this.maxFrames) {
          this.frameX = 0;
        }
      }
    }
    draw() {
      ctx.fillStyle = "white";
      //ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.pos.x,
        this.pos.y - 3,
        this.spriteWidth * 0.3,
        this.spriteHeight * 0.3
      );
    }
    edges() {
      for (let i = flyingEnemies - 1; i >= 0; i--) {
        if (this.pos.x + this.width <= 0) {
          flyingEnemies.splice(i, 1);
        }
        console.log(flyingEnemies.length);
      }
    }
  }
  function handleFlyingEnemies() {
    if (gameRate % 100 == 0) {
      flyingEnemies.push(new FlyingEnemy());
    }
  }

  //flying enemies end

  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bgImgs.forEach((object) => {
      object.draw();
      object.update();
    });

    enemySnails.forEach((snailEnemy) => {
      snailEnemy.draw();
      snailEnemy.update();
    });

    flyingEnemies.forEach((flyingEnemy) => {
      flyingEnemy.update();
      flyingEnemy.draw();
      flyingEnemy.edges();
    });
    player.draw();
    player.update();
    player.edges();

    handleEnemySnails();
    playerSnailEnemyCollision();
    playerFlyingEnemyCollision();
    handleFlyingEnemies();
    scores();
    highScoreBoard();
    winCondition();


    if (keys.jump.pressed) {
      handleParticles();
    }
    if (keys.right.pressed && !keys.jump.pressed) {
      handleDustParticles();
    }
    if (keys.right.pressed && keys.jump.pressed) {
      gameSpeed += 5;
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].show();
      if (particles.length > 10) {
        particles.splice(i, 1);
      }
    }

    for (let i = 0; i < dustParticles.length; i++) {
      dustParticles[i].update();
      dustParticles[i].show();
      if (dustParticles.length > 20) {
        dustParticles.splice(i, 1);
      }
    }
    playerMove();
    gameRate++;
    hue++;
  }

  animate();
  function playerMove() {
    if (keys.right.pressed || keys.jump.pressed) {
      gameSpeed = 5;
      scrollOffset = bgImg1.pos.x * -1;
    } else {
      gameSpeed = 0;
    }
    console.log(scrollOffset);
  }
  //game end / start conditions start
  function winCondition() {
    if (scrollOffset > 300) {
      keys.jump.pressed = false;
      keys.right.pressed = false;
      keys.left.pressed = false;
      highestScore()
      ctx.font = "55px Aerial";
      ctx.fillStyle = "black";
      ctx.fillText(
        "You Win your Score is " + score,
        canvas.width / 2 - 250,
        100
      );
      startBtn.style.display = "block";
      bestScoreResetBtn.style.display = "block";
      cancelAnimationFrame(animationId);
    }
  }
  function loseCondition() {
    ctx.font = "55px Aerial";
    ctx.fillStyle = "black";
    ctx.fillText(
      "You Have been Eaten you scored  " + score,
      canvas.width / 2 - 345,
      150
    );
    startBtn.style.display = "block";
    bestScoreResetBtn.style.display = 'block'
    cancelAnimationFrame(animationId);
    keys.jump.pressed = false;
    keys.right.pressed = false;
    keys.left.pressed = false;
  }
  //game end / start conditions end

  //utilities start

  function scores() {
    ctx.font = "25px Aerial";
    ctx.fillStyle = "black";
    ctx.fillText("score = " + score, 50, 50);
  }
  function highScoreBoard(){
    ctx.font = "25px Aerial";
    ctx.fillStyle = "black";
    ctx.fillText("Best Score = " + highScore, 800, 50);
  }
  function highestScore() {
    if (score > localStorage.getItem("spookyStrollerScore")) {
      localStorage.setItem("spookyStrollerScore", score);
      let hsScore = localStorage.getItem("spookyStrollerScore");
      highScore = hsScore;
    }
  }
  startBtn.addEventListener("click", (e) => {
    startBtn.style.display = "none";
    location.reload();
  });

  bestScoreResetBtn.addEventListener("click", (e) => {
     localStorage.setItem("spookyStrollerScore", 0);
    startBtn.style.display = "none";
    location.reload();
  });
  //utilities end

  //controls

  addEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.code == "KeyA") {
      keys.jump.pressed = true;
      player.vel.y -= 25;
      player.frameY = 1;
      player.maxFrames = 5;
      if (player.pos.y + player.vel.y - 50 <= 0) {
        player.vel.y = 0;
      }
    }
    if (e.code == "ArrowRight") {
      keys.right.pressed = true;
    }
    if (e.code == "ArrowLeft") {
      keys.left.pressed = true;
    }
  });

  addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.code == "KeyA") {
      keys.jump.pressed = false;
      player.vel.y = 0;
      player.frameY = 0;
    }
    if (e.code == "ArrowRight") {
      keys.right.pressed = false;
      gameSpeed = 0;
    }
    if (e.code == "ArrowLeft") {
      keys.left.pressed = false;
    }
  });
  //load end
});
