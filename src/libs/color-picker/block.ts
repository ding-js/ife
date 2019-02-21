import * as covert from 'color-convert';

import { isNumber } from '../utils';
import { generateCanvas } from '../utils/canvas';
import { bind, unbind } from '../utils/move';

import { HSVColor } from './types';

export interface ColorBlockOptions {
  width: number;
  height: number;
  padding?: number;
  onColorChange?(color: HSVColor): void;
}

export class ColorBlock {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _contentWidth: number;
  private _contentHeight: number;
  private _hue: string;
  private _x: number;
  private _y: number;
  private _whiteGradient: CanvasGradient;
  private _blackGradient: CanvasGradient;
  private _color: HSVColor;
  private _id: number;
  private _options: ColorBlockOptions;

  constructor(canvas: HTMLCanvasElement, options: ColorBlockOptions) {
    const _options = {
      padding: 10
    };

    generateCanvas(canvas, options);

    if (options) {
      Object.assign(_options, options);
    }

    this._options = _options as ColorBlockOptions;
    this._canvas = canvas;
    this._init();
  }

  private _init() {
    const canvas = this._canvas;
    const ctx = canvas.getContext('2d');
    const { width, height, padding } = this._options;
    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;

    this._ctx = ctx;
    this._contentWidth = contentWidth;
    this._contentHeight = contentHeight;

    this._id = bind(canvas, ({ x, y }) => {
      this._setCoordinate(x, y);
    });
    this._initBackground();
  }

  private _initBackground() {
    const { _ctx, _options } = this;
    const { padding, width, height } = _options;
    const black = _ctx.createLinearGradient(width / 2, height - padding, width / 2, padding);
    const white = _ctx.createLinearGradient(padding, height / 2, width - padding, height / 2);

    white.addColorStop(0, '#fff');
    white.addColorStop(1, 'rgba(0,0,0,0)');
    black.addColorStop(0, '#000');
    black.addColorStop(1, 'rgba(0,0,0,0)');

    this._whiteGradient = white;
    this._blackGradient = black;
  }

  private _draw() {
    const { _ctx } = this;
    const { width, height } = this._options;

    _ctx.clearRect(0, 0, width, height);

    this._drawColors();
    this._drawPointer();
  }

  // 填充背景色（拾色器）
  private _drawColors() {
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
      _ctx.save();
      _ctx.fillStyle = gradient;
      _ctx.fillRect(padding, padding, _contentWidth, _contentHeight);
      _ctx.restore();
    });
  }

  // 渲染光标
  private _drawPointer() {
    const { padding } = this._options;
    const x = this._x;
    const y = this._y;

    if (isNumber(x) && isNumber(y)) {
      const ctx = this._ctx;

      ctx.save();

      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, padding / 2, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();

      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, padding / 2 - 1, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    }
  }

  // 设置坐标
  private _setCoordinate(x: number, y: number) {
    const { padding } = this._options;
    const { _contentHeight, _contentWidth } = this;
    let currentX;
    let currentY;

    // 检查边界
    if (x < padding) {
      currentX = padding;
    } else if (x > _contentWidth + padding) {
      currentX = _contentWidth + padding;
    } else {
      currentX = x;
    }

    if (y < padding) {
      currentY = padding;
    } else if (y > _contentHeight + padding) {
      currentY = _contentHeight + padding;
    } else {
      currentY = y;
    }

    this._x = currentX;
    this._y = currentY;

    if (this._options.onColorChange) {
      const color: HSVColor = [
        this.color[0],
        ((currentX - padding) / _contentWidth) * 100,
        (1 - (currentY - padding) / _contentHeight) * 100
      ];

      this._color = color;
      this._options.onColorChange(color);
    }

    this._draw();
  }

  private _updateHue() {
    const h = this._color[0];

    if (!isNumber(h)) {
      return;
    }

    const [r, g, b] = covert.hsv.rgb([h, 100, 100]);
    this._hue = `rgb(${r},${g},${b})`;
  }

  private _updateCoordinate() {
    const { _contentWidth, _contentHeight, _options } = this;
    const [, s, v] = this._color;

    this._x = (s * _contentWidth) / 100 + _options.padding;
    this._y = ((100 - v) * _contentHeight) / 100 + _options.padding;
  }

  public destroy() {
    unbind(this._id);
    this._canvas.parentNode.removeChild(this._canvas);
  }

  set color(color: HSVColor) {
    const mergedColor: HSVColor = this._color
      ? (this._color.slice() as HSVColor)
      : (new Array(3) as HSVColor);
    let shouldUpdate = false;

    color.forEach((v, i) => {
      if (isNumber(v)) {
        if (!this._color || mergedColor[i] !== v) {
          mergedColor[i] = v;
          shouldUpdate = true;
        }
      }
    });

    if (!shouldUpdate) {
      return;
    }

    this._color = mergedColor;
    this._updateHue();
    this._updateCoordinate();
    this._draw();
  }

  get color() {
    return this._color;
  }
}
