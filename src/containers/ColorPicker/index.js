import ColorPicker from '@/libs/colorpicker';
import * as utils from '@/libs/colorpicker/utils';

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
              {['r', 'g', 'b'].map(v => (
                <div class="form-group">
                  <label for={v}>{v.toUpperCase()}:</label>
                  <input
                    type="number"
                    value={this.color[v]}
                    max="255"
                    min="0"
                    step="1"
                    onInput={e => this.updateInput(e, v)}
                  />
                </div>
              ))}
            </div>
            <div class="row">
              {['h', 's', 'l'].map(v => (
                <div class="form-group">
                  <label for={v}>{v.toUpperCase()}:</label>
                  <input
                    type="number"
                    value={this.color[v]}
                    max="1"
                    min="0"
                    step="0.05"
                    onInput={e => this.updateInput(e, v)}
                  />
                </div>
              ))}
            </div>
          </form>
        </section>
        <section>
          <p>#{this.color.hex.toUpperCase()}</p>
          <div
            class="color-picker__preview"
            style={{ backgroundColor: '#' + this.color.hex }}
          />
        </section>
      </div>
    );
  },
  methods: {
    updateInput(e, name) {
      const target = e.target;
      const value = Number(target.value);
      const max = Number(target.getAttribute('max'));
      const min = Number(target.getAttribute('min'));
      let result = value;

      if (Number.isNaN(value)) {
        result = min;
      }

      if (result > max) {
        result = max;
      }

      if (result < min) {
        result = min;
      }

      this.color[name] = result;
    },
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
