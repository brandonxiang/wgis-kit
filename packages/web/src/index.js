import {
  mapbox,
  osm,
  mapquest,
  mapquest1,
  gaodesat,
  tuba,
  geoqBlue,
  geoqCommunity,
  geoqGray,
  geoColor,
  geoqWarm,
  geoqBound,
  geoqBoundonly,
  geoqWater,
  StamenToner,
  StamenWaterColor,
  esrisat,
  google,
} from "./background-layer";
import { L } from "./config";
import { wgs84togcj02, gcj02tobd09 } from "@wgis/kit";
import { createToolPanel } from "./components/tool-panel";

var map = new L.Map("map", {
  center: new L.LatLng(26.33280692289788, 114.78515624999999),
  zoom: 5,
});

L.control
  .layers(
    {
      geoqBlue: geoqBlue.addTo(map),
      高德影像: gaodesat,
      esrisat: esrisat,
      MapQuest: mapquest1,
      谷歌影像: google,
      Mapbox: mapbox,
      osm: osm,
      MapQuest: mapquest,
      图吧: tuba,
      geoqCommunity: geoqCommunity,
      geoqGray: geoqGray,
      geoColor: geoColor,
      geoqWarm: geoqWarm,
      geoqBound: geoqBound,
      geoqBoundonly: geoqBoundonly,
      geoqWater: geoqWater,
      StamenToner: StamenToner,
      StamenWaterColor: StamenWaterColor,
    },
    {},
    { position: "topleft" },
  )
  .addTo(map);

createToolPanel(map);
