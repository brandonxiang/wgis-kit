import { Scene } from "@antv/l7";
import { TMap } from "@antv/l7-maps";

function initMap() {
  const scene = new Scene({
    id: "map",
    logoPosition: "bottomright",
    map: new TMap({
      center: [107.054293, 35.246265],
      zoom: 5,
    }),
    // map: new TencentMap({
    //   style: "style1",
    //   center: [107.054293, 35.246265],
    //   zoom: 4.056,
    // }),
    // map: new GaodeMap({
    //   style: "light",
    //   center: [107.054293, 35.246265],
    //   zoom: 4.056,
    // viewMode: "3D",
    // mapStyle: "amap://styles/darkblue",
    // center: [121.435159, 31.256971],
    // zoom: 14.89,
    // minZoom: 10,
    // }),
  });
}

initMap();
