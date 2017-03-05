interface ICropperOptions {
	preview?: HTMLElement;
}

export class Cropper {
	private _container: HTMLElement;
	private _options: ICropperOptions;
	private _cropperCtx: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _image: HTMLImageElement;
	private _imageWidth: number;
	private _imageHeight: number;
	private _scaleOffset: number = 0;
	private _cropperX: number;
	private _cropperY: number;
	private _cropperWidth: number;
	private _cropperHeight: number;
	constructor(container: HTMLElement, options?: ICropperOptions) {
		this._container = container;
		this._options = options;
		this.init();
	}

	private init() {
		const container = this._container;
		const cropperCanvas = document.createElement('canvas'),
			cropperCtx = cropperCanvas.getContext('2d');

		this._width = +container.offsetWidth;
		this._height = +container.offsetHeight;

		Object.assign(cropperCanvas, {
			width: this._width,
			height: this._height
		});

		this._cropperCtx = cropperCtx;

		container.appendChild(cropperCanvas);

		cropperCanvas.addEventListener('mousewheel', (e) => {
			if (this._image) {
				this._scaleOffset += e.deltaY;
				this.draw();
			}
		});
	}


	private fillBackground() {
		const ctx = this._cropperCtx,
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
		const image = this._image;
		if (image) {
			const scale = this._scaleOffset;

			let width = image.width,
				height = image.height;

			if (scale !== 0) {
				let k;
				if (scale > 0) {
					k = 1 / (1 + scale / 800);
				} else {
					k = 1 + Math.abs(scale) / 800;
				}

				width *= k;
				height *= k;

				this._imageWidth = width;
				this._imageHeight = height;
			}

			this._cropperCtx.drawImage(image, (this._width - width) / 2, (this._height - height) / 2, width, height);
		}
	}

	private fillCropper() {
		if (!this._cropperWidth) {
			this._cropperWidth = this._imageWidth / 2;
		} else if (this._cropperWidth > this._imageWidth) {
			this._cropperWidth = this._imageWidth;
		}

		if (!this._cropperHeight) {
			this._cropperHeight = this._imageHeight / 2;
		} else if (this._cropperHeight > this._imageHeight) {
			this._cropperHeight = this._imageHeight;
		}

		if (!this._cropperX) {
			this._cropperX = this._width / 2;
		}
	}

	public draw() {
		const ctx = this._cropperCtx;

		ctx.clearRect(0, 0, this._width, this._height);

		this.fillBackground();

		this.fillImage();

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
