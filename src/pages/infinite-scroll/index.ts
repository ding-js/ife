import './index.scss';
import { InfiniteScroll } from './infinite-scroll';

const container = document.querySelector('#scroll-content') as HTMLElement;

new InfiniteScroll(container);
