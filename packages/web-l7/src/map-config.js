export const mapConfigs = {
  gaode: {
    name: '高德地图',
    nameEn: 'Gaode Map',
    type: 'amap',
    token: 'YOUR_AMAP_KEY',
    style: 'normal',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
  },
  tianditu: {
    name: '天地图',
    nameEn: 'Tianditu Map',
    type: 'tianditu',
    token: 'YOUR_TIANDITU_KEY',
    style: 'normal',
    url: 'https://t{s}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk={token}'
  },
  tencent: {
    name: '腾讯地图',
    nameEn: 'Tencent Map',
    type: 'tencent',
    token: 'YOUR_TENCENT_KEY',
    style: 'normal',
    url: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0'
  },
  mapbox: {
    name: 'MapBox',
    nameEn: 'MapBox',
    type: 'mapbox',
    token: 'YOUR_MAPBOX_TOKEN',
    style: 'mapbox://styles/mapbox/streets-v12',
    url: 'https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={token}'
  },
  maplibre: {
    name: 'MapLibre',
    nameEn: 'MapLibre',
    type: 'maplibre',
    token: null,
    style: 'https://demotiles.maplibre.org/style.json',
    url: null
  }
}

export const defaultCenter = [116.397428, 39.90923]
export const defaultZoom = 12
export const maxZoom = 18
export const minZoom = 3
