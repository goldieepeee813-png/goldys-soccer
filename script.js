const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let round = 1;

let ball = { x: 450, y: 470, r: 10, dx: 0, dy: 0, inMotion: false };

let keeper = {
  x: 450,
  y: 180,
  dx: 0,
  active: false,
  diveDir: 0,
  diveSpeed: 16,   // Faster dive speed for wider goal
  returnSpeed: 6,
  reach: 60,       // Extended arm reach
  state: "idle"
};

function resetBall() {
  ball.x = 450;
  ball.y = 470;
  ball.dx = 0;
  ball.dy = 0;
  ball.inMotion = false;
  keeper.x = 450;
  keeper.dx = 0;
  keeper.active = false;
  keeper.diveDir = 0;
  keeper.state = "idle";
}

canvas.addEventListener("click", (e) => {
  if (!ball.inMotion) {
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    const power = 9;
    const angle = Math.atan2(targetY - ball.y, targetX - ball.x);
    ball.dx = Math.cos(angle) * power;
    ball.dy = Math.sin(angle) * power;
    ball.inMotion = true;

    const dive = Math.floor(Math.random() * 3);
    if (dive === 0) { keeper.dx = -keeper.diveSpeed; keeper.diveDir = -1; keeper.state = "dive"; }
    if (dive === 1) { keeper.dx = 0; keeper.diveDir = 0; keeper.state = "dive"; }
    if (dive === 2) { keeper.dx = keeper.diveSpeed; keeper.diveDir = 1; keeper.state = "dive"; }
    keeper.active = true;
  }
});

function drawBall() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function drawKeeper() {
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;

  // Head
  ctx.beginPath();
  ctx.arc(keeper.x, keeper.y - 25, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(keeper.x, keeper.y - 15);
  ctx.lineTo(keeper.x, keeper.y + 20);
  ctx.stroke();

  // Arms with extended reach
  ctx.beginPath();
  if (keeper.diveDir === -1) {
    ctx.moveTo(keeper.x, keeper.y);
    ctx.lineTo(keeper.x - keeper.reach, keeper.y - 10);
  } else if (keeper.diveDir === 1) {
    ctx.moveTo(keeper.x, keeper.y);
    ctx.lineTo(keeper.x + keeper.reach, keeper.y - 10);
  } else {
    ctx.moveTo(keeper.x, keeper.y);
    ctx.lineTo(keeper.x - 15, keeper.y);
    ctx.moveTo(keeper.x, keeper.y);
    ctx.lineTo(keeper.x + 15, keeper.y);
  }
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(keeper.x, keeper.y + 20);
  ctx.lineTo(keeper.x - 15, keeper.y + 40);
  ctx.moveTo(keeper.x, keeper.y + 20);
  ctx.lineTo(keeper.x + 15, keeper.y + 40);
  ctx.stroke();
}

function update() {
  if (ball.inMotion) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (keeper.active) {
      keeper.x += keeper.dx;
      if (keeper.x < 300) keeper.x = 300;   // wider range left
      if (keeper.x > 600) keeper.x = 600;   // wider range right
    }

    // Collision with extended arms
    if (ball.y - ball.r < keeper.y + 20 &&
        ball.y + ball.r > keeper.y - 30 &&
        ball.x > keeper.x - 20 - (keeper.diveDir === -1 ? keeper.reach : 0) &&
        ball.x < keeper.x + 20 + (keeper.diveDir === 1 ? keeper.reach : 0)) {
      round++;
      resetBall();
    }

    // Goal detection (wider posts)
    if (ball.y < 180 && ball.x > 220 && ball.x < 680) {
      score++;
      round++;
      resetBall();
    }

    if (ball.y < 0 || ball.x < 0 || ball.x > canvas.width || ball.y > canvas.height) {
      round++;
      resetBall();
    }
  } else {
    if (keeper.x < 450) keeper.x += keeper.returnSpeed;
    if (keeper.x > 450) keeper.x -= keeper.returnSpeed;
    if (Math.abs(keeper.x - 450) < 5) keeper.x = 450;
  }
}

function drawGoal() {
  ctx.fillStyle = "white";
  ctx.fillRect(220, 50, 10, 130);
  ctx.fillRect(680, 50, 10, 130);
  ctx.fillRect(220, 50, 470, 10);

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(220, 50 + i * 20);
    ctx.quadraticCurveTo(450, 110 + i * 10, 680, 50 + i * 20);
    ctx.stroke();
  }
  for (let j = 0; j <= 10; j++) {
    ctx.beginPath();
    ctx.moveTo(220 + j * 46, 50);
    ctx.lineTo(220 + j * 46, 180);
    ctx.stroke();
  }

  // Banner board
  ctx.fillStyle = "gold";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GoldyPorter Stadium", 450, 40);
}

function drawPitch() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.strokeRect(170, 180, 560, 300);

  ctx.beginPath();
  ctx.arc(450, 470, 3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPitch();
  drawGoal();
  drawKeeper();
  drawBall();

  document.getElementById("score").textContent = "Score: " + score;
  document.getElementById("round").textContent = "Round: " + round;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();