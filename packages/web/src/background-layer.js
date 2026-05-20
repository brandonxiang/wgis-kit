const commonRasterOptions = {
  tileSize: 256,
  maxZoom: 18,
  maxNativeZoom: 18,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 3,
  detectRetina: true,
}

const createRasterLayerConfig = ({ key, label, urlTemplate, options = {} }) => ({
  key,
  label,
  urlTemplate,
  options: {
    ...commonRasterOptions,
    ...options,
  },
})

const createCompositeRasterLayerConfig = ({ key, label, layers }) => ({
  key,
  label,
  layers: layers.map((layer) => ({
    ...layer,
    options: {
      ...commonRasterOptions,
      ...layer.options,
    },
  })),
})

const createTiandituLayerConfig = ({ key, label, baseType, annotationType, token }) =>
  createCompositeRasterLayerConfig({
    key,
    label,
    layers: [
      {
        urlTemplate: `https://t{s}.tianditu.gov.cn/DataServer?T=${baseType}&x={x}&y={y}&l={z}&tk=${token}`,
        options: {
          subdomains: "01234567",
          attribution: "© 天地图",
        },
      },
      {
        urlTemplate: `https://t{s}.tianditu.gov.cn/DataServer?T=${annotationType}&x={x}&y={y}&l={z}&tk=${token}`,
        options: {
          subdomains: "01234567",
          attribution: "© 天地图",
        },
      },
    ],
  })

const tiandituToken = import.meta.env?.VITE_TIANDITU_TOKEN || ""

const baseTileLayerConfigs = [
  createRasterLayerConfig({
    key: "gaodesat",
    label: "高德影像",
    urlTemplate: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    options: {
      subdomains: "1234",
      attribution: "© 高德地图",
    },
  }),
  createRasterLayerConfig({
    key: "gaode",
    label: "高德标准",
    urlTemplate:
      "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    options: {
      subdomains: "1234",
      attribution: "© 高德地图",
    },
  }),
  createRasterLayerConfig({
    key: "esrisat",
    label: "Esri 影像",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  }),
  createRasterLayerConfig({
    key: "esriStreet",
    label: "Esri 街道",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriTopo",
    label: "Esri 地形",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriLightGray",
    label: "Esri 浅灰",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriDarkGray",
    label: "Esri 深灰",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriTerrain",
    label: "Esri 地貌",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriShadedRelief",
    label: "Esri 阴影地貌",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri",
    },
  }),
  createRasterLayerConfig({
    key: "esriNatGeo",
    label: "Esri NatGeo",
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles © Esri, National Geographic",
    },
  }),
  createRasterLayerConfig({
    key: "geoqBound",
    label: "GeoQ 行政边界",
    urlTemplate:
      "https://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "© GeoQ",
    },
  }),
  createRasterLayerConfig({
    key: "geoqWater",
    label: "GeoQ 水系",
    urlTemplate:
      "https://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "© GeoQ",
    },
  }),
  createRasterLayerConfig({
    key: "osmDe",
    label: "OSM 德国镜像",
    urlTemplate: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
    options: {
      subdomains: "abc",
      attribution: "© OpenStreetMap contributors",
    },
  }),
  createRasterLayerConfig({
    key: "cyclosm",
    label: "CyclOSM",
    urlTemplate: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    options: {
      subdomains: "abc",
      attribution: "© CyclOSM, © OpenStreetMap contributors",
    },
  }),
]

const tiandituLayerConfigs = tiandituToken
  ? [
      createTiandituLayerConfig({
        key: "tiandituVec",
        label: "天地图矢量",
        baseType: "vec_w",
        annotationType: "cva_w",
        token: tiandituToken,
      }),
      createTiandituLayerConfig({
        key: "tiandituImg",
        label: "天地图影像",
        baseType: "img_w",
        annotationType: "cia_w",
        token: tiandituToken,
      }),
      createTiandituLayerConfig({
        key: "tiandituTer",
        label: "天地图地形",
        baseType: "ter_w",
        annotationType: "cta_w",
        token: tiandituToken,
      }),
    ]
  : []

const tileLayerConfigs = [...baseTileLayerConfigs, ...tiandituLayerConfigs]

export { tileLayerConfigs }
