enum BoxStatus {
	empty,
	wall,
	body,
	head,
	footer,
	food
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
	type: BoxStatus;
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
	private _boxTypes: {
		[key: number]: IBoxType;
	};
	private _snake: Ibox[];

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

		this._boxTypes = {
			[BoxStatus.empty]: {
				background: '#ccc'
			},
			[BoxStatus.wall]: {},
			[BoxStatus.head]: {},
			[BoxStatus.body]: {},
			[BoxStatus.footer]: {},
			[BoxStatus.food]: {}
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
					type: BoxStatus.empty
				});
			}

			this._boxes.push(colum);
		}

		this._snake = [this._boxes[3][4], this._boxes[4][4], this._boxes[5][4]];

		this.update();
	}

	private update() {

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
