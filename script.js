
function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Cream bakery floor
    ctx.fillStyle = '#fff4e6';
    ctx.fillRect(0, 0, w, h);

    // Checkerboard floor pattern
    const tile = 42;

    for (let y = 0; y < h; y += tile) {
        for (let x = 0; x < w; x += tile) {
            if ((Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0) {
                ctx.fillStyle = 'rgba(239, 205, 222, 0.20)';
                ctx.fillRect(x, y, tile, tile);
            }
        }
    }

    // Decorative bakery shelves
    roundedRect(12, 42, 75, 12, 6, '#d5a47e');
    roundedRect(w - 87, 42, 75, 12, 6, '#d5a47e');

    // Small decorative jars
    ['#e8a9c5', '#b9a4db', '#f3c58b'].forEach((color, i) => {
        roundedRect(18 + i * 23, 22, 15, 18, 5, color);
        roundedRect(w - 84 + i * 23, 22, 15, 18, 5, color);
    });

    // Decorative hanging lights
    for (let i = 0; i < 5; i++) {
        const x = 65 + i * (w - 130) / 4;

        ctx.strokeStyle = '#d8b9a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 17);
        ctx.stroke();

        ctx.fillStyle = '#ffdf91';
        ctx.beginPath();
        ctx.arc(x, 20, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Decorative plants
    ctx.font = '25px sans-serif';
    ctx.fillText('🌷', 20, h - 35);
    ctx.fillText('🌷', w - 45, h - 35);

    // Bakery floor mat
    roundedRect(
        w / 2 - 105,
        h - 35,
        210,
        12,
        6,
        '#d9b3df'
    );

    // Bottom border
    ctx.fillStyle = '#e8cdb9';
    ctx.fillRect(0, h - 18, w, 18);

    // Cute decorative sparkles
    ctx.font = '17px sans-serif';

    ctx.fillText('✦', 105, 100);
    ctx.fillText('✧', w - 110, 145);
    ctx.fillText('✦', 100, h - 100);
    ctx.fillText('✧', w - 100, h - 140);

    // Power-up indicator
    if (powerUpTimer > 0) {
        roundedRect(12, 65, 165, 32, 12, '#f3d7f4');

        ctx.fillStyle = '#784b8c';
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'left';

        ctx.fillText(
            `💖 BIG TRAY: ${Math.ceil(powerUpTimer)}s`,
            20,
            86
        );
    }
}
