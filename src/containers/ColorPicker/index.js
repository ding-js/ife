import { utils, ColorPicker } from '@/libs/colorpicker';
import './index.scss';

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
  render() {
    return (
      <div class="color-picker">
        <section class="picker-wrapper">
          <div id="picker" ref="picker" />
        </section>
        <section>
          <form onSubmit={this.validateForm}>
            <div class="row">
              <div class="form-group">
                <label for="r">R:</label>
                <input
                  type="number"
                  value={this.color.r}
                  max="255"
                  min="0"
                  step="1"
                />
              </div>
              <div class="form-group">
                <label for="g">G:</label>
                <input
                  type="number"
                  value={this.color.g}
                  max="255"
                  min="0"
                  step="1"
                />
              </div>
              <div class="form-group">
                <label for="b">B:</label>
                <input
                  type="number"
                  value={this.color.b}
                  max="255"
                  min="0"
                  step="1"
                />
              </div>
            </div>
            <div class="row">
              <div class="form-group">
                <label for="h">H:</label>
                <input
                  type="number"
                  value={this.color.h}
                  step="0.05"
                  max="1"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="l">L:</label>
                <input
                  type="number"
                  value={this.color.l}
                  step="0.05"
                  max="1"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="s">S:</label>
                <input
                  type="number"
                  value={this.color.s}
                  step="0.05"
                  max="1"
                  min="0"
                />
              </div>
            </div>
          </form>
        </section>
        <section>
          <p>#{this.color.hex.toUpperCase()}</p>
          <div
            class="color-picker__preview"
            style="{backgroundColor:'#'+color.hex}"
          />
        </section>
      </div>
    );
  },
  methods: {
    validateForm(e) {
      e.preventDefault();

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
  mounted() {
    this.$_picker = new ColorPicker(this.$refs.picker, {
      onBlockColorChange: pixel => {
        const rgb = utils.ImageData2Rgb(pixel);
        const hsl = utils.Rgb2Hsl(rgb);
        const hex = utils.Rgb2Hex(rgb);

        const [r, g, b] = rgb;
        const [h, s, l] = hsl;

        this.color = {
          r,
          g,
          b,
          h,
          s,
          l,
          hex
        };
      }
    });
  }
};
