import './index.scss';
import { Cropper } from './cropper';
import { toast } from 'utils';
import * as defaultImage from './asset/default.jpg';
const container = document.querySelector('#cropper') as HTMLElement,
	preview = document.querySelector('#preview') as HTMLElement,
	fileInput = document.querySelector('#file') as HTMLInputElement,
	pick = document.querySelector('#pick-file') as HTMLElement,
	setCropper = document.querySelector('#set-cropper') as HTMLElement,
	widthInput = setCropper.querySelector('[name="width"]') as HTMLInputElement,
	heightInput = setCropper.querySelector('[name="height"]') as HTMLInputElement,
	setBtn = document.querySelector('#set-btn'),
	cropBtn = document.querySelector('#crop-btn'),
	cropImage = document.querySelector('#crop-image') as HTMLImageElement;

const w = 700, h = 450;

const cropper = new Cropper(container, {
	preview: preview,
	width: w,
	height: h,
	previewScale: 0.6
});

widthInput.setAttribute('max', '' + w);
heightInput.setAttribute('max', '' + h);

fileInput.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;

	if (el.value === '' || el.files.length < 1) {
		return;
	}

	const file = el.files[0];

	if (file.type.match(/^image\/.+/)) {
		cropper.setImage(file);
		pick.innerHTML = file.name;
	}
});

setCropper.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() === 'input') {
		const val = +el.value,
			max = +el.getAttribute('max'),
			min = +el.getAttribute('mix');
		if (val > max) {
			el.value = '' + max;
		}

		else if (val < min) {
			el.value = '' + min;
		}
		else if (val === 0) {
			el.value = '';
		}
	}
});

setBtn.addEventListener('click', () => {
	const width = +widthInput.value,
		height = +heightInput.value;
	if (!width || !height) {
		return toast('请输入正确的宽高!');
	}

	cropper.setCropper(width, height);

});

cropBtn.addEventListener('click', () => {
	const canvas = cropper.crop();
	cropImage.src = canvas.toDataURL();
	toast('裁剪成功,我就不假装上传了!');
});

const image = new Image();

image.src = defaultImage;

image.onload = () => {
	cropper.setImage(image);
};
