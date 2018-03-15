<template>
  <div>
    <section class="picker-wrapper">
      <div id="picker"
           ref="picker"></div>
    </section>
    <section>
      <form @submit.prevent="validateForm">
        <div class="form-row">
          <div class="form-group">
            <label for="r">R:</label>
            <input type="number"
                   v-model.number="color.r"
                   max="255"
                   min="0"
                   step="1">
          </div>
          <div class="form-group">
            <label for="g">G:</label>
            <input type="number"
                   v-model.number="color.g"
                   max="255"
                   min="0"
                   step="1">
          </div>
          <div class="form-group">
            <label for="b">B:</label>
            <input type="number"
                   v-model.number="color.b"
                   max="255"
                   min="0"
                   step="1">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="h">H:</label>
            <input type="number"
                   v-model.number="color.h"
                   step="0.05"
                   max="1"
                   min="0">
          </div>
          <div class="form-group">
            <label for="l">L:</label>
            <input type="number"
                   v-model.number="color.l"
                   step="0.05"
                   max="1"
                   min="0">
          </div>
          <div class="form-group">
            <label for="s">S:</label>
            <input type="number"
                   v-model.number="color.s"
                   step="0.05"
                   max="1"
                   min="0">
          </div>
        </div>
        <!-- <div class="form-row">
          <div class="form-group">
            <label for="hex">HEX:</label>
            <input type="text" v-model="color.hex">
          </div>
        </div> -->
      </form>
    </section>
    <section>
      <p>#{{color.hex.toUpperCase()}}</p>
      <div class="color-preview"
           :style="{backgroundColor:'#'+color.hex}"></div>
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
      hex: ''
    }
  }),
  methods: {
    validateForm() {
      const color = this.color;
      let error = false;

      ['r', 'g', 'b', 'h', 'l', 's'].forEach(key => {
        if (color[key] < 0) {
          color[key] = 0;
          error = true;
        }
      });

      ['r', 'g', 'b'].forEach(key => {
        if (color[key] > 255) {
          color[key] = 255;
          error = true;
        }
      });

      ['h', 's', '1'].forEach(key => {
        if (color[key] > 1) {
          color[key] = 1;
          error = true;
        }
      });

      return error;
    }
  },
  watch: {
    color: {
      handler(color, prevColor) {
        if (!this.$_picker || this.validateForm()) {
          return;
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$_picker = new ColorPicker(this.$refs.picker, {
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


<style scoped>
section {
  text-align: center;
}

section + section {
  margin-top: 20px;
}

.form-row {
  margin-top: 20px;
}

.form-group {
  display: inline-block;
}
.color-preview {
  width: 130px;
  height: 36px;
  display: inline-block;
  transition: background-color 0.1s linear;
}
label {
  display: inline-block;
  width: 36px;
}
input[type='number'] {
  width: 58px;
}
input[type='text'] {
  width: 94px;
}
</style>
