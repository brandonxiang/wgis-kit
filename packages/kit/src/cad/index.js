import { parseDxf, getEntities, getLayers, getBoundingBox } from './dxf-reader.js'
import { parseDwg, isValidDwg, getDwgVersion, getDwgSuggestions } from './dwg-reader.js'
import { dxfToGeoJSON, entitiesToGeoJSON, DEFAULT_COLORS } from './converter.js'

const SUPPORTED_FORMATS = ['dxf', 'dwg']

/**
 * Read CAD file and convert to GeoJSON
 * @param {ArrayBuffer|string} buffer - CAD file content
 * @param {string} format - File format ('dxf' or 'dwg')
 * @param {Object} options - Conversion options
 * @returns {Promise<FeatureCollection>}
 */
export async function readCadFile(buffer, format, options = {}) {
  if (!buffer) {
    throw new Error('No buffer provided')
  }
  
  format = format.toLowerCase()
  
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new Error(`Unsupported format: ${format}. Supported: ${SUPPORTED_FORMATS.join(', ')}`)
  }
  
  const defaultOptions = {
    offset: [0, 0],
    scale: 1,
    rotation: 0,
    layers: null,
    entityTypes: null,
    ...options
  }
  
  if (format === 'dxf') {
    return readDxfFile(buffer, defaultOptions)
  } else if (format === 'dwg') {
    return readDwgFile(buffer, defaultOptions)
  }
}

/**
 * Read DXF file
 * @param {ArrayBuffer|string} buffer - DXF file content
 * @param {Object} options - Options
 * @returns {FeatureCollection}
 */
function readDxfFile(buffer, options) {
  let dxf
  
  if (typeof buffer === 'string') {
    dxf = parseDxf(buffer)
  } else {
    const text = new TextDecoder('utf-8').decode(buffer)
    dxf = parseDxf(text)
  }
  
  let entities = getEntities(dxf)
  
  if (options.layers) {
    entities = entities.filter(e => options.layers.includes(e.layer))
  }
  
  if (options.entityTypes) {
    entities = entities.filter(e => options.entityTypes.includes(e.type))
  }
  
  return {
    geojson: dxfToGeoJSON({ entities }, options),
    metadata: {
      format: 'dxf',
      entityCount: entities.length,
      layers: getLayers(dxf),
      boundingBox: getBoundingBox(entities)
    }
  }
}

/**
 * Read DWG file
 * @param {ArrayBuffer} buffer - DWG file content
 * @param {Object} options - Options
 * @returns {FeatureCollection}
 */
function readDwgFile(buffer, options) {
  if (!isValidDwg(buffer)) {
    throw new Error('Invalid DWG file format')
  }
  
  const version = getDwgVersion(buffer)
  console.warn(`DWG version detected: ${version}`)
  
  const result = parseDwg(buffer, options)
  
  if (!result.entities || result.entities.length === 0) {
    const suggestions = getDwgSuggestions()
    console.warn(suggestions.recommended)
    
    return {
      geojson: { type: 'FeatureCollection', features: [] },
      metadata: {
        format: 'dwg',
        version: version,
        warning: 'Limited DWG support. For full support, convert to DXF.',
        suggestions: suggestions
      }
    }
  }
  
  return {
    geojson: entitiesToGeoJSON(result.entities, options),
    metadata: {
      format: 'dwg',
      version: version,
      entityCount: result.entities.length,
      layers: result.layers
    }
  }
}

/**
 * Get supported file formats
 * @returns {string[]}
 */
export function getSupportedFormats() {
  return [...SUPPORTED_FORMATS]
}

/**
 * Check if format is supported
 * @param {string} format - File format
 * @returns {boolean}
 */
export function isFormatSupported(format) {
  return SUPPORTED_FORMATS.includes(format.toLowerCase())
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string}
 */
export function getFileExtension(filename) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export {
  parseDxf,
  getEntities,
  getLayers,
  getBoundingBox,
  parseDwg,
  isValidDwg,
  getDwgVersion,
  getDwgSuggestions,
  dxfToGeoJSON,
  entitiesToGeoJSON,
  DEFAULT_COLORS
}
