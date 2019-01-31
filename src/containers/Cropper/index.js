import Cropper from '@/libs/cropper';
import { toast } from '@/libs/utils';
import * as defaultImage from './assets/default.jpg';

import './index.scss';

const downloader = document.createElement('a');

let downloadCount = 0;

export default {
  name: 'Cropper',
  props: {
    window: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      cropperOptions: {
        width: 200,
        height: 200,
        x: 0,
        y: 0
      },
      pickText: '点击选择要裁剪的图片',
      preview: [0.6, 0.9, 1.2]
    };
  },
  render(h) {
    return (
      <div class="cropper">
        <section>
          <form>
            <div class="form-group">
              <input
                placeholder="宽"
                type="number"
                min="0"
                max={this.containerSize.width}
                name="width"
                value={this.cropperOptions.width}
                onInput={e => {
                  this.updateSize(e, 'width');
                }}
              />
              <input
                placeholder="高"
                type="number"
                min="0"
                max={this.containerSize.height}
                name="height"
                value={this.cropperOptions.height}
                onInput={e => {
                  this.updateSize(e, 'height');
                }}
              />
            </div>
            <div class="form-group">
              <button type="button" onClick={this.setCropper}>
                修改大小
              </button>
              <button type="button" onClick={this.doCrop}>
                裁剪
              </button>
            </div>
            <div class="form-group">
              <label for="file" class="cropper__pick" id="pick-file">
                {this.pickText}
              </label>
              <input
                type="file"
                id="file"
                accept="image/jpeg,image/x-icon,image/png"
                onChange={this.uploadImg}
              />
            </div>
          </form>
        </section>
        <section>
          <div ref="container" class="cropper__container" />
        </section>
        <section>
          {this.preview.map(v => (
            <div class="cropper__preview" ref={`preview-${v}`} />
          ))}
        </section>
      </div>
    );
  },

  computed: {
    containerSize() {
      const { width, height } = this.window;

      if (width > 767) {
        return {
          width: 700,
          height: 450
        };
      }

      const min = Math.min(width, height);

      return {
        width: min,
        height: min
      };
    }
  },

  methods: {
    updateSize(e, key) {
      const { cropperOptions, containerSize } = this;
      const val = Number(e.target.value);
      let result = val;

      if (Number.isNaN(val) || val <= 0) {
        result = 1;
      }

      if (val > containerSize[key]) {
        result = containerSize[key];
      }

      cropperOptions[key] = result;
    },
    uploadImg(e) {
      const el = e.target;

      if (!el.value || el.files.length < 1) {
        return;
      }

      const file = el.files[0];

      // 判断文件类型
      if (file.type.match(/^image\/.+/)) {
        this.$_cropper.image = file;
        this.pickText = file.name;
      } else {
        toast('请选择正确的图片');
      }
    },
    setCropper() {
      if (!this.$_cropper) {
        return;
      }

      const { width, height } = this.cropperOptions;

      const invalid = [width, height].some(v => {
        return [v => !!v, v => v > 0].some(f => !f(v));
      });

      if (invalid) {
        toast('请输入正确的宽高!');
        return;
      }
      this.$_cropper.cropper = { width, height };
    },
    async doCrop() {
      try {
        const url = await this.$_cropper.crop();
        downloader.href = url;

        downloader.download = `dingjs-cropper-${++downloadCount}.png`;
        downloader.click();
      } catch (e) {
        toast(
          '不支持HTML5,建议使用<a href="https://www.google.com/chrome/">「Chrome浏览器」浏览本页面!</a>'
        );
      }
    },
    init() {
      const { width, height } = this.containerSize;

      this.$_cropper = new Cropper(this.$refs.container, {
        preview: this.preview.map((v, i) => ({
          zoom: v,
          container: this.$refs[`preview-${v}`]
        })),
        width,
        height,
        onCropperChange: cropper => {
          Object.assign(this.cropperOptions, cropper);
        }
      });

      this.setDefault();
    },
    setDefault() {
      const image = new Image();

      image.src = defaultImage;

      image.onload = () => {
        this.$_cropper.image = image;
      };
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.$_cropper.destroy();
  }
};
