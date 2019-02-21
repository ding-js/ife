import { ChangedColor, HSVColor } from './types';
import { ColorBlock, ColorBlockOptions } from './block';
import { ColorBar, ColorBarOptions } from './bar';
import { isNumber } from '../utils';
import * as covert from 'color-convert';

interface ColorPickerOptions {
  padding?: number;
  height?: number;
  barWidth?: number;
  blockWidth?: number;
  onColorChange?(color: ChangedColor): void;
}

type ColorSetter = Partial<ChangedColor>;
export default class ColorPicker {
  private _container: HTMLElement;
  private _options: ColorPickerOptions;
  private _block: ColorBlock;
  private _bar: ColorBar;
  private _color: HSVColor;

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
    this._init();
  }

  private _init() {
    const { height, blockWidth, barWidth } = this._options;
    const block = document.createElement('canvas');
    const bar = document.createElement('canvas');
    const blockOptions: ColorBlockOptions = {
      width: blockWidth,
      height,
      onColorChange: ([, s, v]) => {
        this.color = { hsv: [undefined, s, v] };
      }
    };
    const barOptions: ColorBarOptions = {
      width: barWidth,
      height,
      onColorChange: ([h]) => {
        this.color = { hsv: [h, undefined, undefined] };
      }
    };

    this._container.appendChild(block);
    this._container.appendChild(bar);
    this._block = new ColorBlock(block, blockOptions);
    this._bar = new ColorBar(bar, barOptions);

    // 设置初始化颜色
    this.color = { hsv: [0, 50, 50] };
  }

  private _handleColorChange(from: ColorSetter) {
    const color = this._color;
    const [h, s, v] = color;
    if (isNumber(h)) {
      this._bar.color = color;
    }

    if (isNumber(s) && isNumber(v)) {
      this._block.color = color;
    }

    if (typeof this._options.onColorChange === 'function') {
      const rgb = from.rgb || covert.hsv.rgb([h, s, v]);
      const hsl = covert.rgb.hsl(rgb);
      const hex = covert.rgb.hex(rgb);

      this._options.onColorChange({
        hex,
        hsl,
        rgb,
        hsv: color,
        ...from // 避免 hsv 反转换成源数据出现误差
      });
    }
  }

  public destroy() {
    this._block.destroy();
    this._bar.destroy();
  }

  set color(color: ColorSetter) {
    if (!this._bar || !this._block) {
      return;
    }
    let from: ColorSetter;
    let hsv: HSVColor;

    if (color.rgb) {
      hsv = covert.rgb.hsv(color.rgb);
      from = { rgb: color.rgb };
    } else if (color.hsl) {
      hsv = covert.hsl.hsv(color.hsl);
      from = { hsl: color.hsl };
    } else if (color.hex) {
      hsv = covert.rgb.hsv(covert.hex.rgb(color.hex));
      from = { hex: color.hex };
    } else if (color.hsv) {
      hsv = color.hsv;
      from = { hsv: color.hsv };
    } else {
      return;
    }

    if (this._color) {
      this._color.forEach((v, i) => {
        if (!isNumber(hsv[i])) {
          hsv[i] = v;
        }
      });

      if (hsv.every((v, i) => v === this._color[i])) {
        return;
      }
    }

    this._color = hsv;
    this._handleColorChange(from);
  }
}
