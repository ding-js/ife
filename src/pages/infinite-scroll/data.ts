const data: number[] = [];
for (let i = 1; i <= 10000; i++) {
	data.push(i);
}

export function get(index: number, length: number, cb: Function) {
	const d = data.slice(index, index + length);

	setTimeout(() => {
		cb(d);
	}, 200 + Math.random() * 400);

}
