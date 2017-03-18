const data: number[] = [];
for (let i = 1; i <= 100; i++) {
	data.push(i);
}

export function get(index: number, length: number, cb: Function) {
	const d = data.slice(index, index + length);

	const isLast = index + length > data.length - 2;

	setTimeout(() => {
		cb(d, isLast);
	}, 300 + Math.random() * 500);
}
