enum BoxType {
	empty,
	wall,
	body,
	head,
	footer,
	food
}

enum Direction {
	left,
	right,
	up,
	down
}

enum GameStatus {
	beforeStart,
	afterEnd,
	pause,
	normal
}

interface IDirection {
	x: number;
	y: number;
	keyCode: number[];
	opposite: number;
}

interface ISnakeOptions {
	width?: number;
	height?: number;
	sideLength?: number;
	scroeCallback?(this: Snake, scroe: number): void;
}

interface IContent {
	x: number;
	y: number;
	width: number;
	height: number;
	rows: number;
	colums: number;
}

interface Ibox {
	x: number;
	y: number;
	xIndex: number;
	yIndex: number;
	type: BoxType;
}

interface IBoxType {
	background?: string;
	render?(ctx: CanvasRenderingContext2D, x: number, y: number, sideLength: number): void;
}

export class Snake {
	private _container: HTMLElement;
	private _options: ISnakeOptions;
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _content: IContent;
	private _boxes: Ibox[][] = [];
	private _snake: Ibox[] = [];
	private _snakeDirection: Direction;
	private _keys: Direction[] = [];
	private _status: GameStatus = GameStatus.beforeStart;
	private _speed: number = 1;
	private _duration: number = 0;
	private _delay: number = 10;

	private _animation: number;

	private _boxTypes: {
		[key: number]: IBoxType;
	} = {
		[BoxType.empty]: {},
		[BoxType.wall]: {
			background: 'brown'
		},
		[BoxType.head]: {
			background: '#555',
			render: (ctx, x, y, sideLength) => {
				const k = sideLength / 14,	// 基数
					d = this._direction[this._snakeDirection],
					r = sideLength / 2,
					eyes = [
						{
							x: x + r + d.x * k * 3 + (d.x === 0 ? k * 2.5 : 0),
							y: y + r + d.y * k * 3 + (d.y === 0 ? k * 2.5 : 0)
						},
						{
							x: x + r + d.x * k * 3 + (d.x === 0 ? -k * 2.5 : 0),
							y: y + r + d.y * k * 3 + (d.y === 0 ? -k * 2.5 : 0)
						}
					];
				ctx.fillStyle = '#fff';

				eyes.forEach(eye => {

					ctx.beginPath();

					ctx.arc(eye.x, eye.y, 2 * k, 0, Math.PI * 2);

					ctx.fill();
				});


			}
		},
		[BoxType.body]: {
			background: '#888'
		},
		[BoxType.footer]: {
			background: '#888'
		},
		[BoxType.food]: {
			background: 'orange'
		}
	};

	private _direction: {
		[key: number]: IDirection;
	} = {
		[Direction.left]: {
			x: -1,
			y: 0,
			keyCode: [65, 37],
			opposite: Direction.right
		},
		[Direction.right]: {
			x: 1,
			y: 0,
			keyCode: [68, 39],
			opposite: Direction.left
		},
		[Direction.up]: {
			x: 0,
			y: -1,
			keyCode: [87, 38],
			opposite: Direction.down
		},
		[Direction.down]: {
			x: 0,
			y: 1,
			keyCode: [83, 40],
			opposite: Direction.up
		}
	};

	constructor(container: HTMLElement, options?: ISnakeOptions) {
		const _options: ISnakeOptions = {
			width: container.offsetWidth,
			height: container.offsetHeight,
			sideLength: 14
		};

		Object.assign(_options, options);

		const side = _options.sideLength,
			pdV = (_options.width % side) / 2,
			pdH = (_options.height % side) / 2,
			width = _options.width - pdH * 2,
			height = _options.height - pdV * 2;

		this._content = {
			x: pdH,
			y: pdV,
			width: width,
			height: height,
			rows: width / side,
			colums: height / side
		};

		this._container = container;
		this._options = _options;

		this.init();
	}


