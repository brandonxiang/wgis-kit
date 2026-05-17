// @ts-nocheck

const CSV_COORD_KEYS = {
  lng: ["lng", "lon", "longitude", "x"],
  lat: ["lat", "latitude", "y"],
}

export const lightweightFormats = ["csv", "wkt", "kml", "gpx"]

export function getLightweightFormats() {
  return [...lightweightFormats]
}

export function readLightweightGeojson(text, format) {
  const normalized = normalizeFormat(format)
  if (normalized === "csv") return csvToGeojson(text)
  if (normalized === "wkt") return wktToGeojson(text)
  if (normalized === "kml") return kmlToGeojson(text)
  if (normalized === "gpx") return gpxToGeojson(text)
  throw new Error(`Unsupported lightweight format: ${format}`)
}

export function writeLightweightGeojson(geojson, format) {
  const normalized = normalizeFormat(format)
  if (normalized === "csv") return geojsonToCsv(geojson)
  if (normalized === "wkt") return geojsonToWkt(geojson)
  if (normalized === "kml") return geojsonToKml(geojson)
  if (normalized === "gpx") return geojsonToGpx(geojson)
  throw new Error(`Unsupported lightweight format: ${format}`)
}

export function csvToGeojson(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) return featureCollection([])

  const headers = rows[0].map((header) => header.trim())
  const lngIndex = findHeaderIndex(headers, CSV_COORD_KEYS.lng)
  const latIndex = findHeaderIndex(headers, CSV_COORD_KEYS.lat)
  if (lngIndex < 0 || latIndex < 0) {
    throw new Error("CSV 需要包含 lng/lon/x 和 lat/y 列")
  }

  const features = rows.slice(1).flatMap((row, index) => {
    const lng = Number(row[lngIndex])
    const lat = Number(row[latIndex])
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return []

    const properties = {}
    headers.forEach((header, headerIndex) => {
      if (headerIndex !== lngIndex && headerIndex !== latIndex && header) {
        properties[header] = row[headerIndex] ?? ""
      }
    })

    return [
      {
        type: "Feature",
        properties: { id: index + 1, ...properties },
        geometry: { type: "Point", coordinates: [lng, lat] },
      },
    ]
  })

  return featureCollection(features)
}

export function geojsonToCsv(geojson) {
  const rows = [["feature_id", "geometry_type", "coord_index", "lng", "lat", "properties"]]
  geojson.features.forEach((feature, featureIndex) => {
    collectCoordinateRows(feature.geometry).forEach((item, coordIndex) => {
      rows.push([
        String(featureIndex + 1),
        item.type,
        String(coordIndex + 1),
        String(item.coord[0]),
        String(item.coord[1]),
        JSON.stringify(feature.properties ?? {}),
      ])
    })
  })
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")
}

export function wktToGeojson(text) {
  const features = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      type: "Feature",
      properties: { id: index + 1 },
      geometry: parseWktGeometry(line),
    }))
  return featureCollection(features)
}

export function geojsonToWkt(geojson) {
  return geojson.features
    .map((feature) => geometryToWkt(feature.geometry))
    .filter(Boolean)
    .join("\n")
}

