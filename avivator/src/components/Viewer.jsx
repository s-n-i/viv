/* eslint-disable no-nested-ternary */
import shallow from 'zustand/shallow';
import React, { useState } from 'react';
import debounce from 'lodash/debounce';
import {
  SideBySideViewer,
  PictureInPictureViewer,
  VolumeViewer,
  AdditiveColormapExtension,
  LensExtension
  // eslint-disable-next-line import/no-unresolved
} from '@hms-dbmi/viv';
import {
  useImageSettingsStore,
  useViewerStore,
  useChannelsStore,
  useLoader
} from '../state';
import { useWindowSize } from '../utils';
import { DEFAULT_OVERVIEW } from '../constants';
import {layerData} from './Layers/data'
import {GridCellLayer} from 'deck.gl';
import {generateText} from './Layers/generateText'
import {generateIcons} from './Layers/generateIcons'
import { useEffect } from 'react';

const Viewer = () => {
  console.log('generateText',generateText)
  const [useLinkedView, use3d, viewState] = useViewerStore(
    store => [store.useLinkedView, store.use3d, store.viewState],
    shallow
  );
  const [
    colors,
    contrastLimits,
    channelsVisible,
    selections
  ] = useChannelsStore(
    store => [
      store.colors,
      store.contrastLimits,
      store.channelsVisible,
      store.selections
    ],
    shallow
  );
  const loader = useLoader();
  const viewSize = useWindowSize();
  const [
    lensSelection,
    colormap,
    renderingMode,
    xSlice,
    ySlice,
    zSlice,
    resolution,
    lensEnabled,
    zoomLock,
    panLock,
    isOverviewOn,
    onViewportLoad,
    useFixedAxis
  ] = useImageSettingsStore(
    store => [
      store.lensSelection,
      store.colormap,
      store.renderingMode,
      store.xSlice,
      store.ySlice,
      store.zSlice,
      store.resolution,
      store.lensEnabled,
      store.zoomLock,
      store.panLock,
      store.isOverviewOn,
      store.onViewportLoad,
      store.useFixedAxis
    ],
    shallow
  );

  const [hoverInfo, setHoverInfo]=useState();
  const [heatmapLayer, setHeatmapLayer]=useState();
  const [layers, setLayers] = useState([]);
  const cellSize = 4140;
  const offsetPosition = (
    unparsedPosition,
    cellSize,
    xOffset,
    yOffset
  ) => {
    const position = unparsedPosition.split(',');
    return [parseInt(position[1]) * cellSize + xOffset, (position[0].charCodeAt(0) - 65) * cellSize + yOffset];
  }
  const layerControls = {
          "visible": true,
          "subLayers": [
              {
                  "visible": true
              },
              {
                  "visible": true
              }
          ]
      };
  const generateHeatmap = (data, cellSize, setHoverInfo) => {
    return new GridCellLayer({
      id: 'grid-cell-layer-#detail#',
      data,
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 0, 255, 200],
      extruded: false,
      cellSize,
      getPosition: (d) => offsetPosition(d.position, cellSize, -cellSize, 0),
      getFillColor: (d) => {
        const concentration = parseInt(d.concentration);
        return [concentration > 255 ? 255 : concentration, 0, 0, 100];
      }
    });
  };

  useEffect(()=>{
    setHeatmapLayer(generateHeatmap(layerData.data, cellSize, setHoverInfo))
  },[])

  const zoomTextVisibilities={
    well_location: -7,
    drug_name: -4,
    time_point: -4,
    concentration: -4
  }
  const onViewStateChange = (vws) => {
    console.log(vws,'vws')
    const { viewState }=vws;
    const { zoom }=viewState;
    const z = Math.min(Math.max(Math.round(-zoom), 0), loader.length - 1);
    useViewerStore.setState({ pyramidResolution: z });
    if ((vws.viewState.zoom>-7 && vws.oldViewState.zoom<-7) || (vws.viewState.zoom<-7 && vws.oldViewState.zoom>-7) || (vws.viewState.zoom>-4 && vws.oldViewState.zoom<-4) || (vws.viewState.zoom<-4 && vws.oldViewState.zoom>-4)) {
    setLayers([
      generateIcons(layerData.data, cellSize, layerControls.visible && layerControls.subLayers[1].visible && viewState.zoom>zoomTextVisibilities.drug_name, layerData.images.fields[0]),
      ...layerData.text.fields.map((entry)=>generateText(layerData.data, cellSize, layerControls.visible && layerControls.subLayers[0].visible && viewState.zoom>zoomTextVisibilities[entry.field], entry))
    ]
    );
  }

  };

  const viewstt={target: [52225.77594287684, 33095],
  zoom: -9.080060648139831,
  id:'axc'
  };

  return use3d ? (
    <VolumeViewer
      loader={loader}
      contrastLimits={contrastLimits}
      colors={colors}
      channelsVisible={channelsVisible}
      selections={selections}
      colormap={colormap}
      xSlice={xSlice}
      ySlice={ySlice}
      zSlice={zSlice}
      resolution={resolution}
      renderingMode={renderingMode}
      height={viewSize.height}
      width={viewSize.width}
      onViewportLoad={onViewportLoad}
      useFixedAxis={useFixedAxis}
      viewStates={[viewState]}
      onViewStateChange={debounce(
        ({ viewState: newViewState, viewId }) =>
          useViewerStore.setState({
            viewState: { ...newViewState, id: viewId }
          }),
        250,
        { trailing: true }
      )}
    />
  ) : useLinkedView ? (
    <SideBySideViewer
      loader={loader}
      contrastLimits={contrastLimits}
      colors={colors}
      channelsVisible={channelsVisible}
      selections={selections}
      height={viewSize.height}
      width={viewSize.width}
      zoomLock={zoomLock}
      panLock={panLock}
      hoverHooks={{
        handleValue: v => useViewerStore.setState({ pixelValues: v })
      }}
      lensSelection={lensSelection}
      lensEnabled={lensEnabled}
      onViewportLoad={onViewportLoad}
      extensions={[
        colormap ? new AdditiveColormapExtension() : new LensExtension()
      ]}
      colormap={colormap || 'viridis'}
    />
  ) : (
    <PictureInPictureViewer
    viewStates={[viewstt]}
      loader={loader}
      contrastLimits={contrastLimits}
      colors={colors}
      channelsVisible={channelsVisible}
      selections={selections}
      height={viewSize.height}
      width={viewSize.width}
      overview={DEFAULT_OVERVIEW}
      overviewOn={isOverviewOn}
      hoverHooks={{
        handleValue: v => useViewerStore.setState({ pixelValues: v })
      }}
      lensSelection={lensSelection}
      lensEnabled={lensEnabled}
      onViewportLoad={onViewportLoad}
      extensions={[
        colormap ? new AdditiveColormapExtension() : new LensExtension()
      ]}
      colormap={colormap || 'viridis'}
      onViewStateChange={onViewStateChange}
      deckProps={{
        layers:[heatmapLayer, ...layers],
        getTooltip: ({object}) => object && {
          html: `<img crossOrigin="anonymous"
          referrerPolicy="origin"
          src="${object.drugUrl}">`,
          style: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            fontSize: '0.8em'
          }
        }
      }}
    />
  );
};
export default Viewer;
