export type Color = [number, number, number];
export type HSVColor = Color;
export interface ChangedColor {
  hsv: Color;
  rgb: Color;
  hsl: Color;
  hex: string;
}
