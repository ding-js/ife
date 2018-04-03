import { ColorBlock, ColorBlockOptions } from './block';
import { ColorBar, ColorBarOptions } from './bar';
import * as utils from './utils';

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
  private _color: Color = {
    h: null,
    s: null,
    v: null
  };

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
        this.color = {
          ...this._color,
          s,
          v
        };
      }
    };

    const barOptions: ColorBarOptions = {
      width: barWidth,
      height,
      onColorChange: ({ h }) => {
        this.color = {
          ...this._color,
          h
        };
      }
    };

    this._container.appendChild(block);

    this._container.appendChild(bar);

    this._block = new ColorBlock(block, blockOptions);

    this._bar = new ColorBar(bar, barOptions);
  }

  private handleColorChange(color: Color) {
    if (typeof color.h === 'number') {
      this._bar.color = color;
    }

    if (typeof color.s === 'number' && typeof color.v === 'number') {
      this._block.color = color;
    }

    if (this._options.onColorChange) {
      const rgb = utils.HSVtoRGB(color);
      const hsl = utils.RGBtoHSL(rgb);

      this._options.onColorChange(
        Object.assign(
          {
            hex: utils.RGBtoHEX(rgb)
          },
          rgb,
          hsl
        )
      );
    }
  }

  set color(color: Color) {
    const hsv = ['h', 's', 'v'];

    if (hsv.every(p => color[p] === this._color[p])) {
      return;
    }

    this._color = color;

    this.handleColorChange(color);
  }

  get block() {
    return this._block;
  }

  get bar() {
    return this._bar;
  }
}
