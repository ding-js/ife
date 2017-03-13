import './index.scss';
import { Snake } from './snake';
import * as $ from 'jquery';
import * as infoHtml from './info.pug';

const wrapper = $('#snake-wrapper'),
	modeWrapper = $('#mode-wrapper');

let mode: string;

modeWrapper.on('click', 'button', (e) => {
	mode = $(e).data('mode');
	modeWrapper.removeClass('show');
});


function updateInfo() {

}

// function updateInfo(scroe: number = 0, speed: number = 1) {
// 	scroeInfo.innerHTML = '' + scroe;
// 	speedInfo.innerHTML = '' + speed;
// }

// function commonMode() {
// 	updateInfo();
// 	new Snake(wrapper, {
// 		width: 600,
// 		height: 600,
// 		scroeCallback: function (scroe) {
// 			const speed = this.speed,
// 				targetSpeed = 1 + Math.floor(scroe / 5) * 5;

// 			if (speed !== targetSpeed) {
// 				this.speed = targetSpeed;
// 			}

// 			updateInfo(scroe, this.speed);
// 		}
// 	});
// }

// function levelMode() {
// 	updateInfo();
// 	const levels = [];

// 	for (let i = 1; i <= 10; i++) {
// 		levels.push({
// 			scroe: i * 5,
// 			speed: 1 + i * 5
// 		});
// 	}

// 	let index = 0;

// 	new Snake(wrapper, {
// 		width: 600,
// 		height: 600,
// 		scroeCallback: function (scroe) {
// 			const level = levels[index];
// 			if (scroe >= level.scroe) {
// 				if (index >= levels.length - 1) {
// 					this.endGame('没有关卡啦!');
// 				} else {
// 					this.speed = level.speed;
// 					this.nextLevel('按空格进入下一关');
// 					index++;
// 					updateInfo(1, level.speed);
// 				}
// 				return false;
// 			}
// 			updateInfo(scroe, this.speed);
// 		}
// 	});
// }

// function escapeMode() {
// 	updateInfo();
// 	const levels = [];

// 	for (let i = 1; i <= 10; i++) {
// 		levels.push({
// 			scroe: i * 5,
// 			speed: 1 + i * 3
// 		});
// 	}

// 	let index = 0;

// 	const s = new Snake(wrapper, {
// 		height: 600,
// 		width: 600,
// 		scroeCallback: function (scroe) {
// 			const level = levels[index];
// 			if (scroe >= level.scroe) {
// 				if (index >= levels.length - 1) {
// 					this.endGame('没有关卡啦!');
// 				} else {
// 					this.speed = level.speed;
// 					s.fillWall(20);
// 					this.nextLevel('按空格进入下一关');
// 					index++;
// 					updateInfo(1, level.speed);
// 				}
// 				return false;
// 			}
// 			updateInfo(scroe, this.speed);

// 		}
// 	});

// 	s.fillWall(20);
// }

const snake = new Snake(wrapper.get(0), {
	scroeCallback: (score) => {
		updateInfo();
		updateMode(score);
	},
	endCallback: function (msg) {
		info(msg, () => {
			this.reStart();
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
	snake.speed = 1 + Math.floor(score / 10) * 10;
}

const levelMode = (function () {
	let index = 0;

	const levels = [];

	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 1,
			speed: 1 + i * 5
		});
	}

	return (score) => {
		const level = levels[index];
		if (score >= level.scroe) {
			if (index >= levels.length - 1) {
				info('没有关卡啦!', () => {
					snake.reset();
					snake.speed = levels[0].speed;
					snake.start();
				});
				index = 0;
			} else {
				info('下一关啦', () => {
					snake.reset();
					snake.speed = level.speed;
					snake.start();
				});
				index++;
			}
			return false;
		}
	};
})();

function updateMode(score: number) {
	snake.reset();

	switch (mode) {
		case 'common':
			commonMode(score);
			break;
		case 'level':
			levelMode(score);
			break;
		case 'dodge':
			break;
		default:
			break;
	}
}
