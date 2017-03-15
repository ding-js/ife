import './index.scss';
import { Snake } from './snake';
import * as $ from 'jquery';
import * as infoHtml from './info.pug';

const wrapper = $('#snake-wrapper'),
	modeWrapper = $('#mode-wrapper'),
	scoreEl = $('#score'),
	speedEl = $('#speed');

let mode: string;

modeWrapper.on('click', 'button', (e) => {
	mode = $(e.currentTarget).data('mode');
	modeWrapper.removeClass('show');
	updateMode(0);
});

function showMode() {
	modeWrapper.addClass('show');
}

const snake = new Snake(wrapper.get(0), {
	scroeCallback: (score) => {
		updateMode(score);
	},
	endCallback: function (msg) {
		const able = this.disable();
		info(msg, () => {
			able();
			showMode();
		});
	}
});

function info(msg: string, cb) {
	const el = $(infoHtml({
		msg
	}));

	const remove = () => {
		el.removeClass('show');
		setTimeout(() => {
			el.remove();
		}, 200);
	};

	const currentCb = () => {
		remove();
		cb();
	};

	wrapper.append(el);

	wrapper.find('button').one('click', currentCb);

	setTimeout(() => {
		el.addClass('show');
	}, 0);
}

function commonMode(score: number) {
	const speed = 1 + Math.floor(score / 10) * 10;
	if (score === 0) {
		snake.reset();
		snake.draw();
	}
	if (snake.speed !== speed) {
		snake.speed = speed;
		updateInfo(score);
	}
}

const levelMode = (function () {
	let index = 0;

	const levels = [];


	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 8,
			speed: 1 + i * 5
		});
	}

	const reset = () => {
		snake.speed = levels[0].speed;
		snake.draw();
	};
	return (score) => {
		const level = levels[index];

		if (score === 0) {
			snake.reset();
			reset();
			return;
		}
		if (score >= level.scroe) {
			const able = snake.disable();
			snake.reset();
			if (index >= levels.length - 1) {
				info('没有关卡啦!', () => {
					reset();
					able();
				});
				index = 0;
			} else {
				info('下一关啦', () => {
					snake.speed = level.speed;
					snake.draw();
					able();
					updateInfo(0);
				});
				index++;
			}
			return false;
		}
	};
}());

const dodgeMode = (function () {
	let index = 0;

	const levels = [];

	const reset = () => {
		snake.speed = levels[0].speed;
		snake.fillWall(levels[0].walls);
		snake.draw();
	};

	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 8,
			speed: 1 + i * 5,
			walls: i * 10
		});
	}

	return (score) => {
		if (score === 0) {
			snake.reset();
			reset();
			return;
		}

		const level = levels[index];
		if (score >= level.scroe) {
			snake.reset();
			const able = snake.disable();
			if (index >= levels.length - 1) {
				info('没有关卡啦!', () => {
					reset();
					able();
					showMode();
				});
				index = 0;
			} else {
				info('下一关啦', () => {
					snake.speed = level.speed;
					snake.fillWall(level.walls);
					snake.draw();
					able();
					updateInfo(0);
				});
				index++;
			}
		}
	};
}());

function updateMode(score: number) {
	updateInfo(score);
	switch (mode) {
		case 'common':
			commonMode(score);
			break;
		case 'level':
			levelMode(score);
			break;
		case 'dodge':
			dodgeMode(score);
			break;
		default:
			break;
	}
}


function updateInfo(score: number) {
	scoreEl.html('' + score);
	speedEl.html('' + snake.speed);
}
