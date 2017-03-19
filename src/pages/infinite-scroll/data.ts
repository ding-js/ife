const data: number[] = [];
for (let i = 1; i <= 100; i++) {
	data.push(i);
}

export function get(index: number, length: number, cb: Function) {
	const nextIndex = index + length,

		d = data.slice(index, nextIndex),

		isLast = nextIndex > data.length - 2;

	setTimeout(() => {
		cb(d, nextIndex, isLast);
	}, 300 + Math.random() * 500);
}
