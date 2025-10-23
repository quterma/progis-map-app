import L, { Map as LMap, Layer as LLayer, LatLng } from 'leaflet';

export type MapHandle = { map: LMap; layers: Record<string, LLayer> };

export function createMap(
  el: HTMLElement,
  opts: { center: [number, number]; zoom: number },
): MapHandle {
  const map = L.map(el).setView(opts.center, opts.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map);
  return { map, layers: {} };
}
export function setView(h: MapHandle, center: [number, number], zoom: number) {
  h.map.setView(center, zoom);
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
    center: { x: c.lng, y: c.lat, crs: 'EPSG:4326' }, // было 3857
    zoom: z,
    crs: 'EPSG:4326' as const,
  };
}

export function showPopup(h: MapHandle, ll: LatLng, html: string) {
  L.popup().setLatLng(ll).setContent(html).openOn(h.map);
}

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
  url.searchParams.set('VERSION', '1.1.1'); // ⬅
  url.searchParams.set('LAYERS', params.layers);
  url.searchParams.set('QUERY_LAYERS', params.layers);
  url.searchParams.set('SRS', 'EPSG:4326'); // ⬅
  url.searchParams.set('BBOX', bbox);
  url.searchParams.set('WIDTH', String(size.x));
  url.searchParams.set('HEIGHT', String(size.y));
  url.searchParams.set('INFO_FORMAT', params.infoFormat ?? 'application/json');
  // координата клика в пикселях → X/Y (1.1.1)
  // const pt = h.map.latLngToContainerPoint(h.map.getCenter()); // заглушка; реальный X/Y проставим в identifyWms
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
  url.searchParams.set('X', String(Math.round(pt.x))); // ⬅
  url.searchParams.set('Y', String(Math.round(pt.y))); // ⬅
  url.searchParams.set('FEATURE_COUNT', '10'); // полезно
  url.searchParams.set('STYLES', ''); // некоторые сервера требуют
  return url.toString();
}
