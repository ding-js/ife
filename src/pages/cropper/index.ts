import './index.scss';
import { Cropper } from './cropper';
import { toast } from 'utils';
import * as defaultImage from './asset/default.jpg';

let downloadCount = 0;

const container = document.querySelector('#cropper') as HTMLElement,
	preview = document.querySelectorAll('.preview'),
	fileInput = document.querySelector('#file') as HTMLInputElement,
	pick = document.querySelector('#pick-file') as HTMLElement,
	setCropper = document.querySelector('#set-cropper') as HTMLElement,
	widthInput = setCropper.querySelector('[name="width"]') as HTMLInputElement,
	heightInput = setCropper.querySelector('[name="height"]') as HTMLInputElement,
	setBtn = document.querySelector('#set-btn'),
	cropBtn = document.querySelector('#crop-btn'),
	download = document.createElement('a');

const w = 700, h = 450;

const cropper = new Cropper(container, {
	preview: Array.prototype.map.call(preview, (el, index) => {
		return {
			container: el,
			scale: 0.7 + index * 0.3
		};
	}),
	width: w,
	height: h
});

// 设置max属性,不能大于画布的宽高
widthInput.setAttribute('max', '' + w);
heightInput.setAttribute('max', '' + h);

// 监听用户选择图片文件
fileInput.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;

	if (el.value === '' || el.files.length < 1) {
		return;
	}

	const file = el.files[0];

	// 判断文件类型
	if (file.type.match(/^image\/.+/)) {
		cropper.setImage(file);
		pick.innerHTML = file.name;
	} else {
		toast('请选择正确的图片');
	}
});

// 纠正用户输入
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

// 点击设置按钮
setBtn.addEventListener('click', () => {
	const width = +widthInput.value,
		height = +heightInput.value;
	if (!width || !height) {
		return toast('请输入正确的宽高!');
	}

	cropper.setCropper(width, height);

});

// 点击裁剪按钮
cropBtn.addEventListener('click', () => {
	try {
		const canvas = cropper.crop();
		download.href = canvas.toDataURL();
		download.download = `ding-cropper-${++downloadCount}.png`;
		download.click();
		toast('我就不假装上传了!');
	} catch (e) {
		console.error(e);
		toast('不支持HTML5,建议使用<a href="https://www.google.com/chrome/">「Chrome浏览器」浏览本页面!</a>');
	}
});

// 载入默认图片
(function () {
	const image = new Image();

	image.src = defaultImage;

	image.onload = () => {
		cropper.setImage(image);
	};
}());
