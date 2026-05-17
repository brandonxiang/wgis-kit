import type { FeatureCollection } from "geojson"

export type LightweightFormat = "csv" | "wkt" | "kml" | "gpx"

export const lightweightFormats: LightweightFormat[]

export function getLightweightFormats(): LightweightFormat[]

export function readLightweightGeojson(
  text: string,
  format: LightweightFormat | string,
): FeatureCollection

export function writeLightweightGeojson(
  geojson: FeatureCollection,
  format: LightweightFormat | string,
): string

export function csvToGeojson(text: string): FeatureCollection

export function geojsonToCsv(geojson: FeatureCollection): string

export function wktToGeojson(text: string): FeatureCollection

export function geojsonToWkt(geojson: FeatureCollection): string

export function kmlToGeojson(text: string): FeatureCollection

export function geojsonToKml(geojson: FeatureCollection): string

export function gpxToGeojson(text: string): FeatureCollection

export function geojsonToGpx(geojson: FeatureCollection): string
