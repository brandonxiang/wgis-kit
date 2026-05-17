/**
 * 角度转弧度
 * @param {number} degrees
 * @returns {number}
 */
export function numberToRadius(degrees: number): number
/**
 * 弧度转角度
 * @param {number} radius
 * @returns {number}
 */
export function numberToDegree(radius: number): number
/**
 * 判断两个 LineString 是否相交，返回交点数组
 * @param {GeoJSON.LineString} line1
 * @param {GeoJSON.LineString} line2
 * @returns {GeoJSON.Point[]}
 */
export function linestringsIntersect(
  line1: GeoJSON.LineString,
  line2: GeoJSON.LineString,
): GeoJSON.Point[]
/**
 * 判断点是否在 Polygon 内。边界点算作在内部，洞内点算作外部。
 * @param {GeoJSON.Point} point
 * @param {GeoJSON.Polygon} polygon
 * @returns {boolean}
 */
export function pointInPolygon(point: GeoJSON.Point, polygon: GeoJSON.Polygon): boolean
/**
 * 判断点是否在 MultiPolygon 内。
 * @param {GeoJSON.Point} point
 * @param {GeoJSON.MultiPolygon} multiPolygon
 * @returns {boolean}
 */
export function pointInMultiPolygon(
  point: GeoJSON.Point,
  multiPolygon: GeoJSON.MultiPolygon,
): boolean
/**
 * 以中心点和半径生成圆形 Polygon。
 * @param {number} radiusInMeters
 * @param {GeoJSON.Point} centerPoint
 * @param {number} [steps=15]
 * @returns {GeoJSON.Polygon}
 */
export function drawCircle(
  radiusInMeters: number,
  centerPoint: GeoJSON.Point,
  steps?: number,
): GeoJSON.Polygon
/**
 * 计算矩形 Polygon 的中心点。
 * @param {GeoJSON.Polygon} rectangle
 * @returns {GeoJSON.Point}
 */
export function rectangleCentroid(rectangle: GeoJSON.Polygon): GeoJSON.Point
/**
 * 计算两个点之间的球面距离，单位米。
 * @param {GeoJSON.Point} point1
 * @param {GeoJSON.Point} point2
 * @returns {number}
 */
export function pointDistance(point1: GeoJSON.Point, point2: GeoJSON.Point): number
/**
 * 判断几何对象是否完全在半径范围内。
 * @param {GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon} geometry
 * @param {GeoJSON.Point} center
 * @param {number} radius
 * @returns {boolean}
 */
export function geometryWithinRadius(
  geometry: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon,
  center: GeoJSON.Point,
  radius: number,
): boolean
/**
 * 计算 Polygon 面积。外环为正，洞会从面积中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {number}
 */
export function polygonArea(polygon: GeoJSON.Polygon): number
/**
 * 计算 Polygon 中心点，洞会从权重中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {GeoJSON.Point}
 */
export function polygonCentroid(polygon: GeoJSON.Polygon): GeoJSON.Point
/**
 * 根据起点、方位角和距离计算目标点。
 * @param {GeoJSON.Point} point
 * @param {number} bearing
 * @param {number} distanceInMeters
 * @returns {GeoJSON.Point}
 */
export function destinationPoint(
  point: GeoJSON.Point,
  bearing: number,
  distanceInMeters: number,
): GeoJSON.Point
/**
 * 使用 Ramer-Douglas-Peucker 算法简化 GeoJSON Point 数组。
 * @param {GeoJSON.Point[]} source
 * @param {number} [tolerance=20] 米级容差
 * @returns {GeoJSON.Point[]}
 */
export function simplifyPoints(source: GeoJSON.Point[], tolerance?: number): GeoJSON.Point[]
/**
 * 计算 Polygon 面积。外环为正，洞会从面积中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {number}
 */
export function area(polygon: GeoJSON.Polygon): number
/**
 * 计算 Polygon 中心点，洞会从权重中扣除。
 * @param {GeoJSON.Polygon} polygon
 * @returns {GeoJSON.Point}
 */
export function centroid(polygon: GeoJSON.Polygon): GeoJSON.Point
/**
 * 使用 Ramer-Douglas-Peucker 算法简化 GeoJSON Point 数组。
 * @param {GeoJSON.Point[]} source
 * @param {number} [tolerance=20] 米级容差
 * @returns {GeoJSON.Point[]}
 */
export function simplify(source: GeoJSON.Point[], tolerance?: number): GeoJSON.Point[]
