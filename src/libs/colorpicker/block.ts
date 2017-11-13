import * as utils from './utils';
export interface IColorBlockOptions {
  width: number;
  height: number;
  lineWidth?: number;
  onColorChange?(pixel: ImageData): void;
}

export class ColorBlock {
  private _padding: number = 10;
  private _el: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;
  private _contentWidth: number;
  private _contentHeight: number;
  private _middleColor: string;
  private _x: number;
  private _y: number;
  private _moveEvt: boolean = false;

  private _options: IColorBlockOptions;

  constructor(element: HTMLCanvasElement, options?: IColorBlockOptions) {
    const _options: IColorBlockOptions = {
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

    const { width, height, lineWidth } = this._options;

    const contentWidth = width - padding * 2,
      contentHeight = height - padding * 2;

    canvas.setAttribute('width', width.toString());

    canvas.setAttribute('height', height.toString());

    ctx.lineWidth = lineWidth;

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
  }

  // 填充背景色（拾色器）,同一个CanvasGradient复用会出现Bug,所以每次都新建一个CanvasGradient
  private fill() {
    const { _ctx, _padding, _width, _height, _contentWidth, _contentHeight } = this;

    const gradient = _ctx.createLinearGradient(_width - _padding, _height - _padding, _padding, _padding);

    _ctx.save();

    gradient.addColorStop(0, '#000');

    if (this._middleColor !== undefined) {
      gradient.addColorStop(0.5, this._middleColor);
    }

    gradient.addColorStop(1, '#fff');

    _ctx.fillStyle = gradient;

    _ctx.fillRect(_padding, _padding, _contentWidth, _contentHeight);

    _ctx.restore();
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
