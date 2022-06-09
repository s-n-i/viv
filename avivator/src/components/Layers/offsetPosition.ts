import {Position2D} from 'deck.gl';

export const offsetPosition = (
  unparsedPosition: string,
  cellSize: number,
  xOffset: number,
  yOffset: number
): Position2D => {
  const position = unparsedPosition.split(',');
  return [parseInt(position[1]) * cellSize + xOffset, (position[0].charCodeAt(0) - 65) * cellSize + yOffset];
};
