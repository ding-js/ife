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
	private _snake: Ibox[];
	private _snakeDirection: Direction = Direction.right;
	private _keys: Direction[] = [];

	private _boxTypes: {
		[key: number]: IBoxType;
	} = {
		[BoxType.empty]: {
			background: '#f5f5f5'
		},
		[BoxType.wall]: {},
		[BoxType.head]: {
			background: 'red'
		},
		[BoxType.body]: {
			background: 'green'
		},
		[BoxType.footer]: {
			background: 'green'
		},
		[BoxType.food]: {
			background: 'yellow'
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
				code = e.keyCode;
			for (let i in direction) {
				if (direction[i].keyCode.indexOf(code) > -1) {
					e.preventDefault();
					this._keys.push(+i);
					// if (type !== snakeDirection && type !== direction[snakeDirection].opposite) {
					// 	this._snakeDirection = type;
					// }
				}
			}
		});

		this.start();
	}

	private getBox(x: number, y: number): Ibox {
		const boxes = this._boxes;
		const colum = boxes[x];

		if (!colum) {
			return;
		}

		return colum[y];

	}

	private start() {
		const originSnake = [6, 5, 4, 3].map(x => this.getBox(x, 4));
		this._snake = originSnake;
		this.createAFood();
		setInterval(this.update, 300);
	}

	private update = () => {
		const keys = this._keys,
			keysLen = keys.length;

		console.log(this._keys);
		if (keysLen > 0) {
			for (let i = keysLen - 1; i >= 0; i--) {
				const type = keys[i];
				if (type !== this._snakeDirection && type !== this._direction[this._snakeDirection].opposite) {
					this._snakeDirection = type;
				}
			}
			this._keys = [];
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
					this.createAFood();
					break;
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
			console.info('Game over!', ' : ', '撞墙');
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

		return box;
	}
	private draw() {
		const op = this._options,
			ctx = this._ctx,
			types = this._boxTypes,
			side = op.sideLength;

		ctx.clearRect(0, 0, op.width, op.height);

		ctx.save();

		this._boxes.forEach(column => {
			column.forEach(box => {
				const type = types[box.type];
				if (type.background) {
					ctx.fillStyle = type.background;
					ctx.fillRect(box.x, box.y, side, side);
				}

				if (type.render) {
					type.render(ctx, box.x, box.y, side);
				}

			});
		});
	}
}
