export type CRS = 'EPSG:3857' | 'EPSG:4326' | string;

export type Point = { x: number; y: number; crs: CRS };
export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  crs: CRS;
};

export type MapState = { center: Point; zoom: number; crs: CRS; bbox?: BBox };

export type LayerKind = 'WMS' | 'WFS';
export type Layer = {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
};

export type Feature = {
  id: string | number;
  geometry: unknown;
  props: Record<string, unknown>;
};

export type DomainErrorCode =
  | 'SERVICE_UNAVAILABLE'
  | 'CAPS_PARSE_FAIL'
  | 'LAYER_NOT_FOUND'
  | 'UNSUPPORTED_CRS'
  | 'IDENTIFY_FAILED'
  | 'EMPTY_RESULT';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: DomainErrorCode; message?: string } };
