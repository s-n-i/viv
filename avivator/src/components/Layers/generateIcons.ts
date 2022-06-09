import {IconLayer} from 'deck.gl';
import {offsetPosition} from './offsetPosition';

export const generateIcons = (data: unknown, cellSize: number, visible: boolean, field: any) => {
  const xOffset = -2 * field.resolutionWidth;
  const yOffset = 2 * field.resolutionWidth;
  return new IconLayer({
    id: 'icon-layer-#detail#',
    data,
    visible,
    sizeScale: field.sizeScale,
    getColor: [255, 255, 255],
    sizeUnits: 'meters',
    getIcon: (d: any) => ({
      url: d.drugUrl,
      mask: true,
      width: field.resolutionWidth,
      height: field.resolutionWidth
    }),
    getPosition: (d: any) => offsetPosition(d.position, cellSize, xOffset, yOffset)
  });
};
