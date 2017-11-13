import { ColorBlock, IColorBlockOptions } from './block';
import { ColorBar, IColorBarOptions } from './bar';
import * as utils from './utils';

interface IColorPickerOptions {
  height?: number;
  barWidth?: number;
  blockWidth?: number;
  onBarColorChange?(pixel: ImageData): void;
  onBlockColorChange?(pixel: ImageData): void;
}

export default class ColorPicker {
  private _container: HTMLElement;
  private _options: IColorPickerOptions;
  private _block: ColorBlock;
  private _bar: ColorBar;
  constructor(container: HTMLElement, options?: IColorPickerOptions) {
    const _options: IColorPickerOptions = {
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
    const op = this._options;
    const block = document.createElement('canvas'),
      bar = document.createElement('canvas');

    const blockOptions: IColorBlockOptions = {
      width: op.blockWidth,
      height: op.height
    };

    const barOptions: IColorBarOptions = {
      width: op.barWidth,
      height: op.height,
      onColorChange: (pixel) => {
        const data = utils.ImageData2Rgb(pixel);
        this._block.color = '#' + utils.Rgb2Hex(data);
        if (op.onBarColorChange) {
          op.onBarColorChange(pixel);
        }
      }
    };

    if (op.onBlockColorChange) {
      blockOptions.onColorChange = op.onBlockColorChange;
    }

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

export {
  utils,
  ColorPicker
};
