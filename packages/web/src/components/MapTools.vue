<script setup>
import { inject, onBeforeUnmount, onMounted } from "vue"
import { MAP_PROVIDE, getMapInjectKey } from "vueleaflet"
import { createDrawTool } from "../draw-tool"
import { createToolPanel } from "./tool-panel"

const props = defineProps({
  mapId: {
    type: String,
    required: true,
  },
  panelTargetId: {
    type: String,
    default: "",
  },
})
const emit = defineEmits(["panel-collapse-change"])

const mapProvider = inject(MAP_PROVIDE)
let drawTool
let toolPanel
let stopped = false

const waitForMap = () =>
  new Promise((resolve) => {
    const key = getMapInjectKey(props.mapId)
    const resolveWhenReady = () => {
      if (stopped) {
        return
      }

      const map = mapProvider?.getMap(key)
      if (map) {
        resolve(map)
        return
      }

      requestAnimationFrame(resolveWhenReady)
    }

    resolveWhenReady()
  })

onMounted(async () => {
  const map = await waitForMap()
  const mapContainer = document.getElementById(props.mapId)

  drawTool = createDrawTool(map)
  drawTool.container.style.position = "absolute"
  drawTool.container.style.left = "16px"
  drawTool.container.style.bottom = "24px"
  mapContainer?.appendChild(drawTool.container)

  const panelParent = props.panelTargetId ? document.getElementById(props.panelTargetId) : null
  const invalidateMapSize = () => {
    requestAnimationFrame(() => map.invalidateSize())
    setTimeout(() => map.invalidateSize(), 220)
  }

  toolPanel = createToolPanel(map, {
    drawTool,
    parent: panelParent,
    onCollapseChange(isCollapsed) {
      emit("panel-collapse-change", isCollapsed)
      invalidateMapSize()
    },
  })
  requestAnimationFrame(() => map.invalidateSize())
})

onBeforeUnmount(() => {
  stopped = true
  drawTool?.container?.remove()
  toolPanel?.remove?.()
})
</script>

<template></template>
