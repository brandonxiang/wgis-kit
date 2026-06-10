import { Helper } from "dxf"

/**
 * Parse DXF file to entities
 * @param {ArrayBuffer|string} data - DXF file content
 * @returns {{ entities: any[], layers: string[], blocks: any[] }}
 */
export function parseDxf(data) {
  const helper = new Helper(data)
  return {
    entities: helper.parsed?.entities || [],
    layers: Object.keys(helper.groups || {}),
    blocks: helper.parsed?.blocks || [],
  }
}

/**
 * Extract entities from DXF parsed data
 * @param {any} dxf - Parsed DXF data
 * @returns {any[]} Array of entities
 */
export function getEntities(dxf) {
  return dxf?.entities || []
}

/**
 * Get layers from DXF file
 * @param {any} dxf - Parsed DXF data
 * @returns {string[]} Array of layer names
 */
export function getLayers(dxf) {
  return dxf?.layers || []
}

/**
 * Get bounding box of DXF entities
 * @param {any[]} entities - DXF entities
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number }} Bounding box
 */
export function getBoundingBox(entities) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const entity of entities) {
    if (entity.type === "LINE") {
      minX = Math.min(minX, entity.start.x, entity.end.x)
      minY = Math.min(minY, entity.start.y, entity.end.y)
      maxX = Math.max(maxX, entity.start.x, entity.end.x)
      maxY = Math.max(maxY, entity.start.y, entity.end.y)
    } else if (entity.type === "CIRCLE") {
      const cx = entity.center?.x ?? entity.x ?? 0
      const cy = entity.center?.y ?? entity.y ?? 0
      const r = entity.radius ?? entity.r ?? 0
      minX = Math.min(minX, cx - r)
      minY = Math.min(minY, cy - r)
      maxX = Math.max(maxX, cx + r)
      maxY = Math.max(maxY, cy + r)
    } else if (entity.type === "ARC") {
      const cx = entity.center?.x ?? entity.x ?? 0
      const cy = entity.center?.y ?? entity.y ?? 0
      const r = entity.radius ?? entity.r ?? 0
      minX = Math.min(minX, cx - r)
      minY = Math.min(minY, cy - r)
      maxX = Math.max(maxX, cx + r)
      maxY = Math.max(maxY, cy + r)
    } else if (entity.type === "POLYLINE" || entity.type === "LWPOLYLINE") {
      if (entity.vertices) {
        for (const v of entity.vertices) {
          minX = Math.min(minX, v.x)
          minY = Math.min(minY, v.y)
          maxX = Math.max(maxX, v.x)
          maxY = Math.max(maxY, v.y)
        }
      }
    } else if (entity.type === "POINT") {
      minX = Math.min(minX, entity.position.x)
      minY = Math.min(minY, entity.position.y)
      maxX = Math.max(maxX, entity.position.x)
      maxY = Math.max(maxY, entity.position.y)
    } else if (entity.type === "TEXT" || entity.type === "MTEXT") {
      if (entity.position) {
        minX = Math.min(minX, entity.position.x)
        minY = Math.min(minY, entity.position.y)
        maxX = Math.max(maxX, entity.position.x)
        maxY = Math.max(maxY, entity.position.y)
      }
    } else if (entity.type === "HATCH") {
      if (entity.boundaryPoints) {
        for (const bp of entity.boundaryPoints) {
          minX = Math.min(minX, bp.x)
          minY = Math.min(minY, bp.y)
          maxX = Math.max(maxX, bp.x)
          maxY = Math.max(maxY, bp.y)
        }
      }
    }
  }

  return { minX, minY, maxX, maxY }
}

/**
 * Discretize arc to line segments
 * @param {{ center: { x: number, y: number }, radius: number, startAngle: number, endAngle: number }} arc - Arc entity
 * @param {number} [segments=32] - Number of segments
 * @returns {[number, number][]} Array of [x, y] coordinates
 */
function arcToPoints(arc, segments = 32) {
  const { center, radius, startAngle, endAngle } = arc
  /** @type {[number, number][]} */
  const points = []

  let start = startAngle
  let end = endAngle

  if (start > end) {
    end += 360
  }

  const step = (end - start) / segments

  for (let i = 0; i <= segments; i++) {
    const angle = ((start + step * i) * Math.PI) / 180
    points.push([center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle)])
  }

  return points
}

/**
 * Discretize circle to line segments
 * @param {{ center: { x: number, y: number }, radius: number }} circle - Circle entity
 * @param {number} [segments=64] - Number of segments
 * @returns {[number, number][]} Array of [x, y] coordinates
 */
function circleToPoints(circle, segments = 64) {
  const { center, radius } = circle
  /** @type {[number, number][]} */
  const points = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI
    points.push([center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle)])
  }

  return points
}

export { arcToPoints, circleToPoints }
