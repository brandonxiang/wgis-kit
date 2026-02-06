import {
  wgs84togcj02,
  gcj02towgs84,
  gcj02tobd09,
  bd09togcj02
} from './coord-transform'

const transformFunctions = {
  'wgs84-gcj02': wgs84togcj02,
  'gcj02-wgs84': gcj02towgs84,
  'gcj02-bd09': gcj02tobd09,
  'bd09-gcj02': bd09togcj02,
  'wgs84-bd09': (lng, lat) => {
    const gcj = wgs84togcj02(lng, lat)
    return gcj02tobd09(gcj[0], gcj[1])
  },
  'bd09-wgs84': (lng, lat) => {
    const gcj = bd09togcj02(lng, lat)
    return gcj02towgs84(gcj[0], gcj[1])
  }
}

/**
 * 转换单个坐标
 * @param {number[]} coord - [lng, lat] 或 [lng, lat, alt]
 * @param {Function} transformFn
 * @returns {number[]}
 */
function transformCoord(coord, transformFn) {
  const [lng, lat, ...rest] = coord
  const [newLng, newLat] = transformFn(lng, lat)
  return [newLng, newLat, ...rest]
}

/**
 * 递归转换坐标数组
 * @param {any} coords
 * @param {Function} transformFn
 * @returns {any}
 */
function transformCoords(coords, transformFn) {
  if (typeof coords[0] === 'number') {
    return transformCoord(coords, transformFn)
  }
  return coords.map(c => transformCoords(c, transformFn))
}

/**
 * 转换 GeoJSON Geometry
 * @param {GeoJSON.Geometry} geometry
 * @param {Function} transformFn
 * @returns {GeoJSON.Geometry}
 */
function transformGeometry(geometry, transformFn) {
  if (!geometry) return geometry

  const result = { ...geometry }

  if (geometry.type === 'GeometryCollection') {
    result.geometries = geometry.geometries.map(g => transformGeometry(g, transformFn))
  } else {
    result.coordinates = transformCoords(geometry.coordinates, transformFn)
  }

  return result
}

/**
 * 转换 GeoJSON 中所有坐标
 * @param {GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry} geojson
 * @param {'wgs84-gcj02' | 'gcj02-wgs84' | 'gcj02-bd09' | 'bd09-gcj02' | 'wgs84-bd09' | 'bd09-wgs84'} transform
 * @returns {GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry}
 */
export function transformGeoJSON(geojson, transform) {
  const transformFn = transformFunctions[transform]
  if (!transformFn) {
    throw new Error(`Unknown transform: ${transform}`)
  }

  if (geojson.type === 'FeatureCollection') {
    return {
      ...geojson,
      features: geojson.features.map(f => transformGeoJSON(f, transform))
    }
  }

  if (geojson.type === 'Feature') {
    return {
      ...geojson,
      geometry: transformGeometry(geojson.geometry, transformFn)
    }
  }

  return transformGeometry(geojson, transformFn)
}

export const TRANSFORM_TYPES = [
  { value: 'wgs84-gcj02', label: 'WGS84 → GCJ-02 (高德/腾讯)' },
  { value: 'gcj02-wgs84', label: 'GCJ-02 → WGS84 (GPS)' },
  { value: 'gcj02-bd09', label: 'GCJ-02 → BD-09 (百度)' },
  { value: 'bd09-gcj02', label: 'BD-09 → GCJ-02 (高德/腾讯)' },
  { value: 'wgs84-bd09', label: 'WGS84 → BD-09 (百度)' },
  { value: 'bd09-wgs84', label: 'BD-09 → WGS84 (GPS)' }
]
