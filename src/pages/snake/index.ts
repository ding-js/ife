import './index.scss';
import { Snake } from './snake';

const wrapper = document.querySelector('#snake-wrapper') as HTMLElement,
	scroeInfo = document.querySelector('#scroe-info') as HTMLElement,
	speedInfo = document.querySelector('#speed-info') as HTMLElement,
	modeGroup = document.querySelector('#mode-group') as HTMLElement;

modeGroup.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() === 'input' && el.type === 'radio' && el.checked) {
		el.blur();
		wrapper.innerHTML = '';
		updateInfo(0, 1);
		switch (el.value) {
			case 'common':
				commonMode();
				break;
			case 'level':
				levelMode();
				break;
			case 'escape':
				escapeMode();
				break;
			default:
				return;
		}
	}
});

function updateInfo(scroe: number = 0, speed: number = 1) {
	scroeInfo.innerHTML = '' + scroe;
	speedInfo.innerHTML = '' + speed;
}

function commonMode() {
	updateInfo();
	new Snake(wrapper, {
		width: 600,
		height: 600,
		scroeCallback: function (scroe) {
			const speed = this.speed,
				targetSpeed = 1 + Math.floor(scroe / 5) * 5;

			if (speed !== targetSpeed) {
				this.speed = targetSpeed;
			}

			updateInfo(scroe, this.speed);
		}
	});
}

function levelMode() {
	updateInfo();
	const levels = [];

	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 5,
			speed: 1 + i * 5
		});
	}

	let index = 0;

	new Snake(wrapper, {
		width: 600,
		height: 600,
		scroeCallback: function (scroe) {
			const level = levels[index];
			if (scroe >= level.scroe) {
				if (index >= levels.length - 1) {
					this.endGame('没有关卡啦!');
				} else {
					this.speed = level.speed;
					this.nextLevel('按空格进入下一关');
					index++;
					updateInfo(1, level.speed);
				}
				return false;
			}
			updateInfo(scroe, this.speed);
		}
	});
}

function escapeMode() {
	updateInfo();
	const levels = [];

	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 5,
			speed: 1 + i * 3
		});
	}

	let index = 0;

	const s = new Snake(wrapper, {
		height: 600,
		width: 600,
		scroeCallback: function (scroe) {
			const level = levels[index];
			if (scroe >= level.scroe) {
				if (index >= levels.length - 1) {
					this.endGame('没有关卡啦!');
				} else {
					this.speed = level.speed;
					s.fillWall(20);
					this.nextLevel('按空格进入下一关');
					index++;
					updateInfo(1, level.speed);
				}
				return false;
			}
			updateInfo(scroe, this.speed);

		}
	});

	s.fillWall(20);
}

commonMode();
