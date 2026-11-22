
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const timerText = document.getElementById("timer");
const message = document.getElementById("gameMessage");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
let lives = 3;
let timeLeft = 45;

let gameRunning = false;
let gameStarted = false;

let objects = [];
let lastTime = 0;
let spawnTimer = 0;
let elapsedTime = 0;
let animationId = null;

const keys = {
    left: false,
    right: false
};

const player = {
    x: WIDTH / 2 - 45,
    y: HEIGHT - 55,
    width: 90,
    height: 25,
    speed: 6,
    normalWidth: 90,
    powerUpUntil: 0
};

// Draw the bakery background
function drawBackground() {
    ctx.fillStyle = "#fff6f2";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Background stripes
    for (let x = 0; x < WIDTH; x += 45) {
        ctx.fillStyle = x % 90 === 0 ? "#fff0ec" : "#fff6f2";
        ctx.fillRect(x, 0, 22, HEIGHT);
    }

    // Decorative stars
    ctx.font = "18px Arial";
    ctx.fillStyle = "#efc4cf";

    ctx.fillText("✦", 35, 45);
    ctx.fillText("♡", 465, 75);
    ctx.fillText("✧", 85, 150);
    ctx.fillText("♡", 420, 190);
    ctx.fillText("✦", 480, 310);

    // Bakery floor
    ctx.fillStyle = "#f4d5c8";
    ctx.fillRect(0, HEIGHT - 18, WIDTH, 18);

    ctx.fillStyle = "#eabfae";
    ctx.fillRect(0, HEIGHT - 18, WIDTH, 3);
}

