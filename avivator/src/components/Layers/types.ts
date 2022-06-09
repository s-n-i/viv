import {RGBAColor} from 'deck.gl';

export type textEntry = {
  background: RGBAColor;
  color: RGBAColor;
  field: string;
  font: string;
  hide: boolean;
  opacity: number;
  position: {relative: string; xOffset: number; yOffset: number};
  size: number;
};
