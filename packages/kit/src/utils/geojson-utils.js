// @ts-nocheck

const EARTH_RADIUS = 6371000

/**
 * 角度转弧度
 * @param {number} degrees
 * @returns {number}
 */
export function numberToRadius(degrees) {
  return (degrees * Math.PI) / 180
}

/**
 * 弧度转角度
 * @param {number} radius
 * @returns {number}
 */
export function numberToDegree(radius) {
  return (radius * 180) / Math.PI
}

function pointFromCoord(coord) {
  return { type: "Point", coordinates: coord }
}

/**
 * 判断两个 LineString 是否相交，返回交点数组
 * @param {GeoJSON.LineString} line1
 * @param {GeoJSON.LineString} line2
 * @returns {GeoJSON.Point[]}
 */
export function linestringsIntersect(line1, line2) {
  const intersects = []
  for (let i = 0; i < line1.coordinates.length - 1; i += 1) {
    for (let j = 0; j < line2.coordinates.length - 1; j += 1) {
      const a1x = line1.coordinates[i][0]
      const a1y = line1.coordinates[i][1]
      const a2x = line1.coordinates[i + 1][0]
      const a2y = line1.coordinates[i + 1][1]
      const b1x = line2.coordinates[j][0]
      const b1y = line2.coordinates[j][1]
      const b2x = line2.coordinates[j + 1][0]
      const b2y = line2.coordinates[j + 1][1]
      const uaT = (b2x - b1x) * (a1y - b1y) - (b2y - b1y) * (a1x - b1x)
      const ubT = (a2x - a1x) * (a1y - b1y) - (a2y - a1y) * (a1x - b1x)
      const denominator = (b2y - b1y) * (a2x - a1x) - (b2x - b1x) * (a2y - a1y)
      if (denominator !== 0) {
        const ua = uaT / denominator
        const ub = ubT / denominator
        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
          intersects.push(pointFromCoord([a1x + ua * (a2x - a1x), a1y + ua * (a2y - a1y)]))
        }
      }
    }
  }
  return intersects
}

function pointOnSegment(point, start, end) {
  const cross =
    (point[1] - start[1]) * (end[0] - start[0]) - (point[0] - start[0]) * (end[1] - start[1])
  if (Math.abs(cross) > 1e-12) return false
  return (
    Math.min(start[0], end[0]) <= point[0] &&
    point[0] <= Math.max(start[0], end[0]) &&
    Math.min(start[1], end[1]) <= point[1] &&
    point[1] <= Math.max(start[1], end[1])
  )
}

function pointInRing(coordinates, ring) {
  let inside = false
  let j = ring.length - 1
  for (let i = 0; i < ring.length; i += 1) {
    const current = ring[i]
    const previous = ring[j]
    if (pointOnSegment(coordinates, previous, current)) return true
    if (
      current[1] > coordinates[1] !== previous[1] > coordinates[1] &&
      coordinates[0] <
        ((previous[0] - current[0]) * (coordinates[1] - current[1])) / (previous[1] - current[1]) +
          current[0]
    ) {
      inside = !inside
    }
    j = i
  }
  return inside
}

/**
 * 判断点是否在 Polygon 内。边界点算作在内部，洞内点算作外部。
 * @param {GeoJSON.Point} point
 * @param {GeoJSON.Polygon} polygon
 * @returns {boolean}
 */
export function pointInPolygon(point, polygon) {
  return (
    polygon.coordinates.some((rings) => {
      const exterior = rings
      return pointInRing(point.coordinates, exterior)
    }) && !polygon.coordinates.slice(1).some((ring) => pointInRing(point.coordinates, ring))
  )
}

/**
 * 判断点是否在 MultiPolygon 内。
 * @param {GeoJSON.Point} point
 * @param {GeoJSON.MultiPolygon} multiPolygon
 * @returns {boolean}
 */
