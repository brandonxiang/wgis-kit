import { open } from 'shapefile'

/**
 * 从 ArrayBuffer 读取 SHP 文件并转换为 GeoJSON
 * @param {ArrayBuffer} shpBuffer - .shp 文件内容
 * @param {ArrayBuffer} [dbfBuffer] - .dbf 文件内容（可选）
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function readShapefile(shpBuffer, dbfBuffer) {
  const source = await open(shpBuffer, dbfBuffer)
  const features = []

  while (true) {
    const result = await source.read()
    if (result.done) break
    features.push(result.value)
  }

  return {
    type: 'FeatureCollection',
    features
  }
}

/**
 * 从 File 对象读取 SHP 文件
 * @param {File} shpFile - .shp 文件
 * @param {File} [dbfFile] - .dbf 文件（可选）
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function readShapefileFromFiles(shpFile, dbfFile) {
  const shpBuffer = await shpFile.arrayBuffer()
  const dbfBuffer = dbfFile ? await dbfFile.arrayBuffer() : undefined

  return readShapefile(shpBuffer, dbfBuffer)
}
