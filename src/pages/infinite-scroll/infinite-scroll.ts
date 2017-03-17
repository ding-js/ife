import * as throttle from 'lodash/throttle.js';

interface IInfiniteScrollOptions {
	threshold?: number;
	render?(li: HTMLElement, data): void;
}

export class InfiniteScroll {
	private _options: IInfiniteScrollOptions;
	private _container: HTMLElement;
	private _data: any[];
	private _scrolled: boolean;
	constructor(container: HTMLElement, options?: IInfiniteScrollOptions) {
		const _options: IInfiniteScrollOptions = {
			threshold: 200,
			render: (li, data) => {
				const text = document.createTextNode(data);
				li.appendChild(text);
			}
		};

		Object.assign(_options, options);

		this._options = _options;
		this._container = container;
		this._data = [];
		this._scrolled = false;

		this.init();
	}

	private init() {
		window.addEventListener('scroll', this.handleScroll);
	}

	private handleScroll = throttle((e) => {
		const op = this._options;
		if (document.body.offsetHeight < window.scrollY + window.innerHeight + op.threshold) {
			console.log('触发啦');
		}
	}, 150);
}
