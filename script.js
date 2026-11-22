
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timeEl = document.getElementById('time');

const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');

let player, items, score, lives, timeLeft, running;
let lastTime, spawnClock, move;
let powerUpTimer = 0;

const GAME_DURATION = 45;
const STARTING_LIVES = 3;
const POWERUP_DURATION = 8;

function difficultyLevel() {
    const elapsed = GAME_DURATION - timeLeft;
    return Math.min(1 + elapsed * 0.045, 2.8);
}

function reset() {
    player = {
        x: canvas.width / 2 - 29,
        y: canvas.height - 62,
        w: 58,
        h: 34,
        baseW: 58,
        speed: 330
    };

    items = [];
    score = 0;
    lives = STARTING_LIVES;
    timeLeft = GAME_DURATION;
    powerUpTimer = 0;
    running = false;
    lastTime = 0;
    spawnClock = 0;
    move = 0;

    updateStats();
    drawIntro();
}

function updateStats() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    timeEl.textContent = Math.ceil(timeLeft);
}

function roundedRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff8ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative pastel dots
    for (let i = 0; i < 18; i++) {
        ctx.fillStyle = i % 2
            ? '#f7e8f4'
            : '#fcebdc';

        ctx.beginPath();
        ctx.arc(
            (i * 83 + 25) % canvas.width,
            (i * 47 + 30) % canvas.height,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.fillStyle = '#ead7c7';
    ctx.fillRect(0, canvas.height - 18, canvas.width, 18);

    // Power-up indicator
    if (powerUpTimer > 0) {
        ctx.fillStyle = '#7b4b91';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'left';

        ctx.fillText(
            `💖 BIG TRAY: ${Math.ceil(powerUpTimer)}s`,
            15,
            25
        );
    }
}

function drawPlayer() {
    // Glow effect when power-up is active
    if (powerUpTimer > 0) {
        ctx.shadowColor = '#e99be8';
        ctx.shadowBlur = 18;
    }

    roundedRect(
        player.x,
        player.y,
        player.w,
        player.h,
        12,
        powerUpTimer > 0 ? '#d58be6' : '#b47acb'
    );

    ctx.shadowBlur = 0;

    roundedRect(
        player.x + 5,
        player.y + 5,
        player.w - 10,
        8,
        5,
        '#e8c9f2'
    );

    ctx.font = '23px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillText(
        '🍡',
        player.x + player.w / 2,
        player.y + 27
    );
}

function drawItems() {
    items.forEach(item => {
        ctx.font = item.type === 'powerup'
            ? '32px sans-serif'
            : '30px sans-serif';

        ctx.textAlign = 'center';

        let emoji = '🍡';

        if (item.type === 'puddle') emoji = '💧';
        if (item.type === 'powerup') emoji = '💖';

        ctx.fillText(emoji, item.x, item.y);
    });
}

function drawIntro() {
    drawBackground();
    drawPlayer();

    ctx.fillStyle = '#6f4d7d';
    ctx.textAlign = 'center';
    ctx.font = 'bold 25px system-ui';

    ctx.fillText(
        'Ready for delivery?',
        canvas.width / 2,
        145
    );

    ctx.font = '16px system-ui';

    ctx.fillText(
        'Catch 🍡, avoid 💧 and collect 💖!',
        canvas.width / 2,
        178
    );
}

function endGame(message) {
    running = false;

    drawBackground();
    drawItems();
    drawPlayer();

    ctx.fillStyle = '#654775';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px system-ui';

    ctx.fillText(
        message,
        canvas.width / 2,
        170
    );

    ctx.font = '18px system-ui';

    ctx.fillText(
        'Final score: ' + score,
        canvas.width / 2,
        207
    );

    ctx.font = '15px system-ui';

    ctx.fillText(
        'Press Restart to play again',
        canvas.width / 2,
        238
    );
}

