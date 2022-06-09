
import {TextLayer} from 'deck.gl';
import {offsetPosition} from './offsetPosition';
import {textEntry} from './types';

export const generateText = (data: unknown, cellSize: number, visible: boolean, entry: textEntry) => {
  console.log(entry, 'entry');
  const xOffsets = {
    start: -cellSize,
    middle: cellSize / 2 - cellSize,
    end: 0
  };
  const yOffsets = {
    top: 0,
    center: cellSize / 2,
    bottom: cellSize
  };
  const relativePosition = entry.position.relative.split(' ') as any;
  return new TextLayer({
    id: 'text-layer-#detail#-' + entry.field,
    data,
    visible,
    getColor: entry.color,
    getPosition: (d: any) =>
      offsetPosition(d.position, cellSize, xOffsets[relativePosition[0]], yOffsets[relativePosition[1]]),
    getText: (d: any) => d[entry.field],
    getSize: entry.size,
    getTextAnchor: relativePosition[0],
    getAlignmentBaseline: relativePosition[1],
    backgroundColor: entry.background,
    opacity: entry.opacity
  });
};
