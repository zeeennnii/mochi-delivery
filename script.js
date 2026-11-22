
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

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
let gameOver = false;

let objects = [];
let animationId = null;
let lastTime = 0;
let spawnTimer = 0;
let elapsedTime = 0;

let powerUpTimer = 0;
let invincibleTimer = 0;

const player = {
    x: WIDTH / 2 - 38,
    y: HEIGHT - 65,
    width: 76,
    height: 25,
    speed: 6
};

const keys = {
    left: false,
    right: false
};

function roundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);

    ctx.closePath();
    ctx.fill();
}

function drawBackground() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#fff4e6";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Checkerboard bakery floor
    const tile = 42;

    for (let y = 0; y < HEIGHT; y += tile) {
        for (let x = 0; x < WIDTH; x += tile) {
            if (
                (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0
            ) {
                ctx.fillStyle = "rgba(239, 205, 222, 0.20)";
                ctx.fillRect(x, y, tile, tile);
            }
        }
    }

    // Bakery shelves
    roundedRect(12, 42, 75, 12, 6, "#d5a47e");
    roundedRect(WIDTH - 87, 42, 75, 12, 6, "#d5a47e");

    // Decorative jars
    ["#e8a9c5", "#b9a4db", "#f3c58b"].forEach((color, i) => {
        roundedRect(18 + i * 23, 22, 15, 18, 5, color);
        roundedRect(WIDTH - 84 + i * 23, 22, 15, 18, 5, color);
    });

    // Hanging lights
    for (let i = 0; i < 5; i++) {
        const x = 65 + i * (WIDTH - 130) / 4;

        ctx.strokeStyle = "#d8b9a8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 17);
        ctx.stroke();

        ctx.fillStyle = "#ffdf91";
        ctx.beginPath();
        ctx.arc(x, 20, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Plants
    ctx.font = "25px sans-serif";
    ctx.fillText("🌷", 20, HEIGHT - 35);
    ctx.fillText("🌷", WIDTH - 45, HEIGHT - 35);

    // Bakery floor mat
    roundedRect(
        WIDTH / 2 - 105,
        HEIGHT - 35,
        210,
        12,
        6,
        "#d9b3df"
    );

    // Bottom border
    ctx.fillStyle = "#e8cdb9";
    ctx.fillRect(0, HEIGHT - 18, WIDTH, 18);

    // Sparkles
    ctx.font = "17px sans-serif";
    ctx.fillText("✦", 105, 100);
    ctx.fillText("✧", WIDTH - 110, 145);
    ctx.fillText("✦", 100, HEIGHT - 100);
    ctx.fillText("✧", WIDTH - 100, HEIGHT - 140);

    // Power-up indicator
    if (powerUpTimer > 0) {
        roundedRect(12, 65, 165, 32, 12, "#f3d7f4");

        ctx.fillStyle = "#784b8c";
        ctx.font = "bold 13px system-ui";
        ctx.textAlign = "left";

        ctx.fillText(
            `💖 BIG TRAY: ${Math.ceil(powerUpTimer)}s`,
            20,
            86
        );
    }
}

function drawPlayer() {
    const currentWidth = powerUpTimer > 0 ? 100 : player.width;
    const centerX = player.x + player.width / 2;
    const trayX = centerX - currentWidth / 2;

    // Tray shadow
    roundedRect(
        trayX,
        player.y + 5,
        currentWidth,
        player.height,
        12,
        "#c18acb"
    );

    // Tray body
    roundedRect(
        trayX,
        player.y,
        currentWidth,
        player.height,
        12,
        "#e6b9e8"
    );

    // Tray decoration
    ctx.strokeStyle = "#a66bb5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trayX + 10, player.y + 8);
    ctx.lineTo(trayX + currentWidth - 10, player.y + 8);
    ctx.stroke();

    ctx.font = "17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍡", centerX, player.y - 7);
}

function drawObjects() {
    ctx.textAlign = "center";

    objects.forEach(object => {
        ctx.font = `${object.size}px sans-serif`;
        ctx.fillText(object.emoji, object.x, object.y);
    });
}

function drawGame() {
    drawBackground();
    drawObjects();
    drawPlayer();

    if (!gameRunning && !gameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(0, 115, WIDTH, 110);

        ctx.fillStyle = "#9259a8";
        ctx.textAlign = "center";
        ctx.font = "bold 25px Georgia";
        ctx.fillText("Welcome to Mochi Bakery!", WIDTH / 2, 160);

        ctx.font = "16px Georgia";
        ctx.fillText("Press Start Game to play!", WIDTH / 2, 190);
    }

    if (gameOver) {
        ctx.fillStyle = "rgba(255, 248, 252, 0.85)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.textAlign = "center";
        ctx.fillStyle = "#9259a8";
        ctx.font = "bold 32px Georgia";
        ctx.fillText("Game Over!", WIDTH / 2, 170);

        ctx.font = "20px Georgia";
        ctx.fillText(`Final Score: ${score}`, WIDTH / 2, 210);

        ctx.font = "16px Georgia";
        ctx.fillText("Press Restart to play again!", WIDTH / 2, 245);
    }
}

function spawnObject() {
    const random = Math.random();

    let type = "mochi";
    let emoji = "🍡";

    if (random < 0.22) {
        type = "puddle";
        emoji = "💧";
    } else if (random < 0.32) {
        type = "powerup";
        emoji = "💖";
    }

    const size = type === "powerup" ? 27 : 29;

    objects.push({
        x: 25 + Math.random() * (WIDTH - 50),
        y: -20,
        size,
        speed: 2.2 + Math.random() * 1.2 + elapsedTime * 0.045,
        type,
        emoji
    });
}

function updatePlayer() {
    if (keys.left) {
        player.x -= player.speed;
    }

    if (keys.right) {
        player.x += player.speed;
    }

    const currentWidth = powerUpTimer > 0 ? 100 : player.width;
    const centerX = player.x + player.width / 2;

    if (centerX - currentWidth / 2 < 0) {
        player.x = currentWidth / 2 - player.width / 2;
    }

    if (centerX + currentWidth / 2 > WIDTH) {
        player.x = WIDTH - currentWidth / 2 - player.width / 2;
    }
}

function loseLife() {
    if (invincibleTimer > 0) return;

    lives--;
    invincibleTimer = 0.8;

    updateStats();

    if (lives <= 0) {
        endGame("You ran out of lives!");
    }
}

function updateObjects(delta) {
    const currentWidth = powerUpTimer > 0 ? 100 : player.width;
    const trayLeft = player.x + player.width / 2 - currentWidth / 2;
    const trayRight = trayLeft + currentWidth;

    objects.forEach(object => {
        object.y += object.speed * delta;

        const objectLeft = object.x - object.size / 2;
        const objectRight = object.x + object.size / 2;

        const touchingTray =
            object.y >= player.y &&
            object.y <= player.y + player.height + object.size / 2 &&
            objectRight >= trayLeft &&
            objectLeft <= trayRight;

        if (touchingTray) {
            if (object.type === "mochi") {
                score += 10;
                message.textContent = "Yummy! +10 points! 🍡";
            } else if (object.type === "puddle") {
                loseLife();
                message.textContent = "Oh no! You hit a puddle! 💧";
            } else if (object.type === "powerup") {
                powerUpTimer = 8;
                message.textContent = "Big tray activated! 💖";
            }

            object.remove = true;
        }

        // Missed mochi
        if (object.type === "mochi" && object.y > HEIGHT) {
            loseLife();
            message.textContent = "You missed a mochi! 🍡";
            object.remove = true;
        }

        if (object.y > HEIGHT + 40) {
            object.remove = true;
        }
    });

    objects = objects.filter(object => !object.remove);
}

function updateStats() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    timerDisplay.textContent = Math.max(0, Math.ceil(timeLeft));
}

