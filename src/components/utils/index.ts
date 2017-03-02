import './index.scss';
export function toast(msg: string, delay: number = 5000) {
	const el = document.createElement('div'),
		text = document.createTextNode(msg);

	el.classList.add('ding-toast');

	el.appendChild(text);
	document.body.appendChild(el);

	setTimeout(() => {
		document.body.removeChild(el);
	}, delay);
}
