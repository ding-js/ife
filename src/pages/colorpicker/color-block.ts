import * as utils from './utils';
export interface IColorBlockOptions {
	lineWidth?: number;
	onColorChange?(pixel: ImageData);
}

export class ColorBlock {
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
	private _moveEvt: boolean = false;

	// 默认的光圈样式
	private _options: IColorBlockOptions = {
		lineWidth: 1
	};

	constructor(element: HTMLCanvasElement, options?: IColorBlockOptions) {
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
		// ctx.strokeStyle = this._options.strokeStyle;

		this._ctx = ctx;
		this._width = width;
		this._height = height;
		this._contentWidth = contentWidth;
		this._contentHeight = contentHeight;

		canvas.addEventListener('mousedown', (e) => {
			if (e.which === 1) {
				this._moveEvt = true;
				this.setCoordinateByEvent(e);
				canvas.addEventListener('mousemove', this.handleMouseMove);
			}
		});

		document.addEventListener('mouseup', (e) => {
			if (this._moveEvt && e.which === 1) {
				this._moveEvt = false;
				canvas.removeEventListener('mousemove', this.handleMouseMove);
			}
		});

		this.setCoordinate(width / 2, height / 2);
		// this.draw();
	}


	// 填充背景色（拾色器）,同一个CanvasGradient复用会出现Bug,所以每次都新建一个CanvasGradient
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


	private setCoordinateByEvent = (e: MouseEvent) => {
		this.setCoordinate(e.layerX, e.layerY);
	}

	private handleMouseMove = (e: MouseEvent) => {
		if (e.which === 1) {
			this.setCoordinateByEvent(e);
		}
	}

	// 设置坐标
	private setCoordinate(x: number, y: number) {
		const padding = this._padding;
		let currentX, currentY;
		// 检查是否出界
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

	// 渲染光标
	private renderCurrentColor() {
		const x = this._x,
			y = this._y;
		if (x !== undefined && y !== undefined) {
			const ctx = this._ctx;

			ctx.save();


			ctx.strokeStyle = '#000';
			ctx.beginPath();
			ctx.arc(x, y, this._padding / 2, 0, 2 * Math.PI);
			ctx.stroke();

			ctx.strokeStyle = '#fff';
			ctx.beginPath();
			ctx.arc(x, y, this._padding / 2 - this._options.lineWidth, 0, 2 * Math.PI);
			ctx.stroke();

			ctx.restore();
			// 颜色变化后的回调
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
			const hex = '#' + utils.Rgb2Hex(utils.ImageData2Rgb(ctx.getImageData(p.x, p.y, 1, 1)));
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