function endGame(reason) {
    gameRunning = false;
    gameOver = true;

    message.textContent = `${reason} Final score: ${score}`;

    cancelAnimationFrame(animationId);
    drawGame();
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const delta = Math.min((timestamp - lastTime) / 16.67 || 1, 2);
    lastTime = timestamp;

    const seconds = delta / 60;

    elapsedTime += seconds;
    timeLeft -= seconds;

    if (powerUpTimer > 0) {
        powerUpTimer -= seconds;
    }

    if (invincibleTimer > 0) {
        invincibleTimer -= seconds;
    }

    updatePlayer();

    spawnTimer += seconds;

    const spawnInterval = Math.max(
        0.35,
        0.95 - elapsedTime * 0.012
    );

    if (spawnTimer >= spawnInterval) {
        spawnObject();
        spawnTimer = 0;
    }

    updateObjects(delta);
    updateStats();

    if (timeLeft <= 0) {
        timeLeft = 0;
        updateStats();
        endGame("Time is up!");
        return;
    }

    drawGame();

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameRunning) return;

    if (gameOver) {
        resetGame();
    }

    gameRunning = true;
    gameOver = false;
    lastTime = performance.now();

    message.textContent = "Catch those delicious mochis! 🍡";

    animationId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    cancelAnimationFrame(animationId);

    score = 0;
    lives = 3;
    timeLeft = 45;

    objects = [];

    player.x = WIDTH / 2 - player.width / 2;

    gameRunning = false;
    gameOver = false;

    spawnTimer = 0;
    elapsedTime = 0;
    powerUpTimer = 0;
    invincibleTimer = 0;

    keys.left = false;
    keys.right = false;

    message.textContent = "Press Start Game to begin!";

    updateStats();
    drawGame();
}

// Keyboard controls
document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " "
    ) {
        event.preventDefault();
    }

    if (key === "arrowleft" || key === "a") {
        keys.left = true;
    }

    if (key === "arrowright" || key === "d") {
        keys.right = true;
    }
});

document.addEventListener("keyup", event => {
    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") {
        keys.left = false;
    }

    if (key === "arrowright" || key === "d") {
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

// Game buttons
startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    resetGame();
    startGame();
});

// Initial screen
updateStats();
drawGame();
