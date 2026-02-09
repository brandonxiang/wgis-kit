import { describe, it, expect } from 'vitest'
import { readShapefile } from '../src/shapefile/reader'
import path from 'path'
import { readFileSync } from 'fs'

describe('Shapefile 读取', () => {
  const demoPath = path.resolve(__dirname, '../../web/demo-data')

  describe('readShapefile', () => {
    it('读取有效的 SHP 文件', async () => {
      const shpBuffer = readFileSync(`${demoPath}/polygons.shp`)
      const dbfBuffer = readFileSync(`${demoPath}/polygons.dbf`)

      const result = await readShapefile(shpBuffer, dbfBuffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toBeDefined()
      expect(result.features.length).toBeGreaterThan(0)
    })

    it('仅读取 SHP 文件 (无 DBF)', async () => {
      const shpBuffer = readFileSync(`${demoPath}/polygons.shp`)

      const result = await readShapefile(shpBuffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toBeDefined()
    })

    it('返回有效的 GeoJSON 结构', async () => {
      const shpBuffer = readFileSync(`${demoPath}/polygons.shp`)
      const dbfBuffer = readFileSync(`${demoPath}/polygons.dbf`)

      const result = await readShapefile(shpBuffer, dbfBuffer)
      const feature = result.features[0]

      expect(feature.type).toBe('Feature')
      expect(feature.geometry).toBeDefined()
      expect(feature.geometry.type).toBeDefined()
      expect(feature.geometry.coordinates).toBeDefined()
    })
  })
})
