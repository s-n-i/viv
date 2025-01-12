import type { GeoTIFFImage } from 'geotiff';
import { getDims, getLabels, DTYPE_LOOKUP } from '../../utils';
import type { OMEXML, UnitsLength, DimensionOrder } from '../../omexml';
import type { MultiTiffImage } from '../multi-tiff';

export interface OmeTiffSelection {
  t: number;
  c: number;
  z: number;
}

export function getOmePixelSourceMeta({ Pixels }: OMEXML[0]) {
  // e.g. 'XYZCT' -> ['t', 'c', 'z', 'y', 'x']
  const labels = getLabels(Pixels.DimensionOrder);

  // Compute "shape" of image
  const dims = getDims(labels);
  const shape: number[] = Array(labels.length).fill(0);
  shape[dims('t')] = Pixels.SizeT;
  shape[dims('c')] = Pixels.SizeC;
  shape[dims('z')] = Pixels.SizeZ;

  // Push extra dimension if data are interleaved.
  if (Pixels.Interleaved) {
    // @ts-expect-error private, unused dim name for selection
    labels.push('_c');
    shape.push(3);
  }

  // Creates a new shape for different level of pyramid.
  // Assumes factor-of-two downsampling.
  const getShape = (level: number) => {
    const s = [...shape];
    s[dims('x')] = Pixels.SizeX >> level;
    s[dims('y')] = Pixels.SizeY >> level;
    return s;
  };

  if (!(Pixels.Type in DTYPE_LOOKUP)) {
    throw Error(`Pixel type ${Pixels.Type} not supported.`);
  }

  const dtype = DTYPE_LOOKUP[Pixels.Type as keyof typeof DTYPE_LOOKUP];
  if (Pixels.PhysicalSizeX && Pixels.PhysicalSizeY) {
    const physicalSizes: {
      [k: string]: { size: number; unit: UnitsLength };
    } = {
      x: {
        size: Pixels.PhysicalSizeX,
        unit: Pixels.PhysicalSizeXUnit
      },
      y: {
        size: Pixels.PhysicalSizeY,
        unit: Pixels.PhysicalSizeYUnit
      }
    };
    if (Pixels.PhysicalSizeZ) {
      physicalSizes.z = {
        size: Pixels.PhysicalSizeZ,
        unit: Pixels.PhysicalSizeZUnit
      };
    }
    return { labels, getShape, physicalSizes, dtype };
  }

  return { labels, getShape, dtype };
}

// Inspired by/borrowed from https://geotiffjs.github.io/geotiff.js/geotiffimage.js.html#line297
function guessImageDataType(image: GeoTIFFImage) {
  // Assuming these are flat TIFFs, just grab the info for the first image/sample.
  const sampleIndex = 0;
  const format = image.fileDirectory.SampleFormat
    ? image.fileDirectory.SampleFormat[sampleIndex]
    : 1;
  const bitsPerSample = image.fileDirectory.BitsPerSample[sampleIndex];
  switch (format) {
    case 1: // unsigned integer data
      if (bitsPerSample <= 8) {
        return DTYPE_LOOKUP.uint8;
      }
      if (bitsPerSample <= 16) {
        return DTYPE_LOOKUP.uint16;
      }
      if (bitsPerSample <= 32) {
        return DTYPE_LOOKUP.uint32;
      }
      break;
    case 2: // twos complement signed integer data
      if (bitsPerSample <= 8) {
        return DTYPE_LOOKUP.int8;
      }
      if (bitsPerSample <= 16) {
        return DTYPE_LOOKUP.int16;
      }
      if (bitsPerSample <= 32) {
        return DTYPE_LOOKUP.int32;
      }
      break;
    case 3:
      switch (bitsPerSample) {
        case 16:
          // Should be float 16, maybe 32 will work?
          // Or should we raise an error?
          return DTYPE_LOOKUP.float;
        case 32:
          return DTYPE_LOOKUP.float;
        case 64:
          return DTYPE_LOOKUP.double;
        default:
          break;
      }
      break;
    default:
      break;
  }
  throw Error('Unsupported data format/bitsPerSample');
}

function getMultiTiffShapeMap(tiffs: MultiTiffImage[]): {
  [key: string]: number;
} {
  let [c, z, t] = [0, 0, 0];
  for (const tiff of tiffs) {
    c = Math.max(c, tiff.selection.c);
    z = Math.max(z, tiff.selection.z);
    t = Math.max(t, tiff.selection.t);
  }

  const firstTiff = tiffs[0].tiff;
  return {
    x: firstTiff.getWidth(),
    y: firstTiff.getHeight(),
    z: z + 1,
    c: c + 1,
    t: t + 1
  };
}

export function getMultiTiffMeta(
  dimensionOrder: DimensionOrder,
  tiffs: MultiTiffImage[]
) {
  const firstTiff = tiffs[0].tiff;
  const shapeMap = getMultiTiffShapeMap(tiffs);
  const shape = [];
  for (const dim of dimensionOrder.toLowerCase()) {
    shape.unshift(shapeMap[dim]);
  }

  const labels = getLabels(dimensionOrder);
  const dtype = guessImageDataType(firstTiff);
  return { shape, labels, dtype };
}

function getMultiTiffPixelMedatata(
  imageNumber: number,
  dimensionOrder: DimensionOrder,
  shapeMap: { [key: string]: number },
  dType: string,
  tiffs: MultiTiffImage[]
) {
  const channelMetadata = [];
  for (let i = 0; i < tiffs.length; i += 1) {
    channelMetadata.push({
      ID: `Channel:${imageNumber}:${i}`,
      Name: tiffs[i].name,
      SamplesPerPixel: tiffs[i].tiff.getSamplesPerPixel()
    });
  }
  return {
    BigEndian: !tiffs[0].tiff.littleEndian,
    DimensionOrder: dimensionOrder,
    ID: `Pixels:${imageNumber}`,
    SizeC: shapeMap.c,
    SizeT: shapeMap.t,
    SizeX: shapeMap.x,
    SizeY: shapeMap.y,
    SizeZ: shapeMap.z,
    Type: dType,
    Channels: channelMetadata
  };
}

export function getMultiTiffMetadata(
  imageName: string,
  tiffImages: MultiTiffImage[],
  dimensionOrder: DimensionOrder,
  dType: string
) {
  const imageNumber = 0;
  const id = `Image:${imageNumber}`;
  const date = '';
  const description = '';
  const shapeMap = getMultiTiffShapeMap(tiffImages);

  const pixels = getMultiTiffPixelMedatata(
    imageNumber,
    dimensionOrder,
    shapeMap,
    dType,
    tiffImages
  );

  const format = () => {
    return {
      'Acquisition Date': date,
      'Dimensions (XY)': `${shapeMap.x} x ${shapeMap.y}`,
      PixelsType: dType,
      'Z-sections/Timepoints': `${shapeMap.z} x ${shapeMap.t}`,
      Channels: shapeMap.c
    };
  };
  return {
    ID: id,
    Name: imageName,
    AcquisitionDate: date,
    Description: description,
    Pixels: pixels,
    format
  };
}

export function parseFilename(path: string) {
  const parsedFilename: { name?: string; extension?: string } = {};
  const filename = path.split('/').pop();
  const splitFilename = filename?.split('.');
  if (splitFilename) {
    parsedFilename.name = splitFilename.slice(0, -1).join('.');
    [, parsedFilename.extension] = splitFilename;
  }
  return parsedFilename;
}
