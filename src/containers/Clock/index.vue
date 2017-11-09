<template>
  <div>
    <section class="clock-wrapper">
      <canvas ref="canvas"></canvas>
    </section>
    <section></section>
  </div>
</template>

<script lang="ts">
import Clock from '@/libs/clock';

let _clock: Clock;

export default {
  name: 'Clock',
  mounted() {
    _clock = new Clock(this.$refs.canvas);
  }
};
</script>


<style scoped lang="scss">
.clock-wrapper {
  text-align: center;
}
</style>
