import * as throttle from 'lodash/throttle.js';
import './index.scss';

const loading = document.querySelector('#loading') as HTMLElement,
	content = document.querySelector('#scroll-content') as HTMLElement,
	total = document.querySelector('#scroll-controller [name="total"]') as HTMLInputElement,
	step = document.querySelector('#scroll-controller [name="step"]') as HTMLInputElement;

const distance = window.innerHeight * 0.2;	// 触发函数时离可视区域距离

let data = [];	// 假数据

let itemStep;	// 每次载入数据数

let state: {
	isLast?: boolean;
	loading?: boolean;
	index?: number;
	init?: boolean;
} = {};	// 存储状态

// 模拟异步获取数据
function getScrollData(index: number, length: number, cb: Function) {
	setTimeout(() => {
		const items = data.slice(index, index + length),
			isLast = index + length + 1 >= data.length;

		cb(items, isLast);
	}, (Math.random() * 2 + 1) * 500);
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
	const _dis = loading.offsetTop - document.body.scrollTop - window.innerHeight;	// loading元素距离页面底部

	if (!state.isLast && !state.loading && _dis < distance) {
		state.loading = true;

		getScrollData(state.index, itemStep, (items, isLast) => {
			if (state.init) {
				state.init = false;
				state.loading = false;
				init();
				return;
			}

			state.isLast = isLast;
			state.index += items.length;
			fillElements(items);

			state.loading = false;
			// 解绑事件和隐藏loading元素
			if (isLast) {
				loading.style.display = 'none';
				window.removeEventListener('scroll', checkScroll);
			} else {
				checkScroll();
			}
		});
	}
}, 100); // 节流延迟

function init() {
	if (state.loading) {
		// 在loading时,等待loading结束重新调用
		state.init = true;
	} else {
		const itemLength = +total.value || +(total.dataset as any).default;

		// 如果上一轮中已经全部显示需要重新绑定事件和显示Loading元素
		if (state.isLast) {
			reset();
		}

		itemStep = +step.value || +(step.dataset as any).default;

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


function reset() {
	loading.style.display = 'block';
	window.addEventListener('scroll', checkScroll);
}

// 用户配置
document.querySelector('#scroll-controller').addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() === 'input') {
		const val = +el.value,
			min = +el.getAttribute('min'),
			max = +el.getAttribute('max');

		if (val < min || val === 0) {
			el.value = '';
		} else if (val > max) {
			el.value = '' + max;
		}

		init();
	}
});

// 页面载入时的初始化
window.addEventListener('scroll', checkScroll);

init();
