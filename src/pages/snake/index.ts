import './index.scss';
import { Snake } from './snake';

const wrapper = document.querySelector('#snake-wrapper') as HTMLElement;

new Snake(wrapper, {
	width: 600,
	height: 600
});