export function kmlToGeojson(text) {
  const placemarks = matchAll(text, /<Placemark[\s\S]*?<\/Placemark>/gi)
  const sources = placemarks.length ? placemarks.map((match) => match[0]) : [text]
  const features = []

  sources.forEach((source, index) => {
    const name = stripTags(matchFirst(source, /<name[^>]*>([\s\S]*?)<\/name>/i) ?? "")
    const properties = name ? { name } : { id: index + 1 }
    const point = matchFirst(source, /<Point[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>/i)
    const line = matchFirst(
      source,
      /<LineString[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>/i,
    )
    const polygon = matchFirst(
      source,
      /<Polygon[\s\S]*?<outerBoundaryIs[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>/i,
    )

    if (point) {
      features.push(
        feature({ type: "Point", coordinates: parseCoordinateList(point)[0] }, properties),
      )
    }
    if (line) {
      features.push(
        feature({ type: "LineString", coordinates: parseCoordinateList(line) }, properties),
      )
    }
    if (polygon) {
      features.push(
        feature({ type: "Polygon", coordinates: [parseCoordinateList(polygon)] }, properties),
      )
    }
  })

  return featureCollection(features)
}

export function geojsonToKml(geojson) {
  const placemarks = geojson.features
    .map((item, index) => {
      const name = escapeXml(item.properties?.name || `Feature ${index + 1}`)
      const geometry = geometryToKml(item.geometry)
      if (!geometry) return ""
      return `<Placemark><name>${name}</name>${geometry}</Placemark>`
    })
    .filter(Boolean)
    .join("")
  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${placemarks}</Document></kml>`
}

export function gpxToGeojson(text) {
  const features = []
  matchAll(text, /<wpt\b([^>]*)>([\s\S]*?)<\/wpt>/gi).forEach((match, index) => {
    const point = pointFromAttributes(match[1])
    if (point) {
      features.push(
        feature(point, {
          name: stripTags(
            matchFirst(match[2], /<name[^>]*>([\s\S]*?)<\/name>/i) ?? `Waypoint ${index + 1}`,
          ),
        }),
      )
    }
  })

  matchAll(text, /<rte[\s\S]*?<\/rte>/gi).forEach((route, index) => {
    const coordinates = matchAll(route[0], /<rtept\b([^>]*)>/gi)
      .map((match) => pointFromAttributes(match[1])?.coordinates)
      .filter(Boolean)
    if (coordinates.length) {
      features.push(feature({ type: "LineString", coordinates }, { name: `Route ${index + 1}` }))
    }
  })

  matchAll(text, /<trkseg[\s\S]*?<\/trkseg>/gi).forEach((segment, index) => {
    const coordinates = matchAll(segment[0], /<trkpt\b([^>]*)>/gi)
      .map((match) => pointFromAttributes(match[1])?.coordinates)
      .filter(Boolean)
    if (coordinates.length) {
      features.push(feature({ type: "LineString", coordinates }, { name: `Track ${index + 1}` }))
    }
  })

  return featureCollection(features)
}

export function geojsonToGpx(geojson) {
  const entries = geojson.features
    .map((item, index) => geometryToGpx(item.geometry, item.properties, index))
    .filter(Boolean)
    .join("")
  return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="wgis-kit" xmlns="http://www.topografix.com/GPX/1/1">${entries}</gpx>`
}

function normalizeFormat(format) {
  return String(format).replace(/^\./, "").toLowerCase()
}

function featureCollection(features) {
  return { type: "FeatureCollection", features }
}

function feature(geometry, properties = {}) {
  return { type: "Feature", properties, geometry }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]
    if (quoted && char === '"' && next === '"') {
      cell += '"'
      i += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (!quoted && char === ",") {
      row.push(cell)
      cell = ""
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1
      row.push(cell)
      if (row.some((value) => value !== "")) rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }
  row.push(cell)
  if (row.some((value) => value !== "")) rows.push(row)
  return rows
}

function findHeaderIndex(headers, candidates) {
  const normalized = headers.map((header) => header.toLowerCase())
  return normalized.findIndex((header) => candidates.includes(header))
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? "")
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function parseWktGeometry(wkt) {
  const trimmed = wkt.trim()
  const type = trimmed.split("(")[0].trim().toUpperCase()
  const body = trimmed.slice(trimmed.indexOf("("))
  if (type === "POINT") {
    return { type: "Point", coordinates: parseWktPoint(stripParens(body)) }
  }
  if (type === "LINESTRING") {
    return { type: "LineString", coordinates: parseWktPointList(stripParens(body)) }
  }
  if (type === "POLYGON") {
    return {
      type: "Polygon",
      coordinates: splitWktGroups(stripParens(body)).map((ring) =>
        parseWktPointList(stripParens(ring)),
      ),
    }
  }
  throw new Error(`Unsupported WKT geometry: ${type}`)
}

function geometryToWkt(geometry) {
  if (!geometry) return ""
  if (geometry.type === "Point") return `POINT (${formatWktPoint(geometry.coordinates)})`
  if (geometry.type === "LineString") {
    return `LINESTRING (${geometry.coordinates.map(formatWktPoint).join(", ")})`
  }
  if (geometry.type === "Polygon") {
    return `POLYGON (${geometry.coordinates.map((ring) => `(${ring.map(formatWktPoint).join(", ")})`).join(", ")})`
  }
  if (geometry.type === "MultiPoint") {
    return `MULTIPOINT (${geometry.coordinates.map((coord) => `(${formatWktPoint(coord)})`).join(", ")})`
  }
  if (geometry.type === "MultiLineString") {
    return `MULTILINESTRING (${geometry.coordinates.map((line) => `(${line.map(formatWktPoint).join(", ")})`).join(", ")})`
  }
  if (geometry.type === "MultiPolygon") {
    return `MULTIPOLYGON (${geometry.coordinates.map((polygon) => `(${polygon.map((ring) => `(${ring.map(formatWktPoint).join(", ")})`).join(", ")})`).join(", ")})`
  }
  return ""
}

function stripParens(value) {
  const trimmed = value.trim()
  return trimmed.startsWith("(") && trimmed.endsWith(")") ? trimmed.slice(1, -1) : trimmed
}

function splitWktGroups(value) {
  const groups = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === "(") {
      if (depth === 0) start = i
      depth += 1
    } else if (value[i] === ")") {
      depth -= 1
      if (depth === 0) groups.push(value.slice(start, i + 1))
    }
  }
  return groups
}

function parseWktPointList(value) {
  return value.split(",").map((item) => parseWktPoint(item))
}

function parseWktPoint(value) {
  return value.trim().split(/\s+/).slice(0, 2).map(Number)
}

function formatWktPoint(coord) {
  return `${coord[0]} ${coord[1]}`
}

function parseCoordinateList(value) {
  return value
    .trim()
    .split(/\s+/)
    .map((item) => item.split(",").slice(0, 2).map(Number))
    .filter((coord) => coord.every(Number.isFinite))
}

function geometryToKml(geometry) {
  if (!geometry) return ""
  if (geometry.type === "Point") {
    return `<Point><coordinates>${formatKmlCoord(geometry.coordinates)}</coordinates></Point>`
  }
  if (geometry.type === "LineString") {
    return `<LineString><coordinates>${geometry.coordinates.map(formatKmlCoord).join(" ")}</coordinates></LineString>`
  }
  if (geometry.type === "Polygon") {
    return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${geometry.coordinates[0].map(formatKmlCoord).join(" ")}</coordinates></LinearRing></outerBoundaryIs></Polygon>`
  }
  return ""
}

function formatKmlCoord(coord) {
  return `${coord[0]},${coord[1]},0`
}

function geometryToGpx(geometry, properties = {}, index = 0) {
  const name = escapeXml(properties?.name || `Feature ${index + 1}`)
  if (geometry?.type === "Point") {
    return `<wpt lon="${geometry.coordinates[0]}" lat="${geometry.coordinates[1]}"><name>${name}</name></wpt>`
  }
  if (geometry?.type === "LineString") {
    const points = geometry.coordinates
      .map((coord) => `<trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>`)
      .join("")
    return `<trk><name>${name}</name><trkseg>${points}</trkseg></trk>`
  }
  return ""
}

function pointFromAttributes(attributes) {
  const lat = Number(matchFirst(attributes, /\blat=["']([^"']+)["']/i))
  const lon = Number(matchFirst(attributes, /\b(?:lon|lng)=["']([^"']+)["']/i))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined
  return { type: "Point", coordinates: [lon, lat] }
}

function collectCoordinateRows(geometry) {
  if (!geometry) return []
  if (geometry.type === "Point") return [{ type: "Point", coord: geometry.coordinates }]
  if (geometry.type === "MultiPoint" || geometry.type === "LineString") {
    return geometry.coordinates.map((coord) => ({ type: geometry.type, coord }))
  }
  if (geometry.type === "MultiLineString" || geometry.type === "Polygon") {
    return geometry.coordinates.flat().map((coord) => ({ type: geometry.type, coord }))
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat(2).map((coord) => ({ type: geometry.type, coord }))
  }
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.flatMap((item) => collectCoordinateRows(item))
  }
  return []
}

function matchAll(text, regex) {
  return [...text.matchAll(regex)]
}

function matchFirst(text, regex) {
  return text.match(regex)?.[1]
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "").trim()
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
