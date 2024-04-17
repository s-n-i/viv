import type { ZarrArray } from 'zarr';

import { fromString } from '../omexml';
import {
  guessBioformatsLabels,
  loadMultiscales,
  guessTileSize
} from './lib/utils';
import ZarrPixelSource from './pixel-source';

export async function load(
  root: ZarrArray['store'],
  xmlSource: string | File | Response
) {
  // If 'File' or 'Response', read as text.
  if (typeof xmlSource !== 'string') {
    xmlSource = await xmlSource.text();
  }

  // Get metadata and multiscale data for _first_ image.
  const imgMeta = fromString(xmlSource)[0];
  const { data } = await loadMultiscales(root, '0');

  const labels = guessBioformatsLabels(data[0], imgMeta);
  const tileSize = guessTileSize(data[0]);
  let random=Math.random();
  setInterval(()=>random=Math.random(),1000)
  const pyramid = data.map(arr => new ZarrPixelSource(arr, labels, tileSize)).map(entry=>{
    
    Object.defineProperty(entry._data.store, 'url', {
      get: function() { return Math.random()>0.5 ? "https://files.scb-ncats.io/pyramids/Idr0043/precompute/79289/tissue164989_x00_y03_p08_c(0-2)/data.zarr" : "https://files.scb-ncats.io/pyramids/Idr0043/precompute/79289/tissue164989_x00_y07_p03_c(0-2)/data.zarr"}
    });
    Object.defineProperty(entry._data._chunkStore, 'url', {
      get: function() { return Math.random()>0.5 ? "https://files.scb-ncats.io/pyramids/Idr0043/precompute/79289/tissue164989_x00_y03_p08_c(0-2)/data.zarr" : "https://files.scb-ncats.io/pyramids/Idr0043/precompute/79289/tissue164989_x00_y07_p03_c(0-2)/data.zarr"}
    });
    return entry
  });
  return {
    data: pyramid,
    metadata: imgMeta
  };
}
