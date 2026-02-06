import shpwrite from 'shp-write'

/**
 * 将 GeoJSON 导出为 SHP 并下载
 * @param {GeoJSON.FeatureCollection} geojson
 * @param {string} [filename='export'] - 文件名
 */
export function downloadShapefile(geojson, filename = 'export') {
  const options = {
    folder: filename,
    outputType: 'blob',
    compression: 'DEFLATE'
  }

  shpwrite.download(geojson, options)
}

/**
 * 将 GeoJSON 导出为 SHP Blob
 * @param {GeoJSON.FeatureCollection} geojson
 * @returns {Promise<Blob>}
 */
export async function writeShapefileToBlob(geojson) {
  const options = {
    outputType: 'blob',
    compression: 'DEFLATE'
  }

  return shpwrite.zip(geojson, options)
}