function startGame() {
    if (running) return;

    if (timeLeft <= 0 || lives <= 0) {
        reset();
    }

    running = true;
    lastTime = performance.now();

    requestAnimationFrame(loop);
}

function loop(now) {
    if (!running) return;

    const dt = Math.min(
        (now - lastTime) / 1000,
        0.04
    );

    lastTime = now;

    timeLeft -= dt;
    spawnClock += dt;

    // Power-up countdown
    if (powerUpTimer > 0) {
        powerUpTimer -= dt;

        if (powerUpTimer <= 0) {
            powerUpTimer = 0;

            const center = player.x + player.w / 2;
            player.w = player.baseW;
            player.x = center - player.w / 2;
        }
    }

    const difficulty = difficultyLevel();

    // Player movement
    player.x += move * player.speed * dt;

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.w, player.x)
    );

    // Increasing spawn rate
    const spawnEvery = Math.max(
        0.32,
        0.95 / difficulty
    );

    if (spawnClock >= spawnEvery) {
        spawnClock = 0;

        const random = Math.random();

        let type = 'mochi';

        if (random < 0.12) {
            type = 'powerup';
        } else if (random < 0.34) {
            type = 'puddle';
        }

        items.push({
            x: 24 + Math.random() * (canvas.width - 48),
            y: -10,
            speed: (125 + Math.random() * 65) * difficulty,
            type: type
        });
    }

    // Move falling objects
    items.forEach(item => {
        item.y += item.speed * dt;
    });

    items = items.filter(item => {

        const caught =
            item.y > player.y &&
            item.y < player.y + player.h + 22 &&
            item.x > player.x - 10 &&
            item.x < player.x + player.w + 10;

        if (caught) {

            if (item.type === 'mochi') {
                score += 10;
            }

            else if (item.type === 'puddle') {
                lives -= 1;
            }

            else if (item.type === 'powerup') {

                // Increase tray size
                const center = player.x + player.w / 2;

                player.w = 100;
                player.x = center - player.w / 2;

                // Extend power-up duration
                powerUpTimer = POWERUP_DURATION;
            }

            return false;
        }

        // Missing mochi costs one life
        if (
            item.type === 'mochi' &&
            item.y > canvas.height - 12
        ) {
            lives -= 1;
            return false;
        }

        // Power-ups and puddles disappear safely
        // if they reach the bottom without being caught.
        return item.y < canvas.height + 35;
    });

    updateStats();

    drawBackground();
    drawItems();
    drawPlayer();

    if (lives <= 0) {
        endGame('Delivery failed!');
        return;
    }

    if (timeLeft <= 0) {
        timeLeft = 0;
        updateStats();

        endGame('Time is up!');
        return;
    }

    requestAnimationFrame(loop);
}

// Keyboard controls
document.addEventListener('keydown', event => {
    if (
        ['ArrowLeft', 'ArrowRight', ' '].includes(event.key)
    ) {
        event.preventDefault();
    }

    if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a'
    ) {
        move = -1;
    }

    if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd'
    ) {
        move = 1;
    }

    if (event.key === ' ' && !running) {
        startGame();
    }
});

document.addEventListener('keyup', event => {
    if (
        [
            'ArrowLeft',
            'ArrowRight',
            'a',
            'd',
            'A',
            'D'
        ].includes(event.key)
    ) {
        move = 0;
    }
});

// Mobile controls
function holdButton(id, direction) {
    const button = document.getElementById(id);

    button.addEventListener('pointerdown', event => {
        event.preventDefault();
        move = direction;
    });

    [
        'pointerup',
        'pointerleave',
        'pointercancel'
    ].forEach(eventName => {
        button.addEventListener(eventName, () => {
            move = 0;
        });
    });
}

holdButton('left', -1);
holdButton('right', 1);

// Start and restart
startBtn.addEventListener('click', startGame);

restartBtn.addEventListener('click', () => {
    reset();
    startGame();
});

// Initialize
reset();
