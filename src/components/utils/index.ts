export function throttle(cb: Function, delay: number = 100) {
	let timer: number;
	return (...args) => {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			cb(...args);
		}, delay);

	};
}
