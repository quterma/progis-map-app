import L, { Map as LMap, Layer as LLayer, LatLng } from 'leaflet';
import {
  WMS_VERSION,
  WMS_CRS,
  WMS_INFO_FORMAT,
  WMS_FEATURE_COUNT,
  WMS_BUFFER,
} from './wms.config';

export type MapHandle = {
  map: LMap;
  layers: Record<string, LLayer>;
  selection?: LLayer | null;
};

/**
 * Выполняет callback после полной загрузки карты.
 * @param h MapHandle — объект карты.
 * @param cb Функция обратного вызова.
 */
export function whenReady(h: MapHandle, cb: () => void) {
  h.map.whenReady(cb);
}

/**
 * Создаёт карту Leaflet с базовым фоном CartoDB.
 * @param el HTML-элемент контейнера.
 * @param opts.center Координаты центра [lat, lng].
 * @param opts.zoom Начальный зум.
 * @returns MapHandle — объект с экземпляром карты и зарегистрированными слоями.
 */
export function createMap(
  el: HTMLElement,
  opts: { center: [number, number]; zoom: number },
): MapHandle {
  const map = L.map(el).setView(opts.center, opts.zoom);
  // Using CartoDB base tiles instead of OSM
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '© CartoDB',
      maxZoom: 19,
    },
  ).addTo(map);
  return { map, layers: {}, selection: null };
}

/**
 * Изменяет центр и зум карты с анимацией.
 * @param h MapHandle — объект карты.
 * @param center Новые координаты центра [lat, lng].
 * @param zoom Новый уровень зума.
 * Особенности: использует requestAnimationFrame для корректного рендеринга.
 */
export function setView(h: MapHandle, center: [number, number], zoom: number) {
  requestAnimationFrame(() => {
    try {
      h.map.invalidateSize(false);
      h.map.setView(center, zoom, { animate: true });
    } catch {
      // map might be destroyed; ignore
    }
  });
}

/**
 * Добавляет WMS-слой на карту с заданными параметрами.
 * @param h MapHandle — объект карты.
 * @param id Уникальный идентификатор слоя.
 * @param url Базовый URL WMS-сервиса.
 * @param options Параметры WMS (layers, format, transparent и т.д.).
 * @returns Созданный WMS-слой Leaflet.
 * Особенности: автоматически удаляет предыдущий слой с тем же ID.
 */
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

/**
 * Удаляет слой с карты по идентификатору.
 * @param h MapHandle — объект карты.
 * @param id Идентификатор слоя для удаления.
 */
export function removeLayer(h: MapHandle, id: string) {
  const l = h.layers[id];
  if (l) {
    h.map.removeLayer(l);
    delete h.layers[id];
  }
}

/**
 * Полностью уничтожает карту и освобождает ресурсы.
 * @param h MapHandle — объект карты для уничтожения.
 * Особенности: удаляет все слои, выделения и DOM-элементы карты.
 */
export function destroy(h: MapHandle) {
  clearSelection(h);
  Object.keys(h.layers).forEach((id) => removeLayer(h, id));
  h.map.remove();
}

/**
 * Регистрирует обработчик кликов по карте.
 * @param h MapHandle — объект карты.
 * @param cb Функция обратного вызова, получающая координаты клика.
 */
export function onMapClick(h: MapHandle, cb: (ll: LatLng) => void) {
  h.map.on('click', (e) => cb(e.latlng));
}

/**
 * Получает текущее состояние карты (центр, зум, CRS).
 * @param h MapHandle — объект карты.
 * @returns Объект с координатами центра, зумом и системой координат.
 * Особенности: использует WMS_CRS (EPSG:4326) для совместимости с WMS.
 */
export function getView(h: MapHandle) {
  const c = h.map.getCenter();
  const z = h.map.getZoom();
  return {
    center: { x: c.lng, y: c.lat, crs: WMS_CRS },
    zoom: z,
    crs: WMS_CRS,
  };
}

/**
 * Показывает всплывающее окно с контентом в указанной точке.
 * @param h MapHandle — объект карты.
 * @param ll Координаты для размещения popup.
 * @param content HTML-строка или DOM-элемент для отображения.
 * @returns Созданный popup объект Leaflet.
 */
export function showPopup(
  h: MapHandle,
  ll: LatLng,
  content: string | HTMLElement,
): L.Popup {
  const popup = L.popup().setLatLng(ll).openOn(h.map);
  popup.setContent(content as string | HTMLElement);
  return popup;
}

/** ---------- WMS GetFeatureInfo URL (1.1.1) ---------- */
/**
 * Строит URL для WMS GetFeatureInfo запроса.
 * @param h MapHandle — объект карты для получения viewport и размеров.
 * @param baseUrl Базовый URL WMS-сервиса.
 * @param params Параметры: layers (обязательно), infoFormat (опционально).
 * @returns URL объект с настроенными параметрами WMS 1.1.1.
 * Особенности: использует EPSG:4326, BBOX в формате [minX,minY,maxX,maxY].
 */
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
  url.searchParams.set('VERSION', WMS_VERSION);
  url.searchParams.set('LAYERS', params.layers);
  url.searchParams.set('QUERY_LAYERS', params.layers);
  url.searchParams.set('SRS', WMS_CRS);
  url.searchParams.set('BBOX', bbox);
  url.searchParams.set('WIDTH', String(size.x));
  url.searchParams.set('HEIGHT', String(size.y));
  url.searchParams.set('INFO_FORMAT', params.infoFormat ?? WMS_INFO_FORMAT);
  url.searchParams.set('FEATURE_COUNT', String(WMS_FEATURE_COUNT));
  url.searchParams.set('BUFFER', String(WMS_BUFFER));
  url.searchParams.set('STYLES', '');
  return url;
}

/**
 * Создаёт URL для WMS GetFeatureInfo запроса в точке клика.
 * @param h MapHandle — объект карты.
 * @param ll Координаты клика (lat/lng).
 * @param baseUrl Базовый URL WMS-сервиса.
 * @param params Параметры: layers, infoFormat.
 * @returns Строка с полным URL для GetFeatureInfo.
 * Особенности: преобразует lat/lng в пиксельные координаты X,Y на карте.
 */
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
/**
 * Очищает текущее выделение на карте.
 * @param h MapHandle — объект карты.
 */
export function clearSelection(h: MapHandle) {
  if (h.selection) {
    h.map.removeLayer(h.selection);
    h.selection = null;
  }
}

/**
 * Подсвечивает GeoJSON объект на карте красным цветом.
 * @param h MapHandle — объект карты.
 * @param geojson GeoJSON данные для отображения.
 * @returns Созданный слой с выделением.
 * Особенности: полигоны/линии как контуры, точки как circleMarker.
 */
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

/**
 * Подсвечивает точку на карте красным маркером.
 * @param h MapHandle — объект карты.
 * @param ll Координаты точки для подсветки.
 * @returns Созданный circleMarker.
 */
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
