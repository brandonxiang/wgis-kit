import { describe, it, expect } from 'vitest'
import { transformGeoJSON, TRANSFORM_TYPES } from '../src/utils/geojson-transform'

describe('GeoJSON 转换', () => {
  const pointFeature = {
    type: 'Feature',
    properties: { name: 'test point' },
    geometry: { type: 'Point', coordinates: [116.3912757, 39.906101] }
  }

  const lineFeature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [116.3912757, 39.906101],
        [116.39742829, 39.90906171]
      ]
    }
  }

  const polygonWithHole = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[116.0, 39.5], [117.0, 39.5], [117.0, 40.5], [116.0, 40.5], [116.0, 39.5]],
        [[116.2, 39.7], [116.5, 39.7], [116.5, 39.9], [116.2, 39.9], [116.2, 39.7]]
      ]
    }
  }

  describe('FeatureCollection', () => {
    it('转换所有要素', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [pointFeature, lineFeature]
      }
      const result = transformGeoJSON(fc, 'wgs84-gcj02')
      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toHaveLength(2)
      expect(result.features[0].geometry.type).toBe('Point')
      expect(result.features[1].geometry.type).toBe('LineString')
    })
  })

  describe('Feature', () => {
    it('转换 Point', () => {
      const result = transformGeoJSON(pointFeature, 'wgs84-gcj02')
      expect(result.geometry.coordinates[0]).toBeGreaterThan(116.3912757)
    })

    it('转换 Polygon (含孔洞)', () => {
      const result = transformGeoJSON(polygonWithHole, 'wgs84-gcj02')
      expect(result.geometry.coordinates).toHaveLength(2)
      expect(result.geometry.coordinates[0]).toHaveLength(5)
      expect(result.geometry.coordinates[1]).toHaveLength(5)
    })
  })

  describe('GeometryCollection', () => {
    it('转换混合几何', () => {
      const gc = {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [116.0, 39.0] },
          { type: 'LineString', coordinates: [[116.0, 39.0], [117.0, 40.0]] }
        ]
      }
      const result = transformGeoJSON(gc, 'wgs84-gcj02')
      expect(result.geometries).toHaveLength(2)
    })
  })

  describe('3D 坐标', () => {
    it('保留第三维坐标 (高度)', () => {
      const point3D = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [116.0, 39.0, 100] }
      }
      const result = transformGeoJSON(point3D, 'wgs84-gcj02')
      expect(result.geometry.coordinates).toHaveLength(3)
      expect(result.geometry.coordinates[2]).toBe(100)
    })
  })

  describe('错误处理', () => {
    it('无效的 transform 类型抛出错误', () => {
      expect(() => transformGeoJSON(pointFeature, 'invalid'))
        .toThrow('Unknown transform: invalid')
    })

    it('空 GeoJSON', () => {
      const empty = { type: 'Feature', geometry: null }
      const result = transformGeoJSON(empty, 'wgs84-gcj02')
      expect(result.geometry).toBeNull()
    })
  })

  describe('TRANSFORM_TYPES', () => {
    it('包含所有支持的转换类型', () => {
      expect(TRANSFORM_TYPES).toHaveLength(6)
      const values = TRANSFORM_TYPES.map(t => t.value)
      expect(values).toContain('wgs84-gcj02')
      expect(values).toContain('gcj02-wgs84')
      expect(values).toContain('gcj02-bd09')
      expect(values).toContain('bd09-gcj02')
      expect(values).toContain('wgs84-bd09')
      expect(values).toContain('bd09-wgs84')
    })
  })
})
