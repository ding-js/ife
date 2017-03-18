import './index.scss';
import { InfiniteScroll } from './infinite-scroll';
import { get } from './data';

let index = 0;

const length = 20;

const container = document.querySelector('#scroll-content') as HTMLElement,
	loading = document.querySelector('#loading');

const scroller = new InfiniteScroll(container, {
	trigger: function (able) {
		get(index, length, (data, isLast) => {
			index += length;
			able();
			this.add(data);
			if (isLast) {
				this.destroy();
				loading.parentNode.removeChild(loading);
			}
		});
	}
});

const minLength = Math.ceil((window.innerHeight - 80) / 59);

get(0, 10 - (minLength % 10) + minLength, (data, isLast) => {
	index += length;
	scroller.add(data);
	if (isLast) {
		scroller.destroy();
		loading.parentNode.removeChild(loading);
	}
});


