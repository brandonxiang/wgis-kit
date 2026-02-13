import { L } from './config'
import { L7Layer } from '@antv/l7-leaflet'
import { PointLayer, LineLayer, PolygonLayer } from '@antv/l7'

export function addL7Layer(map) {
  const l7Layer = new L7Layer().addTo(map)
  const scene = l7Layer.getScene()

  const pointData = [
    { lng: 116.397428, lat: 39.90923, name: '北京' },
    { lng: 116.427428, lat: 39.91923, name: '示例1' },
    { lng: 116.367428, lat: 39.89923, name: '示例2' },
    { lng: 116.447428, lat: 39.92923, name: '示例3' }
  ]

  const lineData = [
    {
      coordinates: [
        [116.397428, 39.90923],
        [116.407428, 39.91923],
        [116.417428, 39.90923],
        [116.427428, 39.91923]
      ],
      name: '路线1'
    },
    {
      coordinates: [
        [116.367428, 39.89923],
        [116.377428, 39.90923],
        [116.387428, 39.89923]
      ],
      name: '路线2'
    }
  ]

  const polygonData = [
    {
      coordinates: [[
        [116.387428, 39.93923],
        [116.397428, 39.93923],
        [116.397428, 39.94923],
        [116.387428, 39.94923],
        [116.387428, 39.93923]
      ]],
      name: '区域1'
    }
  ]

  const pointLayer = new PointLayer({})
    .source(pointData, {
      parser: { type: 'json', x: 'lng', y: 'lat' }
    })
    .shape('circle')
    .size(20)
    .color('#ff6b6b')
    .style({ stroke: '#fff', lineWidth: 2 })
    .label('name', {
      style: { fill: '#333', fontSize: 12, stroke: '#fff', lineWidth: 2 }
    })

  const lineLayer = new LineLayer({})
    .source(lineData, {
      parser: { type: 'json', coordinates: 'coordinates' }
    })
    .shape('line')
    .size(2)
    .color('#4ecdc4')

  const polygonLayer = new PolygonLayer({})
    .source(polygonData, {
      parser: { type: 'json', coordinates: 'coordinates' }
    })
    .shape('fill')
    .color('#45b7d1')
    .style({ opacity: 0.6 })

  scene.addLayer(pointLayer)
  scene.addLayer(lineLayer)
  scene.addLayer(polygonLayer)

  return { pointLayer, lineLayer, polygonLayer, scene }
}

export { L7Layer, PointLayer, LineLayer, PolygonLayer }
