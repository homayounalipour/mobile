import {colors} from 'constants/values';
import qs from 'qs';

const API_KEY = process.env.REACT_NATIVE_GOOGLE_MAPS_API_KEY;
const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';

interface Coordinate {
  lat: number;
  lng: number;
}

interface Path {
  color?: string;
  weight?: number;
  fillcolor?: string;
  coordinates: Coordinate[];
}

interface Marker {
  coordinate: Coordinate;
}

interface Input {
  width: number;
  height: number;
  path?: Path;
  markers?: [Marker];
  zoom?: number;
  maptype?: 'roadmap' | 'satellite';
}

function pipe(dictionary: Record<string, string | number>) {
  return Object.entries(dictionary)
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

function joinCoordinate({lat, lng}: Coordinate) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

const defaultColor = colors.khakiDark.replace(/^#/, '0x');

function getStaticMapUrl({height, width, markers, path, zoom, maptype = 'satellite'}: Input) {
  const queryParams = {
    zoom: zoom ?? (markers && 12),
    path:
      path &&
      `${pipe({
        color: path.color ?? defaultColor,
        fillcolor: path.fillcolor ?? defaultColor,
        weight: path.weight ?? 1,
      })}|${path.coordinates.map(joinCoordinate).join('|')}`,
    // TODO: Support multiple markers
    center: markers && `${joinCoordinate(markers[0].coordinate)}`,
    markers: markers && `color:${defaultColor}|${joinCoordinate(markers[0].coordinate)}`,
    size: `${Math.floor(width)}x${Math.floor(height)}`,
    scale: 2,
    maptype,
    key: API_KEY,
  };

  return `${baseUrl}?${qs.stringify(queryParams)}`;
}

export default getStaticMapUrl;
