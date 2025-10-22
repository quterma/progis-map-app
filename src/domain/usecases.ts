import type { Layer, MapState, Point, Result } from './types';
import type { OGCServicePort } from './ports';

export function listLayers(svc: OGCServicePort) {
  return svc.listLayers();
}

export function selectLayer(
  layers: Layer[],
  layerId: string,
  visible: boolean,
): Result<Layer[]> {
  const idx = layers.findIndex((l) => l.id === layerId);
  if (idx === -1) return { ok: false, error: { code: 'LAYER_NOT_FOUND' } };

  const next = layers.slice();
  next[idx] = { ...next[idx], visible };

  return { ok: true, value: next };
}

export function setView(
  prev: MapState,
  patch: Partial<MapState>,
): Result<MapState> {
  if (patch.crs && !['EPSG:3857', 'EPSG:4326'].includes(patch.crs))
    return { ok: false, error: { code: 'UNSUPPORTED_CRS' } };

  return { ok: true, value: { ...prev, ...patch } };
}

export async function identifyAt(
  svc: OGCServicePort,
  input: { layerId: string; point: Point; view: MapState },
): Promise<Result<unknown[]>> {
  try {
    const res = await svc.identifyAt(input);
    if (!res.length) return { ok: false, error: { code: 'EMPTY_RESULT' } };

    return { ok: true, value: res };
  } catch {
    return { ok: false, error: { code: 'IDENTIFY_FAILED' } };
  }
}
