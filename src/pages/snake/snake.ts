import * as TWEEN from 'tween.js';

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
	normal,
	disabled
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
	origin?: {
		x: number;
		y: number;
	}[];
	scroeCallback?(this: Snake, scroe: number): void;
	endCallback?(this: Snake, reason: string): void;
	pauseCallback?(this: Snake): void;
	continueCallback?(this: Snake): void;
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
	animateX?: number;
	animateY?: number;
}

interface IBoxType {
	background?: string;
	render?(ctx: CanvasRenderingContext2D, x: number, y: number, sideLength: number): void;
}

interface ITween {
	tween;
	isCompleted: boolean;
	startTime: number;
	spend: number;
}

export class Snake {
	private _container: HTMLElement;
	private _options: ISnakeOptions;
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _content: IContent;
	private _boxes: Ibox[][] = [];
	private _snake: Ibox[];
	private _food: Ibox[];
	private _wall: Ibox[];
	private _snakeDirection: Direction;
	private _keys: Direction[];
	private _status: GameStatus;
	private _speed: number = 1;
	private _animation: {
		id: number;
		cb(time: number): void;
		tweens: ITween[];
	};

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
			render: (ctx, x, y, sideLength) => {
				ctx.fillStyle = '#888';
				ctx.beginPath();
				ctx.arc(x + sideLength / 2, y + sideLength / 2, sideLength / 2, 0, Math.PI * 2);
				ctx.fill();
			}
		},
		[BoxType.footer]: {
			render: (ctx, x, y, sideLength) => {
				ctx.fillStyle = '#888';
				ctx.beginPath();
				ctx.arc(x + sideLength / 2, y + sideLength / 2, sideLength * 0.35, 0, Math.PI * 2);
				ctx.fill();
			}
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
			sideLength: 18
		};

		Object.assign(_options, options);

		if (!_options.origin) {
			_options.origin = [];
			for (let i = 6; i > 2; i--) {
				_options.origin.push({
					x: i,
					y: 4
				});
			}
		}

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

		// 初始化地图格
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
						default:
							break;
					}
					break;
				default:
					break;
			}

			for (let i in direction) {
				if (direction[i].keyCode.indexOf(code) > -1) {
					e.preventDefault();
					if (status === GameStatus.normal) {
						this._keys.push(+i);
					} else if (status === GameStatus.beforeStart) {
						this._keys.push(+i);
						this.start();
					}
				}
			}
		});

		this.reset();

		this.drawMap();

		this._status = GameStatus.disabled;
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

		ctx.fillStyle = 'rgba(0,0,0,.6)';
		ctx.fillRect(content.x, content.y, content.width, content.height);

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = 'bold ' + op.sideLength * fontSize + 'px serif';

		if (!Array.isArray(msgs)) {
			msgs = [msgs];
		}

		msgs.forEach((msg, index) => {
			ctx.fillText(msg, op.width * 0.5, op.height * 0.4 + op.sideLength * fontSize * 1.1 * index, content.width - op.sideLength * 2);
		});

		ctx.restore();
	}

	private drawBox(box: Ibox) {
		const types = this._boxTypes,
			ctx = this._ctx,
			side = this._options.sideLength;

		const type = types[box.type],
			x = box.animateX ? box.animateX : box.x,
			y = box.animateY ? box.animateY : box.y;

		if (type.background) {
			ctx.save();
			ctx.fillStyle = type.background;
			ctx.fillRect(x, y, side, side);
			ctx.restore();
		}

		if (type.render) {
			ctx.save();
			type.render(ctx, x, y, side);
			ctx.restore();
		}
	}

	private drawMap() {
		const op = this._options,
			ctx = this._ctx,
			content = this._content,
			side = op.sideLength;

		ctx.save();

		// 绘制地图线
		ctx.beginPath();

		ctx.strokeStyle = '#ddd';
		ctx.lineWidth = 1;

		for (let x = 0; x <= content.colums; x++) {
			const xC = content.x + x * side;
			ctx.moveTo(xC, content.y);
			ctx.lineTo(xC, content.y + content.height);
		}

		for (let y = 0; y <= content.rows; y++) {
			const yC = content.y + y * side;
			ctx.moveTo(content.x, yC);
			ctx.lineTo(content.x + content.width, yC);
		}

		ctx.stroke();

		ctx.restore();
	}

	private drawContent() {
		this._ctx.save();
		this._food.forEach(box => {
			this.drawBox(box);
		});

		this._boxes.forEach(column => {
			column.forEach(box => {
				const type = box.type;
				if (type !== BoxType.food) {
					this.drawBox(box);
				}
			});
		});

		this._ctx.restore();
	}

	public draw() {
		const op = this._options,
			ctx = this._ctx;

		ctx.clearRect(0, 0, op.width, op.height);

		this.drawMap();

		this.drawContent();
	}

	private updateAnimation(tweens: ITween[], cb: Function) {
		const animationCb = (time) => {
			let complete = true;

			tweens.forEach(t => {
				t.tween.update(time);
				if (!t.isCompleted) {
					complete = false;
				}
			});

			this.draw();

			if (!complete) {
				this.updateAnimation(tweens, cb);
			} else {
				cb();
			}
		};

		this._animation = {
			cb: animationCb,
			id: requestAnimationFrame(animationCb),
			tweens: tweens
		};
	}

	private createTween(now: Ibox, next: Ibox, timeout: number): ITween {
		const t = {
			tween: new TWEEN.Tween({ x: now.x, y: now.y })
				.to({ x: next.x, y: next.y }, timeout)
				.onUpdate(function () {
					Object.assign(now, {
						animateX: this.x,
						animateY: this.y
					});
				})
				.onComplete(function () {
					t.isCompleted = true;
				})
				.start(),
			isCompleted: false,
			startTime: new Date().getTime(),
			spend: 0
		};

		return t;
	}

	private update = () => {
		if (this._status !== GameStatus.normal) {
			return;
		}
		const timeout = this._speed > 30 ? 1 : 300 - this._speed * 10;
		const keys = this._keys,
			keysLen = keys.length;

		// 根据键盘输入转向
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

		const box = this.getBox(x, y);

		const animationComplete = () => {
			snake.forEach(snakeBox => {
				delete snakeBox.animateX;
				delete snakeBox.animateY;
			});

			switch (box.type) {
				case BoxType.empty:
					footer.type = BoxType.empty;
					snake.pop();
					break;
				case BoxType.food:
					const r = this.eat(box);
					if (r !== undefined && !r) {
						return;
					}
					break;
				default:
					return;
			}

			snake.unshift(box);

			this.updateSnake();

			if (this._status === GameStatus.normal) {
				this.draw();
				this.update();
			}
		};

		if (box && x >= 0 && x < content.colums && y >= 0 && y < content.rows) {
			const tweenList = [
				this.createTween(head, box, timeout)
			];

			if (box.type === BoxType.body || box.type === BoxType.footer) {
				this.draw(); // 转向
				this.endGame('红烧蛇肉!');
				return;
			} else if (box.type === BoxType.wall) {
				this.draw(); // 转向
				this.endGame('撞墙!');
				return;
			}

			for (let i = 1, l = snake.length; i < l; i++) {
				const thisBox = snake[i],
					nextBox = snake[i - 1];
				tweenList.push(
					this.createTween(thisBox, nextBox, timeout)
				);
			}

			requestAnimationFrame(() => {
				this.updateAnimation(tweenList, animationComplete);
			});

		} else {
			this.endGame('撞边界啦!');
		}
	}

	private updateSnake() {
		const snake = this._snake;

		snake.forEach(snakeBox => {
			snakeBox.type = BoxType.body;
		});

		snake[0].type = BoxType.head;

		snake[snake.length - 1].type = BoxType.footer;
	}

	public reset() {
		this._status = GameStatus.beforeStart;

		this._food = [];

		this._wall = [];

		this._keys = [];

		this._snakeDirection = Direction.right;

		this._boxes.forEach(column => {
			column.forEach(box => {
				box.type = BoxType.empty;
			});
		});

		this._snake = this._options.origin.map(cords =>
			this.getBox(cords.x, cords.y)
		);

		this.updateSnake();

		this.createFood();


	}

	public start() {
		this._status = GameStatus.normal;

		this.draw();

		this.update();
	}

	private pauseGame(cb) {
		if (this._status === GameStatus.normal && this._animation) {
			cancelAnimationFrame(this._animation.id);

			this._animation.tweens.forEach(t => {
				if (!t.isCompleted) {
					t.spend = new Date().getTime() - t.startTime;
					t.tween.stop();
				}
			});

			cb();
		}

	}

	private pause() {
		this.pauseGame(() => {
			this._status = GameStatus.pause;
			this.info('Pause');
		});
	}

	private continue() {
		if (this._status === GameStatus.pause) {
			this._animation.tweens.forEach(t => {
				if (!t.isCompleted) {
					t.tween.start(t.spend);
				}
			});

			requestAnimationFrame((time) => {
				this._status = GameStatus.normal;
				this._animation.cb(time);
			});
		}
	}

	private eat(box) {
		const scroe = this._snake.length - this._options.origin.length + 1;
		const food = this._food;

		this._food = food.splice(food.indexOf(box));

		this.createFood();

		if (this._options.scroeCallback) {
			return this._options.scroeCallback.call(this, scroe, this.speed);
		}
	}

	public endGame(info: string) {
		if (this._options.endCallback) {
			this._options.endCallback.call(this, info);
		}
		this._status = GameStatus.afterEnd;
	}

	private createFood() {
		const content = this._content,
			x = Math.floor(Math.random() * content.colums),
			y = Math.floor(Math.random() * content.rows),
			box = this.getBox(x, y);

		if (box.type === BoxType.empty) {
			box.type = BoxType.food;
		} else {
			return this.createFood();
		}

		this._food.push(box);
		return box;
	}


	public nextLevel(msg: string) {
		this.pauseGame(() => {
			this.info(msg);
			this._status = GameStatus.afterEnd;
		});
	}

	public fillWall(walls: number) {
		const content = this._content;
		let i = 0;
		while (i < walls) {
			const box = this.getBox(Math.floor(Math.random() * content.colums), Math.floor(Math.random() * content.rows));
			if (box.type === BoxType.empty) {
				box.type = BoxType.wall;
				this._wall.push(box);
				i++;
			}
		}
	}

	public disable() {
		const lastStatus = this._status;
		this._status = GameStatus.disabled;

		return () => {
			this._status = lastStatus;
		};
	}

	set speed(speed: number) {
		this._speed = speed;
	}

	get speed() {
		return this._speed;
	}
}
