<template>
  <div>
    <section class="picker-wrapper">
      <div id="picker" ref="picker"></div>
    </section>
    <section>
      <form @submit.prevent="setColorByRGB">
        <div class="form-group">
          <label for="r">R:</label>
          <input type="number" v-model="color.r">
        </div>
        <div class="form-group">
          <label for="g">G:</label>
          <input type="number" v-model="color.g">
        </div>
        <div class="form-group">
          <label for="b">B:</label>
          <input type="number" v-model="color.b">
        </div>
      </form>
    </section>
    <section>
      <form @submit.prevent="setColorByHLS">
        <div class="form-group">
          <label for="h">H:</label>
          <input type="number" v-model="color.h">
        </div>
        <div class="form-group">
          <label for="l">L:</label>
          <input type="number" v-model="color.l">
        </div>
        <div class="form-group">
          <label for="s">S:</label>
          <input type="number" v-model="color.s">
        </div>
      </form>
    </section>
    <section>
      <form @submit.prevent="setColorByHEX">
        <div class="form-group">
          <label for="hex">HEX:</label>
          <input type="text" v-model="color.hex">
        </div>
      </form>
    </section>
    <section class="preview-wrapper">
      <div class="color-preview"></div>
      <div class="preview-info"></div>
    </section>
  </div>
</template>

<script>
import { utils, ColorPicker } from '@/libs/colorpicker';
export default {
  name: 'ColorPicker',
  data: () => ({
    color: {
      r: null,
      g: null,
      b: null,
      h: null,
      s: null,
      l: null,
      hex: null
    }
  }),
  methods: {
    setColorByRGB() {

    },
    setColorByHLS() {

    },
    setColorByHEX() {

    }
  },
  mounted() {
    this.$_picker = new ColorPicker(this.$refs.picker, {
      onBarColorChange: (pixel) => {
        console.log(pixel);
      },
      onBlockColorChange: (pixel) => {
        const rgb = utils.ImageData2Rgb(pixel),
          hsl = utils.Rgb2Hsl(rgb),
          hex = utils.Rgb2Hex(rgb);

        const [r, g, b] = rgb,
          [h, s, l] = hsl;

        this.color = {
          r, g, b, h, s, l, hex
        };
      }
    });
  }
};
</script>


<style>
section {
  text-align: center;
}

.form-group {
  display: inline-block;
}
label {
  display: inline-block;
  width: 36px;
}
input[type="number"] {
  width: 58px;
}
</style>
