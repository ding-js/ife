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
    const hsl = 'hsl';
    const rgb = 'rgb';
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
                    value={this.color[rgb][i]}
                    max="255"
                    min="0"
                    step="1"
                    onInput={e => this.updateInput(e, i, rgb)}
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
                    value={this.color[hsl][i]}
                    max={v === 'h' ? '360' : '100'}
                    min="0"
                    step={v === 'h' ? '5' : '1'}
                    onInput={e => this.updateInput(e, i, hsl)}
                  />
                </div>
              ))}
            </div>

            <div class="row">
              <div class="form-group">
                <label for="hex">#</label>
                <input type="text" value={this.color.hex.toUpperCase()} onInput={this.updateColorByHEX} maxlength="6" />
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
    updateInput(e, i, key) {
      if (!key) {
        return;
      }
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

      const color = this.color[key].slice();
      color[i] = result;
      this.$_picker.color = {
        [key]: color
      };
    },
    updateColorByHEX(e) {
      const value = e.target.value.toUpperCase();
      e.target.value = value;

      if (value.length !== 6 && value.length !== 3) {
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
