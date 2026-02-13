/**
 * DWG Reader
 * 
 * DWG is a proprietary binary format. This module provides basic support
 * through conversion or external libraries.
 * 
 * Options:
 * 1. Use @mlightcad/libredwg-converter (commercial)
 * 2. Convert DWG to DXF externally first
 * 3. Use online conversion services
 */

/**
 * Parse DWG file (basic implementation)
 * Note: Full DWG parsing requires commercial libraries or server-side conversion
 * @param {ArrayBuffer} buffer - DWG file content
 * @param {Object} options - Options
 * @returns {Object} Parsed entities (limited support)
 */
export function parseDwg(buffer, options = {}) {
  console.warn(
    'DWG parsing is limited. For full support, please:\n' +
    '1. Convert DWG to DXF using external tools\n' +
    '2. Use the DXF parser instead\n' +
    '3. Consider using @mlightcad/libredwg-converter for commercial use'
  )
  
  return {
    entities: [],
    layers: [],
    warning: 'Limited DWG support. Consider converting to DXF.'
  }
}

/**
 * Check if DWG file can be parsed
 * @param {ArrayBuffer} buffer - File buffer
 * @returns {boolean} True if potentially valid DWG
 */
export function isValidDwg(buffer) {
  if (!buffer || buffer.byteLength < 22) return false
  
  const header = new Uint8Array(buffer, 0, 22)
  const signature = String.fromCharCode(...header.slice(0, 6))
  
  return signature === 'AC1015' || 
         signature === 'AC1018' || 
         signature === 'AC1019' ||
         signature === 'AC1021' ||
         signature === 'AC1024' ||
         signature === 'AC1027' ||
         signature === 'AC1029' ||
         signature === 'AC1032'
}

/**
 * Get DWG version from file header
 * @param {ArrayBuffer} buffer - File buffer
 * @returns {string} DWG version
 */
export function getDwgVersion(buffer) {
  if (!buffer || buffer.byteLength < 22) return 'unknown'
  
  const header = new Uint8Array(buffer, 0, 22)
  const signature = String.fromCharCode(...header.slice(0, 6))
  
  const versions = {
    'AC1015': 'R15/AutoCAD 2000',
    'AC1018': 'AutoCAD 2004',
    'AC1019': 'AutoCAD 2007',
    'AC1021': 'AutoCAD 2010',
    'AC1024': 'AutoCAD 2013',
    'AC1027': 'AutoCAD 2018',
    'AC1029': 'AutoCAD 2021',
    'AC1032': 'AutoCAD 2024'
  }
  
  return versions[signature] || 'unknown'
}

/**
 * Suggest conversion approach for DWG
 * @returns {Object} Suggestions
 */
export function getDwgSuggestions() {
  return {
    recommended: 'Convert DWG to DXF using:\n' +
      '- Autodesk TrueView (free)\n' +
      '- LibreDWG tools\n' +
      '- Online converters',
    alternatives: [
      'Use ODA (Open Design Alliance) libraries',
      'Use @mlightcad/libredwg-converter (commercial)',
      'Export from CAD software as DXF'
    ]
  }
}