export function pointInMultiPolygon(point, multiPolygon) {
  return multiPolygon.coordinates.some((coordinates) =>
    pointInPolygon(point, { type: "Polygon", coordinates }),
  )
}

/**
 * 以中心点和半径生成圆形 Polygon。
 * @param {number} radiusInMeters
 * @param {GeoJSON.Point} centerPoint
 * @param {number} [steps=15]
 * @returns {GeoJSON.Polygon}
 */
export function drawCircle(radiusInMeters, centerPoint, steps = 15) {
  const stepCount = Math.max(steps, 15)
  const [lng, lat] = centerPoint.coordinates
  const distance = radiusInMeters / EARTH_RADIUS
  const radLat = numberToRadius(lat)
  const radLng = numberToRadius(lng)
  const ring = []

  for (let step = 0; step < stepCount; step += 1) {
    const bearing = (2 * Math.PI * step) / stepCount
    const nextLat = Math.asin(
      Math.sin(radLat) * Math.cos(distance) +
        Math.cos(radLat) * Math.sin(distance) * Math.cos(bearing),
    )
    const nextLng =
      radLng +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distance) * Math.cos(radLat),
        Math.cos(distance) - Math.sin(radLat) * Math.sin(nextLat),
      )
    ring.push([numberToDegree(nextLng), numberToDegree(nextLat)])
  }

  ring.push(ring[0])
  return { type: "Polygon", coordinates: [ring] }
}

/**
 * 计算矩形 Polygon 的中心点。
 * @param {GeoJSON.Polygon} rectangle
 * @returns {GeoJSON.Point}
 */
export function rectangleCentroid(rectangle) {
  const ring = rectangle.coordinates[0]
  const xs = ring.map((coord) => coord[0])
  const ys = ring.map((coord) => coord[1])
  return pointFromCoord([
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ])
}

/**
 * 计算两个点之间的球面距离，单位米。
 * @param {GeoJSON.Point} point1
 * @param {GeoJSON.Point} point2
 * @returns {number}
 */
export function pointDistance(point1, point2) {
  const [lon1, lat1] = point1.coordinates
  const [lon2, lat2] = point2.coordinates
  const degLat = numberToRadius(lat2 - lat1)
  const degLon = numberToRadius(lon2 - lon1)
  const a =
    Math.sin(degLat / 2) ** 2 +
    Math.cos(numberToRadius(lat1)) * Math.cos(numberToRadius(lat2)) * Math.sin(degLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS * c
}

/**
 * 判断几何对象是否完全在半径范围内。
 * @param {GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon} geometry
 * @param {GeoJSON.Point} center
 * @param {number} radius
 * @returns {boolean}
 */
export function geometryWithinRadius(geometry, center, radius) {
  if (geometry.type === "Point") {
    return pointDistance(geometry, center) <= radius
  }
  const coordinates = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates
  return coordinates.every((coord) => pointDistance(pointFromCoord(coord), center) <= radius)
}

function ringArea(ring) {
  let total = 0
  let j = ring.length - 1
  for (let i = 0; i < ring.length; i += 1) {
    total += ring[i][0] * ring[j][1]
    total -= ring[i][1] * ring[j][0]
    j = i
  }
  return total / 2
}

/**
 * 计算 Polygon 面积。外环为正，洞会从面积中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {number}
 */
export function polygonArea(polygon) {
  return polygon.coordinates.reduce((total, ring, index) => {
    const value = Math.abs(ringArea(ring))
    return total + (index === 0 ? value : -value)
  }, 0)
}

function ringCentroid(ring) {
  let signedArea = 0
  let xTotal = 0
  let yTotal = 0
  let j = ring.length - 1
  for (let i = 0; i < ring.length; i += 1) {
    const factor = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
    signedArea += factor
    xTotal += (ring[i][0] + ring[j][0]) * factor
    yTotal += (ring[i][1] + ring[j][1]) * factor
    j = i
  }
  signedArea /= 2
  return {
    area: signedArea,
    coordinates: signedArea === 0 ? [0, 0] : [xTotal / (signedArea * 6), yTotal / (signedArea * 6)],
  }
}

/**
 * 计算 Polygon 中心点，洞会从权重中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {GeoJSON.Point}
 */
export function polygonCentroid(polygon) {
  let xTotal = 0
  let yTotal = 0
  let areaTotal = 0
  polygon.coordinates.forEach((ring, index) => {
    const result = ringCentroid(ring)
    const weight = index === 0 ? Math.abs(result.area) : -Math.abs(result.area)
    xTotal += result.coordinates[0] * weight
    yTotal += result.coordinates[1] * weight
    areaTotal += weight
  })
  return pointFromCoord([xTotal / areaTotal, yTotal / areaTotal])
}

/**
 * 根据起点、方位角和距离计算目标点。
 * @param {GeoJSON.Point} point
 * @param {number} bearing
 * @param {number} distanceInMeters
 * @returns {GeoJSON.Point}
 */
export function destinationPoint(point, bearing, distanceInMeters) {
  const distance = distanceInMeters / EARTH_RADIUS
  const brng = numberToRadius(bearing)
  const lon1 = numberToRadius(point.coordinates[0])
  const lat1 = numberToRadius(point.coordinates[1])
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance) + Math.cos(lat1) * Math.sin(distance) * Math.cos(brng),
  )
  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distance) * Math.cos(lat1),
      Math.cos(distance) - Math.sin(lat1) * Math.sin(lat2),
    )
  lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
  return pointFromCoord([numberToDegree(lon2), numberToDegree(lat2)])
}

