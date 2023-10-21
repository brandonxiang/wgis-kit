import { L } from './config'

const mapbox = new L.TileLayer(
  "https://a.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWc2enkwMWk0dWRtM3Qwd3J5dHo2In0.42pdJNpJD8BAalQ3nM8KQg",
  {
    id: "mapbox.Street",
  }
);
const osm = new L.TileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {}
);
const mapquest = new L.TileLayer(
  "http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png",
  {
    subdomains: "1234",
  }
);
const mapquest1 = new L.TileLayer(
  "https://{s}.tiles.mapquest.com/render/latest/vivid/{z}/{x}/{y}/256/png",
  {
    subdomains: "abc",
  }
);
const mapquestsat = new L.TileLayer(
  "http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
  {
    subdomains: "1234",
  }
);
const tianditu = new L.TileLayer(
  "http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
  {
    subdomains: "01234567",
  }
);
const tianditusat = new L.TileLayer(
  "http://t{s}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
  {
    subdomains: "01234567",
  }
);
const tianditusurface = new L.TileLayer(
  "http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}",
  {
    subdomains: "01234567",
  }
);
const gaode = new L.TileLayer(
  "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z=d{z}",
  {
    subdomains: "1234",
  }
);
const gaode1 = new L.TileLayer(
  "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z=d{z}",
  {
    subdomains: "1234",
  }
);
const gaodesat = new L.TileLayer(
  "http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  {
    subdomains: "1234",
  }
);
const tuba = new L.TileLayer(
  "http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}",
  {
    subdomains: "0123",
  }
);
const geoqBlue = new L.TileLayer(
  "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "点击地图任意处，获取百度和火星坐标"
  }
);
const geoqCommunity = new L.TileLayer(
  "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqGray = new L.TileLayer(
  "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoColor = new L.TileLayer(
  "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqWarm = new L.TileLayer(
  " http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqBound = new L.TileLayer(
  "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqBoundonly = new L.TileLayer(
  "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundary/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqWater = new L.TileLayer(
  "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}",
  {}
);
const geoqRailway = new L.TileLayer(
  "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/Subway/MapServer/tile/{z}/{y}/{x}",
  {}
);
const StamenToner = new L.TileLayer(
  "http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png",
  {}
);
const StamenWaterColor = new L.TileLayer(
  "http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png",
  {}
);
const OpenTopoMap = new L.TileLayer(
  "http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {}
);
const atlaslight = new L.TileLayer('http://42.120.180.211:8080/mapservice?t=1&c={constiant}&x={x}&y={y}&z={z}&size=1&v=light',{})
const esrisat = new L.TileLayer(
  "http://server.arcgisonline.com/arcgis/rest/services/world_imagery/mapserver/tile/{z}/{y}/{x}",
  {}
);
const google = new L.TileLayer(
  "http://khm0.googleapis.com/kh?v=203&hl=zh-CN&&x={x}&y={y}&z={z}",
  {}
);

export {
    mapbox,
    osm,
    mapquest,
    mapquest1,
    mapquestsat,
    tianditu,
    tianditusat,
    tianditusurface,
    gaode,
    gaode1,
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
    geoqRailway,
    StamenToner,
    StamenWaterColor,
    OpenTopoMap,
    atlaslight,
    esrisat,
    google,
}