<script setup>
import { computed, ref } from "vue";
import { LMap, LTileLayer } from "vueleaflet";
import MapTools from "./components/MapTools.vue";
import { tileLayerConfigs } from "./background-layer";

const selectedLayerKey = ref("gaodesat");
const mapOptions = {
  center: [26.33280692289788, 114.78515624999999],
  zoom: 5,
};

const selectedLayer = computed(
  () => tileLayerConfigs.find((layer) => layer.key === selectedLayerKey.value) || tileLayerConfigs[0],
);
</script>

<template>
  <div class="map-shell">
    <LMap id="map" class="map-root" :options="mapOptions">
      <LTileLayer
        :key="selectedLayer.key"
        :url-template="selectedLayer.urlTemplate"
        :options="selectedLayer.options"
      />
      <MapTools map-id="map" />
    </LMap>

    <div class="layer-switcher" aria-label="底图切换">
      <label class="layer-switcher-label" for="base-layer">底图</label>
      <select id="base-layer" v-model="selectedLayerKey">
        <option v-for="layer in tileLayerConfigs" :key="layer.key" :value="layer.key">
          {{ layer.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.map-shell,
.map-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.layer-switcher {
  position: absolute;
  top: 12px;
  left: 52px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.layer-switcher-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.layer-switcher select {
  min-width: 160px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 5px 8px;
  color: #333;
  background: #fff;
}
</style>
