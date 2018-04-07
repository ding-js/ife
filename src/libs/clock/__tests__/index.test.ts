import Clock from '../';

beforeAll(() => {
  document.body.innerHTML = '<div id="t1" /><div id="t2" /><div id="t3" />';
});

describe('Clock lifecycle', () => {
  it('create & destory', () => {
    const container = document.querySelector('#t1') as HTMLElement;

    const clock = new Clock(container);

    const canvas = document.querySelector('canvas');

    expect(canvas.parentNode).toBe(container);

    clock.destroy();

    expect(canvas.parentNode).toBeNull();
  });
});

describe('Clock public methods', () => {
  it('add alarm', done => {
    const container = document.querySelector('#t2') as HTMLElement;

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
    const container = document.querySelector('#t3') as HTMLElement;

    const clock = new Clock(container);

    clock.addAlarm(new Date(), () => null);

    clock.clearAlarms();

    expect(clock.alarms.length).toBe(0);
  });
});
