import './index.scss';

const wrapper = document.querySelector('#wrapper');
setInterval(() => {
	wrapper.classList.toggle('color-bg');
}, 1000);
