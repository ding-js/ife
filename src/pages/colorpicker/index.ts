import './index.scss';
import ColorBlock from './color-block';
import ColorBar from './color-bar';
import * as pub from './pub';

const colors = document.querySelector('#colors');

const rgbElements = Array.prototype.slice.call(document.querySelectorAll('#rgb-info input'), 0),
	hslElements = Array.prototype.slice.call(document.querySelectorAll('#hsl-info input'), 0);

const colorBlock = new ColorBlock(document.querySelector('#color-block') as HTMLCanvasElement, {
	onColorChange: (pixel) => {
		const rgbData = pub.ImageData2Rgb(pixel);

		const hslData = pub.Rgb2Hsl(rgbData);

		rgbElements.forEach((el, index) => {
			el.value = rgbData[index];
		});

		hslElements.forEach((el, index) => {
			el.value = hslData[index];
		});

		colors.innerHTML = `RGB:${rgbData.join(',')}<br>HSL:${hslData.join(',')}<br>HEX:#${pub.Rgb2Hex(rgbData)}`;
	}
});

const colorBar = new ColorBar(document.querySelector('#color-bar') as HTMLCanvasElement, {
	onColorChange: (pixel) => {
		const data = pub.ImageData2Rgb(pixel);
		colorBlock.color = '#' + pub.Rgb2Hex(data);
	}
});


document.querySelector('#rgb-info').addEventListener('change', (e) => {
	if ((e.target as HTMLElement).nodeName.toLowerCase() === 'input') {
		const rgb: number[] = [];
		const input = e.target as HTMLInputElement;
		const _val = input.value,
			_numberVal = parseInt(_val);
		if (_val === '') {
			return;
		} else if (_numberVal < 0) {
			input.value = '0';
		} else if (_numberVal > 255) {
			input.value = '255';
		}

		for (let el of rgbElements) {
			const val = el.value;
			if (val === '') {
				return;
			} else {
				rgb.push(parseInt(val));
			}
		}
		const hex = '#' + pub.Rgb2Hex(rgb);
		colorBlock.currentColor = hex;
		colorBar.hideSlider();
	}
});

document.querySelector('#hsl-info').addEventListener('change', (e) => {
	if ((e.target as HTMLElement).nodeName.toLowerCase() === 'input') {
		const hsl: number[] = [];
		const input = e.target as HTMLInputElement;
		const _val = input.value,
			_numberVal = parseInt(_val);
		if (_val === '') {
			return;
		} else if (_numberVal < 0) {
			input.value = '0';
		} else if (_numberVal > 1) {
			input.value = '1';
		}

		for (let el of hslElements) {
			const val = el.value;
			if (val === '') {
				return;
			} else {
				hsl.push(parseFloat(val));
			}
		}
		const rgb = pub.Hsl2Rgb(hsl);
		const hex = '#' + pub.Rgb2Hex(rgb);
		console.log(rgb, hsl, hex);
		colorBlock.currentColor = hex;
		colorBar.hideSlider();
	}
});
