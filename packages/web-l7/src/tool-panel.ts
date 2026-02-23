import { Scene, PointLayer, LineLayer, PolygonLayer } from "@antv/l7"
import {
  wgs84togcj02,
  gcj02tobd09,
  readCadFile,
  getSupportedFormats,
  readShapefileFromFiles,
  downloadShapefile,
} from "@wgis/kit"
import type { FeatureCollection } from "geojson"

export interface ToolPanelOptions {
  scene: Scene
  onLayerAdded?: (layer: PointLayer | LineLayer | PolygonLayer) => void
}

let currentGeojson: FeatureCollection | null = null
let currentLayers: (PointLayer | LineLayer | PolygonLayer)[] = []

export function createToolPanel(options: ToolPanelOptions): HTMLElement {
  const { scene, onLayerAdded } = options

  const container = document.createElement("div")
  container.className = "tool-panel"
  container.innerHTML = `
    <div class="tool-panel-header">
      <span>工具箱</span>
      <button class="tool-toggle-btn">−</button>
    </div>
    <div class="tool-panel-content">
      <div class="tool-section">
        <div class="tool-section-title">📁 文件导入</div>
        <div class="tool-tabs">
          <button class="tab-btn active" data-tab="geojson">GeoJSON</button>
          <button class="tab-btn" data-tab="shp">SHP</button>
          <button class="tab-btn" data-tab="cad">CAD</button>
        </div>
        <div class="tab-content active" id="tab-geojson">
          <div class="file-drop-zone" id="geojson-drop-zone">
            <div class="drop-icon">📄</div>
            <div class="drop-text">点击或拖拽 GeoJSON 文件</div>
            <div class="drop-hint">支持 .json, .geojson</div>
            <input type="file" id="geojson-input" accept=".json,.geojson" />
          </div>
          <div class="file-name-display" id="geojson-name">未选择文件</div>
        </div>
        <div class="tab-content" id="tab-shp">
          <div class="shp-file-row">
            <label>.shp</label>
            <input type="file" id="shp-file" accept=".shp" />
            <span class="file-trigger" id="shp-name">选择文件</span>
          </div>
          <div class="shp-file-row">
            <label>.dbf</label>
            <input type="file" id="dbf-file" accept=".dbf" />
            <span class="file-trigger" id="dbf-name">选择文件</span>
          </div>
          <div class="shp-file-row">
            <label>.shx</label>
            <input type="file" id="shx-file" accept=".shx" />
            <span class="file-trigger" id="shx-name">选择文件 (可选)</span>
          </div>
        </div>
        <div class="tab-content" id="tab-cad">
          <div class="file-drop-zone" id="cad-drop-zone">
            <div class="drop-icon">📐</div>
            <div class="drop-text">点击或拖拽 CAD 文件</div>
            <div class="drop-hint">支持 .dxf, .dwg</div>
            <input type="file" id="cad-input" accept=".dxf,.dwg" />
          </div>
          <div class="file-name-display" id="cad-name">未选择文件</div>
          <div class="cad-options" style="margin-top: 12px;">
            <div class="coord-row">
              <label>偏移X</label>
              <input type="number" id="cad-offset-x" value="0" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;" />
            </div>
            <div class="coord-row">
              <label>偏移Y</label>
              <input type="number" id="cad-offset-y" value="0" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;" />
            </div>
            <div class="coord-row">
              <label>缩放</label>
              <input type="number" id="cad-scale" value="1" step="0.1" min="0.001" max="1000" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;" />
            </div>
          </div>
        </div>
        <button class="tool-primary-btn" id="import-btn">导入到地图</button>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">📤 导出数据</div>
        <div class="export-options">
          <label class="checkbox-label">
            <input type="radio" name="export-format" value="geojson" checked />
            <span>GeoJSON</span>
          </label>
          <label class="checkbox-label">
            <input type="radio" name="export-format" value="shp" />
            <span>SHP (ZIP)</span>
          </label>
        </div>
        <button class="tool-secondary-btn" id="export-btn" disabled>导出当前图层</button>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">🔄 坐标转换</div>
        <div class="coord-row">
          <label>源坐标</label>
          <select id="source-crs">
            <option value="wgs84">WGS84 (GPS)</option>
            <option value="gcj02">GCJ-02 (高德)</option>
            <option value="bd09">BD-09 (百度)</option>
          </select>
        </div>
        <div class="coord-row">
          <label>目标坐标</label>
          <select id="target-crs">
            <option value="gcj02">GCJ-02 (高德)</option>
            <option value="wgs84">WGS84 (GPS)</option>
            <option value="bd09">BD-09 (百度)</option>
          </select>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">📍 坐标拾取</div>
        <div class="coord-display">
          <div class="coord-item">
            <span class="coord-label">WGS84</span>
            <span class="coord-value" id="coord-wgs84">点击地图获取</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">GCJ-02</span>
            <span class="coord-value" id="coord-gcj02">-</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">BD-09</span>
            <span class="coord-value" id="coord-bd09">-</span>
          </div>
        </div>
      </div>
      <div class="tool-status" id="tool-status"></div>
    </div>
  `

  document.body.appendChild(container)

  const toggleBtn = container.querySelector(".tool-toggle-btn") as HTMLButtonElement
  const panelContent = container.querySelector(".tool-panel-content") as HTMLElement
  toggleBtn.addEventListener("click", () => {
    const isHidden = panelContent.style.display === "none"
    panelContent.style.display = isHidden ? "block" : "none"
    toggleBtn.textContent = isHidden ? "−" : "+"
  })

  const tabBtns = container.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      container.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
      container.querySelector(`#tab-${(btn as HTMLElement).dataset.tab}`)?.classList.add("active")
    })
  })

  const geojsonInput = container.querySelector("#geojson-input") as HTMLInputElement
  const geojsonDropZone = container.querySelector("#geojson-drop-zone") as HTMLElement
  const geojsonName = container.querySelector("#geojson-name") as HTMLElement
  const shpInput = container.querySelector("#shp-file") as HTMLInputElement
  const dbfInput = container.querySelector("#dbf-file") as HTMLInputElement
  const shxInput = container.querySelector("#shx-file") as HTMLInputElement
  const shpName = container.querySelector("#shp-name") as HTMLElement
  const dbfName = container.querySelector("#dbf-name") as HTMLElement
  const shxName = container.querySelector("#shx-name") as HTMLElement
  const importBtn = container.querySelector("#import-btn") as HTMLButtonElement
  const exportBtn = container.querySelector("#export-btn") as HTMLButtonElement
  const status = container.querySelector("#tool-status") as HTMLElement

  let selectedTab = "geojson"

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedTab = (btn as HTMLElement).dataset.tab || "geojson"
    })
  })

  geojsonDropZone.addEventListener("click", () => geojsonInput.click())
  geojsonDropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    geojsonDropZone.classList.add("drag-over")
  })
  geojsonDropZone.addEventListener("dragleave", () => {
    geojsonDropZone.classList.remove("drag-over")
  })
  geojsonDropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    geojsonDropZone.classList.remove("drag-over")
    const file = e.dataTransfer.files[0]
    if (file) { handleGeojsonFile(file) }
  })
  geojsonInput.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) { handleGeojsonFile(file) }
  })

  function handleGeojsonFile(file: File) {
    if (!file.name.match(/\.(json|geojson)$/i)) {
      showStatus("请选择 GeoJSON 文件", "error")
      return
    }
    geojsonName.textContent = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        currentGeojson = JSON.parse(e.target?.result as string)
        showStatus(`已加载 ${currentGeojson.features?.length || 0} 个要素`, "success")
        exportBtn.disabled = false
      } catch {
        showStatus("文件解析失败", "error")
      }
    }
    reader.readAsText(file, "utf-8")
  }

  const cadInput = container.querySelector("#cad-input") as HTMLInputElement
  const cadDropZone = container.querySelector("#cad-drop-zone") as HTMLElement
  const cadName = container.querySelector("#cad-name") as HTMLElement

  cadDropZone.addEventListener("click", () => cadInput.click())
  cadDropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    cadDropZone.classList.add("drag-over")
  })
  cadDropZone.addEventListener("dragleave", () => {
    cadDropZone.classList.remove("drag-over")
  })
  cadDropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    cadDropZone.classList.remove("drag-over")
    const file = e.dataTransfer.files[0]
    if (file) { handleCadFile(file) }
  })
  cadInput.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) { handleCadFile(file) }
  })

  async function handleCadFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    if (!getSupportedFormats().includes(ext)) {
      showStatus("不支持的文件格式，仅支持 .dxf 和 .dwg", "error")
      return
    }
    cadName.textContent = file.name
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const offsetX = parseFloat((container.querySelector("#cad-offset-x") as HTMLInputElement).value) || 0
        const offsetY = parseFloat((container.querySelector("#cad-offset-y") as HTMLInputElement).value) || 0
        const scale = parseFloat((container.querySelector("#cad-scale") as HTMLInputElement).value) || 1

        const center = scene.getCenter()
        const result = await readCadFile(e.target?.result as ArrayBuffer, ext, {
          offset: [center.lng + offsetX, center.lat + offsetY],
          scale: scale,
        })

        currentGeojson = result.geojson
        showStatus(`已加载 ${currentGeojson.features.length} 个要素 (${result.metadata.format.toUpperCase()})`, "success")
        exportBtn.disabled = false
      } catch (err) {
        console.error(err)
        showStatus(`CAD加载失败: ${(err as Error).message}`, "error")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  shpName.addEventListener("click", () => shpInput.click())
  dbfName.addEventListener("click", () => dbfInput.click())
  shxName.addEventListener("click", () => shxInput.click())

  shpInput.addEventListener("change", (e) => {
    shpName.textContent = (e.target as HTMLInputElement).files?.[0]?.name || "选择文件"
  })
  dbfInput.addEventListener("change", (e) => {
    dbfName.textContent = (e.target as HTMLInputElement).files?.[0]?.name || "选择文件"
  })
  shxInput.addEventListener("change", (e) => {
    shxName.textContent = (e.target as HTMLInputElement).files?.[0]?.name || "选择文件 (可选)"
  })

  importBtn.addEventListener("click", async () => {
    try {
      showStatus("正在加载...", "loading")

      if (selectedTab === "geojson") {
        if (!currentGeojson) {
          showStatus("请先选择 GeoJSON 文件", "error")
          return
        }
      } else if (selectedTab === "shp") {
        const shpFile = shpInput.files?.[0]
        if (!shpFile) {
          showStatus("请选择 .shp 文件", "error")
          return
        }
        const dbfFile = dbfInput.files?.[0]
        currentGeojson = await readShapefileFromFiles(shpFile, dbfFile)
        showStatus(`已加载 ${currentGeojson.features.length} 个要素`, "success")
      } else if (selectedTab === "cad") {
        if (!currentGeojson) {
          showStatus("请先选择 CAD 文件", "error")
          return
        }
      }

      currentLayers.forEach((layer) => scene.removeLayer(layer))
      currentLayers = []

      const layers = addGeoJSONToScene(scene, currentGeojson)
      currentLayers = layers
      layers.forEach((layer) => {
        if (onLayerAdded) { onLayerAdded(layer) }
      })

      showStatus(`已导入 ${currentGeojson.features.length} 个要素`, "success")
    } catch (err) {
      console.error(err)
      showStatus(`加载失败: ${(err as Error).message}`, "error")
    }
  })

  exportBtn.addEventListener("click", () => {
    if (!currentGeojson) {
      showStatus("没有可导出的数据", "error")
      return
    }

    const format = (container.querySelector('input[name="export-format"]:checked') as HTMLInputElement)?.value
    const filename = "wgis_export"

    if (format === "geojson") {
      const blob = new Blob([JSON.stringify(currentGeojson, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}.geojson`
      a.click()
      URL.revokeObjectURL(url)
      showStatus("GeoJSON 已导出", "success")
    } else {
      downloadShapefile(currentGeojson, filename)
      showStatus("SHP 已导出", "success")
    }
  })

  const coordWgs84 = container.querySelector("#coord-wgs84") as HTMLElement
  const coordGcj02 = container.querySelector("#coord-gcj02") as HTMLElement
  const coordBd09 = container.querySelector("#coord-bd09") as HTMLElement

  scene.on("click", (e: any) => {
    const lng = e.lnglat?.lng
    const lat = e.lnglat?.lat

    if (lng === undefined || lat === undefined) { return }

    coordWgs84.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`

    const gcj = wgs84togcj02(lng, lat)
    coordGcj02.textContent = `${gcj[1].toFixed(6)}, ${gcj[0].toFixed(6)}`

    const bd = gcj02tobd09(gcj[0], gcj[1])
    coordBd09.textContent = `${bd[1].toFixed(6)}, ${bd[0].toFixed(6)}`
  })

  function showStatus(msg: string, type: string) {
    status.textContent = msg
    status.className = `tool-status ${type}`
  }

  return container
}

function addGeoJSONToScene(
  scene: Scene,
  geojson: FeatureCollection,
): (PointLayer | LineLayer | PolygonLayer)[] {
  const layers: (PointLayer | LineLayer | PolygonLayer)[] = []

  const pointFeatures = geojson.features.filter((f) => f.geometry.type === "Point" || f.geometry.type === "MultiPoint")
  const lineFeatures = geojson.features.filter(
    (f) => f.geometry.type === "LineString" || f.geometry.type === "MultiLineString",
  )
  const polygonFeatures = geojson.features.filter(
    (f) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon",
  )

  if (pointFeatures.length > 0) {
    const pointLayer = new PointLayer({
      autoFit: true,
    })
      .source(pointFeatures)
      .shape("circle")
      .size(15)
      .color("#3388ff")
      .style({ stroke: "#fff", lineWidth: 2 })
    scene.addLayer(pointLayer)
    layers.push(pointLayer)
  }

  if (lineFeatures.length > 0) {
    const lineLayer = new LineLayer({
      autoFit: true,
    })
      .source(lineFeatures)
      .shape("line")
      .size(2)
      .color("#4ecdc4")
    scene.addLayer(lineLayer)
    layers.push(lineLayer)
  }

  if (polygonFeatures.length > 0) {
    const polygonLayer = new PolygonLayer({
      autoFit: true,
    })
      .source(polygonFeatures)
      .shape("fill")
      .color("#45b7d1")
      .style({ opacity: 0.6 })
    scene.addLayer(polygonLayer)
    layers.push(polygonLayer)
  }

  return layers
}
