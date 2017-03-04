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
	}

	public draw() {
		const ctx = this._cropperCtx,
			image = this._image;

		ctx.save();

		if (image) {
			const width = this._imageWidth,
				height = this._imageHeight;

			this._cropperCtx.drawImage(image, (this._width - width) / 2, (this._height - height) / 2);
		}
	}

	public fillImage(file: File) {
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
			};
		}

		reader.readAsDataURL(file);
	}
}
