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

export default {
  name: 'Clock',
  data: () => ({
    time: getOriginTime(),
    alarms: []
  }),
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
            <div class="form-group">
              <label for="hours">小时：</label>
              <input
                type="number"
                value={this.time.hours}
                max="23"
                min="0"
                step="1"
              />
            </div>
            <div class="form-group">
              <label for="minutes">分钟：</label>
              <input
                type="number"
                value={this.time.minutes}
                max="59"
                min="0"
                step="1"
              />
            </div>
            <div class="form-group">
              <label for="seconds">秒：</label>
              <input
                type="number"
                value={this.time.seconds}
                max="59"
                min="0"
                step="1"
              />
            </div>
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
  watch: {
    time: {
      deep: true,
      handler(time) {
        const next = Object.assign({}, time);
        const { hours, minutes, seconds } = time;

        if (hours > 23) {
          next.hours = 23;
        }

        if (hours < 0) {
          next.hours = 0;
        }

        if (minutes > 59) {
          next.minutes = 59;
        }

        if (minutes < 0) {
          next.minutes = 0;
        }

        if (seconds > 59) {
          next.seconds = 59;
        }

        if (seconds < 0) {
          next.seconds = 0;
        }

        const props = ['hours', 'minutes', 'seconds'];

        for (const prop of props) {
          if (next[prop] !== time[prop]) {
            Object.assign(this.time, next);
            break;
          }
        }
      }
    }
  },
  methods: {
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

      clock.addAlarm(settedTime, this.triggerAlarm);

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
