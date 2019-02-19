import ColorPicker from '@/libs/color-picker';

import './index.scss';

export default {
  name: 'ColorPicker',
  data: () => ({
    color: {
      rgb: [],
      hsl: [],
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
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <div class="row">
              {['r', 'g', 'b'].map((v, i) => (
                <div class="form-group">
                  <label for={v}>{v.toUpperCase()}:</label>
                  <input
                    type="number"
                    value={this.color.rgb[i]}
                    max="255"
                    min="0"
                    step="1"
                    onInput={e => this.updateInput(e, v, i)}
                  />
                </div>
              ))}
            </div>
            <div class="row">
              {['h', 's', 'l'].map((v, i) => (
                <div class="form-group">
                  <label for={v}>{v.toUpperCase()}:</label>
                  <input
                    type="number"
                    value={this.color.hsl[i]}
                    max="100"
                    min="0"
                    step="5"
                    onInput={e => this.updateInput(e, v, i)}
                  />
                </div>
              ))}
            </div>

            <div class="row">
              <div class="form-group">
                <label for="hex">#</label>
                <input value={this.color.hex.toUpperCase()} type="text" onInput={this.updateColorByHEX} />
              </div>
            </div>
          </form>
        </section>
        <section>
          <div class="color-picker__preview" style={{ backgroundColor: '#' + this.color.hex }} />
        </section>
      </div>
    );
  },
  methods: {
    updateInput(e, name, i) {
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

      const color = Object.assign({}, this.color);

      switch (name) {
        case 'r':
        case 'g':
        case 'b':
          color.rgb[i] = result;
          this.updateColorByRGB(color.rgb);
          break;
        case 'h':
        case 's':
        case 'l':
          color.hsl[i] = result;
          this.updateColorByHSL(color.hsl);
          break;
        default:
          break;
      }
    },
    updateColorByRGB(color) {
      if (color.some(v => typeof v !== 'number')) {
        return;
      }

      this.$_picker.color = {
        rgb: color
      };
    },
    updateColorByHSL(color) {
      if (color.some(v => typeof v !== 'number')) {
        return;
      }

      this.$_picker.color = {
        hsl: color
      };
    },
    updateColorByHEX(e) {
      const value = e.target.value;

      if (value.length !== 6) {
        return;
      }

      for (const v of value) {
        const n = parseInt(v, 16);
        if (Number.isNaN(n) || n > 15) {
          return;
        }
      }

      this.$_picker.color = {
        hex: value
      };
    }
  },
  mounted() {
    this.$_picker = new ColorPicker(this.$refs.picker, {
      onColorChange: color => {
        Object.assign(this.color, color);
      }
    });
  },
  beforeDestroy() {
    if (this.$_picker) {
      this.$_picker.destroy();
    }
  }
};
