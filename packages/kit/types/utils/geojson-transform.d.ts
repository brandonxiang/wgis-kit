import type { FeatureCollection, Feature, Geometry } from 'geojson';

export type TransformType =
  | 'wgs84-gcj02'
  | 'gcj02-wgs84'
  | 'gcj02-bd09'
  | 'bd09-gcj02'
  | 'wgs84-bd09'
  | 'bd09-wgs84';

export interface TransformOption {
  value: TransformType;
  label: string;
}

/**
 * 转换 GeoJSON 中所有坐标
 */
export function transformGeoJSON<T extends FeatureCollection | Feature | Geometry>(
  geojson: T,
  transform: TransformType
): T;

export const TRANSFORM_TYPES: TransformOption[];
