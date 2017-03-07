interface ICropperOptions {
	preview?: HTMLElement;
	width?: number;
	height?: number;
}

enum Area {
	cropper,
	image,
	point,
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
	private _scale: number = 1;
	private _cropperX: number;
	private _cropperY: number;
	private _xOffset: number;
	private _yOffset: number;
	private _cropperWidth: number;
	private _cropperHeight: number;
	private _area: Area;
	private _moving: boolean;
	private _preview: boolean = false;
	private _previewWidth: number;
	private _previewHeight: number;
	private _previewCanvas: HTMLCanvasElement;
	private _previewCtx: CanvasRenderingContext2D;
	private _lineWidth: number = 1;
	private _pointWidth: number = 8;
	private _pointHeight: number = 8;

	constructor(container: HTMLElement, options?: ICropperOptions) {
		const _options = {
			width: +container.offsetWidth,
			height: +container.offsetHeight
		};

		Object.assign(_options, options);

		this._container = container;
		this._options = _options;

		this._width = _options.width;
		this._height = _options.height;
		this.init();
	}

	private init() {
		const container = this._container;
		const canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');

		const op = this._options;

		Object.assign(canvas, {
			width: this._width,
			height: this._height
		});

		this._ctx = ctx;
		this._canvas = canvas;

		container.appendChild(canvas);

		if (op.preview) {
			const previewCanvas = document.createElement('canvas'),
				previewCtx = previewCanvas.getContext('2d');

			op.preview.appendChild(previewCanvas);

			this._previewCanvas = previewCanvas;
			this._previewCtx = previewCtx;
			this._preview = true;

		}

		canvas.addEventListener('mousewheel', (e) => {
			const image = this._image;

			e.preventDefault();

			if (this._image) {
				let width = image.width,
					height = image.height,
					k;
				const scale = this._scale,
					offset = e.deltaY / 800;

				if (offset > 0) {
					k = 1 / (1 + offset);
				} else {
					k = (1 + Math.abs(offset));
				}

				k *= scale;

				this._scale = k;

				width *= k;
				height *= k;

				this._imageX += (this._imageWidth - width) / 2;
				this._imageY += (this._imageHeight - height) / 2;

				this._imageWidth = width;
				this._imageHeight = height;

				this.draw();
			}
		});

		// 判断点击区域
		canvas.addEventListener('mousedown', (e) => {
			if (e.which === 1) {
				const [x, y] = [e.layerX, e.layerY];
				const point = this.getPoint();
				this._moving = true;

				// 设置偏移(点击坐标与定点坐标)
				if (x > point.x && x < point.x + point.width && y > point.y && y < point.y + point.height) {
					this._xOffset = x - point.x;
					this._yOffset = y - point.y;
					this._area = Area.point;
				}
				else if (x > this._cropperX && x < this._cropperX + this._cropperWidth && y > this._cropperY && y < this._cropperY + this._cropperHeight) {
					this._xOffset = x - this._cropperX;
					this._yOffset = y - this._cropperY;
					this._area = Area.cropper;
				} else if (x > this._imageX && x < this._imageX + this._imageWidth && y > this._imageY && y < this._imageY + this._imageHeight) {
					this._xOffset = x - this._imageX;
					this._yOffset = y - this._imageY;
					this._area = Area.image;
				}
				else {
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
					case Area.image:
						this.handleImageMove(e);
						break;
					case Area.point:
						this.handlePointMove(e);
						break;
					default:
						return;
				}

				this.draw();
			}
		});
	}

	private handlePointMove(e: MouseEvent) {
		const [x, y] = [e.layerX, e.layerY];
		const [w, h] = [x - this._cropperX - this._xOffset, y - this._cropperY - this._yOffset];
		if (w <= 0 || h <= 0) {
			return;
		}
		this.setCropper(w, h, false);
	}

	private getPoint() {
		const w = this._pointWidth,
			h = this._pointHeight,
			x = this._cropperX + this._cropperWidth - w / 2,
			y = this._cropperY + this._cropperHeight - h / 2;

		return {
			width: w,
			height: h,
			x: x,
			y: y
		};
	}

	private handleImageMove = (e: MouseEvent) => {
		const [x, y] = [e.layerX, e.layerY];
		const [oX, oY] = [this._xOffset, this._yOffset];

		this._imageX = x - oX;
		this._imageY = y - oY;
	}

