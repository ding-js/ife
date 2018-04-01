import { ColorBlock, ColorBlockOptions } from './block';
import { ColorBar, ColorBarOptions } from './bar';
import * as utils from './utils';

interface ColorPickerOptions {
  height?: number;
  barWidth?: number;
  blockWidth?: number;
  onBarColorChange?(pixel: ImageData): void;
  onBlockColorChange?(pixel: ImageData): void;
}

export default class ColorPicker {
  private _container: HTMLElement;
  private _options: ColorPickerOptions;
  private _block: ColorBlock;
  private _bar: ColorBar;

  constructor(container: HTMLElement, options?: ColorPickerOptions) {
    const _options: ColorPickerOptions = {
      height: 300,
      blockWidth: 300,
      barWidth: 40
    };

    Object.assign(_options, options);

    this._options = _options;

    this._container = container;

    this.init();
  }

  init() {
    const {
      height,
      blockWidth,
      barWidth,
      onBarColorChange,
      onBlockColorChange
    } = this._options;

    const block = document.createElement('canvas'),
      bar = document.createElement('canvas');

    const blockOptions: ColorBlockOptions = {
      width: blockWidth,
      height: height,
      onColorChange: pixel => {
        if (onBlockColorChange) {
          onBlockColorChange(pixel);
        }
      }
    };

    const barOptions: ColorBarOptions = {
      width: barWidth,
      height: height,
      onColorChange: pixel => {
        const data = utils.ImageData2Rgb(pixel);

        this._block.color = '#' + utils.Rgb2Hex(data);

        if (onBarColorChange) {
          onBarColorChange(pixel);
        }
      }
    };

    this._container.appendChild(block);

    this._container.appendChild(bar);

    this._block = new ColorBlock(block, blockOptions);

    this._bar = new ColorBar(bar, barOptions);
  }

  get block() {
    return this._block;
  }

  get bar() {
    return this._bar;
  }
}
