import './index.scss';
interface ITagOptions {
	text?: string;
	radius?: number;
}

interface ICoordinate {
	x: number;
	y: number;
}
const tagcloud = document.querySelector('#tagcloud') as HTMLElement;


class Tag {
	private _container: HTMLElement;
	private _options: ITagOptions;
	private _width: number;
	private _height: number;
	private _center: ICoordinate;
	private _element: HTMLElement;

	constructor(container: HTMLElement, options?: ITagOptions) {
		const w = container.offsetWidth, h = container.offsetHeight;
		this._container = container;
		this._options = {
			radius: (w > h ? h : w) / 2
		};

		this._center = {
			x: w / 2,
			y: h / 2
		};

		Object.assign(this._options, options);

		if (this._options.text === undefined) {
			this._options.text = createRandomText();
		}

		this.init();
	}

	private init() {
		const el = document.createElement('li');

		el.innerHTML = this._options.text;

		this._container.appendChild(el);

		this._width = el.offsetWidth;
		this._height = el.offsetHeight;

		Object.assign(el.style, {
			left: this._center.x + 'px',
			top: this._center.y + 'px'
		});

		this._element = el;

	}

	public move(angle: number, step: number = 3) {
		const el = this._element,
			y = Math.sin(angle) * step,
			x = Math.cos(angle) * step,
			top = el.offsetTop,
			left = el.offsetLeft;

		Object.assign(el.style, {
			left: left + x + 'px',
			top: top + y + 'px'
		});
	}
}




interface ICloudOptions {
	tags?: ITagOptions[] | number;
}

class Cloud {
	private _element: HTMLElement;
	private _options: ICloudOptions;
	private _tagList: Tag[] = [];
	constructor(element: HTMLElement, options?: ICloudOptions) {
		this._options = {
			tags: 100
		};

		this._element = element;

		Object.assign(this._options, options);

		this.init();
	}

	init() {
		const tags = this._options.tags,
			el = this._element;
		this._element.innerHTML = '';
		if (Array.isArray(tags)) {
			tags.forEach(tag => {
				this._tagList.push(new Tag(el, tag));
			});
		} else if (typeof tags === 'number') {
			for (let i = 0; i < tags; i++) {
				this._tagList.push(new Tag(el));
			}
		}


		// setInterval(() => {
		// 	this._tagList.forEach(t => {
		// 		t.move((Math.random() - 0.5) * 2 * Math.PI);
		// 	});
		// }, 100);
	}
}

new Cloud(tagcloud);


function createRandomText(): string {
	const r = Math.random(),
		length = 3 + Math.round(r * 8);

	let text = '';

	for (let i = 0; i < length; i++) {
		text += String.fromCharCode(97 + Math.floor(Math.random() * 26));
	}

	return text;
}
