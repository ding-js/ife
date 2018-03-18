import './index.scss';
import { Snake } from '@/libs/snake';
import message from '@/libs/utils/message';

export default {
  name: 'Snake',
  render() {
    return (
      <main class="snake">
        <section>
          <div class="snake__container" ref="container">
            <transition name="fade-out">
              <div class="snake__mode-wrapper" v-show={this.modeVisible}>
                <div class="snake__mode">
                  {this.modes.map((mode) => (
                    <button type="button" onClick={() => this.start(mode.name)}>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </transition>
          </div>
        </section>
        <section v-show={this.showInfo}>
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
      return ![this.speed, this.score].some((v) => !v && v !== 0);
    }
  },
  methods: {
    message(msg, cb) {
      return message(
        {
          title: 'Hello',
          message: msg,
          cb
        },
        this.$refs.container
      );
    },
    start(mode) {
      this.modeVisible = false;

      this.mode = mode;

      this.initMode(0, 5);
    },
    initMode(score, speed) {
      this.score = score;
      this.speed = speed;

      switch (this.mode) {
        case 'common':
          this.initCommonMode(score, speed);
          break;
        case 'level':
          this.initLevelMode(score, speed);
          break;
        case 'dodge':
          this.initDodgeMode(score, speed);
          break;
        default:
          return;
      }
    },
    initCommonMode(score, speed) {
      const currentSpeed = 1 + Math.floor(score / 10) * 10;
      const snake = this.$_snake;

      if (!score) {
        snake.prepareStart();
        this.speed = speed;
      }

      if (speed !== currentSpeed) {
        this.speed = currentSpeed;
      }
    },
    initLevelMode: (() => {
      const snake = this.$_snake;

      const levels = [];

      let levelIndex = 0;

      for (let i = 1; i <= 10; i++) {
        levels.push({
          scroe: i * 8,
          speed: 1 + i * 5
        });
      }

      const init = () => {
        snake.prepareStart();
        snake.speed = levels[0].speed;
      };

      return (score, speed) => {
        const level = levels[levelIndex];

        if (score === 0) {
          init();
          return;
        }

        if (score >= level.scroe) {
          snake.disable();

          // snake.prepareStart();

          // if (levelIndex >= levels.length - 1) {
          //   info('没有关卡啦!', () => {
          //     init();
          //     enable();
          //   });
          //   levelIndex = 0;
          // } else {
          //   info('下一关啦', () => {
          //     this.speed = level.speed;
          //     snake.draw();
          //     enable();
          //     updateInfo(0);
          //   });
          //   levelIndex++;
          // }
        }
      };
    })(),
    initDodgeMode() {}
  },
  mounted() {
    this.$_snake = new Snake(this.$refs.container, {
      scoreCallback: this.initMode
    });

    this.message('test');
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
