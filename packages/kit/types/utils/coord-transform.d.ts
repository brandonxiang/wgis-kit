/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon {number}
 * @param bd_lat {number}
 * @returns {number[]}
 */
export function bd09togcj02(bd_lon: number, bd_lat: number): number[];
/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng {number}
 * @param lat {number}
 * @returns {number[]}
 */
export function gcj02tobd09(lng: number, lat: number): number[];
/**
 * WGS84转GCj02
 * @param lng {number}
 * @param lat {number}
 * @returns {number[]}
 */
export function wgs84togcj02(lng: number, lat: number): number[];
/**
 * GCJ02 转换为 WGS84
 * @param lng {number}
 * @param lat {number}
 * @returns {number[]}
 */
export function gcj02towgs84(lng: number, lat: number): number[];
/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng {number}
 * @param lat {number}
 * @returns {boolean}
 */
export function out_of_china(lng: number, lat: number): boolean;
