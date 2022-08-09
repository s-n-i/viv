import React, { PureComponent } from 'react'; // eslint-disable-line import/no-unresolved
import DeckGL from '@deck.gl/react';
import {GridCellLayer} from 'deck.gl';
// No need to use the ES6 or React variants.
import equal from 'fast-deep-equal';
import { getVivId } from '../views/utils';
import { Matrix4 } from 'math.gl';
import { createLoader } from '../avivator/src/utils';
const areViewStatesEqual = (viewState, otherViewState) => {
  return (
    otherViewState === viewState ||
    (viewState?.zoom === otherViewState?.zoom &&
      viewState?.rotationX === otherViewState?.rotationX &&
      viewState?.rotationOrbit === otherViewState?.rotationOrbit &&
      equal(viewState?.target, otherViewState?.target))
  );
};

/**
 * @typedef viewStateChangeProps
 * @type {object}
 * @property {string} args.viewId
 * @property {object} args.viewState
 * @property {object} args.oldViewState
 * @ignore
 */

/**
 * @callback ViewStateChange
 * @param {viewStateChangeProps} args
 * @ignore
 */

/**
 * @callback Hover
 * @param {Object} info
 * @param {Object} event
 * @ignore
 */

/**
 * @callback HandleValue
 * @param {Array.<number>} valueArray pixel values for the image under the hover location
 * @ignore
 */

/**
 * @callback HandleCoordinate
 * @param {Object} coordnate The coordinate in the image from which the values are picked.
 * @ignore
 */

/**
 * @typedef HoverHooks
 * @type {object}
 * @property {HandleValue} handleValue
 * @property {HandleCoordinate} handleCoordinate
 * @ignore
 */
class VivViewerWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      viewStates: {}
    };
    const { viewStates } = this.state;
    const { views, viewStates: initialViewStates } = this.props;
    views.forEach(view => {
      viewStates[view.id] = view.filterViewState({
        viewState: initialViewStates.find(v => v.id === view.id)
      });
    });
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this.layerFilter = this.layerFilter.bind(this);
    this.onHover = this.onHover.bind(this);
   

    const data=[
      "https://files.scb-ncats.io/pyramids/eastman/p00_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p01_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p02_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p03_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p04_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p05_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p06_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p07_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p08_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p09_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p10_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p11_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p12_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p13_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p14_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p15_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p16_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p17_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p18_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p19_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p20_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p21_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p22_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p23_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p24_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p25_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p26_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p27_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p28_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p29_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p30_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p31_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p32_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p33_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p34_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p35_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p36_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p37_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p38_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p39_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p40_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p41_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p42_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p43_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p44_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p45_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p46_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p47_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p48_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p49_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p50_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p51_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p52_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p53_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p54_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p55_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p56_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p57_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p58_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p59_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p60_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p61_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p62_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p63_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p64_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p65_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p66_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p67_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p68_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p69_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p70_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p71_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p72_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p73_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p74_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p75_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p76_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p77_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p78_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p79_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p80_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p81_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p82_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)",
      "https://files.scb-ncats.io/pyramids/eastman/p83_x(01-24)_y(01-16)_wx(0-2)_wy(0-2)_c(1-2)"
    ];
    const generateHeatmap = () => {
      const cellSize = 4140;
      const width = 24;
      const height = 16;
      const data1 = Array.from({length: width * height}, (e, i) => ({
        fillColor: [Math.floor(Math.random() * 256), 0, 0, 100],
        position: [(i % width) * cellSize, Math.floor(i / width) * cellSize]
      }));
      return new GridCellLayer({
        id: 'grid-cell-layer-#detail#',
        data: data1,
        extruded: false,
        cellSize,
        getPosition: (d) => d.position,
        getFillColor: (d) => d.fillColor
      });
    };
    //this.state.layers=[this._renderLayers()[0][0].clone({id:"ZarrPixelSource-"+"original"+"-#detail#"})];
    this.state.loaders=[];
    //this.state.layers=[];
    data.forEach((url, i)=>{
      createLoader(url).then(loader=>{
        //const modelMatrix = new Matrix4(IDENTITY).translate([140000*(i%row), 140000*Math.floor(i/row), 0]);
        //this.setState({layers:[...this.state.layers,this._renderLayers(loader.data)[0][0].clone({id:"ZarrPixelSource-"+i+"-#detail#", modelMatrix})]})
        this.setState({loaders:[...this.state.loaders,loader]});
      })
    })
  }

  /**
   * This prevents only the `draw` call of a layer from firing,
   * but not other layer lifecycle methods.  Nonetheless, it is
   * still useful.
   * @param {object} args
   * @param {object} args.layer Layer being updated.
   * @param {object} args.viewport Viewport being updated.
   * @returns {boolean} Whether or not this layer should be drawn in this viewport.
   */
  // eslint-disable-next-line class-methods-use-this
  layerFilter({ layer, viewport }) {
    return layer.id.includes(getVivId(viewport.id));
  }

  /**
   * This updates the viewState as a callback to the viewport changing in DeckGL
   * (hence the need for storing viewState in state).
   */
  _onViewStateChange({ viewId, viewState, interactionState, oldViewState }) {
    // Save the view state and trigger rerender.
    const { views, onViewStateChange } = this.props;
    // eslint-disable-next-line no-param-reassign
    viewState =
      (onViewStateChange &&
        onViewStateChange({
          viewId,
          viewState,
          interactionState,
          oldViewState
        })) ||
      viewState;
    this.setState(prevState => {
      const viewStates = {};
      views.forEach(view => {
        const currentViewState = prevState.viewStates[view.id];
        viewStates[view.id] = view.filterViewState({
          viewState: { ...viewState, id: viewId },
          oldViewState,
          currentViewState
        });
      });
      return { viewStates };
    });
    return viewState;
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    const { views } = props;
    // Only update state if the previous viewState prop does not match the current one
    // so that people can update viewState
    // eslint-disable-next-line react/destructuring-assignment
    const viewStates = { ...this.state.viewStates };
    let anyChanged = false;
    views.forEach(view => {
      const currViewState = props.viewStates?.find(
        viewState => viewState.id === view.id
      );
      if (!currViewState) {
        return;
      }
      const prevViewState = prevProps.viewStates?.find(
        viewState => viewState.id === view.id
      );
      if (areViewStatesEqual(currViewState, prevViewState)) {
        return;
      }
      anyChanged = true;
      const { height, width } = view;
      viewStates[view.id] = view.filterViewState({
        viewState: {
          ...currViewState,
          height,
          width,
          id: view.id
        }
      });
    });
    if (anyChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ viewStates });
    }
  }

  /**
   * This updates the viewStates' height and width with the newest height and
   * width on any call where the viewStates changes (i.e resize events),
   * using the previous state (falling back on the view's initial state) for target x and y, zoom level etc.
   */
  static getDerivedStateFromProps(props, prevState) {
    const { views, viewStates: viewStatesProps } = props;
    // Update internal viewState on view changes as well as height and width changes.
    // Maybe we should add x/y too?
    if (
      views.some(
        view =>
          !prevState.viewStates[view.id] ||
          view.height !== prevState.viewStates[view.id].height ||
          view.width !== prevState.viewStates[view.id].width
      )
    ) {
      const viewStates = {};
      views.forEach(view => {
        const { height, width } = view;
        const currentViewState = prevState.viewStates[view.id];
        viewStates[view.id] = view.filterViewState({
          viewState: {
            ...(currentViewState ||
              viewStatesProps.find(v => v.id === view.id)),
            height,
            width,
            id: view.id
          }
        });
      });
      return { viewStates };
    }
    return prevState;
  }

  // eslint-disable-next-line consistent-return
  onHover(info, event) {
    const { tile, coordinate, sourceLayer: layer } = info;
    const { onHover, hoverHooks } = this.props;
    if (onHover) {
      onHover(info, event);
    }
    if (!hoverHooks || !coordinate || !layer) {
      return null;
    }
    const { handleValue = () => {}, handleCoordnate = () => {} } = hoverHooks;
    let hoverData;
    // Tiled layer needs a custom layerZoomScale.
    if (layer.id.includes('Tiled')) {
      if (!tile?.content) {
        return null;
      }
      const { content, bbox, z } = tile;
      if (!content.data || !bbox) {
        return null;
      }
      const { data, width, height } = content;
      const { left, right, top, bottom } = bbox;
      const bounds = [
        left,
        data.height < layer.tileSize ? height : bottom,
        data.width < layer.tileSize ? width : right,
        top
      ];
      if (!data) {
        return null;
      }
      // The zoomed out layer needs to use the fixed zoom at which it is rendered.
      const layerZoomScale = Math.max(1, 2 ** Math.round(-z));
      const dataCoords = [
        Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
        Math.floor((coordinate[1] - bounds[3]) / layerZoomScale)
      ];
      const coords = dataCoords[1] * width + dataCoords[0];
      hoverData = data.map(d => d[coords]);
    } else {
      const { channelData } = layer.props;
      if (!channelData) {
        return null;
      }
      const { data, width, height } = channelData;
      if (!data || !width || !height) {
        return null;
      }
      const bounds = [0, height, width, 0];
      // Using floor means that as we zoom out, we are scaling by the zoom just passed, not the one coming.
      const { zoom } = layer.context.viewport;
      const layerZoomScale = Math.max(1, 2 ** Math.floor(-zoom));
      const dataCoords = [
        Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
        Math.floor((coordinate[1] - bounds[3]) / layerZoomScale)
      ];
      const coords = dataCoords[1] * width + dataCoords[0];
      hoverData = data.map(d => d[coords]);
    }
    handleValue(hoverData);
    handleCoordnate(coordinate);
  }

  /**
   * This renders the layers in the DeckGL context.
   */
  _renderLayers(loader) {
    const { onHover } = this;
    const { viewStates } = this.state;
    const { views, layerProps } = this.props;
    return views.map((view, i) =>
      view.getLayers({
        viewStates,
        props: {
          ...layerProps[i],
          ...(loader ? {loader} : {})
          //onHover
        }
      })
    );
  }

  render() {
    /* eslint-disable react/destructuring-assignment */
    const { views, randomize, useDevicePixels = true, deckProps } = this.props;
    const { viewStates } = this.state;
    const deckGLViews = views.map(view => view.getDeckGlView());
    // DeckGL seems to use the first view more than the second for updates
    // so this forces it to use the others more evenly.  This isn't perfect,
    // but I am not sure what else to do.  The DeckGL render hooks don't help,
    // but maybe useEffect() would help?  I couldn't work it out as
    // The issue is that I'm not sure how React would distinguish between forced updates
    // from permuting the views array and "real" updates like zoom/pan.
    // I tried keeping a counter but I couldn't figure out resetting it
    // without triggering a re-render.
    if (randomize) {
      const random = Math.random();
      const holdFirstElement = deckGLViews[0];
      // weight has to go to 1.5 because we use Math.round().
      const randomWieghted = random * 1.49;
      const randomizedIndex = Math.round(randomWieghted * (views.length - 1));
      deckGLViews[0] = deckGLViews[randomizedIndex];
      deckGLViews[randomizedIndex] = holdFirstElement;
    }

    const IDENTITY = [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1];
      const row =20;
    const layers=this.state.loaders.map((loader, i)=>{
      console.log('i',i)
      const modelMatrix = new Matrix4(IDENTITY).translate([140000*(i%row), 140000*Math.floor(i/row), 0]);
      return this._renderLayers(loader.data)[0][0].clone({id:"ZarrPixelSource-"+i+"-#detail#", modelMatrix});
    })
    return (
      <DeckGL
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(deckProps ?? {})}
        layerFilter={this.layerFilter}
        layers={
          deckProps?.layers === undefined
            ? [...layers]
            : [...layers, ...deckProps.layers]
        }
        onViewStateChange={this._onViewStateChange}
        views={deckGLViews}
        viewState={viewStates}
        useDevicePixels={useDevicePixels}
        getCursor={({ isDragging }) => {
          return isDragging ? 'grabbing' : 'crosshair';
        }}
      />
    );
  }
}

