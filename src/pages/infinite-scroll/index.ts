import * as throttle from 'lodash/throttle.js';
import './index.scss';



const loading = document.querySelector('#loading') as HTMLElement,
	content = document.querySelector('#scroll-content') as HTMLElement,
	total = document.querySelector('#scroll-controller [name="total"]') as HTMLInputElement,
	step = document.querySelector('#scroll-controller [name="step"]') as HTMLInputElement;

let data = [];	// 假数据

let itemStep;	// 每次载入数据数

let state: any = {};	// 存储状态



// 模拟异步获取数据
function getScrollData(index: number, length: number, cb: Function) {
	setTimeout(() => {
		const items = data.slice(index, index + length),
			isLast = index + length + 1 > data.length;
		cb(items, isLast);

	}, (Math.random() * 3 + 1) * 500);

}

// 填充元素
function fillElements(items) {
	if (items.length > 0) {
		items.forEach(item => {
			const el = document.createElement('li'),
				text = document.createTextNode(item);
			el.appendChild(text);
			content.appendChild(el);
		});
	}
}



const checkScroll = throttle(() => {
	const distance = loading.offsetTop - document.body.scrollTop - window.innerHeight;	// loading元素距离页面底部
	if (!state.isLast && !state.loading && distance < 200) {
		state.loading = true;
		getScrollData(state.index, itemStep, (items, isLast) => {
			state.isLast = isLast;
			state.index += items.length;
			fillElements(items);
			state.loading = false;
			if (isLast) {
				loading.style.display = 'none';
				window.removeEventListener('scroll', checkScroll);
			} else {
				checkScroll();
			}
		});
	}
}, 200);

function init() {
	// 在loading时改变则等待loading结束重新调用
	if (state.loading) {
		setTimeout(() => {
			init();
		}, 200);
	} else {
		const itemLength = +total.value || 100;

		itemStep = +step.value || 20;

		state = {
			index: 0,
			isLast: false,
			loading: false
		};

		data = [];

		// 填充假数据
		for (let i = 1; i <= itemLength; i++) {
			data.push(`Item ${i}`);
		}

		content.innerHTML = '';

		checkScroll();
	}
}

document.querySelector('#scroll-controller').addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() === 'input') {
		const val = +el.value;
		if (val <= 0) {
			el.value = '0';
		}

		init();
	}
});

window.addEventListener('scroll', checkScroll);

init();
