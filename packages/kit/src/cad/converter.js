import { getEntities, arcToPoints, circleToPoints } from './dxf-reader'

const DEFAULT_COLORS = {
  LINE: '#ff6b6b',
  POLYLINE: '#4ecdc4',
  LWPOLYLINE: '#4ecdc4',
  CIRCLE: '#45b7d1',
  ARC: '#f39c12',
  TEXT: '#9b59b6',
  MTEXT: '#9b59b6',
  POINT: '#e74c3c',
  HATCH: '#2ecc71',
  BLOCK: '#3498db',
  INSERT: '#e67e22',
  ELLIPSE: '#1abc9c',
  SPLINE: '#34495e'
}

function transformPoint(point, options) {
  const { offset = [0, 0], scale = 1, rotation = 0 } = options
  let [x, y] = point
  
  x = x * scale + offset[0]
  y = y * scale + offset[1]
  
  if (rotation !== 0) {
    const rad = rotation * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const nx = x * cos - y * sin
    const ny = x * sin + y * cos
    x = nx
    y = ny
  }
  
  return [x, y]
}

function convertLine(entity, options) {
  return {
    type: 'Feature',
    properties: {
      type: 'LINE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.LINE
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        transformPoint([entity.start.x, entity.start.y], options),
        transformPoint([entity.end.x, entity.end.y], options)
      ]
    }
  }
}

function convertPolyline(entity, options) {
  const vertices = entity.vertices || []
  if (vertices.length === 0) return null
  
  const coordinates = vertices.map(v => 
    transformPoint([v.x, v.y], options)
  )
  
  return {
    type: 'Feature',
    properties: {
      type: 'POLYLINE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.POLYLINE,
      isClosed: entity.isClosed || false
    },
    geometry: {
      type: entity.isClosed ? 'Polygon' : 'LineString',
      coordinates: entity.isClosed ? [coordinates] : coordinates
    }
  }
}

function convertLwpolyline(entity, options) {
  const points = entity.points || []
  if (points.length === 0) return null
  
  const coordinates = points.map(p => 
    transformPoint([p.x, p.y], options)
  )
  
  return {
    type: 'Feature',
    properties: {
      type: 'LWPOLYLINE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.LWPOLYLINE,
      isClosed: entity.isClosed || false
    },
    geometry: {
      type: entity.isClosed ? 'Polygon' : 'LineString',
      coordinates: entity.isClosed ? [coordinates] : coordinates
    }
  }
}

