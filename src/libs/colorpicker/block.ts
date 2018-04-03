import { bind, unbind } from '../utils/drag';
import { generateCanvas } from '../utils';

interface Color {
  h: number;
  s: number;
  v: number;
}

export interface ColorBlockOptions {
  width: number;
  height: number;
  lineWidth?: number;
  padding?: number;
  onColorChange?(color: Color): void;
}

export class ColorBlock {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _contentWidth: number;
  private _contentHeight: number;
  private _color: Color;
  private _hue: string;
  private _x: number;
  private _y: number;
  private _whiteGradient: CanvasGradient;
  private _blackGradient: CanvasGradient;

  private _options: ColorBlockOptions;

  constructor(canvas: HTMLCanvasElement, options: ColorBlockOptions) {
    const _options = {
      lineWidth: 1,
      padding: 10
    };

    const r = generateCanvas(canvas, options);

    if (options) {
      Object.assign(_options, options);
    }

    this._options = _options as ColorBlockOptions;

    this._canvas = canvas;

    this.init();
  }

  private init() {
    const canvas = this._canvas,
      ctx = canvas.getContext('2d');

    const { width, height, lineWidth, padding } = this._options;

    const contentWidth = width - padding * 2,
      contentHeight = height - padding * 2;

    ctx.lineWidth = lineWidth;

    this._ctx = ctx;

    this._contentWidth = contentWidth;
    this._contentHeight = contentHeight;

    this.initBackground();

    bind(canvas, ({ x, y }) => {
      this.setCoordinate(x, y);
    });

    Promise.resolve().then(() => {
      this.setCoordinate(width / 2, height / 2);
    });
  }

  private initBackground() {
    const { _ctx, _color, _options } = this;
    const { padding, width, height } = _options;

    const black = _ctx.createLinearGradient(
      width / 2,
      height - padding,
      width / 2,
      padding
    );

    const white = _ctx.createLinearGradient(
      padding,
      height / 2,
      width - padding,
      height / 2
    );

    white.addColorStop(0, '#fff');

    white.addColorStop(1, 'rgba(0,0,0,0)');

    black.addColorStop(0, '#000');

    black.addColorStop(1, 'rgba(0,0,0,0)');

    this._whiteGradient = white;

    this._blackGradient = black;
  }

  // 填充背景色（拾色器）
  private fillColor() {
    const { _ctx, _contentWidth, _contentHeight, _hue } = this;

    const { padding } = this._options;

    if (!_hue) {
      return;
    }

    // 填充底色
    _ctx.save();

    _ctx.fillStyle = _hue;

    _ctx.fillRect(padding, padding, _contentWidth, _contentHeight);

    _ctx.restore();

    // 填充黑白背景
    [this._whiteGradient, this._blackGradient].forEach(gradient => {
      _ctx.fillStyle = gradient;

      _ctx.fillRect(padding, padding, _contentWidth, _contentHeight);

      _ctx.restore();
    });
  }

  // 设置坐标
  private setCoordinate(x: number, y: number) {
    const { padding } = this._options;
    const { _contentHeight, _contentWidth } = this;
    let currentX, currentY;

    // 检查边界
    if (x < padding) {
      currentX = padding + 1;
    } else if (x > _contentWidth + padding) {
      currentX = _contentWidth + padding - 1;
    } else {
      currentX = x;
    }

    if (y < padding) {
      currentY = padding + 1;
    } else if (y > _contentHeight + padding) {
      currentY = _contentHeight + padding - 1;
    } else {
      currentY = y;
    }

    this._x = currentX;
    this._y = currentY;

    if (this._options.onColorChange) {
      const color = {
        v: 1 - (currentY - padding) / _contentHeight,
        s: (currentX - padding) / _contentWidth,
        h: (this._color && this.color.h) || null
      };

      this._color = color;

      this._options.onColorChange(color);
    }

    this.draw();
  }

  // 渲染光标
  private renderPointer() {
    const { padding } = this._options;

    const x = this._x,
      y = this._y;

    if (x !== undefined && y !== undefined) {
      const ctx = this._ctx;

      ctx.save();

      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, padding / 2, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();

      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, padding / 2 - this._options.lineWidth, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    }
  }

  private updateHue() {
    const h = this._color && this._color.h;

    if (typeof h !== 'number') {
      return;
    }

    const index = Math.floor(h / 60);
    const c = Math.round((h % 60) / 60 * 255);

    let r, g, b;

    switch (index) {
      case 0:
        r = 255;
        g = c;
        b = 0;
        break;
      case 1:
        r = 255 - c;
        g = 255;
        b = 0;
        break;
      case 2:
        r = 0;
        g = 255;
        b = c;
        break;
      case 3:
        r = 0;
        g = 255 - c;
        b = 255;
        break;
      case 4:
        r = c;
        g = 0;
        b = 255;
        break;
      case 5:
        r = 255;
        g = 0;
        b = 255 - c;
        break;
      default:
        return;
    }
    this._hue = `rgb(${r},${g},${b})`;
  }

  private updateCoordinate() {
    const { _contentWidth, _contentHeight, _options } = this;

    this._x = this._color.s * _contentWidth + _options.padding;
    this._y = (1 - this.color.v) * _contentHeight + _options.padding;
  }

  private draw() {
    const { _ctx, _x, _y } = this;
    const { width, height } = this._options;

    _ctx.clearRect(0, 0, width, height);

    this.fillColor();

    this.renderPointer();
  }

  set color(color: Color) {
    const props = ['h', 's', 'v'];
    const mergedColor = Object.assign({}, this._color, color);
    const c = {
      h: mergedColor.h,
      s: mergedColor.s,
      v: mergedColor.v
    };

    if (this._color && props.every(p => c[p] === this._color[p])) {
      return;
    }

    this._color = c;

    this.updateHue();

    this.updateCoordinate();

    this.draw();
  }

  get color() {
    return this._color;
  }
}
