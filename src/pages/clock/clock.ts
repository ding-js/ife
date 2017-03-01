interface IClockOptions {
	radius?: number;
}

export default class Clock {
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _radius: number;
	private _options: IClockOptions;

	constructor(canvas: HTMLCanvasElement, options?: IClockOptions) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');
		this._width = +canvas.getAttribute('width') || 300;
		this._height = +canvas.getAttribute('height') || 300;
		const _option: IClockOptions = {
			radius: Math.min(this._width, this._height) / 2
		};

		if (options) {
			if (options.radius && (options.radius > _option.radius || options.radius <= 1)) {
				options.radius = _option.radius;
			}
		}

		Object.assign(_option, options);

		this._radius = _option.radius;

		this._options = _option;

		window.requestAnimationFrame(this.draw);

	}

	private draw = () => {
		const ctx = this._ctx,
			width = this._width,
			height = this._height,
			center = {
				x: width / 2,
				y: height / 2
			},
			op = this._options,
			borderWidth = 10,
			radius = op.radius;
		ctx.save();
		ctx.clearRect(0, 0, width, height);

		ctx.strokeStyle = '#a39999';
		ctx.lineWidth = borderWidth;
		ctx.beginPath();
		ctx.arc(center.x, center.y, radius - borderWidth / 2, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.restore();

		ctx.save();

		for (let i = 0; i < 60; i++) {
			let scaleWidth = radius / 70;
			const scaleRadius = radius - borderWidth - 5,
				height = radius / 10,
				r = i / 60 * 2 * Math.PI;
			if (i % 5 === 0) {
				scaleWidth = radius / 30;
			}





		}

		// window.requestAnimationFrame(this.draw);
	}



	private getCurrentTime() {
		const date = new Date();
		const [h, m, s] = [
			date.getHours(),
			date.getMinutes(),
			date.getSeconds()
		];

		const [hR, mR, sR] = [h / 12, m / 60, s / 60].map(v => v * 2 * Math.PI);

		return {
			h, m, s, hR, mR, sR
		};
	}


}
