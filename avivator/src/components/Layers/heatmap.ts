import {GridCellLayer, PickInfo} from 'deck.gl';
import {offsetPosition} from './offsetPosition';

const generateHeatmap = (data: unknown, cellSize: number, setHoverInfo: (info: PickInfo<unknown>) => void) => {
  return new GridCellLayer({
    id: 'grid-cell-layer',
    data,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 80],
    extruded: false,
    cellSize,
    getPosition: (d: any) => offsetPosition(d.position, cellSize, -cellSize, 0),
    getFillColor: (d: any) => {
      const concentration = parseInt(d.concentration);
      return [concentration > 255 ? 255 : concentration, 0, 0, 100];
    }
  });
};

export default generateHeatmap;
