var c = document.getElementById("game");
var ctx = c.getContext("2d");

var game = {
	snake: {
		snakeyBits: [],
		headX: 0,
		headY: 0,
		headDX: 0,
		headDY: 1,
		length: 10,
		alive: true,
		advanceTimeout: 0
	},
	score: 0,
	field: [],
	extent: [30, 30]
};

function genField(w, h) {
	clearField(w, h);
	placeMines(w, h);
	updateField(w, h);
}

function clearField(w, h) {
	game.field = [];
	for (var x = 0; x < w; x++) {
		var col = [];
		for (var y = 0; y < h; y++) {
			col.push(0)
		}
		game.field.push(col);
	}
}

function placeMines(w, h) {
	for (var c = 0; c < (w * h) * 0.2; c++) {
		var x = Math.floor(Math.random() * w);
		var y = Math.floor(Math.random() * h);

		game.field[x][y] = -1;
	}
}

function updateField(w, h) {
	for (var x = 0; x < w; x ++) {
		for (var y = 0; y < h; y ++) {
			if (game.field[x][y] != -1) {
				game.field[x][y] = (
					(x > 0 && game.field[x - 1][y] < 0 ? 1 : 0) +
					(y > 0 && game.field[x][y - 1] < 0 ? 1 : 0) +
					(x < (w - 1) && game.field[x + 1][y] < 0 ? 1 : 0) +
					(y < (h - 1) && game.field[x][y + 1] < 0 ? 1 : 0) +
					(x > 0 && y > 0 && game.field[x - 1][y - 1] < 0 ? 1 : 0) +
					(x < (w - 1) && y > 0 && game.field[x + 1][y - 1] < 0 ? 1 : 0) +
					(x > 0 && y < (h - 1) && game.field[x - 1][y + 1] < 0 ? 1 : 0) +
					(x < (w - 1) && y < (h - 1) && game.field[x + 1][y + 1] < 0 ? 1 : 0)
				);
			}
		}
	}
}

function startGame() {
	genField(game.extent[0], game.extent[1]);

	game.snake = {
		snakeyBits: [],
		headX: 0,
		headY: 0,
		headDX: 0,
		headDY: 1,
		length: 10,
		alive: true,
		advanceTimeout: 0
	};
	game.score = 0;

	while (game.field[game.snake.headX][game.snake.headY] != -1) {
		game.snake.headX ++;
		if (game.snake.headX == game.extent[0]) {
			game.snake.headX = 0;
			game.snake.headY ++;
		}
	}
	game.snake.snakeyBits.push([game.snake.headX, game.snake.headY]);

	render();
}

function render() {
	var w = game.extent[0], h = game.extent[1];
	var tileW = 20, tileH = 20;

	c.width = Math.max(w * tileW, window.innerWidth);
	c.height = Math.max(h * tileH, window.innerHeight);
	c.style.width = c.width + "px";
	c.style.height = c.height + "px";

	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.strokeStyle = 'rgb(128, 128, 128)';
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.textAlign = 'center';
	ctx.font = '18px sans-serif';

	for (var x = 0; x < w; x ++) {
		for (var y = 0; y < h; y ++) {
			var val = game.field[x][y];
			switch (val) {
				case 0:
					ctx.fillStyle = 'rgb(255,255,255)';
					break;
				case -1:
					ctx.fillStyle = 'rgb(0, 0, 0)';
					break;
				default:
					ctx.fillStyle = 'hsl(' + (val * 45) + ', 100%, 75%)';
					break;
			}
			ctx.fillRect(tileW * x, tileH * y, tileW, tileH);
			ctx.strokeRect(tileW * x, tileH * y, tileW, tileH);

			if (val > 0) {
				ctx.fillStyle = 'rgb(0, 0, 0)';
				ctx.fillText(val, tileW * x + (tileW / 2), tileH * y + 17);
			}
		}
	}

	ctx.fillStyle = (game.snake.alive ? 'rgb(0, 153, 0)' : 'rgb(153, 0, 0)');
	for (var i = 0; i < game.snake.snakeyBits.length; i ++) {
		var xy = game.snake.snakeyBits[i];
		ctx.fillRect(tileW * xy[0], tileH * xy[1], tileW, tileH);
	}

	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.font = '18px serif';
	ctx.textAlign = 'left';
	ctx.fillText('Your Score: ' + game.score, 0, c.height - 18);

	ctx.textAlign = 'right';
	ctx.fillText('Best Score: ' + localStorage.bestScore, c.width - 18, c.height - 18);
}

function advanceSnake() {
	if (!game.snake.alive) {
		startGame();
		return;
	}
	game.snake.headX += game.snake.headDX;
	game.snake.headY += game.snake.headDY;
	game.snake.snakeyBits.push([game.snake.headX, game.snake.headY]);
	if (game.snake.headX < 0
		|| game.snake.headY < 0
		|| game.snake.headX >= game.extent[0]
		|| game.snake.headY >= game.extent[1]) {
		game.snake.alive = false;
	}

	var next = 0;
	if (game.snake.alive) {
		next = game.field[game.snake.headX][game.snake.headY];
	}
	if (next == -1) {
		game.field[game.snake.headX][game.snake.headY] = 0;
		updateField(game.extent[0], game.extent[1]);
		game.snake.length ++;
		game.score ++;

		var best = parseInt(localStorage.bestScore);
		if (best !== best || game.score > best) {
			localStorage.bestScore = game.score;
		}
	}
	if (game.snake.snakeyBits.length > game.snake.length) {
		game.snake.snakeyBits.splice(0, 1);
	}
	for (var i = 0; i < game.snake.snakeyBits.length - 1; i ++) {
		var bit = game.snake.snakeyBits[i];
		if (bit[0] == game.snake.headX && bit[1] == game.snake.headY) {
			//RIP
			game.snake.alive = false;
		}
	}
	if (next == 0) {
		game.snake.alive = false;
	}

	if (game.snake.advanceTimeout) {
		clearTimeout(game.snake.advanceTimeout);
	}

	render();

	if (!game.snake.alive) {
		game.snake.advanceTimeout = setTimeout(advanceSnake, 1000);
	}
}

document.body.addEventListener("keydown", function(e) {
	switch (e.code) {
		case "ArrowUp":
			if (game.snake.headDY == 1) {
				break;
			}
			game.snake.headDX = 0;
			game.snake.headDY = -1;
			break;
		case "ArrowLeft":
			if (game.snake.headDX == 1) {
				break;
			}
			game.snake.headDX = -1;
			game.snake.headDY = 0;
			break;
		case "ArrowRight":
			if (game.snake.headDX == -1) {
				break;
			}
			game.snake.headDX = 1;
			game.snake.headDY = 0;
			break;
		case "ArrowDown":
			if (game.snake.headDY == -1) {
				break;
			}
			game.snake.headDX = 0;
			game.snake.headDY = 1;
			break;
		default:
			//Ignore other keys
			return;
	}
	e.preventDefault();
	if (game.snake.alive) {
		advanceSnake();
	}
});

startGame();
document.getElementById("start").addEventListener("click", function() {
	document.getElementById("instructions").style.display = "none";
});
