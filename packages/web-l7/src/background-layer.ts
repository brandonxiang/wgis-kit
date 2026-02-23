import { Map as L7Map } from "@antv/l7";
import { TMap } from "@antv/l7-maps";

export interface MapConfig {
  name: string;
  map: any;
}

export const mapConfigs: MapConfig[] = [
  {
    name: "天地图",
    map: new TMap({
      center: [107.054293, 35.246265],
      zoom: 5,
    }),
  },
];

export function createMap(container: string, config: MapConfig): L7Map {
  return config.map;
}
