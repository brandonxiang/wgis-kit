import type { FeatureCollection } from 'geojson';

/**
 * 从 ArrayBuffer 读取 SHP 文件并转换为 GeoJSON
 */
export function readShapefile(
  shpBuffer: ArrayBuffer,
  dbfBuffer?: ArrayBuffer
): Promise<FeatureCollection>;

/**
 * 从 File 对象读取 SHP 文件
 */
export function readShapefileFromFiles(
  shpFile: File,
  dbfFile?: File
): Promise<FeatureCollection>;
