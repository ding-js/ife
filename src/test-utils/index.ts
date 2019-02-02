import { Buffer } from 'buffer';

export function canvasToBuffer(canvas) {
  const dataUrlReg = /^.+?,/;
  return Buffer.from(canvas.toDataURL().replace(dataUrlReg, ''), 'base64');
}
