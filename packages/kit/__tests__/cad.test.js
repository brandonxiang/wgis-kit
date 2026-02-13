import { describe, it, expect } from 'vitest'
import {
  readCadFile,
  getSupportedFormats,
  isFormatSupported,
  getFileExtension,
  dxfToGeoJSON,
  getEntities,
  getLayers,
  getBoundingBox,
  parseDxf
} from '../src/cad/index'

const sampleDxf = `0
SECTION
2
ENTITIES
0
LINE
5
1
330
0
100
AcDbEntity
  8
0
100
AcDbLine
 10
0.0
 20
0.0
 30
0.0
 11
100.0
 21
100.0
 31
0.0
0
CIRCLE
5
2
330
0
100
AcDbEntity
 8
0
100
AcDbCircle
 10
50.0
 20
50.0
 30
0.0
 40
25.0
0
ENDSEC
0
EOF`

describe('CAD 模块', () => {
  describe('readCadFile', () => {
    it('应该成功解析 DXF 字符串', async () => {
      const result = await readCadFile(sampleDxf, 'dxf')
      expect(result).toHaveProperty('geojson')
      expect(result).toHaveProperty('metadata')
      expect(result.geojson.type).toBe('FeatureCollection')
      expect(result.metadata.format).toBe('dxf')
    })

    it('应该抛出不支持格式的错误', async () => {
      await expect(readCadFile(sampleDxf, 'xyz')).rejects.toThrow('Unsupported format')
    })

    it('应该抛出无缓冲区的错误', async () => {
      await expect(readCadFile(null, 'dxf')).rejects.toThrow('No buffer provided')
    })
  })

  describe('getSupportedFormats', () => {
    it('应该返回支持的格式列表', () => {
      const formats = getSupportedFormats()
      expect(formats).toContain('dxf')
      expect(formats).toContain('dwg')
    })
  })

  describe('isFormatSupported', () => {
    it('应该正确判断支持的格式', () => {
      expect(isFormatSupported('dxf')).toBe(true)
      expect(isFormatSupported('DXF')).toBe(true)
      expect(isFormatSupported('dwg')).toBe(true)
      expect(isFormatSupported('json')).toBe(false)
    })
  })

  describe('getFileExtension', () => {
    it('应该正确提取文件扩展名', () => {
      expect(getFileExtension('test.dxf')).toBe('dxf')
      expect(getFileExtension('test.DWG')).toBe('dwg')
      expect(getFileExtension('test.file.dxf')).toBe('dxf')
      expect(getFileExtension('test')).toBe('')
    })
  })

  describe('parseDxf', () => {
    it('应该成功解析 DXF 字符串', () => {
      const dxf = parseDxf(sampleDxf)
      expect(dxf).toHaveProperty('entities')
      expect(dxf.entities.length).toBeGreaterThan(0)
    })

    it('应该包含 LINE 和 CIRCLE 实体', () => {
      const dxf = parseDxf(sampleDxf)
      const entityTypes = dxf.entities.map(e => e.type)
      expect(entityTypes).toContain('LINE')
      expect(entityTypes).toContain('CIRCLE')
    })
  })

  describe('getEntities', () => {
    it('应该返回实体数组', () => {
      const dxf = parseDxf(sampleDxf)
      const entities = getEntities(dxf)
      expect(Array.isArray(entities)).toBe(true)
      expect(entities.length).toBeGreaterThan(0)
    })
  })

  describe('getLayers', () => {
    it('应该返回图层名称数组', () => {
      const dxf = parseDxf(sampleDxf)
      const layers = getLayers(dxf)
      expect(Array.isArray(layers)).toBe(true)
    })
  })

  describe('getBoundingBox', () => {
    it('应该计算边界框', () => {
      const dxf = parseDxf(sampleDxf)
      const entities = getEntities(dxf)
      const bbox = getBoundingBox(entities)
      expect(bbox).toHaveProperty('minX')
      expect(bbox).toHaveProperty('minY')
      expect(bbox).toHaveProperty('maxX')
      expect(bbox).toHaveProperty('maxY')
      expect(bbox.minX).toBeLessThan(bbox.maxX)
      expect(bbox.minY).toBeLessThan(bbox.maxY)
    })

    it('应该处理空实体数组', () => {
      const bbox = getBoundingBox([])
      expect(bbox.minX).toBe(Infinity)
      expect(bbox.maxX).toBe(-Infinity)
    })
  })

  describe('dxfToGeoJSON', () => {
    it('应该将 DXF 转换为 GeoJSON', () => {
      const dxf = parseDxf(sampleDxf)
      const geojson = dxfToGeoJSON(dxf)
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features.length).toBeGreaterThan(0)
    })

    it('应该正确应用偏移选项', () => {
      const dxf = parseDxf(sampleDxf)
      const geojson = dxfToGeoJSON(dxf, { offset: [100, 200] })
      const firstFeature = geojson.features[0]
      if (firstFeature.geometry.type === 'LineString') {
        const coords = firstFeature.geometry.coordinates
        expect(coords[0][0]).toBe(100)
        expect(coords[0][1]).toBe(200)
      }
    })

    it('应该正确应用缩放选项', () => {
      const dxf = parseDxf(sampleDxf)
      const geojson = dxfToGeoJSON(dxf, { scale: 0.5 })
      expect(geojson.features.length).toBeGreaterThan(0)
    })
  })
})
