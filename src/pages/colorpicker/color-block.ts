interface IOptions {
	lineWidth?: number;
	strokeStyle?: string;
	onColorChange?(color: ImageData);
}

export default class ColorBlock {
	private _padding: number = 10;
	private _element: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _contentWidth: number;
	private _contentHeight: number;
	private _gradient: CanvasGradient;
	private _middleColor: string;
	private _x: number;
	private _y: number;
	private _options: IOptions = {
		lineWidth: 2,
		strokeStyle: '#FFC0CB'
	};

	constructor(element: HTMLCanvasElement, options?: IOptions) {
		if (options) {
			Object.assign(this._options, options);
		}

		this._element = element;
		this.init();
	}

	private init() {
		const padding = this._padding;

		const canvas = this._element,
			ctx = canvas.getContext('2d');

		const width = +canvas.getAttribute('width'),
			height = +canvas.getAttribute('height'),
			contentWidth = width - padding * 2,
			contentHeight = height - padding * 2;

		ctx.lineWidth = this._options.lineWidth;
		ctx.strokeStyle = this._options.strokeStyle;

		this._ctx = ctx;
		this._width = width;
		this._height = height;
		this._contentWidth = contentWidth;
		this._contentHeight = contentHeight;
		this._gradient = ctx.createLinearGradient(contentWidth, contentHeight, padding, padding);

		canvas.addEventListener('click', this.mouseHandle);
		canvas.addEventListener('mousemove', (e) => {
			if (e.which === 1) {
				this.mouseHandle(e);
			}
		});

		this.draw();
	}



	private fill() {
		const gradient = this._gradient,
			ctx = this._ctx;

		gradient.addColorStop(0, '#000000');

		if (this._middleColor) {
			gradient.addColorStop(0.5, this._middleColor);
		}

		gradient.addColorStop(1, '#ffffff');

		ctx.fillStyle = gradient;
		ctx.fillRect(this._padding, this._padding, this._contentWidth, this._contentHeight);
	}

	private mouseHandle = (e: MouseEvent) => {
		this.setCoordinate(e.layerX, e.layerY);
		this.draw();
	}

	private setCoordinate(x: number, y: number) {
		const padding = this._padding;
		let currentX, currentY;
		if (x < padding) {
			currentX = padding;
		} else if (x > this._contentWidth + padding) {
			currentX = this._contentWidth + padding;
		} else {
			currentX = x;
		}


		if (y < padding) {
			currentY = padding;
		} else if (y > this._contentHeight + padding) {
			currentY = this._contentHeight + padding;
		} else {
			currentY = y;
		}


		this._x = currentX;
		this._y = currentY;
	}

	private renderCurrentColor() {
		const x = this._x,
			y = this._y;
		if (x !== undefined && y !== undefined) {
			const ctx = this._ctx;

			ctx.beginPath();
			ctx.arc(x, y, this._padding / 2, 0, 2 * Math.PI);
			ctx.stroke();
			console.log(x, y, ctx.getImageData(x, y, 1, 1).data);
			if (this._options.onColorChange) {
				const data = ctx.getImageData(x, y, 1, 1);
				this._options.onColorChange(data);
			}
		}
	}

	public draw() {
		const ctx = this._ctx;
		ctx.clearRect(0, 0, this._width, this._height);
		this.fill();
		this.renderCurrentColor();
	}

	set color(color: string) {
		this._middleColor = color;
		this.draw();
	}
}
