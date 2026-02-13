import { L } from './config'
import { L7Layer } from '@antv/l7-leaflet'
import { DrawCircle, DrawLine, DrawPoint, DrawPolygon, DrawRect } from '@antv/l7-draw'

let drawInstance = null

export function createDrawTool(map, options = {}) {
  const defaultOptions = {
    position: 'topright',
    drawStyles: {
      point: {
        fill: '#ff6b6b',
        stroke: '#fff',
        radius: 8
      },
      line: {
        stroke: '#4ecdc4',
        lineWidth: 3
      },
      polygon: {
        fill: '#45b7d1',
        fillOpacity: 0.3,
        stroke: '#45b7d1',
        lineWidth: 2
      }
    }
  }

  const config = { ...defaultOptions, ...options }

  const container = L.DomUtil.create('div', 'draw-control')
  container.innerHTML = `
    <div class="draw-buttons">
      <button class="draw-btn" data-mode="point" title="绘制点">
        <span>📍</span>
      </button>
      <button class="draw-btn" data-mode="line" title="绘制线">
        <span>📏</span>
      </button>
      <button class="draw-btn" data-mode="polygon" title="绘制面">
        <span>⬡</span>
      </button>
      <button class="draw-btn" data-mode="rect" title="绘制矩形">
        <span>⬜</span>
      </button>
      <button class="draw-btn" data-mode="circle" title="绘制圆">
        <span>⭕</span>
      </button>
      <button class="draw-btn" data-mode="delete" title="删除">
        <span>🗑️</span>
      </button>
    </div>
    <style>
      .draw-control {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        padding: 8px;
        z-index: 1000;
      }
      .draw-buttons {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .draw-btn {
        width: 36px;
        height: 36px;
        border: 1px solid #ddd;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .draw-btn:hover {
        background: #f0f0f0;
        border-color: #667eea;
      }
      .draw-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
      }
    </style>
  `

  L.DomEvent.disableClickPropagation(container)

  const l7Layer = new L7Layer().addTo(map)
  const scene = l7Layer.getScene()

  let currentMode = null
  const drawnLayers = []

  container.querySelectorAll('.draw-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = btn.dataset.mode
      handleDrawMode(mode, scene, btn)
    })
  })

  function handleDrawMode(mode, scene, btn) {
    container.querySelectorAll('.draw-btn').forEach(b => b.classList.remove('active'))

    if (currentMode === mode) {
      if (drawInstance) {
        drawInstance.disable()
        drawInstance = null
      }
      currentMode = null
      return
    }

    currentMode = mode
    btn.classList.add('active')

    if (mode === 'delete') {
      clearAllFeatures()
      currentMode = null
      btn.classList.remove('active')
      return
    }

    enableDrawMode(mode, scene)
  }

  function enableDrawMode(mode, scene) {
    if (drawInstance) {
      drawInstance.disable()
      drawInstance = null
    }

    let DrawClass
    switch (mode) {
      case 'point':
        DrawClass = DrawPoint
        break
      case 'line':
        DrawClass = DrawLine
        break
      case 'polygon':
        DrawClass = DrawPolygon
        break
      case 'rect':
        DrawClass = DrawRect
        break
      case 'circle':
        DrawClass = DrawCircle
        break
      default:
        return
    }

    drawInstance = new DrawClass(scene, {
      style: config.drawStyles[mode] || {}
    })

    drawInstance.enable()

    drawInstance.on('drawend', (e) => {
      drawnLayers.push(e.target)
    })
  }

  function clearAllFeatures() {
    if (drawInstance) {
      drawInstance.disable()
      drawInstance = null
    }

    drawnLayers.forEach(layer => {
      if (layer.remove) {
        layer.remove()
      }
    })
    drawnLayers.length = 0
    currentMode = null
  }

  function getDrawnData() {
    return drawnLayers.map(layer => {
      if (layer.getSource && layer.getSource().getData) {
        return layer.getSource().getData()
      }
      return null
    }).filter(Boolean)
  }

  function exportToGeoJSON() {
    const features = []

    drawnLayers.forEach(layer => {
      if (layer.getSource && layer.getSource().getData) {
        const data = layer.getSource().getData()
        if (data && data.features) {
          features.push(...data.features)
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features: features
    }
  }

  return {
    container,
    getDrawnData,
    exportToGeoJSON,
    clearAllFeatures
  }
}

export { DrawCircle, DrawLine, DrawPoint, DrawPolygon, DrawRect }
