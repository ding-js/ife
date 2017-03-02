import './index.scss';
import { toast } from 'utils';
import Clock from './clock';
const timeFormGroup = document.querySelector('#time'),
	timeFormInput: HTMLInputElement[] = Array.prototype.slice.call(timeFormGroup.querySelectorAll('input')),
	pickZone = document.querySelector('#pick-zone') as HTMLSelectElement,
	clockCanvas = document.querySelector('#clock') as HTMLCanvasElement,
	setAlarm = document.querySelector('#set-alarm') as HTMLElement,
	alarmInfo = document.querySelector('#alarm-info') as HTMLElement,
	resetClock = document.querySelector('#reset-clock') as HTMLElement;

if (window.innerWidth < 768) {
	const side = Math.min(window.innerWidth, window.innerHeight) - 10;
	clockCanvas.width = side;
	clockCanvas.height = side;
}
const clock = new Clock(clockCanvas);

timeFormGroup.addEventListener('change', (e) => {
	const el = e.target as HTMLInputElement;
	if (el.tagName.toLowerCase() !== 'input' || setAlarm.dataset.set) {
		return;
	}
	const valStr = el.value,
		val = +valStr,
		max = +el.getAttribute('max');

	const now = new Date();

	if (valStr === '') {
		el.value = '';
	} else {
		if (val > max) {
			el.value = '' + max;
		} else if (val < 0) {
			el.value = '';
		}

		else if (val < 10) {
			el.value = '0' + val;
		} else {
			// 防止输入过多0
			el.value = '' + val;
		}
	}

	const current = getInputDate();

	pickZone.value = '';

	clock.offset = current.getTime() - now.getTime();
});

pickZone.addEventListener('change', (e) => {
	const el = e.target as HTMLSelectElement,
		val = +el.value,
		now = new Date(),
		offset = getMilliseconds(0, now.getTimezoneOffset());

	timeFormInput.forEach(input => {
		input.value = '';
	});

	clock.offset = offset + getMilliseconds(val);
});

setAlarm.addEventListener('click', (e) => {
	const el = e.target as HTMLElement;
	if (!el.dataset.set) {
		el.innerHTML = '保存闹钟';
		el.dataset.set = 'true';
	} else {
		el.innerHTML = '设置闹钟';
		el.dataset.set = '';
		clock.setAlarm(getInputDate(), () => {
			toast('闹钟来了！');
			updateAlarmInfo();
		});
		updateAlarmInfo();
	}
	resetClock.click();
});

resetClock.addEventListener('click', () => {
	clock.offset = 0;
});

function updateAlarmInfo() {
	const alarms = clock.alarm;
	let str: string = '';
	if (alarms && alarms.length > 0) {
		alarms.forEach(a => {
			str += `<p>${a.time.toString()}</p>`;
		});
	} else {
		str = '暂无闹钟';
	}

	alarmInfo.innerHTML = str;
}

function getInputDate() {
	const now = new Date();

	const today = new Date(now.getTime() - getMilliseconds(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())).getTime();

	const vals = timeFormInput.map(input => input.value || 0);

	const offset = getMilliseconds(...vals);

	const current = new Date(today + offset);

	return current;
}

function getMilliseconds(...args): number {
	const msList = [60, 60, 1000, 1],
		len = msList.length;
	let ms = 0;
	if (args.length > len) {
		args = args.slice(0, len);
	}
	args.forEach((time, index) => {
		ms += msList.slice(index, len).reduce((x, y) => x * y, parseInt(time));
	});
	return ms;
}

