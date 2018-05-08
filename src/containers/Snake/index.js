import { Snake } from '@/libs/snake';
import message from '@/libs/utils/message';

import './index.scss';

export default {
  name: 'Snake',
  render() {
    return (
      <main class="snake">
        <section>
          <div class="snake__container" ref="container">
            <transition name="fade">
              <div class="snake__mode-wrapper" v-show={this.modeVisible}>
                <div class="snake__mode">
                  {this.modes.map(mode => (
                    <button type="button" onClick={() => this.start(mode.name)}>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </transition>
          </div>
        </section>
        <section v-show={this.showInfo} class="snake__info">
          <div class="form-group">
            <span>分数:</span>
            <span>{this.score}</span>
          </div>
          <div class="form-group">
            <span>速度:</span>
            <span>{this.speed}</span>
          </div>
        </section>
      </main>
    );
  },
  props: {
    window: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      modes: [
        {
          name: 'common',
          label: '普通模式'
        },
        {
          name: 'level',
          label: '过关模式'
        },
        {
          name: 'dodge',
          label: '躲避模式'
        }
      ],
      mode: null,
      modeVisible: true,
      score: null,
      speed: null
    };
  },
  computed: {
    showInfo() {
      return ![this.speed, this.score].some(v => !v && v !== 0);
    }
  },
  methods: {
    showModes() {
      this.modeVisible = true;
    },
    message(msg, cb) {
      return message(
        {
          title: '消息提醒',
          message: msg,
          cb
        },
        this.$refs.container
      );
    },
    start(mode) {
      // 避免在动效期间连续点击
      if (!this.modeVisible) {
        return;
      }

      this.modeVisible = false;

      this.mode = mode;

      this.updateMode();
    },
    updateMode(score, speed) {
      this.score = score || 0;

      switch (this.mode) {
        case 'common':
          this.updateCommonMode(score, speed);
          break;
        case 'level':
          this.updateLevelMode(score, speed);
          break;
        case 'dodge':
          this.updateDodgeMode(score, speed);
          break;
        default:
          break;
      }
    },
    updateCommonMode(score, speed) {
      const snake = this.$_snake;

      if (!score) {
        snake.prepareStart();
        this.speed = 1;
      } else {
        const currentSpeed = 1 + Math.floor(score / 3) * 2;

        this.speed = currentSpeed;
      }
    },
    updateLevelMode: (function() {
      const levels = [];
      let levelIndex = 0;

      for (let i = 0; i < 5; i++) {
        levels.push({
          score: (i + 1) * 5,
          speed: 1 + i * 5
        });
      }

      return function(score, speed) {
        const level = levels[levelIndex];

        const snake = this.$_snake;
        const init = () => {
          snake.prepareStart();
          this.speed = levels[0].speed;
        };

        if (!score) {
          init();

          return;
        }

        if (score >= level.score) {
          snake.disable();

          if (levelIndex >= levels.length - 1) {
            this.message('厉害啊大兄弟，通关啦！', () => {
              this.showModes();
              levelIndex = 0;
            });
          } else {
            this.message('下一关啦！', () => {
              const nextLevel = levels[levelIndex + 1];

              snake.prepareStart();

              this.speed = nextLevel.speed;

              levelIndex++;
            });
          }
        }
      };
    })(),
    updateDodgeMode: (function() {
      let levelIndex = 0;

      const levels = [];

      for (let i = 0; i < 5; i++) {
        levels.push({
          score: (i + 1) * 5,
          speed: 1 + i * 5,
          walls: (i + 1) * 10
        });
      }

      return function(score) {
        const snake = this.$_snake;

        const init = () => {
          snake.prepareStart();
          this.speed = levels[0].speed;
          snake.fillWall(levels[0].walls);
          snake.draw();
        };

        if (!score) {
          init();
          return;
        }

        const level = levels[levelIndex];

        if (score >= level.score) {
          snake.disable();

          if (levelIndex >= levels.length - 1) {
            this.message('牛逼啊大兄弟，通关啦！', () => {
              this.showModes();
              levelIndex = 0;
            });
          } else {
            this.message('下一关啦！', () => {
              const nextLevel = levels[levelIndex + 1];

              snake.prepareStart();

              this.speed = nextLevel.speed;

              snake.fillWall(nextLevel.walls);

              snake.draw();

              levelIndex++;
            });
          }
        }
      };
    })(),
    sendEndMessage({ message }) {
      this.message(message, () => {
        this.showModes();
      });
    }
  },
  mounted() {
    const { window } = this;
    const side =
      window.width > 767 ? 600 : Math.min(window.width, window.height);

    this.$_snake = new Snake(this.$refs.container, {
      scoreCallback: this.updateMode,
      endCallback: this.sendEndMessage,
      width: side,
      height: side
    });
  },
  beforeDestroy() {
    this.$_snake.destroy();
  },
  watch: {
    speed(v) {
      const snake = this.$_snake;
      if (snake && snake.speed !== v) {
        snake.speed = v;
      }
    }
  }
};
