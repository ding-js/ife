import { toast } from '../utils';
import './index.scss';
import Clock from './clock';
const timeFormGroup = document.querySelector('#time'),
  timeFormInput: HTMLInputElement[] = Array.prototype.slice.call(timeFormGroup.querySelectorAll('input')),
  clockCanvas = document.querySelector('#clock') as HTMLCanvasElement,
  pickZone = document.querySelector('#pick-zone') as HTMLSelectElement,
  alarmInfo = document.querySelector('#alarm-info') as HTMLElement,
  setAlarmBtn = document.querySelector('#set-alarm') as HTMLElement,
  resetClockBtn = document.querySelector('#reset-clock') as HTMLElement,
  setTimeBtn = document.querySelector('#set-time') as HTMLElement;

if (window.innerWidth < 768) {
  const side = Math.min(window.innerWidth, window.innerHeight) - 10;
  clockCanvas.width = side;
  clockCanvas.height = side;
}
const clock = new Clock(clockCanvas);

// 修改Input值
timeFormGroup.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.tagName.toLowerCase() !== 'input') {
    return;
  }
  const valStr = el.value,
    val = +valStr,
    max = +el.getAttribute('max');

  if (valStr === '') {
    el.value = '';
  } else {
    if (val > max) {
      el.value = '' + max;
    } else if (val < 0) {
      el.value = '';
    } else if (val < 10) {
      el.value = '0' + val;
    } else {
      // 防止输入过多0
      el.value = '' + val;
    }
  }
});

// 设置时间
setTimeBtn.addEventListener('click', (e) => {
  const now = new Date();
  const current = getInputDate();

  pickZone.value = '';

  clock.offset = current.getTime() - now.getTime();
});

// 设置时区
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

// 设置闹钟
setAlarmBtn.addEventListener('click', (e) => {
  clock.setAlarm(getInputDate(), (index) => {
    toast(`闹钟响啦!`);
    updateAlarmInfo();
  });

  updateAlarmInfo();
  pickZone.value = '';
});

// 重置时钟与闹钟
resetClockBtn.addEventListener('click', () => {
  clock.offset = 0;
  clock.clearAlarm();
  updateAlarmInfo();
});

// 跟新闹钟信息
function updateAlarmInfo() {
  const alarms = clock.alarm;
  let str: string = '';
  if (alarms && alarms.length > 0) {
    alarms.forEach((a, index) => {
      str += `<p>闹钟${index + 1} : ${a.time.toLocaleTimeString()}</p>`;
    });
  } else {
    str = '暂无闹钟';
  }

  alarmInfo.innerHTML = str;
}

// 获取输去的时间
function getInputDate(): Date {
  const now = new Date();

  const today = new Date(now.getTime() - getMilliseconds(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())).getTime();

  const vals = timeFormInput.map(input => input.value || 0);

  const offset = getMilliseconds(...vals);

  const current = new Date(today + offset);

  return current;
}

// 计算毫秒数
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
