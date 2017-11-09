import { ColorBlock, IColorBlockOptions } from './color-block';
import { ColorBar, IColorBarOptions } from './color-bar';
import * as  utils from './utils';

interface IColorPickerOptions {
	height?: number;
	barWidth?: number;
	blockWidth?: number;
	padding?: number;
	onBarColorChange?(pixel: ImageData);
	onBlockColorChange?(pixel: ImageData);
}

export default class ColorPicker {
	private _container: HTMLElement;
	private _options: IColorPickerOptions;
	private _block: ColorBlock;
	private _bar: ColorBar;
	constructor(container: HTMLElement, options?: IColorPickerOptions) {
		const _options: IColorPickerOptions = {
			height: 420,
			barWidth: 50
		};

		Object.assign(_options, options);

		_options.blockWidth = _options.height;

		this._options = _options;
		this._container = container;
		this.init();
	}

	init() {
		const op = this._options;
		const block = document.createElement('canvas'),
			bar = document.createElement('canvas');

		const blockOptions: IColorBlockOptions = {},
			barOptions: IColorBarOptions = {
				onColorChange: (pixel) => {
					const data = utils.ImageData2Rgb(pixel);
					this._block.color = '#' + utils.Rgb2Hex(data);
					if (op.onBarColorChange) {
						op.onBarColorChange(pixel);
					}
				}
			};

		Object.assign(block, {
			width: op.blockWidth,
			height: op.height
		});

		Object.assign(bar, {
			width: op.barWidth,
			height: op.height
		});

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
}
