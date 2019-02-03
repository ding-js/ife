import { canvasToBuffer } from '@/test-utils';
import Clock from '../';

const RealDate = Date;
const date = new Date('2019-01-01 14:07:23');

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
