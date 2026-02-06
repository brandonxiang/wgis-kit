import type { FeatureCollection } from 'geojson';

/**
 * 将 GeoJSON 导出为 SHP 并下载
 */
export function downloadShapefile(
  geojson: FeatureCollection,
  filename?: string
): void;

/**
 * 将 GeoJSON 导出为 SHP Blob
 */
export function writeShapefileToBlob(
  geojson: FeatureCollection
): Promise<Blob>;
