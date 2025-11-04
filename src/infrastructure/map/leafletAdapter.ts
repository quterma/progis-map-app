import L, { Map as LMap, Layer as LLayer, LatLng } from 'leaflet';
import {
  WMS_VERSION,
  WMS_CRS,
  WMS_INFO_FORMAT,
  WMS_FEATURE_COUNT,
  WMS_BUFFER,
  WMS_REQUEST_TYPES,
} from '../config';

export type MapHandle = {
  map: LMap;
  layers: Record<string, LLayer>;
  selection?: LLayer | null;
};

/**
 * Выполняет callback после полной загрузки карты.
 * @param h - Объект карты
 * @param cb - Функция обратного вызова
 */
export function whenReady(h: MapHandle, cb: () => void) {
  h.map.whenReady(cb);
}

/**
 * Создает экземпляр Leaflet карты с базовым слоем OpenStreetMap.
 * @param el - HTML элемент контейнера для карты
 * @param opts - Параметры: центр карты и начальный зум
 * @returns Объект карты с методами управления
 */
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

/**
 * Устанавливает новый центр и зум карты с анимацией.
 * Использует requestAnimationFrame для корректного обновления размеров.
 * @param h - Объект карты
 * @param center - Координаты центра [lat, lng]
 * @param zoom - Уровень масштабирования
 */
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

/**
 * Добавляет WMS слой на карту или заменяет существующий.
 * @param h - Объект карты
 * @param id - Уникальный идентификатор слоя
 * @param url - URL WMS сервера
 * @param options - Параметры WMS запроса
 * @returns Созданный WMS слой
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
 * @param h - Объект карты
 * @param id - Идентификатор слоя для удаления
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
 * Удаляет все слои, выделения и DOM элементы.
 * @param h - Объект карты для уничтожения
 */
export function destroy(h: MapHandle) {
  clearSelection(h);
  Object.keys(h.layers).forEach((id) => removeLayer(h, id));
  h.map.remove();
}

/**
 * Регистрирует обработчик кликов по карте.
 * @param h - Объект карты
 * @param cb - Функция обратного вызова с координатами клика
 */
export function onMapClick(h: MapHandle, cb: (ll: LatLng) => void) {
  h.map.on('click', (e) => cb(e.latlng));
}

/**
 * Получает текущее состояние карты: центр, зум и система координат.
 * @param h - Объект карты
 * @returns Объект с параметрами карты
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
 * Показывает всплывающее окно с HTML контентом в указанной точке.
 * @param h - Объект карты
 * @param ll - Координаты для размещения popup
 * @param html - HTML контент для отображения
 */
export function showPopup(h: MapHandle, ll: LatLng, html: string) {
  const p = L.popup().setLatLng(ll).openOn(h.map);
  p.setContent(html);
}

/** ---------- WMS GetFeatureInfo (1.1.1) ---------- */

/**
 * Создает URL для WMS GetFeatureInfo запроса.
 * Формирует запрос согласно спецификации WMS 1.1.1 с использованием текущих границ карты.
 * @param h - Объект карты для получения размеров и границ
 * @param baseUrl - Базовый URL WMS сервера
 * @param params - Параметры: слои и формат ответа
 * @returns URL объект с настроенными параметрами WMS
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
  url.searchParams.set('REQUEST', WMS_REQUEST_TYPES.GET_FEATURE_INFO);
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
 * Создает URL для WMS GetFeatureInfo запроса в точке клика.
 * Преобразует географические координаты в пиксельные координаты экрана.
 * @param h - Объект карты
 * @param ll - Координаты клика в формате lat/lng
 * @param baseUrl - Базовый URL WMS сервера
 * @param params - Параметры: слои и формат ответа
 * @returns Полный URL для GetFeatureInfo запроса
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

/** ---------- Выделение объектов на карте ---------- */

/**
 * Очищает текущее выделение на карте.
 * @param h - Объект карты
 */
export function clearSelection(h: MapHandle) {
  if (h.selection) {
    h.map.removeLayer(h.selection);
    h.selection = null;
  }
}

/**
 * Подсвечивает GeoJSON объект на карте красным цветом.
 * Поддерживает полигоны, линии и точки с разными стилями отображения.
 * @param h - Объект карты
 * @param geojson - GeoJSON данные для отображения
 * @returns Созданный слой выделения
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
 * @param h - Объект карты
 * @param ll - Координаты точки для подсветки
 * @returns Созданный маркер точки
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
