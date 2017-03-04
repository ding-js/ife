import './index.scss';
import { Cropper } from './cropper';
const container = document.querySelector('#cropper') as HTMLElement,
	preview = document.querySelector('#preview') as HTMLElement,
	fileInput = document.querySelector('#file') as HTMLInputElement;

const cropper = new Cropper(container, {
	preview: preview
});

fileInput.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.value === '' || el.files.length < 1) {
		return;
	}

	cropper.fillImage(el.files[0]);
});

