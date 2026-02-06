# wgis-kit

<p align="center">
  <img src="https://img.shields.io/github/license/brandonxiang/wgis-kit" alt="license">
  <img src="https://img.shields.io/badge/pnpm-monorepo-orange" alt="pnpm">
  <img src="https://img.shields.io/badge/leaflet-map-green" alt="leaflet">
  <a href="https://twitter.com/intent/follow?screen_name=xwpisme">
    <img src="https://img.shields.io/twitter/follow/xwpisme?style=social&logo=twitter" alt="follow on Twitter">
  </a>
</p>

<p align="center">
  <b>WebGIS 工具集合 - 专注于地图坐标转换与可视化</b>
</p>

---

## ✨ 功能特性

### 🗺️ 地图选点工具

点击地图即可获取三种坐标系下的坐标值：

| 坐标系 | 说明 | 使用场景 |
|--------|------|----------|
| **WGS84** | 真实坐标 (GPS/谷歌地球) | 国际通用坐标系 |
| **GCJ-02** | 国测局坐标 (火星坐标) | 高德、腾讯地图 |
| **BD-09** | 百度坐标系 | 百度地图 |

### 🔄 坐标转换库 (`@wgis/kit`)

提供常用坐标系之间的互相转换：

```javascript
import { 
  wgs84togcj02,  // WGS84 → GCJ-02
  gcj02towgs84,  // GCJ-02 → WGS84
  gcj02tobd09,   // GCJ-02 → BD-09
  bd09togcj02    // BD-09 → GCJ-02
} from '@wgis/kit'

// 示例：WGS84 转 高德坐标
const [lng, lat] = wgs84togcj02(114.785156, 26.332807)
```

### 🌍 多源底图切换

支持多种在线地图底图：

- **国内地图**: 高德影像、图吧、智图 (GeoQ) 系列
- **国际地图**: Google、Mapbox、OSM、ESRI、Stamen
- **智图系列**: 蓝色、灰色、暖色、水系、边界等多种风格

### 📁 GeoJSON 文件加载

支持本地 GeoJSON 文件拖拽/选择加载，直接在地图上可视化展示。

---

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build
```

## 📦 项目结构

```
wgis-kit/
├── packages/
│   ├── kit/          # 坐标转换核心库
│   └── web/          # 地图可视化 Web 应用
```

## 🔗 在线演示

👉 [Demo](https://brandonxiang.github.io/wgis-kit/)

## 📄 License

[MIT](LICENSE) © Brandon Xiang
