import { describe, it, expect } from 'vitest'
import {
  wgs84togcj02,
  gcj02towgs84,
  gcj02tobd09,
  bd09togcj02,
  out_of_china
} from '../src/utils/coord-transform'

describe('坐标转换函数', () => {
  describe('wgs84togcj02', () => {
    it('转换已知坐标对', () => {
      const [lng, lat] = wgs84togcj02(116.3912757, 39.906101)
      expect(lng).toBeGreaterThan(116.397)
      expect(lng).toBeLessThan(116.398)
      expect(lat).toBeGreaterThan(39.907)
      expect(lat).toBeLessThan(39.908)
    })

    it('境外坐标返回原值', () => {
      const [lng, lat] = wgs84togcj02(-122.4194, 37.7749)
      expect(lng).toBeCloseTo(-122.4194, 5)
      expect(lat).toBeCloseTo(37.7749, 5)
    })

    it('边界坐标', () => {
      const [lng, lat] = wgs84togcj02(73.0, 3.0)
      expect(lng).toBeGreaterThan(73.0)
      expect(lng).toBeLessThan(73.01)
      expect(lat).toBeGreaterThan(2.99)
      expect(lat).toBeLessThan(3.01)
    })
  })

  describe('gcj02towgs84', () => {
    it('双向转换一致性', () => {
      const original = [116.3912757, 39.906101]
      const gcj = wgs84togcj02(...original)
      const back = gcj02towgs84(...gcj)
      expect(back[0]).toBeCloseTo(original[0], 5)
      expect(back[1]).toBeCloseTo(original[1], 5)
    })
  })

  describe('gcj02tobd09 与 bd09togcj02', () => {
    it('双向转换一致性', () => {
      const original = [116.39742829, 39.90906171]
      const bd = gcj02tobd09(...original)
      const back = bd09togcj02(...bd)
      expect(back[0]).toBeCloseTo(original[0], 5)
      expect(back[1]).toBeCloseTo(original[1], 5)
    })
  })

  describe('out_of_china', () => {
    it('返回 true 对于境外坐标', () => {
      expect(out_of_china(-122.4194, 37.7749)).toBe(true)
      expect(out_of_china(139.6917, 35.6895)).toBe(true)
    })

    it('返回 false 对于国内坐标', () => {
      expect(out_of_china(116.39742829, 39.90906171)).toBe(false)
      expect(out_of_china(121.4737, 31.2304)).toBe(false)
    })

    it('边界值测试', () => {
      expect(out_of_china(72.004, 55.8271)).toBe(false)
      expect(out_of_china(137.8347, 55.8271)).toBe(false)
    })
  })
})
