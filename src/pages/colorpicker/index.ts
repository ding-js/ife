import './index.scss';
import ColorBlock from './color-block';
import ColorBar from './color-bar';

const colorBar = new ColorBar(document.querySelector('#color-bar') as HTMLCanvasElement);

const colorBlock = new ColorBlock(document.querySelector('#color-block') as HTMLCanvasElement);