	private handleCropperMove = (e: MouseEvent) => {
		const [x, y] = [e.layerX, e.layerY];
		const [oX, oY, cW, cH, w, h] = [this._xOffset, this._yOffset, this._cropperWidth, this._cropperHeight, this._width, this._height];

		let currentX = x - oX,
			currentY = y - oY;


		// 判断边界

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
			ctx.drawImage(image, this._imageX, this._imageY, this._imageWidth, this._imageHeight);
		}
	}

	private fillCropper() {
		if (this._image) {
			const ctx = this._ctx;

			ctx.save();

			ctx.strokeStyle = '#39f';
			ctx.lineWidth = this._lineWidth;

			ctx.strokeRect(this._cropperX, this._cropperY, this._cropperWidth, this._cropperHeight);

			ctx.fillStyle = '#39f';
			const point = this.getPoint();

			ctx.fillRect(point.x, point.y, point.width, point.height);

			ctx.restore();
		}
	}

	private getCropperData() {

		const [imageX, imageY, imageH, imageW] = [this._imageX, this._imageY, this._imageHeight, this._imageWidth];
		const [cropperX, cropperY, cropperH, cropperW] = [this._cropperX, this._cropperY, this._cropperHeight, this._cropperWidth];

		let [currentX, currentY, currentH, currentW] = [cropperX, cropperY, cropperH, cropperW];

		let offsetX = 0, offsetY = 0;

		if (cropperX < imageX) {
			currentX = imageX;
			offsetX = currentX - cropperX;
			currentW -= offsetX;
		}

		if (cropperY < imageY) {
			currentY = imageY;
			offsetY = currentY - cropperY;
			currentH -= offsetY;
		}

		if (cropperX + cropperW > imageX + imageW) {
			currentW -= (cropperX + cropperW) - (imageX + imageW);
		}

		if (cropperY + cropperH > imageY + imageH) {
			currentH -= (cropperY + cropperH) - (imageY + imageH);
		}

		if (currentW < 0 || currentH < 0) {
			return;
		}

		return {
			width: currentW,
			height: currentH,
			x: currentX,
			y: currentY,
			offsetX: offsetX,
			offsetY: offsetY,
			imageData: this._ctx.getImageData(currentX, currentY, currentW, currentH)
		};
	}

	private preview = () => {
		if (this._image && this._preview) {
			const data = this.getCropperData(),
				ctx = this._previewCtx;

			ctx.clearRect(0, 0, this._width, this._height);

			if (data) {
				ctx.putImageData(data.imageData, data.offsetX, data.offsetY);
			}
		}
	}

	private draw() {
		this._ctx.clearRect(0, 0, this._width, this._height);

		this.fillBackground();

		this.fillImage();

		this.preview();

		this.fillCropper();

	}

	public crop(): HTMLCanvasElement {
		if (!this._image) {
			console.error('请添加一张图片');
			return;
		}

		this._ctx.clearRect(0, 0, this._width, this._height);

		this.fillImage();

		const data = this.getCropperData();
		if (data) {
			const canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');

			Object.assign(canvas, {
				width: this._cropperWidth,
				height: this._cropperHeight
			});

			ctx.putImageData(data.imageData, data.offsetX, data.offsetY);

			this.draw();
			return canvas;
		}
	}


	private resetImage(image?: HTMLImageElement) {
		if (!image) {
			if (!this._image) {
				return;
			}

			image = this._image;
		}

		if (!image.src) {
			return;
		}
		const iW = image.width,
			iH = image.height,
			w = this._width,
			h = this._height,
			cW = w / 3,
			cH = h / 3;

		let currentW = iW,
			currentH = iH,
			k = 1;	// cover时的缩放比

		// cover 图片
		if (iW > w) {
			currentW = w;
			k = currentW / iW;
			currentH = k * iH;
		}

		if (currentH > h) {
			currentH = h;
			k = currentH / iH;
			currentW = k * iW;
		}

		// 清空配置
		Object.assign(this, {
			_image: image,
			_imageWidth: currentW,
			_imageHeight: currentH,
			_imageX: (w - currentW) / 2,
			_imageY: (h - currentH) / 2,
			_scale: k
		});

		this.setCropper(cW, cH);
	}

	public setImage(image: File | HTMLImageElement) {
		if (image instanceof HTMLImageElement) {
			this.resetImage(image);
		}
		else if (image instanceof File) {
			if (!image.type.match(/^image\/.+$/)) {
				console.error('请选择正确的图片文件');
			}
			const reader = new FileReader();
			this._image = null;

			reader.onload = (e: any) => {
				const _image = new Image();
				_image.src = e.target.result;
				_image.onload = () => {
					this.resetImage(_image);
				};
			};

			reader.readAsDataURL(image);
		}
		else {
			return;
		}
	}


	private setPreview(resetCoordinate: boolean = true) {
		const width = this._cropperWidth;
		const height = this._cropperHeight;
		if (this._preview) {
			const [w, h] = [this._width, this._height];
			if (resetCoordinate) {
				this._cropperX = w / 2 - width / 2;
				this._cropperY = h / 2 - height / 2;
			}
			this._previewWidth = width;
			this._previewHeight = height;
			Object.assign(this._previewCanvas, {
				width: this._previewWidth,
				height: this._previewHeight
			});
		}
	}


	public setCropper(width: number, height: number, resetCoordinate: boolean = true) {
		this._cropperWidth = width;
		this._cropperHeight = height;

		this.setPreview(resetCoordinate);

		this.draw();
	}

	set previewScale(scale: number) {
		this.setPreview();
		this.draw();
	}
}