// Draw a mochi
function drawMochi(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);

    // Shadow
    ctx.fillStyle = "#e8c4c0";
    ctx.beginPath();
    ctx.ellipse(0, 13, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mochi body
    ctx.fillStyle = "#f8cbd7";
    ctx.beginPath();
    ctx.ellipse(0, 0, 21, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "#ffeaf0";
    ctx.beginPath();
    ctx.ellipse(-7, -7, 7, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = "#80545c";
    ctx.beginPath();
    ctx.arc(-7, 1, 2, 0, Math.PI * 2);
    ctx.arc(7, 1, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#80545c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 5, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.restore();
}

// Draw a puddle
function drawPuddle(x, y) {
    ctx.save();
    ctx.font = "31px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💧", x, y);
    ctx.restore();
}

// Draw a heart power-up
function drawHeart(x, y) {
    ctx.save();
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("❤️", x, y);
    ctx.restore();
}

// Draw the player's tray
function drawPlayer() {
    const center = player.x + player.width / 2;

    ctx.save();

    // Tray shadow
    ctx.fillStyle = "#d9a4a7";
    ctx.beginPath();
    ctx.ellipse(center, player.y + 23, player.width / 2 + 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tray body
    ctx.fillStyle = "#e9a5b6";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 9);
    ctx.fill();

    // Tray top
    ctx.fillStyle = "#ffe0e8";
    ctx.beginPath();
    ctx.roundRect(player.x + 4, player.y - 5, player.width - 8, 10, 5);
    ctx.fill();

    // Decorative dots
    ctx.fillStyle = "#fff8f8";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(player.x + 18 + i * 18, player.y + 11, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Draw everything on the canvas
function drawGame() {
    drawBackground();

    if (!gameStarted) {
        // Visible mochi before pressing Start
        drawMochi(WIDTH / 2, HEIGHT / 2 - 15, 1.5);

        ctx.fillStyle = "#c58b94";
        ctx.font = "bold 15px Trebuchet MS";
        ctx.textAlign = "center";
        ctx.fillText("READY TO DELIVER SOME MOCHI?", WIDTH / 2, HEIGHT / 2 + 45);
    }

    objects.forEach(object => {
        if (object.type === "mochi") {
            drawMochi(object.x, object.y);
        } else if (object.type === "puddle") {
            drawPuddle(object.x, object.y);
        } else if (object.type === "heart") {
            drawHeart(object.x, object.y);
        }
    });

    drawPlayer();
}

// Create falling objects
function spawnObject() {
    const random = Math.random();
    let type = "mochi";

    if (random < 0.18) {
        type = "puddle";
    } else if (random > 0.91) {
        type = "heart";
    }

    objects.push({
        x: 25 + Math.random() * (WIDTH - 50),
        y: -30,
        type: type,
        speed: 2.2 + Math.random() * 1.5 + score / 180
    });
}

// Move player
function updatePlayer() {
    if (keys.left) {
        player.x -= player.speed;
    }

    if (keys.right) {
        player.x += player.speed;
    }

    player.x = Math.max(
        0,
        Math.min(WIDTH - player.width, player.x)
    );

    if (Date.now() > player.powerUpUntil) {
        player.width = player.normalWidth;
    }
}

// Check collision
function checkCollision(object) {
    const objectSize = 18;

    return (
        object.x + objectSize > player.x &&
        object.x - objectSize < player.x + player.width &&
        object.y + objectSize > player.y &&
        object.y - objectSize < player.y + player.height
    );
}

// Lose one life
function loseLife() {
    lives--;
    updateStats();

    if (lives <= 0) {
        endGame("Game Over! 💔");
    }
}

// Update falling objects
function updateObjects(delta) {
    for (let i = objects.length - 1; i >= 0; i--) {
        const object = objects[i];

        object.y += object.speed * delta;

        if (checkCollision(object)) {
            if (object.type === "mochi") {
                score += 10;
            } else if (object.type === "puddle") {
                loseLife();
            } else if (object.type === "heart") {
                player.width = 140;
                player.x = Math.max(
                    0,
                    Math.min(WIDTH - player.width, player.x)
                );
                player.powerUpUntil = Date.now() + 8000;
            }

            objects.splice(i, 1);
            updateStats();

            if (!gameRunning) return;
            continue;
        }

        if (object.y > HEIGHT + 35) {
            if (object.type === "mochi") {
                loseLife();
            }

            objects.splice(i, 1);

            if (!gameRunning) return;
        }
    }
}

// Update score, lives and timer
function updateStats() {
    scoreText.textContent = score;
    livesText.textContent = lives;
    timerText.textContent = timeLeft;
}

// End the game
function endGame(title) {
    gameRunning = false;
    gameStarted = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    message.innerHTML = `
        <h2>${title}</h2>
        <p>Your final score: <strong>${score}</strong></p>
        <p>Press Restart to play again!</p>
    `;

    message.classList.remove("hidden");
    startBtn.textContent = "▶ PLAY AGAIN";

    drawGame();
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;

    if (!lastTime) lastTime = timestamp;

    let delta = (timestamp - lastTime) / 16.67;
    delta = Math.min(delta, 2);
    lastTime = timestamp;

    elapsedTime += delta / 60;
    spawnTimer += delta;

    // Spawn objects more frequently over time
    const spawnDelay = Math.max(25, 65 - score / 15);

    if (spawnTimer >= spawnDelay) {
        spawnObject();
        spawnTimer = 0;
    }

    // Countdown timer
    if (elapsedTime >= 1) {
        timeLeft--;
        elapsedTime = 0;
        updateStats();

        if (timeLeft <= 0) {
            endGame("Time's Up! ⏰");
            return;
        }
    }

    updatePlayer();
    updateObjects(delta);

    if (!gameRunning) return;

    drawGame();
    animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    if (gameRunning) return;

    if (!gameStarted) {
        resetGame();
    }

    gameRunning = true;
    gameStarted = true;
    lastTime = 0;

    message.classList.add("hidden");
    startBtn.textContent = "▶ GAME RUNNING";

    animationId = requestAnimationFrame(gameLoop);
}

// Reset game values
function resetGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    score = 0;
    lives = 3;
    timeLeft = 45;

    objects = [];
    spawnTimer = 0;
    elapsedTime = 0;
    lastTime = 0;

    player.width = player.normalWidth;
    player.x = WIDTH / 2 - player.width / 2;
    player.powerUpUntil = 0;

    keys.left = false;
    keys.right = false;

    gameRunning = false;
    gameStarted = false;

    updateStats();

    message.innerHTML = `
        <h2>🍡 Mochi Delivery! 🍡</h2>
        <p>Catch the falling mochi!</p>
        <p class="hint">Use ← → or A / D to move</p>
    `;

    message.classList.remove("hidden");
    startBtn.textContent = "▶ START GAME";

    drawGame();
}

// Keyboard controls
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = true;
        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = false;
    }
});

// Mobile controls
function holdButton(button, direction) {
    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        keys[direction] = true;
    });

    button.addEventListener("pointerup", () => {
        keys[direction] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[direction] = false;
    });

    button.addEventListener("pointercancel", () => {
        keys[direction] = false;
    });
}

holdButton(leftBtn, "left");
holdButton(rightBtn, "right");

// Button events
startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    resetGame();
    startGame();
});

// Initial screen
updateStats();
drawGame();
