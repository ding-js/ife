import { canvasToBuffer } from '@/test-utils';
import Clock from '../';

const RealDate = Date;
const date = new Date('Tue Jan 01 2019 14:07:23 GMT+0800');

class FakeDate extends RealDate {
  constructor() {
    super(date);
  }
}

FakeDate.now = jest.fn(() => date.getTime());

describe('Clock lifecycle', () => {
  it('create & destroy', () => {
    (window as any).Date = FakeDate;
    const container = document.createElement('div');
    const clock = new Clock(container);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
    // 这里 hack 了 Date 导致计算 offset 时返回的日期也是 date
    // 所以图片呈现的是 UTC 时间 -8 2019-01-01 06:07:23
    expect(canvasToBuffer(canvas)).toMatchImageSnapshot();
    clock.destroy();
    expect(container.querySelector('canvas')).toBeNull();
    (window as any).Date = RealDate;
  });
});

describe('Clock public methods', () => {
  it('add alarm', done => {
    const container = document.createElement('div');
    const clock = new Clock(container);
    const alarm = {
      time: new Date(Date.now() + 1000), // +1s
      cb: () => {
        const now = Date.now();

        expect(Math.abs(now - alarm.time.getTime()) < 500);
        expect(clock.alarms.length).toBe(0);

        done();
      },
      repeat: false
    };

    clock.addAlarm(alarm.time, alarm.cb, alarm.repeat);

    expect(clock.alarms.length).toBe(1);
    expect(clock.alarms[0]).toEqual(alarm);
  });

  it('clear alarms', () => {
    const container = document.createElement('div');
    const clock = new Clock(container);

    clock.addAlarm(new Date(), () => null);
    clock.clearAlarms();
    expect(clock.alarms.length).toBe(0);
  });
});