function convertCircle(entity, options) {
  const cx = entity.center?.x ?? entity.x ?? 0
  const cy = entity.center?.y ?? entity.y ?? 0
  const radius = (entity.radius ?? entity.r ?? 10) * options.scale
  
  const center = transformPoint([cx, cy], options)
  
  const circlePoints = circleToPoints({
    center: { x: 0, y: 0 },
    radius: radius
  })
  
  const coordinates = circlePoints.map(p => [
    center[0] + p[0] - center[0],
    center[1] + p[1] - center[1]
  ])
  
  return {
    type: 'Feature',
    properties: {
      type: 'CIRCLE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.CIRCLE,
      radius: radius,
      center: center
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  }
}

function convertArc(entity, options) {
  const cx = entity.center?.x ?? entity.x ?? 0
  const cy = entity.center?.y ?? entity.y ?? 0
  const radius = (entity.radius ?? entity.r ?? 10) * options.scale
  
  const center = transformPoint([cx, cy], options)
  
  const arcPoints = arcToPoints({
    center: { x: 0, y: 0 },
    radius: radius,
    startAngle: entity.startAngle ?? 0,
    endAngle: entity.endAngle ?? 360
  })
  
  const coordinates = arcPoints.map(p => [
    center[0] + p[0] - center[0],
    center[1] + p[1] - center[1]
  ])
  
  return {
    type: 'Feature',
    properties: {
      type: 'ARC',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.ARC,
      radius: radius,
      center: center,
      startAngle: entity.startAngle,
      endAngle: entity.endAngle
    },
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  }
}

function convertPoint(entity, options) {
  return {
    type: 'Feature',
    properties: {
      type: 'POINT',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.POINT
    },
    geometry: {
      type: 'Point',
      coordinates: transformPoint([entity.position.x, entity.position.y], options)
    }
  }
}

function convertText(entity, options) {
  const coordinate = transformPoint([entity.position.x, entity.position.y], options)
  
  return {
    type: 'Feature',
    properties: {
      type: 'TEXT',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.TEXT,
      text: entity.text || '',
      height: entity.height
    },
    geometry: {
      type: 'Point',
      coordinates: coordinate
    }
  }
}

function convertMtext(entity, options) {
  const coordinate = transformPoint([entity.position.x, entity.position.y], options)
  
  return {
    type: 'Feature',
    properties: {
      type: 'MTEXT',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.MTEXT,
      text: entity.text || '',
      height: entity.height
    },
    geometry: {
      type: 'Point',
      coordinates: coordinate
    }
  }
}

function convertHatch(entity, options) {
  const boundaryPoints = entity.boundaryPoints || []
  if (boundaryPoints.length === 0) return null
  
  const coordinates = [
    boundaryPoints.map(p => transformPoint([p.x, p.y], options))
  ]
  
  return {
    type: 'Feature',
    properties: {
      type: 'HATCH',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.HATCH,
      pattern: entity.pattern || 'SOLID'
    },
    geometry: {
      type: 'Polygon',
      coordinates: coordinates
    }
  }
}

function convertEllipse(entity, options) {
  const center = transformPoint([entity.center.x, entity.center.y], options)
  const semiMajor = entity.semiMajorAxis * options.scale || entity.semiMajorAxis
  const semiMinor = entity.semiMinorAxis * options.scale || entity.semiMinorAxis
  
  const points = []
  const ratio = semiMinor / semiMajor
  const startAngle = entity.startAngle || 0
  const endAngle = entity.endAngle || 2 * Math.PI
  const segments = 64
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * i / segments
    points.push([
      center[0] + semiMajor * Math.cos(angle),
      center[1] + semiMinor * Math.sin(angle)
    ])
  }
  
  return {
    type: 'Feature',
    properties: {
      type: 'ELLIPSE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.ELLIPSE,
      semiMajorAxis: semiMajor,
      semiMinorAxis: semiMinor
    },
    geometry: {
      type: 'LineString',
      coordinates: points
    }
  }
}

function convertSpline(entity, options) {
  const controlPoints = entity.controlPoints || []
  if (controlPoints.length === 0) return null
  
  const coordinates = controlPoints.map(p => 
    transformPoint([p.x, p.y], options)
  )
  
  return {
    type: 'Feature',
    properties: {
      type: 'SPLINE',
      layer: entity.layer || '0',
      color: entity.color || DEFAULT_COLORS.SPLINE,
      degree: entity.degree,
      knotValues: entity.knotValues
    },
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  }
}

function convertEntity(entity, options) {
  if (!entity || !entity.type) return null
  
  const converters = {
    LINE: convertLine,
    POLYLINE: convertPolyline,
    LWPOLYLINE: convertLwpolyline,
    CIRCLE: convertCircle,
    ARC: convertArc,
    POINT: convertPoint,
    TEXT: convertText,
    MTEXT: convertMtext,
    HATCH: convertHatch,
    ELLIPSE: convertEllipse,
    SPLINE: convertSpline
  }
  
  const converter = converters[entity.type]
  if (converter) {
    return converter(entity, options)
  }
  
  return null
}

/**
 * Convert DXF entities to GeoJSON FeatureCollection
 * @param {Object} dxf - Parsed DXF data
 * @param {Object} options - Conversion options
 * @returns {FeatureCollection}
 */
export function dxfToGeoJSON(dxf, options = {}) {
  const entities = getEntities(dxf)
  const features = []
  
  for (const entity of entities) {
    const feature = convertEntity(entity, options)
    if (feature) {
      features.push(feature)
    }
  }
  
  return {
    type: 'FeatureCollection',
    features: features
  }
}

/**
 * Convert CAD entities array to GeoJSON
 * @param {Array} entities - Array of CAD entities
 * @param {Object} options - Conversion options
 * @returns {FeatureCollection}
 */
export function entitiesToGeoJSON(entities, options = {}) {
  const features = []
  
  for (const entity of entities) {
    const feature = convertEntity(entity, options)
    if (feature) {
      features.push(feature)
    }
  }
  
  return {
    type: 'FeatureCollection',
    features: features
  }
}

export { DEFAULT_COLORS, convertEntity }