	private init() {
		const op = this._options,
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			content = this._content,
			side = op.sideLength;

		Object.assign(canvas, {
			width: op.width,
			height: op.height
		});

		this._canvas = canvas;
		this._ctx = ctx;

		this._container.appendChild(canvas);

		for (let x = 0; x < content.colums; x++) {
			const colum: Ibox[] = [];
			for (let y = 0; y < content.rows; y++) {
				colum.push({
					x: content.x + x * side,
					y: content.y + y * side,
					xIndex: x,
					yIndex: y,
					type: BoxType.empty
				});
			}
			this._boxes.push(colum);
		}

		document.addEventListener('keydown', (e) => {
			const direction = this._direction,
				code = e.keyCode,
				status = this._status;

			switch (code) {
				case 32:
					e.preventDefault();
					switch (status) {
						case GameStatus.pause:
							this.continue();
							break;
						case GameStatus.normal:
							this.pause();
							break;
						case GameStatus.beforeStart:
							this.start();
							break;
						case GameStatus.afterEnd:
							this.reStart();
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}

			if (status === GameStatus.normal) {
				for (let i in direction) {
					if (direction[i].keyCode.indexOf(code) > -1) {
						e.preventDefault();
						this._keys.push(+i);
					}
				}
			}
		});

		this.info('Press space to start!');
	}

	private getBox(x: number, y: number): Ibox {
		const boxes = this._boxes;
		const colum = boxes[x];

		if (!colum) {
			return;
		}

		return colum[y];

	}

	private info(msgs: string | string[], fontSize: number = 4) {
		const ctx = this._ctx,
			op = this._options,
			content = this._content;

		ctx.save();

		ctx.fillStyle = 'rgba(0,0,0,.15)';
		ctx.fillRect(content.x, content.y, content.width, content.height);

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = op.sideLength * fontSize + 'px serif';

		if (!Array.isArray(msgs)) {
			msgs = [msgs];
		}

		msgs.forEach((msg, index) => {
			ctx.fillText(msg, op.width / 2, op.height / 3 + op.sideLength * fontSize * 1.1 * index, content.width - op.sideLength * 2);
		});

		ctx.restore();
	}

	private start() {
		const originSnake = [6, 5, 4, 3].map(x => this.getBox(x, 4));

		this._snakeDirection = Direction.right;

		this._snake = originSnake;

		this.createAFood();

		this.updateAnimation();

		this._status = GameStatus.normal;
	}

	private reStart() {
		const boxes = this._boxes;
		boxes.forEach(colum => {
			colum.forEach(box => {
				if (box.type !== BoxType.empty && box.type !== BoxType.wall) {
					box.type = BoxType.empty;
				}
			});
		});

		this.start();
	}

	private pause() {
		if (this._status === GameStatus.normal) {
			cancelAnimationFrame(this._animation);
			requestAnimationFrame(() => {
				this.info('Pause');
				this._status = GameStatus.pause;

			});
		}
	}

	private continue() {
		if (this._status === GameStatus.pause) {
			this.updateAnimation();
			this._status = GameStatus.normal;
		}
	}

	private eat() {
		const scroe = this._snake.length - 3;
		this.createAFood();
		if (this._options.scroeCallback) {
			this._options.scroeCallback.call(this, scroe);
		}
	}

	private update = () => {
		const keys = this._keys,
			keysLen = keys.length;

		if (keysLen > 0) {
			for (let i = keysLen - 1; i >= 0; i--) {
				const type = keys[i];
				if (type !== this._snakeDirection && type !== this._direction[this._snakeDirection].opposite) {
					this._snakeDirection = type;
					this._keys = keys.slice(i + 1);
					break;
				}
			}
		}

		const snake = this._snake,
			direction = this._direction[this._snakeDirection],
			content = this._content;

		const head = snake[0],
			footer = snake[snake.length - 1],
			x = head.xIndex + direction.x,
			y = head.yIndex + direction.y;

		const box = this.getBox(x, y) as Ibox;

		if (box && x >= 0 && x < content.colums && y >= 0 && y < content.rows) {
			switch (box.type) {
				case BoxType.empty:
					footer.type = BoxType.empty;
					snake.pop();
					break;
				case BoxType.food:
					this.eat();
					break;
				case BoxType.body:
				case BoxType.footer:
					this.draw(); // 转向
					this.endGame('红烧蛇肉!');
					return;
				default:
					return;
			}

			snake.unshift(box);

			snake.forEach(s => {
				s.type = BoxType.body;
			});
			snake[0].type = BoxType.head;
			snake[snake.length - 1].type = BoxType.footer;

			this.draw();

		} else {
			this.endGame('撞边界啦!');
		}
	}

	private updateAnimation = () => {
		const delay = this._delay;
		this._animation = requestAnimationFrame(this.updateAnimation);	// 先更新
		if (this._duration > delay || this._speed > delay) {
			this._duration = 0;
			this.update();
		} else {
			this._duration += this._speed;
		}
	}

	public endGame(result: string) {
		if (this._status === GameStatus.normal) {
			cancelAnimationFrame(this._animation);
			requestAnimationFrame(() => {
				this.info(['Game over!', result]);
				this._status = GameStatus.afterEnd;
			});
		}
	}

	private createAFood() {
		const content = this._content,
			x = Math.floor(Math.random() * content.colums),
			y = Math.floor(Math.random() * content.rows),
			box = this.getBox(x, y) as Ibox;

		if (box.type === BoxType.empty) {
			box.type = BoxType.food;
		} else {
			return this.createAFood();
		}
	}

	private draw() {
		const op = this._options,
			ctx = this._ctx,
			content = this._content,
			types = this._boxTypes,
			side = op.sideLength;

		ctx.clearRect(0, 0, op.width, op.height);

		ctx.save();

		ctx.fillStyle = '#f7f7f7';
		ctx.fillRect(content.x, content.y, content.width, content.height);

		ctx.restore();

		this._boxes.forEach(column => {
			column.forEach(box => {
				const type = types[box.type];

				if (type.background) {
					ctx.save();
					ctx.fillStyle = type.background;
					ctx.fillRect(box.x, box.y, side, side);
					ctx.restore();
				}

				if (type.render) {
					ctx.save();
					type.render(ctx, box.x, box.y, side);
					ctx.restore();
				}
			});
		});
	}

	public nextLevel(msg: string) {
		if (this._status === GameStatus.normal) {
			cancelAnimationFrame(this._animation);
			requestAnimationFrame(() => {
				this._status = GameStatus.afterEnd;
				this.info(msg);
			});
		}
	}

	public fillWall(walls: number) {
		const content = this._content;
		let i = 0;
		while (i < walls) {
			const box = this.getBox(Math.floor(Math.random() * content.colums), Math.floor(Math.random() * content.rows));
			console.log(i);
			if (box.type === BoxType.empty) {
				box.type = BoxType.wall;
				i++;
			}
		}
	}

	set speed(speed: number) {
		this._speed = speed;
	}

	get speed() {
		return this._speed;
	}

	set walls(walls: { x: number, y: number }[]) {
		walls.forEach(wall => {
			const box = this.getBox(wall.x, wall.y);
			if (box && box.type === BoxType.empty) {
				box.type = BoxType.wall;
			}
		});
	}
}