function projectCoordinate(coordinate, referenceLatitude) {
  const metersPerDegree = (6378137 * Math.PI) / 180
  return [
    coordinate[0] * metersPerDegree * Math.cos(numberToRadius(referenceLatitude)),
    coordinate[1] * metersPerDegree,
  ]
}

function perpendicularDistance(point, start, end) {
  const referenceLatitude = (point[1] + start[1] + end[1]) / 3
  const [px, py] = projectCoordinate(point, referenceLatitude)
  const [sx, sy] = projectCoordinate(start, referenceLatitude)
  const [ex, ey] = projectCoordinate(end, referenceLatitude)
  const dx = ex - sx
  const dy = ey - sy
  if (dx === 0 && dy === 0) return Math.sqrt((px - sx) ** 2 + (py - sy) ** 2)
  return Math.abs(dy * px - dx * py + ex * sy - ey * sx) / Math.sqrt(dx ** 2 + dy ** 2)
}

function simplifySection(coordinates, start, end, tolerance, keep) {
  let maxDistance = -1
  let index = start
  for (let i = start + 1; i < end; i += 1) {
    const distance = perpendicularDistance(coordinates[i], coordinates[start], coordinates[end])
    if (distance > maxDistance) {
      index = i
      maxDistance = distance
    }
  }
  if (maxDistance > tolerance) {
    keep.add(index)
    simplifySection(coordinates, start, index, tolerance, keep)
    simplifySection(coordinates, index, end, tolerance, keep)
  }
}

/**
 * 使用 Ramer-Douglas-Peucker 算法简化 GeoJSON Point 数组。
 * @param {GeoJSON.Point[]} source
 * @param {number} [tolerance=20] 米级容差
 * @returns {GeoJSON.Point[]}
 */
export function simplifyPoints(source, tolerance = 20) {
  const coordinates = source.map((point) => point.coordinates)
  if (coordinates.length < 3 || tolerance <= 0) {
    return coordinates.map(pointFromCoord)
  }
  const keep = new Set([0, coordinates.length - 1])
  simplifySection(coordinates, 0, coordinates.length - 1, tolerance, keep)
  return [...keep].sort((a, b) => a - b).map((index) => pointFromCoord(coordinates[index]))
}

export const area = polygonArea
export const centroid = polygonCentroid
export const simplify = simplifyPoints
