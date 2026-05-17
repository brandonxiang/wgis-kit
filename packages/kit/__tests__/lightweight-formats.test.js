import { describe, expect, it } from "vitest"
import {
  csvToGeojson,
  geojsonToCsv,
  geojsonToGpx,
  geojsonToKml,
  geojsonToWkt,
  gpxToGeojson,
  kmlToGeojson,
  readLightweightGeojson,
  wktToGeojson,
  writeLightweightGeojson,
} from "../src/utils/lightweight-formats"

const sampleGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "A" },
      geometry: { type: "Point", coordinates: [120, 30] },
    },
    {
      type: "Feature",
      properties: { name: "Line" },
      geometry: {
        type: "LineString",
        coordinates: [
          [120, 30],
          [121, 31],
        ],
      },
    },
  ],
}

describe("轻量格式转换", () => {
  it("导入和导出 CSV 点表", () => {
    const geojson = csvToGeojson("name,lng,lat\nA,120,30\nB,121,31")
    const csv = geojsonToCsv(geojson)

    expect(geojson.features).toHaveLength(2)
    expect(geojson.features[0].geometry.coordinates).toEqual([120, 30])
    expect(csv).toContain("feature_id,geometry_type,coord_index,lng,lat,properties")
  })

  it("导入和导出 WKT", () => {
    const geojson = wktToGeojson("POINT (120 30)\nLINESTRING (120 30, 121 31)")
    const wkt = geojsonToWkt(geojson)

    expect(geojson.features.map((feature) => feature.geometry.type)).toEqual([
      "Point",
      "LineString",
    ])
    expect(wkt).toContain("POINT (120 30)")
    expect(wkt).toContain("LINESTRING (120 30, 121 31)")
  })

  it("导入和导出 KML", () => {
    const kml = geojsonToKml(sampleGeojson)
    const geojson = kmlToGeojson(kml)

    expect(kml).toContain("<kml")
    expect(geojson.features.map((feature) => feature.geometry.type)).toEqual([
      "Point",
      "LineString",
    ])
  })

  it("导入和导出 GPX", () => {
    const gpx = geojsonToGpx(sampleGeojson)
    const geojson = gpxToGeojson(gpx)

    expect(gpx).toContain("<gpx")
    expect(geojson.features.map((feature) => feature.geometry.type)).toEqual([
      "Point",
      "LineString",
    ])
  })

  it("提供统一读写入口", () => {
    const geojson = readLightweightGeojson("POINT (120 30)", "wkt")
    const output = writeLightweightGeojson(geojson, "wkt")

    expect(geojson.features).toHaveLength(1)
    expect(output).toBe("POINT (120 30)")
  })
})
