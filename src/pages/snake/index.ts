import './index.scss';
import { Snake } from './snake';

const wrapper = document.querySelector('#snake-wrapper') as HTMLElement,
	scroeInfo = document.querySelector('#scroe-info') as HTMLElement,
	speedInfo = document.querySelector('#speed-info') as HTMLElement,
	modeGroup = document.querySelector('#mode-group') as HTMLElement;

modeGroup.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() === 'input' && el.type === 'radio' && el.checked) {
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

function updateInfo(scroe, speed) {
	scroeInfo.innerHTML = scroe;
	speedInfo.innerHTML = '' + (Math.floor(speed * 10) / 10);
}

function commonMode() {
	new Snake(wrapper, {
		width: 600,
		height: 600,
		scroeCallback: function (scroe) {
			const speed = this.speed,
				targetSpeed = 1 + Math.floor(scroe / 10) * 0.2;
			if (speed !== targetSpeed) {
				this.speed = targetSpeed;
			}
			updateInfo(scroe, this.speed);
		}
	});
}
function levelMode() {
	const levels = [];

	for (let i = 1; i <= 10; i++) {
		levels.push({
			scroe: i * 10,
			speed: 1 + i * 0.2
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
					this.endGame('你太厉害了');
				} else {
					this.speed = level.speed;
					this.nextLevel('Press space to next');
					index++;
				}
			}
			updateInfo(scroe, this.speed);
		}
	});
}

function escapeMode() {
	new Snake(wrapper, {
		height: 600,
		width: 600,
		scroeCallback: function (scroe) {
			if (scroe >= 1) {
				this.nextLevel('very good');
				this.fillWall(20);
			}
		}
	});
}

// new Snake(wrapper, {
// 	width: 600,
// 	height: 600
// });

