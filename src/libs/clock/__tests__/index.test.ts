import Clock from '../';

describe('Clock lifecycle', () => {
  const container = document.body;

  const clock = new Clock(container, {
    width: 400,
    height: 200
  });

  const canvas = document.querySelector('canvas');

  it('create', () => {
    expect(canvas).toBeDefined();

    expect(canvas.parentNode).toBe(container);

    expect(canvas.getAttribute('width')).toBe('400');

    expect(canvas.getAttribute('height')).toBe('200');
  });

  it('destory', () => {
    clock.destroy();

    expect(canvas.parentNode).not.toBe(container);
  });
});

describe('Clock public methods', () => {
  const container = document.body;

  const clock = new Clock(container);

  it('add alarm', done => {
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
    clock.addAlarm(new Date(), () => null);

    clock.clearAlarms();

    expect(clock.alarms.length).toBe(0);
  });
});
