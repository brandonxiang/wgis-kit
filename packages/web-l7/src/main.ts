import { Scene } from "@antv/l7";
import { mapConfigs, createMap, MapConfig } from "./background-layer";
import { createToolPanel } from "./tool-panel";

let currentMapConfig = mapConfigs[0];
let scene: Scene;

function initMap() {
  const map = createMap("map", currentMapConfig);

  scene = new Scene({
    id: "map",
    logoPosition: "bottomright",
    map: map,
  });

  scene.on("loaded", () => {
    createToolPanel({ scene });
    createMapControl();
  });
}

function createMapControl() {
  const container = document.createElement("div");
  container.className = "map-control";
  container.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 1000;
  `;

  const title = document.createElement("div");
  title.textContent = "底图切换";
  title.style.cssText = "font-weight: bold; margin-bottom: 8px;";

  container.appendChild(title);

  mapConfigs.forEach((config: MapConfig, index: number) => {
    const btn = document.createElement("button");
    btn.textContent = config.name;
    btn.style.cssText = `
      display: block;
      width: 100%;
      margin-bottom: 4px;
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    `;

    if (index === 0) {
      btn.style.background = "#e6f7ff";
      btn.style.borderColor = "#1890ff";
    }

    btn.addEventListener("click", () => {
      switchMap(config);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((b) => {
        b.style.background = "white";
        b.style.borderColor = "#ddd";
      });
      btn.style.background = "#e6f7ff";
      btn.style.borderColor = "#1890ff";
    });

    container.appendChild(btn);
  });

  document.getElementById("map")?.appendChild(container);
}

function switchMap(config: MapConfig) {
  if (!scene) {
    return;
  }

  const center = scene.getCenter();
  const zoom = scene.getZoom();

  scene.setMap(config.map);

  scene.on("loaded", () => {
    scene.setCenterAndZoom([center.lng, center.lat], zoom);
  });
}

initMap();
