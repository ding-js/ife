import { ColorBlock, ColorBlockOptions } from './block';
import { ColorBar, ColorBarOptions } from './bar';
import * as utils from './utils';

interface ColorPickerOptions {
  padding?: number;
  height?: number;
  barWidth?: number;
  blockWidth?: number;
  onColorChange?(color: Color): void;
}

interface Color {
  h: number;
  s: number;
  v: number;
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
    if (this._options.onColorChange) {
      this._options.onColorChange(color);
    }
  }

  set color(color: Color) {
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
