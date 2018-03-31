import Clock from '@/libs/clock';
import { toast } from '@/libs/utils';
import timeZones from './timezones.json';

import './index.scss';

const getOriginTime = () => {
  const now = new Date();

  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    offset: -new Date().getTimezoneOffset() / 60
  };
};

const parts = [
  {
    name: 'hours',
    label: '小时',
    max: 23
  },
  {
    name: 'minutes',
    label: '分钟',
    max: 59
  },
  {
    name: 'seconds',
    label: '秒',
    max: 59
  }
];

export default {
  name: 'Clock',
  data() {
    return {
      time: getOriginTime(),
      alarms: []
    };
  },
  render() {
    return (
      <div class="clock">
        <section>
          <canvas ref="canvas" />
        </section>
        <section>
          <form
            class="clock__time-from"
            onSubmit={e => {
              e.preventDefault();
              this.setTime();
            }}
          >
            {parts.map(p => (
              <div class="form-group">
                <label for={p.name}>{p.label}：</label>
                <input
                  type="number"
                  value={this.time[p.name]}
                  onInput={e => {
                    this.updateInput(e, p);
                  }}
                  max={p.max}
                  min="0"
                  step="1"
                />
              </div>
            ))}
            <div class="form-group">
              <label for="offset">时区：</label>
              <select value={this.time.offset}>
                {timeZones.map(t => (
                  <option key={t.name} value={t.offset}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>
        <section>
          <div class="clock__btns">
            <button type="button" onClick={this.setTime}>
              设置时间
            </button>
            <button type="button" onClick={this.addAlarm}>
              设置闹钟
            </button>
            <button type="button" onClick={this.clearAlarms}>
              清除闹钟
            </button>
            <button type="button" onClick={this.resetClock}>
              还原时钟
            </button>
          </div>
        </section>

        <section>
          <div class="clock__alarms">
            {!this.alarms || this.alarms.length < 1 ? (
              <p>暂无闹钟</p>
            ) : (
              this.alarms.map((alarm, index) => (
                <p key={index}>{alarm.toLocaleString()}</p>
              ))
            )}
          </div>
        </section>
      </div>
    );
  },
  methods: {
    updateInput(e, time) {
      const value = Number(e.target.value);
      let result = value;

      if (Number.isNaN(value) || value < 0) {
        result = 0;
      }

      if (result > time.max) {
        result = time.max;
      }

      this.time[time.name] = result;
    },
    setTime() {
      const clock = this.$_clock;
      const now = new Date();
      const settedTime = this.getFormTime();
      const offset =
        settedTime.getTime() -
        now.getTime() +
        (this.time.offset * 60 + now.getTimezoneOffset()) * 60 * 1000;

      if (clock.offset !== offset) {
        clock.offset = offset;
      }
    },
    addAlarm() {
      const clock = this.$_clock;
      const settedTime = this.getFormTime();

      clock.addAlarm(settedTime, this.triggerAlarm, false);

      this.alarms.push(settedTime);
    },
    clearAlarms() {
      const clock = this.$_clock;

      clock.clearAlarms();

      this.alarms = [];
    },
    getFormTime() {
      const now = new Date();
      const [year, month, date] = [
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ];
      const { hours, minutes, seconds } = this.time;
      const settedTime = new Date(year, month, date, hours, minutes, seconds); // 丢弃了毫秒

      return settedTime;
    },
    triggerAlarm() {
      const clock = this.$_clock;

      this.alarms = clock.alarms.map(alarm => alarm.time);

      toast('闹钟响啦...');
    },
    resetClock() {
      const clock = this.$_clock;

      Object.assign(this.time, getOriginTime());

      clock.offset = 0;
    }
  },
  mounted() {
    this.$_clock = new Clock(this.$refs.canvas);
  }
};