/**
 * This component wraps the DeckGL component.
 * @param {Object} props
 * @param {Array} props.layerProps  Props for the layers in each view.
 * @param {boolean} [props.randomize] Whether or not to randomize which view goes first (for dynamic rendering of multiple linked views).
 * @param {Array.<import('../views').VivView>} props.views Various `VivView`s to render.
 * @param {Array.<object>} props.viewStates List of objects like [{ target: [x, y, 0], zoom: -zoom, id: 'left' }, { target: [x, y, 0], zoom: -zoom, id: 'right' }]
 * @param {ViewStateChange} [props.onViewStateChange] Callback that returns the deck.gl view state (https://deck.gl/docs/api-reference/core/deck#onviewstatechange).
 * @param {Hover} [props.onHover] Callback that returns the picking info and the event (https://deck.gl/docs/api-reference/core/layer#onhover
 *     https://deck.gl/docs/developer-guide/interactivity#the-picking-info-object)
 * @param {HoverHooks} [props.hoverHooks] Object including utility hooks - an object with key handleValue like { handleValue: (valueArray) => {}, handleCoordinate: (coordinate) => {} } where valueArray
 * has the pixel values for the image under the hover location and coordinate is the coordinate in the image from which the values are picked.
 * @param {Object} [props.deckProps] Additional options used when creating the DeckGL component.  See [the deck.gl docs.](https://deck.gl/docs/api-reference/core/deck#initialization-settings).  `layerFilter`, `layers`, `onViewStateChange`, `views`, `viewState`, `useDevicePixels`, and `getCursor` are already set.
 */
// eslint-disable-next-line react/jsx-props-no-spreading
const VivViewer = props => <VivViewerWrapper {...props} />;
export default VivViewer;
