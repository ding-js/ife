import * as pub from './pub';
interface IOptions {
	lineWidth?: number;
	strokeStyle?: string;
	onColorChange?(pixel: ImageData);
}

export default class ColorBlock {
	private _padding: number = 10;
	private _element: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _contentWidth: number;
	private _contentHeight: number;
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


		canvas.addEventListener('click', this.mouseHandle);
		canvas.addEventListener('mousemove', (e) => {
			if (e.which === 1) {
				this.mouseHandle(e);
			}
		});

		this.draw();
	}



	private fill() {
		const ctx = this._ctx;
		const padding = this._padding;
		const gradient = ctx.createLinearGradient(this._width - padding, this._height - padding, padding, padding);

		gradient.addColorStop(0, '#000');

		if (this._middleColor !== undefined) {
			gradient.addColorStop(0.5, this._middleColor);
		}

		gradient.addColorStop(1, '#fff');


		ctx.fillStyle = gradient;
		ctx.fillRect(this._padding, this._padding, this._contentWidth, this._contentHeight);
	}

	private mouseHandle = (e: MouseEvent) => {
		this.setCoordinate(e.layerX, e.layerY);
	}

	private setCoordinate(x: number, y: number) {
		const padding = this._padding;
		let currentX, currentY;
		if (x < padding) {
			currentX = padding + 1;
		} else if (x > this._contentWidth + padding) {
			currentX = this._contentWidth + padding - 1;
		} else {
			currentX = x;
		}


		if (y < padding) {
			currentY = padding + 1;
		} else if (y > this._contentHeight + padding) {
			currentY = this._contentHeight + padding - 1;
		} else {
			currentY = y;
		}


		this._x = currentX;
		this._y = currentY;

		this.draw();
	}

	private renderCurrentColor() {
		const x = this._x,
			y = this._y;
		if (x !== undefined && y !== undefined) {
			const ctx = this._ctx;

			ctx.beginPath();
			ctx.arc(x, y, this._padding / 2, 0, 2 * Math.PI);
			ctx.stroke();
			if (this._options.onColorChange) {
				const pixel = ctx.getImageData(x, y, 1, 1);
				this._options.onColorChange(pixel);
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


	set currentColor(color: string) {
		const x = Math.round(this._width / 2) - 1,
			y = Math.round(this._height / 2) - 1;

		const ctx = this._ctx;
		this._middleColor = color;
		this.draw();

		// 正中间不一定是设置的颜色,遍历附近的像素点找到颜色相同的像素点
		const closestPixel = [];
		for (let a = 0; a < 3; a++) {
			for (let b = 0; b < 3; b++) {
				closestPixel.push({ x: x + a, y: y + b });
			}
		}

		for (let p of closestPixel) {
			const hex = '#' + pub.Rgb2Hex(pub.ImageData2Rgb(ctx.getImageData(p.x, p.y, 1, 1)));
			if (hex === color) {
				this._x = p.x;
				this._y = p.y;
				this.draw();
				return;
			}
		}

		this._x = x + 1;
		this._y = y + 1;
		this.draw();
	}
}
