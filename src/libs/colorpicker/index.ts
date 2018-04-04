import { ColorBlock, ColorBlockOptions } from './block';
import { ColorBar, ColorBarOptions } from './bar';
import * as covert from 'color-convert';

interface ColorPickerOptions {
  padding?: number;
  height?: number;
  barWidth?: number;
  blockWidth?: number;
  onColorChange?(color: CallbackColor): void;
}

interface Color {
  h: number;
  s: number;
  v: number;
}

interface CallbackColor {
  h: number;
  s: number;
  l: number;
  r: number;
  g: number;
  b: number;
  hex: string;
}
export default class ColorPicker {
  private _container: HTMLElement;
  private _options: ColorPickerOptions;
  private _block: ColorBlock;
  private _bar: ColorBar;
  private _color: Color;

  constructor(container: HTMLElement, options?: ColorPickerOptions) {
    const _options: ColorPickerOptions = {
      height: 300,
      blockWidth: 300,
      barWidth: 40,
      padding: 10
    };

    Object.assign(_options, options);

    this._options = _options;

    this._container = container;

    this.init();
  }

  private init() {
    const {
      padding,
      height,
      blockWidth,
      barWidth,
      onColorChange
    } = this._options;

    const block = document.createElement('canvas'),
      bar = document.createElement('canvas');

    const blockOptions: ColorBlockOptions = {
      width: blockWidth,
      height,
      onColorChange: ({ s, v }) => {
        this.setHSV({
          s,
          v
        } as Color);
      }
    };

    const barOptions: ColorBarOptions = {
      width: barWidth,
      height,
      onColorChange: ({ h }) => {
        this.setHSV({
          h
        } as Color);
      }
    };

    this._container.appendChild(block);

    this._container.appendChild(bar);

    this._block = new ColorBlock(block, blockOptions);

    this._bar = new ColorBar(bar, barOptions);

    this.setHSV({
      h: 0,
      s: 0.5,
      v: 0.5
    });
  }

  private handleColorChange(color: Color) {
    if (typeof color.h === 'number') {
      this._bar.color = color;
    }

    if (typeof color.s === 'number' && typeof color.v === 'number') {
      this._block.color = color;
    }

    if (this._options.onColorChange) {
      const { h } = color;
      const s = color.s * 100;
      const v = color.v * 100;
      const rgb = covert.hsv.rgb(h, s, v);
      const hsl = covert.rgb.hsl(rgb).map(n => n / 100);
      const hex = covert.rgb.hex(rgb);

      this._options.onColorChange({
        hex,
        h: hsl[0],
        s: hsl[1],
        l: hsl[2],
        r: rgb[0],
        g: rgb[1],
        b: rgb[2]
      });
    }
  }

  private setHSV(color: Color) {
    if (!this._bar || !this._block) {
      return;
    }

    color = Object.assign({}, this._color, color);

    const hsv = ['h', 's', 'v'];

    if (this._color && hsv.every(p => color[p] === this._color[p])) {
      return;
    }

    this._color = color;

    this.handleColorChange(color);
  }

  set color(color: CallbackColor) {
    const rgb = ['r', 'g', 'b'];
    const hsl = ['h', 's', 'l'];
    let hsv;

    if (rgb.every(p => typeof color[p] === 'number')) {
      hsv = covert.rgb.hsv(color.r, color.g, color.b);
    } else if (hsl.every(p => typeof color[p] === 'number')) {
      hsv = covert.hsl.hsv(color.h * 100, color.s * 100, color.l * 100);
    } else if (color.hex) {
      hsv = covert.rgb.hsv(covert.hex.rgb(color.hex));
    } else {
      return;
    }

    this.setHSV({
      h: hsv[0],
      s: hsv[1] / 100,
      v: hsv[2] / 100
    });
  }

  get block() {
    return this._block;
  }

  get bar() {
    return this._bar;
  }
}
