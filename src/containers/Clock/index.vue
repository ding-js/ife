<template>
  <div>
    <section class="clock-wrapper">
      <canvas ref="canvas"></canvas>
    </section>
    <section>
      <form class="time-wrapper" @submit.prevent="setTime">
        <div class="form-group">
          <label for="hours">小时：</label>
          <input type="number" v-model.number.trim="time.hours" max="23" min="0" step="1">
        </div>
        <div class="form-group">
          <label for="minutes">分钟：</label>
          <input type="number" v-model.number.trim="time.minutes" max="59" min="0" step="1">
        </div>
        <div class="form-group">
          <label for="seconds">秒：</label>
          <input type="number" v-model.number.trim="time.seconds" max="59" min="0" step="1">
        </div>
        <div class="form-group">
          <label for="offset">时区：</label>
          <select v-model.number="time.offset">
            <option v-for="timeZone in $_timeZones" :key="timeZone.name" :value="timeZone.offset">{{timeZone.name}}</option>
          </select>
        </div>
      </form>
    </section>
    <section>
      <div class="btn-wrapper">
        <button type="button" @click="setTime">设置时间</button>
        <button type="button" @click="addAlarm">设置闹钟</button>
        <button type="button" @click="clearAlarms">清除闹钟</button>
      </div>
    </section>

    <section>
      <div class="alarms-wrapper">
        <p v-for="alarm in alarms" :key="alarm.getTime()">{{alarm.toLocaleString()}}</p>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Clock from '@/libs/clock';
import { toast } from '@/libs/utils';
import timeZones from './timezones.json';

const initTime = new Date(); // 用于设置初始值

export default {
  name: 'Clock',
  data: () => ({
    time: {
      hours: initTime.getHours(),
      minutes: initTime.getMinutes(),
      seconds: initTime.getSeconds(),
      offset: -new Date().getTimezoneOffset() / 60
    },
    alarms: []
  }),
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
      if (!clock) {
        return;
      }
      const now = new Date();
      const settedTime = this.getFormTime();
      const offset = settedTime.getTime() - now.getTime() + (this.time.offset * 60 + now.getTimezoneOffset()) * 60 * 1000;

      if (clock.offset !== offset) {
        clock.offset = offset;
      }
    },
    addAlarm() {
      const clock = this.$_clock;
      if (!clock) {
        return;
      }
      const settedTime = this.getFormTime();

      clock.addAlarm(settedTime, this.triggerAlarm);

      this.alarms.push(settedTime);
    },
    clearAlarms() {
      const clock = this.$_clock;
      if (!clock) {
        return;
      }

      clock.clearAlarms();

      this.alarms = [];
    },
    getFormTime() {
      const now = new Date();
      const [year, month, date] = [now.getFullYear(), now.getMonth(), now.getDate()];
      const { hours, minutes, seconds } = this.time;
      const settedTime = new Date(year, month, date, hours, minutes, seconds); // 丢弃了毫秒

      return settedTime;
    },
    triggerAlarm() {
      const clock = this.$_clock;
      if (!clock) {
        return;
      }

      this.alarms = clock.alarms.map(alarm => alarm.time);

      toast('闹钟响啦...');
    }
  },
  mounted() {
    this.$_clock = new Clock(this.$refs.canvas);
  },
  created() {
    this.$_timeZones = timeZones;
  }
};
</script>


<style scoped lang="scss">

section {
  text-align: center;
  &+section {
    margin-top: 20px;
  }
}
.time-wrapper {
  font-size: 14px;
  color: #777;
  .form-group {
    display: inline-block;
    padding: 0 8px;
    height: 30px;
    line-height: 30px;
  }
  label {
    display: inline-block;
  }
  input,
  select {
    display: inline-block;
    border: none;
    border-bottom: 2px solid #eee;
    outline: none;
    padding: 4px;
    color: inherit;
    transition: border-bottom-color 0.3s;
    text-align: center;
    &:focus{
      border-bottom-color: #aaa;
    }
  }
  input {
    width: 58px;
  }
}

.alarms-wrapper{
  color: #777;
}
</style>
