import { describe, expect, it } from "vitest"
import {
  area,
  centroid,
  destinationPoint,
  drawCircle,
  geometryWithinRadius,
  linestringsIntersect,
  pointDistance,
  pointInMultiPolygon,
  pointInPolygon,
  rectangleCentroid,
  simplify,
} from "../src/utils/geojson-utils"

describe("GeoJSON 工具函数", () => {
  it("计算两条 LineString 的交点", () => {
    const diagonalUp = {
      type: "LineString",
      coordinates: [
        [0, 0],
        [10, 10],
      ],
    }
    const diagonalDown = {
      type: "LineString",
      coordinates: [
        [10, 0],
        [0, 10],
      ],
    }
    const farAway = {
      type: "LineString",
      coordinates: [
        [100, 100],
        [110, 110],
      ],
    }

    expect(linestringsIntersect(diagonalUp, diagonalDown)).toEqual([
      { type: "Point", coordinates: [5, 5] },
    ])
    expect(linestringsIntersect(diagonalUp, farAway)).toEqual([])
  })

  it("判断点在 Polygon 和 MultiPolygon 内部", () => {
    const point = { type: "Point", coordinates: [5, 5] }
    const outside = { type: "Point", coordinates: [15, 15] }
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    }
    const multiPolygon = {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
        [
          [
            [20, 20],
            [30, 20],
            [30, 30],
            [20, 30],
            [20, 20],
          ],
        ],
      ],
    }

    expect(pointInPolygon(point, polygon)).toBe(true)
    expect(pointInPolygon(outside, polygon)).toBe(false)
    expect(pointInMultiPolygon(point, multiPolygon)).toBe(true)
  })

  it("正确处理 Polygon holes", () => {
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
        [
          [2, 2],
          [2, 8],
          [8, 8],
          [8, 2],
          [2, 2],
        ],
      ],
    }

    expect(pointInPolygon({ type: "Point", coordinates: [1, 1] }, polygon)).toBe(true)
    expect(pointInPolygon({ type: "Point", coordinates: [5, 5] }, polygon)).toBe(false)
    expect(area(polygon)).toBe(64)
  })

  it("生成圆形 Polygon 并计算矩形中心点", () => {
    const circle = drawCircle(10, { type: "Point", coordinates: [0, 0] }, 50)
    const rectangle = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    }

    expect(circle.type).toBe("Polygon")
    expect(circle.coordinates[0]).toHaveLength(51)
    expect(rectangleCentroid(rectangle)).toEqual({ type: "Point", coordinates: [5, 5] })
  })

  it("计算距离、半径和目标点", () => {
    const oakland = { type: "Point", coordinates: [-122.260000705719, 37.80919060818706] }
    const navalBase = { type: "Point", coordinates: [-122.32083320617676, 37.78774223089045] }
    const destination = destinationPoint(oakland, 180, 2000)

    expect(Math.floor(pointDistance(oakland, navalBase))).toBe(5852)
    expect(geometryWithinRadius(navalBase, oakland, 5853)).toBe(true)
    expect(destination.type).toBe("Point")
    expect(destination.coordinates[1]).toBeLessThan(oakland.coordinates[1])
  })

  it("计算 Polygon 中心点", () => {
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    }

    expect(centroid(polygon)).toEqual({ type: "Point", coordinates: [5, 5] })
  })

  it("使用米级容差简化点数组", () => {
    const points = [
      { type: "Point", coordinates: [0, 0] },
      { type: "Point", coordinates: [0.001, 0.00001] },
      { type: "Point", coordinates: [0.002, 0] },
    ]

    expect(simplify(points, 20)).toEqual([
      { type: "Point", coordinates: [0, 0] },
      { type: "Point", coordinates: [0.002, 0] },
    ])
  })
})
