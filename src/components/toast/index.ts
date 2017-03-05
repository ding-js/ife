import './index.scss';

interface IToastOptions {
	delay: number;
}

export default function toast(options: IToastOptions) {
	const list: Toast[] = [],
		width = window.innerWidth,
		height = window.innerHeight;

	const defaultRight = width * 0.04,
		defaultTop = height * 0.06,
		marginBottom = width * 0.01,
		marginRight = width * 0.01;

	const setToast = (t: Toast, last: Toast) => {
		const tEl = t.el,
			el = last.el;
		if (el.offsetHeight + el.offsetTop + tEl.offsetHeight + marginBottom + defaultTop > height) {
			t.setTopRight(defaultTop, last.right + el.offsetWidth + marginRight);
		} else {
			t.setTopRight(last.top + el.offsetHeight + marginBottom, last.right);
		}
	};


	return (msg: string, delay: number = options.delay) => {
		const t = new Toast(msg);

		if (list.length > 0) {
			setToast(t, list[list.length - 1]);
		} else {
			t.setTopRight(defaultTop, defaultRight);
		}

		list.push(t);

		t.show();

		setTimeout(() => {
			t.hide();
			list.splice(0, 1);
			if (list.length > 0) {
				list[0].setTopRight(defaultTop, defaultRight);
				if (list.length > 1) {
					for (let i = 1, l = list.length; i < l; i++) {
						setToast(list[i], list[i - 1]);
					}
				}
			}
		}, delay);
	};
}


class Toast {
	private _el: HTMLElement;
	private _msg: string;
	public top: number;
	public right: number;

	constructor(msg: string) {
		Object.assign(this, {
			_msg: msg
		});

		this.init();
	}

	private init() {
		const el = document.createElement('div'),
			text = document.createTextNode(this._msg);

		el.classList.add('toast');

		el.appendChild(text);

		document.body.appendChild(el);

		this._el = el;

		// setTimeout(this.hide, this._delay);
	}

	public show = () => {
		this._el.classList.add('show');
	}

	public hide = () => {
		this._el.classList.remove('show');
		this._el.classList.add('hide');

		setTimeout(() => {
			document.body.removeChild(this._el);
		}, 300);
	}

	public setTopRight(top: number, right: number) {
		const el = this.el;
		this.top = top;
		this.right = right;
		Object.assign(el.style, {
			top: top + 'px',
			right: right + 'px'
		});
	}

	get el(): HTMLElement {
		return this._el;
	}
}
