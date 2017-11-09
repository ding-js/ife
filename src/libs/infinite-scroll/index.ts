import './index.scss';
import { InfiniteScroll } from './infinite-scroll';
import { get } from './data';

let index = 0;

const length = 20;

const container = document.querySelector('#scroll-content') as HTMLElement,
	loading = document.querySelector('#loading');

const getCallback = (scroller, data, next, isLast) => {
	index = next;
	scroller.add(data);
	if (isLast) {
		scroller.destroy();
		loading.parentNode.removeChild(loading);
	}
};

const scroller = new InfiniteScroll(container, {
	trigger: function (able) {
		get(index, length, (data, next, isLast) => {
			getCallback(this, data, next, isLast);
			able();
		});
	}
});

const minLength = Math.ceil((window.innerHeight - 80) / 59);

get(0, 10 - (minLength % 10) + minLength, (data, next, isLast) => {
	getCallback(scroller, data, next, isLast);
});


