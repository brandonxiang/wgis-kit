import { L } from "../config"
import { wgs84togcj02, gcj02tobd09, readCadFile, getSupportedFormats } from "@wgis/kit"
import { readShapefileFromFiles, downloadShapefile } from "@wgis/kit"

export function createToolPanel(map, options = {}) {
  const container = L.DomUtil.create("div", "tool-panel")
  container.innerHTML = `
    <div class="tool-panel-header">
      <span>工具箱</span>
      <button class="tool-toggle-btn" type="button" aria-label="折叠工具箱" aria-expanded="true">−</button>
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
        <div class="coord-row">
          <label>应用范围</label>
          <select id="transform-scope">
            <option value="import">导入时</option>
            <option value="export">导出时</option>
            <option value="both">导入和导出</option>
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

  L.DomEvent.disableClickPropagation(container)
  L.DomEvent.disableScrollPropagation(container)

  const toggleBtn = container.querySelector(".tool-toggle-btn")
  const panelContent = container.querySelector(".tool-panel-content")
  toggleBtn.addEventListener("click", () => {
    const isCollapsed = container.classList.toggle("collapsed")
    panelContent.hidden = isCollapsed
    toggleBtn.textContent = isCollapsed ? "+" : "−"
    toggleBtn.setAttribute("aria-expanded", String(!isCollapsed))
  })

  const tabBtns = container.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      container.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
      container.querySelector(`#tab-${btn.dataset.tab}`).classList.add("active")
    })
  })

  const geojsonInput = container.querySelector("#geojson-input")
  const geojsonDropZone = container.querySelector("#geojson-drop-zone")
  const geojsonName = container.querySelector("#geojson-name")
  const shpInput = container.querySelector("#shp-file")
  const dbfInput = container.querySelector("#dbf-file")
  const shxInput = container.querySelector("#shx-file")
  const shpName = container.querySelector("#shp-name")
  const dbfName = container.querySelector("#dbf-name")
  const shxName = container.querySelector("#shx-name")
  const importBtn = container.querySelector("#import-btn")
  const exportBtn = container.querySelector("#export-btn")
  const status = container.querySelector("#tool-status")
  const drawTool = options.drawTool

  let currentGeojson = null
  let currentLayer = null
  let selectedTab = "geojson"

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedTab = btn.dataset.tab
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
    if (file) {
      handleGeojsonFile(file)
    }
  })
  geojsonInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      handleGeojsonFile(file)
    }
  })

  function handleGeojsonFile(file) {
    if (!file.name.match(/\.(json|geojson)$/i)) {
      showStatus("请选择 GeoJSON 文件", "error")
      return
    }
    geojsonName.textContent = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        currentGeojson = JSON.parse(e.target.result)
        showStatus(`已加载 ${currentGeojson.features?.length || 0} 个要素`, "success")
        syncExportButton()
      } catch {
        showStatus("文件解析失败", "error")
      }
    }
    reader.readAsText(file, "utf-8")
  }

  const cadInput = container.querySelector("#cad-input")
  const cadDropZone = container.querySelector("#cad-drop-zone")
  const cadName = container.querySelector("#cad-name")

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
    if (file) {
      handleCadFile(file)
    }
  })
  cadInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      handleCadFile(file)
    }
  })

  function handleCadFile(file) {
    const ext = file.name.split(".").pop().toLowerCase()
    if (!getSupportedFormats().includes(ext)) {
      showStatus("不支持的文件格式，仅支持 .dxf 和 .dwg", "error")
      return
    }
    cadName.textContent = file.name
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const offsetX = parseFloat(container.querySelector("#cad-offset-x").value) || 0
        const offsetY = parseFloat(container.querySelector("#cad-offset-y").value) || 0
        const scale = parseFloat(container.querySelector("#cad-scale").value) || 1

        const center = map.getCenter()
        const result = await readCadFile(e.target.result, ext, {
          offset: [center.lng + offsetX, center.lat + offsetY],
          scale: scale,
        })

        currentGeojson = result.geojson
        showStatus(
          `已加载 ${currentGeojson.features.length} 个要素 (${result.metadata.format.toUpperCase()})`,
          "success",
        )
        syncExportButton()
      } catch (err) {
        console.error(err)
        showStatus(`CAD加载失败: ${err.message}`, "error")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  shpName.addEventListener("click", () => shpInput.click())
  dbfName.addEventListener("click", () => dbfInput.click())
  shxName.addEventListener("click", () => shxInput.click())

  shpInput.addEventListener("change", (e) => {
    shpName.textContent = e.target.files[0]?.name || "选择文件"
  })
  dbfInput.addEventListener("change", (e) => {
    dbfName.textContent = e.target.files[0]?.name || "选择文件"
  })
  shxInput.addEventListener("change", (e) => {
    shxName.textContent = e.target.files[0]?.name || "选择文件 (可选)"
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
        const shpFile = shpInput.files[0]
        if (!shpFile) {
          showStatus("请选择 .shp 文件", "error")
          return
        }
        const dbfFile = dbfInput.files[0]
        currentGeojson = await readShapefileFromFiles(shpFile, dbfFile)
        showStatus(`已加载 ${currentGeojson.features.length} 个要素`, "success")
        syncExportButton()
      } else if (selectedTab === "cad") {
        if (!currentGeojson) {
          showStatus("请先选择 CAD 文件", "error")
          return
        }
      }

      if (currentLayer) {
        map.removeLayer(currentLayer)
      }

      currentLayer = L.geoJSON(currentGeojson, {
        style: {
          color: "#3388ff",
          weight: 2,
          fillOpacity: 0.3,
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#3388ff",
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8,
          })
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const props = Object.entries(feature.properties)
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join("<br>")
            layer.bindPopup(props || "无属性")
          }
        },
      }).addTo(map)

      const bounds = currentLayer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds)
      }

      showStatus(`已导入 ${currentGeojson.features.length} 个要素`, "success")
    } catch (err) {
      console.error(err)
      showStatus(`加载失败: ${err.message}`, "error")
    }
  })

  exportBtn.addEventListener("click", () => {
    const exportGeojson = getExportGeojson()
    if (!exportGeojson.features.length) {
      showStatus("没有可导出的数据", "error")
      return
    }

    const format = container.querySelector('input[name="export-format"]:checked').value
    const filename = "wgis_export"

    if (format === "geojson") {
      const blob = new Blob([JSON.stringify(exportGeojson, null, 2)], {
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
      downloadShapefile(exportGeojson, filename)
      showStatus("SHP 已导出", "success")
    }
  })

  drawTool?.onChange?.(() => {
    syncExportButton()
  })

  const coordWgs84 = container.querySelector("#coord-wgs84")
  const coordGcj02 = container.querySelector("#coord-gcj02")
  const coordBd09 = container.querySelector("#coord-bd09")

  map.on("click", (e) => {
    const latlng = e.latlng
    coordWgs84.textContent = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`

    const gcj = wgs84togcj02(latlng.lng, latlng.lat)
    coordGcj02.textContent = `${gcj[1].toFixed(6)}, ${gcj[0].toFixed(6)}`

    const bd = gcj02tobd09(gcj[0], gcj[1])
    coordBd09.textContent = `${bd[1].toFixed(6)}, ${bd[0].toFixed(6)}`
  })

  function showStatus(msg, type) {
    status.textContent = msg
    status.className = `tool-status ${type}`
  }

  function getExportGeojson() {
    const features = []

    if (currentGeojson?.features?.length) {
      features.push(...currentGeojson.features)
    }

    const drawnGeojson = drawTool?.exportToGeoJSON?.()
    if (drawnGeojson?.features?.length) {
      features.push(...drawnGeojson.features)
    }

    return {
      type: "FeatureCollection",
      features,
    }
  }

  function syncExportButton() {
    exportBtn.disabled = !getExportGeojson().features.length
  }

  return container
}
