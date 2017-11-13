export interface IColorBarOptions {
  width: number;
  height: number;
  lineWidth?: number;
  onColorChange?(color: ImageData): void;
}

export class ColorBar {
  private _el: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;
  private _padding: number = 10;
  private _gradient: CanvasGradient;
  private _y: number;
  private _showSlider: boolean = true;
  private _moveEvt: boolean = false;

  // 拾色条的颜色渐变顺序
  private _colors: string[] = ['f00', 'ffA500', 'ff0', '008000', '00f', '4b0082', '800080'];

  private _options: IColorBarOptions;

  constructor(element: HTMLCanvasElement, options?: IColorBarOptions) {
    const _options: IColorBarOptions = {
      width: null,
      height: null,
      lineWidth: 1,
      onColorChange: null
    };

    if (options) {
      Object.assign(_options, options);
    }

    this._options = _options;

    this._el = element;

    this.init();
  }

  private init() {
    const padding = this._padding;

    const canvas = this._el,
      ctx = canvas.getContext('2d');

    const { width, height } = this._options;

    const gradient = ctx.createLinearGradient(padding, padding, padding, height - padding * 2);

    const colors = this._colors,
      length = colors.length;

    canvas.setAttribute('width', width.toString());

    canvas.setAttribute('height', height.toString());

    // 填充背景色
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (length - 1), '#' + color);
    });

    this._gradient = gradient;

    this._ctx = ctx;
    this._width = width;
    this._height = height;

    ctx.lineWidth = this._options.lineWidth;

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

    this.setCoordinate(0);
  }

  // 这里背景色不会改变,可以复用CanvasGradient
  private fill() {
    const gradient = this._gradient,
      ctx = this._ctx,
      padding = this._padding;

    ctx.fillStyle = gradient;
    ctx.fillRect(this._padding, this._padding, this._width - padding * 2, this._height - padding * 2);
  }

  private setCoordinateByEvent = (e: MouseEvent) => {
    this._showSlider = true;
    this.setCoordinate(e.layerY);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (e.which === 1) {
      this.setCoordinateByEvent(e);
    }
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

  // 渲染光标
  private renderCurrentColor() {
    // 可以选择是否显示光标
    if (this._showSlider) {
      const lineWidth = this._options.lineWidth,
        x = this._width / 2,
        y = this._y,
        sliderWidth = this._width,
        sliderHeight = lineWidth * 6;

      if (y !== undefined) {
        const ctx = this._ctx;

        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.strokeRect(lineWidth / 2, y - sliderHeight / 2, sliderWidth - lineWidth, sliderHeight);

        ctx.strokeStyle = '#fff';
        ctx.strokeRect(lineWidth + lineWidth / 2, y - sliderHeight / 2 + lineWidth, sliderWidth - lineWidth * 3, sliderHeight - lineWidth * 2);
        ctx.stroke();

        ctx.restore();
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

  // 隐藏光标
  public hideSlider() {
    if (this._showSlider) {
      this._showSlider = false;
      this.draw();
    }
  }
}
