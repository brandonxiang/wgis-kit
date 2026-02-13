import { Scene, MapService, PointLayer, LineLayer, PolygonLayer, TileLayer } from '@antv/l7'
import { mapConfigs, defaultCenter, defaultZoom } from './map-config'

let scene = null
let currentMapType = 'gaode'
let activeLayers = {
  points: null,
  lines: null,
  polygons: null
}

const mapSelector = document.getElementById('map-selector')
const lngDisplay = document.getElementById('lng')
const latDisplay = document.getElementById('lat')
const zoomDisplay = document.getElementById('zoom')
const currentMapDisplay = document.getElementById('current-map')
const mapInfoDisplay = document.getElementById('map-info')
const mapStatus = document.getElementById('map-status')
const panelToggle = document.getElementById('panel-toggle')
const toolPanel = document.getElementById('tool-panel')

const samplePoints = [
  { lng: 116.397428, lat: 39.90923, name: '北京天安门' },
  { lng: 116.427428, lat: 39.91923, name: '示例点1' },
  { lng: 116.367428, lat: 39.89923, name: '示例点2' },
  { lng: 116.447428, lat: 39.92923, name: '示例点3' },
  { lng: 116.387428, lat: 39.93923, name: '示例点4' }
]

const sampleLines = [
  {
    coordinates: [
      [116.397428, 39.90923],
      [116.407428, 39.91923],
      [116.417428, 39.90923],
      [116.427428, 39.91923]
    ],
    name: '示例路线1'
  },
  {
    coordinates: [
      [116.367428, 39.89923],
      [116.377428, 39.90923],
      [116.387428, 39.89923],
      [116.397428, 39.90923]
    ],
    name: '示例路线2'
  }
]

const samplePolygons = [
  {
    coordinates: [
      [
        [116.387428, 39.93923],
        [116.397428, 39.93923],
        [116.397428, 39.94923],
        [116.387428, 39.94923],
        [116.387428, 39.93923]
      ]
    ],
    name: '示例区域1'
  },
  {
    coordinates: [
      [
        [116.417428, 39.89923],
        [116.427428, 39.89923],
        [116.427428, 39.90923],
        [116.417428, 39.90923],
        [116.417428, 39.89923]
      ]
    ],
    name: '示例区域2'
  }
]

function createPointLayer() {
  if (activeLayers.points) {
    scene.removeLayer(activeLayers.points)
  }

  const pointLayer = new PointLayer({
    zIndex: 10
  })
    .source(samplePoints, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat'
      }
    })
    .shape('circle')
    .size(20)
    .color('#ff6b6b')
    .style({
      stroke: '#fff',
      lineWidth: 2
    })
    .label('name', {
      style: {
        fill: '#333',
        fontSize: 12,
        stroke: '#fff',
        lineWidth: 2
      }
    })

  scene.addLayer(pointLayer)
  activeLayers.points = pointLayer
}

function createLineLayer() {
  if (activeLayers.lines) {
    scene.removeLayer(activeLayers.lines)
  }

  const lineLayer = new LineLayer({
    zIndex: 5
  })
    .source(sampleLines, {
      parser: {
        type: 'json',
        coordinates: 'coordinates'
      }
    })
    .shape('line')
    .size(3)
    .color('#4ecdc4')
    .style({
      lineDash: [0, 0]
    })

  scene.addLayer(lineLayer)
  activeLayers.lines = lineLayer
}

function createPolygonLayer() {
  if (activeLayers.polygons) {
    scene.removeLayer(activeLayers.polygons)
  }

  const polygonLayer = new PolygonLayer({
    zIndex: 1
  })
    .source(samplePolygons, {
      parser: {
        type: 'json',
        coordinates: 'coordinates'
      }
    })
    .shape('fill')
    .color('#45b7d1')
    .style({
      opacity: 0.6
    })
    .label('name', {
      style: {
        fill: '#333',
        fontSize: 11,
        stroke: '#fff',
        lineWidth: 1
      }
    })

  scene.addLayer(polygonLayer)
  activeLayers.polygons = polygonLayer
}

function removeLayer(layerName) {
  if (activeLayers[layerName]) {
    scene.removeLayer(activeLayers[layerName])
    activeLayers[layerName] = null
  }
}

function createBaseMap(mapType) {
  const config = mapConfigs[mapType]
  if (!config) {
    console.error('Unknown map type:', mapType)
    return
  }

  if (scene) {
    scene.destroy()
  }

  const mapService = new MapService({
    mapType: mapType === 'gaode' ? 'amap' : mapType === 'tianditu' ? 'tianditu' : mapType
  })

  if (config.token && config.token !== `YOUR_${mapType.toUpperCase()}_KEY`) {
    mapService.setMapToken(config.token)
  }

  scene = new Scene({
    id: 'map',
    mapService: mapService,
    center: defaultCenter,
    zoom: defaultZoom,
    style: config.style || {}
  })

  scene.on('loaded', () => {
    mapStatus.textContent = '已加载'
    currentMapDisplay.textContent = config.name
    
    mapInfoDisplay.innerHTML = `
      当前底图: ${config.name}<br>
      ${config.token ? 'API Key: 已配置' : 'API Key: 未配置'}
    `

    if (document.querySelector('[data-layer="points"]').checked) {
      createPointLayer()
    }
    if (document.querySelector('[data-layer="lines"]').checked) {
      createLineLayer()
    }
    if (document.querySelector('[data-layer="polygons"]').checked) {
      createPolygonLayer()
    }
  })

  scene.on('zoomchange', () => {
    const zoom = scene.getZoom()
    zoomDisplay.textContent = zoom.toFixed(0)
  })

  scene.on('mousemove', (e) => {
    if (e.lngLat) {
      lngDisplay.textContent = e.lngLat.lng.toFixed(6)
      latDisplay.textContent = e.lngLat.lat.toFixed(6)
    }
  })
}

function switchMap(mapType) {
  if (currentMapType === mapType) return
  
  currentMapType = mapType
  createBaseMap(mapType)
}

function initEventListeners() {
  mapSelector.addEventListener('change', (e) => {
    switchMap(e.target.value)
  })

  document.querySelectorAll('.layer-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const layerName = e.target.dataset.layer
      const layerItem = e.target.closest('.layer-item')
      
      if (e.target.checked) {
        layerItem.classList.add('active')
        switch (layerName) {
          case 'points':
            createPointLayer()
            break
          case 'lines':
            createLineLayer()
            break
          case 'polygons':
            createPolygonLayer()
            break
        }
      } else {
        layerItem.classList.remove('active')
        removeLayer(layerName)
      }
    })
  })

  panelToggle.addEventListener('click', () => {
    if (toolPanel.style.width === '0px' || toolPanel.style.width === '') {
      toolPanel.style.width = '280px'
      toolPanel.style.overflow = 'hidden'
    } else {
      toolPanel.style.width = '0px'
      toolPanel.style.overflow = 'hidden'
    }
  })

  mapStatus.textContent = '加载中...'
}

function init() {
  initEventListeners()
  createBaseMap(currentMapType)
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init)
}

export { scene, switchMap, createPointLayer, createLineLayer, createPolygonLayer }
