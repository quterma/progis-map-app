import L, { Map as LMap, Layer as LLayer, LatLng } from 'leaflet';

export function whenReady(h: MapHandle, cb: () => void) {
  h.map.whenReady(cb);
}

export type MapHandle = {
  map: LMap;
  layers: Record<string, LLayer>;
  selection?: LLayer | null;
};

export function createMap(
  el: HTMLElement,
  opts: { center: [number, number]; zoom: number },
): MapHandle {
  const map = L.map(el).setView(opts.center, opts.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map);
  return { map, layers: {}, selection: null };
}

export function setView(h: MapHandle, center: [number, number], zoom: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m: any = h.map;
  if (!m || !m._mapPane) return;

  requestAnimationFrame(() => {
    if (!m._mapPane) return;
    h.map.invalidateSize(false);
    h.map.setView(center, zoom, { animate: true });
  });
}

export function addWms(
  h: MapHandle,
  id: string,
  url: string,
  options: L.WMSOptions & { layers: string },
) {
  if (h.layers[id]) h.map.removeLayer(h.layers[id]);
  const wms = L.tileLayer.wms(url, options).addTo(h.map);
  h.layers[id] = wms;
  return wms;
}

export function removeLayer(h: MapHandle, id: string) {
  const l = h.layers[id];
  if (l) {
    h.map.removeLayer(l);
    delete h.layers[id];
  }
}

export function destroy(h: MapHandle) {
  clearSelection(h);
  Object.keys(h.layers).forEach((id) => removeLayer(h, id));
  h.map.remove();
}

export function onMapClick(h: MapHandle, cb: (ll: LatLng) => void) {
  h.map.on('click', (e) => cb(e.latlng));
}

export function getView(h: MapHandle) {
  const c = h.map.getCenter();
  const z = h.map.getZoom();
  return {
    center: { x: c.lng, y: c.lat, crs: 'EPSG:4326' },
    zoom: z,
    crs: 'EPSG:4326' as const,
  };
}

export function showPopup(h: MapHandle, ll: LatLng, html: string) {
  const p = L.popup().setLatLng(ll).openOn(h.map);
  p.setContent(html);
}

/** ---------- WMS GetFeatureInfo URL (1.1.1) ---------- */
function buildGfiUrl(
  h: MapHandle,
  baseUrl: string,
  params: { layers: string; infoFormat?: string },
) {
  const size = h.map.getSize();
  const b = h.map.getBounds();
  const sw = b.getSouthWest(),
    ne = b.getNorthEast();
  const bbox = [sw.lng, sw.lat, ne.lng, ne.lat].join(',');
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('SERVICE', 'WMS');
  url.searchParams.set('REQUEST', 'GetFeatureInfo');
  url.searchParams.set('VERSION', '1.1.1');
  url.searchParams.set('LAYERS', params.layers);
  url.searchParams.set('QUERY_LAYERS', params.layers);
  url.searchParams.set('SRS', 'EPSG:4326');
  url.searchParams.set('BBOX', bbox);
  url.searchParams.set('WIDTH', String(size.x));
  url.searchParams.set('HEIGHT', String(size.y));
  url.searchParams.set('INFO_FORMAT', params.infoFormat ?? 'application/json');
  url.searchParams.set('FEATURE_COUNT', '10');
  url.searchParams.set('STYLES', '');
  return url;
}

export async function identifyWms(
  h: MapHandle,
  ll: L.LatLng,
  baseUrl: string,
  params: { layers: string; infoFormat?: string },
) {
  const url = buildGfiUrl(h, baseUrl, params);
  const pt = h.map.latLngToContainerPoint(ll);
  url.searchParams.set('X', String(Math.round(pt.x)));
  url.searchParams.set('Y', String(Math.round(pt.y)));
  return url.toString();
}

/** ---------- Selection helpers ---------- */
export function clearSelection(h: MapHandle) {
  if (h.selection) {
    h.map.removeLayer(h.selection);
    h.selection = null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function highlightGeoJSON(h: MapHandle, geojson: any) {
  clearSelection(h);
  h.selection = L.geoJSON(geojson, {
    style: () => ({ color: '#ff3b30', weight: 3, fillOpacity: 0.15 }),
    pointToLayer: (_f, latlng) =>
      L.circleMarker(latlng, { radius: 6, color: '#ff3b30', weight: 2 }),
  }).addTo(h.map);
  return h.selection;
}

export function highlightPoint(h: MapHandle, ll: LatLng) {
  clearSelection(h);
  h.selection = L.circleMarker(ll, {
    radius: 6,
    color: '#ff3b30',
    weight: 2,
    fillOpacity: 0.6,
  }).addTo(h.map);
  return h.selection;
}
