declare module "shapefile" {
  export function open(
    shp: ArrayBuffer,
    dbf?: ArrayBuffer,
  ): Promise<{
    read(): Promise<{ done: boolean; value?: import("geojson").Feature }>
  }>
}

declare module "shp-write" {
  const shpwrite: {
    download(geojson: any, options?: any): void
    zip(geojson: any, options?: any): Promise<Blob>
  }
  export default shpwrite
}

declare module "dxf" {
  interface DxfEntity {
    type: string
    layer?: string
    color?: string | number
    start?: { x: number; y: number }
    end?: { x: number; y: number }
    vertices?: Array<{ x: number; y: number }>
    points?: Array<{ x: number; y: number }>
    center?: { x: number; y: number }
    x?: number
    y?: number
    radius?: number
    r?: number
    startAngle?: number
    endAngle?: number
    position?: { x: number; y: number }
    text?: string
    height?: number
    boundaryPoints?: Array<{ x: number; y: number }>
    semiMajorAxis?: number
    semiMinorAxis?: number
    controlPoints?: Array<{ x: number; y: number }>
    degree?: number
    knotValues?: number[]
    isClosed?: boolean
    [key: string]: any
  }

  export class Helper {
    constructor(data: string | ArrayBuffer)
    parsed?: { entities: DxfEntity[]; blocks?: any[] }
    groups?: Record<string, any>
  }
}
