interface IClockOptions {
	radius?: number;
	color?: string;
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
			radius: Math.min(this._width, this._height) / 2,
			color: '#9b9b9b'
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
			color = op.color,
			radius = op.radius,
			borderWidth = radius * 0.08;
		ctx.save();
		ctx.clearRect(0, 0, width, height);

		// 绘制边框
		ctx.strokeStyle = color;
		ctx.lineWidth = borderWidth;
		ctx.beginPath();
		ctx.arc(center.x, center.y, radius - borderWidth / 2, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.restore();

		ctx.save();

		// 绘制刻度
		const distance2Top = borderWidth + radius * 0.02;

		ctx.fillStyle = color;

		ctx.translate(radius, radius);

		ctx.rotate(-Math.PI / 30);

		for (let i = 0; i < 60; i++) {
			const scaleWidth = i % 5 === 0 ? radius / 35 : radius / 70;
			const scaleHeight = radius / 10;

			const x = -scaleWidth / 2,
				y = distance2Top - radius;


			ctx.rotate(Math.PI / 30);
			ctx.beginPath();
			ctx.rect(x, y, scaleWidth, scaleHeight);
			ctx.fill();
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.restore();

		ctx.save();

		// 绘制数字
		const numberRadius = radius - (borderWidth + distance2Top + radius * 0.13);

		const font = radius * 0.18;
		ctx.fillStyle = color;
		ctx.font = `${font}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		for (let i = 1; i <= 12; i++) {
			const radian = i / 12 * 2 * Math.PI,
				x = radius + Math.sin(radian) * numberRadius,
				y = radius - Math.cos(radian) * numberRadius;
			ctx.fillText('' + i, x, y);
		}

		ctx.restore();

		ctx.save();

		const time = this.getCurrentTime();
		// 绘制秒针
		const secondRadius = radius * 0.75;

		ctx.fillStyle = color;

		ctx.beginPath();

		ctx.moveTo(radius, radius);
		ctx.lineTo(radius + secondRadius * Math.sin(time.sR), radius - secondRadius * Math.cos(time.sR));

		ctx.stroke();

		window.requestAnimationFrame(this.draw);
	}



	private getCurrentTime() {
		const date = new Date();
		const [h, m, s, ms] = [
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds()
		];

		const [hR, mR, sR] = [(h + m / 60) / 12, (m + s / 60) / 60, (s + ms / 1000) / 60].map(v => v * 2 * Math.PI);

		return {
			h, m, s, hR, mR, sR
		};
	}

}
