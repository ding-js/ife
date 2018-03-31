import InfiniteScroll from '@/libs/infinite-scroll';
import './index.scss';

const dataset = new Array(100).fill('').map((v, i) => i + 1);

export default {
  name: 'InfiniteScroll',
  render() {
    return (
      <main class="infinite-scroll">
        <ul ref="list" class="infinite-scroll__list" />
      </main>
    );
  },
  mounted() {
    this.$_infiniteScroll = new InfiniteScroll({
      contentElement: this.$refs.list,
      loadingHtml: `
        <p class="infinite-scroll__loading">
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </p>
      `,
      noDataHtml: '<p>Empty</p>',
      render(v) {
        return `<li>${v} list item</li>`;
      },
      getDataset(index) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              dataset: dataset.slice(index, index + 20),
              more: index + 20 < dataset.length
            });
          }, 1000);
        });
      }
    });
  }
};
