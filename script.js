const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');

let player, items, score, lives, timeLeft, running, lastTime, spawnClock, move = 0;
const keys = {};
function reset() {
  player = { x: canvas.width/2 - 29, y: canvas.height - 62, w: 58, h: 34, speed: 330 };
  items = []; score = 0; lives = 3; timeLeft = 45; running = false;
  lastTime = 0; spawnClock = 0;
  updateStats(); drawIntro();
}
function updateStats() {
  scoreEl.textContent = score; livesEl.textContent = lives; timeEl.textContent = Math.ceil(timeLeft);
}
function roundedRect(x,y,w,h,r,color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
}
function drawPlayer() {
  // Delivery tray
  roundedRect(player.x, player.y, player.w, player.h, 12, '#b47acb');
  roundedRect(player.x+5, player.y+5, player.w-10, 8, 5, '#e8c9f2');
  ctx.font = '23px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🍡', player.x+player.w/2, player.y+27);
}
function drawBackground() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff8ed'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<12;i++) {
    ctx.fillStyle = i%2 ? '#f7e8f4' : '#fcebdc';
    ctx.beginPath(); ctx.arc((i*83+25)%canvas.width, (i*47+30)%canvas.height, 3, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = '#ead7c7'; ctx.fillRect(0,canvas.height-18,canvas.width,18);
}
function drawItems() {
  items.forEach(it => {
    ctx.font = '30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(it.type === 'mochi' ? '🍡' : '💧', it.x, it.y);
  });
}
function drawIntro() {
  drawBackground(); drawPlayer();
  ctx.fillStyle = '#6f4d7d'; ctx.textAlign = 'center';
  ctx.font = 'bold 25px system-ui'; ctx.fillText('Ready for delivery?', canvas.width/2, 145);
  ctx.font = '16px system-ui'; ctx.fillText('Catch 🍡 and avoid 💧', canvas.width/2, 178);
}
function endGame(message) {
  running = false;
  drawBackground(); drawItems(); drawPlayer();
  ctx.fillStyle = '#654775'; ctx.textAlign = 'center';
  ctx.font = 'bold 30px system-ui'; ctx.fillText(message, canvas.width/2, 170);
  ctx.font = '18px system-ui'; ctx.fillText('Final score: ' + score, canvas.width/2, 207);
  ctx.font = '15px system-ui'; ctx.fillText('Press Restart to play again', canvas.width/2, 238);
}
function startGame() {
  if (running) return;
  if (timeLeft <= 0 || lives <= 0) reset();
  running = true; lastTime = performance.now(); requestAnimationFrame(loop);
}
function loop(now) {
  if (!running) return;
  const dt = Math.min((now-lastTime)/1000, .04); lastTime = now;
  timeLeft -= dt; spawnClock += dt;
  player.x += move * player.speed * dt;
  player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
  const spawnEvery = Math.max(.42, .95 - score/450);
  if (spawnClock >= spawnEvery) {
    spawnClock = 0;
    items.push({x: 24 + Math.random()*(canvas.width-48), y: -10, speed: 125 + Math.random()*65 + score*.12,
                type: Math.random() < .72 ? 'mochi' : 'puddle'});
  }
  items.forEach(it => it.y += it.speed*dt);
  items = items.filter(it => {
    if (it.y > player.y && it.y < player.y+player.h+22 &&
        it.x > player.x-10 && it.x < player.x+player.w+10) {
      if (it.type === 'mochi') score += 10;
      else lives -= 1;
      return false;
    }
    return it.y < canvas.height+35;
  });
  updateStats();
  drawBackground(); drawItems(); drawPlayer();
  if (lives <= 0) { endGame('Oh no! Delivery missed!'); return; }
  if (timeLeft <= 0) { timeLeft = 0; updateStats(); endGame('Time is up!'); return; }
  requestAnimationFrame(loop);
}
document.addEventListener('keydown', e => {
  if(['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if(e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') move = -1;
  if(e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') move = 1;
  if(e.key === ' ' && !running) startGame();
});
document.addEventListener('keyup', e => {
  if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)) move = 0;
});
function holdButton(id, dir) {
  const b = document.getElementById(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); move = dir; });
  ['pointerup','pointerleave','pointercancel'].forEach(ev => b.addEventListener(ev, () => move = 0));
}
holdButton('left',-1); holdButton('right',1);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => { reset(); startGame(); });
reset();
