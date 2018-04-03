import ColorPicker from '@/libs/colorpicker';
// import * as utils from '@/libs/colorpicker/utils';

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
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
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

      const color = Object.assign({}, this.color);

      color[name] = result;
      // this.color = color;

      switch (name) {
        case 'r':
        case 'g':
        case 'b':
          this.updateColorByRGB(color);
          break;
        case 'h':
        case 's':
        case 'l':
          this.updateColorByHSL(color);
          break;
        default:
          break;
      }
    },
    updateColorByRGB(color) {
      const { r, g, b } = color;

      console.log(r, g, b);

      if ([r, g, b].some(v => !v)) {
        return;
      }

      this.$_picker.block.color = `rgb(${r},${g},${b})`;
    },
    updateColorByHSL(color) {}
  },
  mounted() {
    this.$_picker = new ColorPicker(this.$refs.picker, {
      onColorChange: color => {
        Object.assign(this.color, color);
      }
    });
  }
};
