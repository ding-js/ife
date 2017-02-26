interface IOptions {
	lineWidth?: number;
	strokeStyle?: string;
	onColorChange?(color: ImageData);
}

export default class ColorBar {
	private _element: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _padding: number = 10;
	private _gradient: CanvasGradient;
	private _y: number;
	private _showSlider: boolean = false;

	private _colors: string[] = ['f00', 'ffA500', 'ff0', '008000', '00f', '4b0082', '800080'];

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
			height = +canvas.getAttribute('height');


		const gradient = ctx.createLinearGradient(padding, padding, padding, height - padding * 2);
		const colors = this._colors,
			length = colors.length;
		colors.forEach((color, index) => {
			gradient.addColorStop(index / (length - 1), '#' + color);
		});

		this._gradient = gradient;

		this._ctx = ctx;
		this._width = width;
		this._height = height;


		ctx.lineWidth = this._options.lineWidth;
		ctx.strokeStyle = this._options.strokeStyle;

		canvas.addEventListener('click', this.mouseHandle);
		canvas.addEventListener('mousemove', (e) => {
			if (e.which === 1) {
				this.mouseHandle(e);
			}
		});

		this.fill();
	}

	private fill() {
		const gradient = this._gradient,
			ctx = this._ctx,
			padding = this._padding;

		ctx.fillStyle = gradient;
		ctx.fillRect(this._padding, this._padding, this._width - padding * 2, this._height - padding * 2);
	}

	private mouseHandle = (e: MouseEvent) => {
		this._showSlider = true;
		this.setCoordinate(e.layerY);
	}

	private setCoordinate(y: number) {
		const padding = this._padding;
		let currentY;
		if (y < padding) {
			currentY = padding;
		} else if (y > this._height - padding) {
			currentY = this._height - padding - 1;
		} else {
			currentY = y;
		}

		this._y = currentY;
		this.draw();
	}

	private renderCurrentColor() {
		if (this._showSlider) {
			const x = this._width / 2,
				y = this._y;
			if (y !== undefined) {
				const ctx = this._ctx;
				ctx.strokeRect(0, y - 3, this._width, 6);
				if (this._options.onColorChange) {
					const data = ctx.getImageData(x, y, 1, 1);
					this._options.onColorChange(data);
				}
			}
		}
	}

	private draw() {
		const ctx = this._ctx;
		ctx.clearRect(0, 0, this._width, this._height);
		this.fill();
		this.renderCurrentColor();
	}

	public hideSlider() {
		if (this._showSlider) {
			this._showSlider = false;
			this.draw();
		}
	}
}
