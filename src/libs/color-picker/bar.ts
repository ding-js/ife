import { bind, unbind } from '../utils/move';
import { generateCanvas } from '../utils/canvas';
import { isNumber } from '../utils';
import { HSVColor } from './types';
import * as covert from 'color-convert';

export interface ColorBarOptions {
  width: number;
  height: number;
  padding?: number;
  onColorChange?(color: HSVColor): void;
}

export class ColorBar {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _gradient: CanvasGradient;
  private _y: number;
  private _contentWidth: number;
  private _contentHeight: number;
  private _color: HSVColor;
  private _id: number;
  private _options: ColorBarOptions;

  constructor(canvas: HTMLCanvasElement, options: ColorBarOptions) {
    const _options = {
      padding: 10
    };

    generateCanvas(canvas, options);

    if (options) {
      Object.assign(_options, options);
    }

    this._options = _options as ColorBarOptions;
    this._canvas = canvas;
    this._init();
  }

  private _init() {
    const { padding, width, height } = this._options;
    const canvas = this._canvas;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(padding, padding, padding, height - padding * 2);

    // 填充背景色
    for (let i = 0; i <= 6; i++) {
      const k = i / 6;
      const [r, g, b] = covert.hsv.rgb([k * 360, 100, 100]);

      gradient.addColorStop(i / 6, `rgb(${r},${g},${b})`);
    }

    this._contentWidth = width - padding * 2;
    this._contentHeight = height - padding * 2;
    this._gradient = gradient;
    this._ctx = ctx;

    this._id = bind(canvas, e => {
      this._setCoordinate(e.y);
    });
  }

  private _draw() {
    const { width, height } = this._options;

    this._ctx.clearRect(0, 0, width, height);
    this._drawColors();
    this._drawSlider();
  }

  private _drawColors() {
    const { _gradient, _ctx } = this;
    const { padding } = this._options;

    _ctx.fillStyle = _gradient;
    _ctx.fillRect(padding, padding, this._contentWidth, this._contentHeight);
  }

  // 渲染光标
  private _drawSlider() {
    if (!isNumber(this._y)) {
      return;
    }

    const { padding, width } = this._options;
    const lineWidth = 1;

    const y = this._y,
      sliderWidth = width,
      sliderHeight = padding / 2;

    const ctx = this._ctx;

    ctx.save();

    ctx.strokeStyle = '#000';
    ctx.strokeRect(0, y - sliderHeight / 2, sliderWidth, sliderHeight);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(
      lineWidth,
      y - sliderHeight / 2 + lineWidth,
      sliderWidth - lineWidth * 2,
      sliderHeight - lineWidth * 2
    );
    ctx.stroke();

    ctx.restore();
  }

  private _setCoordinate(y: number) {
    const { padding, height } = this._options;
    let result;

    if (y < padding) {
      result = padding;
    } else if (y > height - padding) {
      result = height - padding;
    } else {
      result = y;
    }

    if (this._y === result) {
      return;
    }

    this._y = result;

    if (this._options.onColorChange) {
      const k = (result - padding) / this._contentHeight;
      const hue = Math.floor(k * 360);
      const color: HSVColor = [hue, undefined, undefined];

      this._color = color;
      this._options.onColorChange(color);
    }

    this._draw();
  }
  public destroy() {
    unbind(this._id);
    this._canvas.parentNode.removeChild(this._canvas);
  }

  set color(color: HSVColor) {
    if (this._color && color[0] === this._color[0]) {
      return;
    }

    const { padding } = this._options;
    const k = color[0] / 360;
    const y = this._contentHeight * k + padding;

    this._setCoordinate(y);
  }

  get color() {
    return this._color;
  }
}
