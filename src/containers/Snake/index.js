import './index.scss';
import { Snake } from '@/libs/snake';

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
        <section>
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
      modeVisible: true,
      score: '',
      speed: ''
    };
  },
  methods: {
    start(mode) {
      this.modeVisible = false;

      this.$_snake.prepareStart();
    }
  },
  mounted() {
    this.$_snake = new Snake(this.$refs.container);
  }
};
