interface ICropperOptions {
	preview?: HTMLElement;
}

enum Area {
	cropper,
	image,
	background
}

export class Cropper {
	private _container: HTMLElement;
	private _options: ICropperOptions;
	private _ctx: CanvasRenderingContext2D;
	private _canvas: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _image: HTMLImageElement;
	private _imageWidth: number;
	private _imageHeight: number;
	private _imageX: number;
	private _imageY: number;
	private _scaleOffset: number = 0;
	private _cropperX: number;
	private _cropperY: number;
	private _xOffset: number;
	private _yOffset: number;
	private _cropperWidth: number;
	private _cropperHeight: number;
	private _area: Area;
	private _moving: boolean;
	constructor(container: HTMLElement, options?: ICropperOptions) {
		this._container = container;
		this._options = options;
		this.init();
	}

	private init() {
		const container = this._container;
		const canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');

		this._width = +container.offsetWidth;
		this._height = +container.offsetHeight;

		Object.assign(canvas, {
			width: this._width,
			height: this._height
		});

		this._ctx = ctx;
		this._canvas = canvas;

		container.appendChild(canvas);

		canvas.addEventListener('mousewheel', (e) => {
			const image = this._image;
			if (this._image) {
				let width = image.width,
					height = image.height;
				const scale = this._scaleOffset + e.deltaY;

				this._scaleOffset = scale;

				if (scale !== 0) {
					let k;
					if (scale > 0) {
						k = 1 / (1 + scale / 800);
					} else {
						k = 1 + Math.abs(scale) / 800;
					}

					width *= k;
					height *= k;

					this._imageX += (this._imageWidth - width) / 2;
					this._imageY += (this._imageHeight - height) / 2;

					this._imageWidth = width;
					this._imageHeight = height;
				}

				this.draw();
			}
		});


		canvas.addEventListener('mousedown', (e) => {
			if (e.which === 1) {
				const [x, y] = [e.layerX, e.layerY];
				this._moving = true;
				if (x > this._cropperX && x < this._cropperX + this._cropperWidth && y > this._cropperY && y < this._cropperY + this._cropperHeight) {
					this._xOffset = x - this._cropperX;
					this._yOffset = y - this._cropperY;
					this._area = Area.cropper;
				} else if (x > this._imageX && x < this._imageX + this._imageWidth && y > this._imageY && y < this._imageY + this._imageHeight) {
					this._area = Area.image;
				} else {
					this._area = Area.background;
					this._moving = false;
				}
			}
		});

		window.addEventListener('mouseup', (e) => {
			if (e.which === 1) {
				this._moving = false;
			}
		});


		canvas.addEventListener('mousemove', (e) => {
			if (this._moving) {
				switch (this._area) {
					case Area.cropper:
						this.handleCropperMove(e);
						break;
					default:
						break;
				}

				this.draw();
			}
		});
	}
	private handleCropperMove = (e: MouseEvent) => {
		const [x, y] = [e.layerX, e.layerY];
		const [oX, oY, cW, cH, w, h] = [this._xOffset, this._yOffset, this._cropperWidth, this._cropperHeight, this._width, this._height];

		let currentX = x - oX,
			currentY = y - oY;



		if (x < oX) {
			currentX = 0;
		}

		if (x > w - cW + oX) {
			currentX = w - cW;
		}

		if (y < oY) {
			currentY = 0;
		}

		if (y > h - cH + oY) {
			currentY = h - cH;
		}

		this._cropperX = currentX;
		this._cropperY = currentY;

	}

	private fillBackground() {
		const ctx = this._ctx,
			width = this._width,
			height = this._height,
			side = width / 40,
			x = Math.ceil(width / side),
			y = Math.ceil(height / side);

		ctx.save();

		ctx.fillStyle = '#ccc';

		let k = 0;
		for (let i = 0; i < y; i++) {
			for (let j = 0; j < x; j++) {
				if ((k + i) % 2 === 0) {
					ctx.fillRect(j * side, i * side, side, side);
				}
				k++;
			}
		}

		ctx.fillStyle = 'rgba(0,0,0,0.2)';

		ctx.fillRect(0, 0, width, height);

		ctx.restore();
	}

	private fillImage() {
		const ctx = this._ctx,
			image = this._image;
		if (image) {
			if (this._imageWidth === undefined) {
				this._imageWidth = image.width;
			}

			if (this._imageHeight === undefined) {
				this._imageHeight = image.height;
			}

			if (this._imageX === undefined) {
				this._imageX = (this._width - this._imageWidth) / 2;
			}

			if (this._imageY === undefined) {
				this._imageY = (this._height - this._imageHeight) / 2;
			}

			ctx.drawImage(image, this._imageX, this._imageY, this._imageWidth, this._imageHeight);
		}
	}

	private fillCropper() {
		if (this._image) {
			const ctx = this._ctx,
				image = this._image,
				imageWidth = image.width,
				imageHeight = image.height,
				lineWidth = 1;
			ctx.save();

			if (this._cropperWidth === undefined) {
				this._cropperWidth = imageWidth / 2;
			}

			if (this._cropperHeight === undefined) {
				this._cropperHeight = imageHeight / 2;
			}

			if (this._cropperX === undefined) {
				this._cropperX = this._width / 2 - this._imageWidth / 4;
			}

			if (this._cropperY === undefined) {
				this._cropperY = this._height / 2 - this._imageHeight / 4;
			}

			ctx.strokeStyle = '#000';
			ctx.lineWidth = lineWidth;

			ctx.strokeRect(this._cropperX, this._cropperY, this._cropperWidth, this._cropperHeight);

			ctx.restore();
		}

	}

	public draw() {
		const ctx = this._ctx;

		ctx.clearRect(0, 0, this._width, this._height);

		this.fillBackground();

		this.fillImage();

		this.fillCropper();
	}

	public changeImage(file: File) {
		if (!file.type.match(/^image\/.+$/)) {
			console.error('请选择正确的图片文件');
			return;
		}

		const reader = new FileReader();
		this._image = null;

		reader.onload = (e: any) => {
			const image = new Image();
			image.src = e.target.result;
			image.onload = () => {
				this._image = image;
				this._imageWidth = image.width;
				this._imageHeight = image.height;
				this.draw();
			};
		};

		reader.readAsDataURL(file);
	}
}
