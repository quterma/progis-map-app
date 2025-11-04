import { useEffect, useRef, useState } from 'react';
import {
  createMap,
  onMapClick,
  showPopup,
  destroy,
  setView,
  whenReady,
} from '../../infrastructure/map/leafletAdapter';
import { identifyWms } from '../../infrastructure/map/leafletAdapter';
import { WMS_URL } from '../../infrastructure/config';
import { titleCase } from '../../infrastructure/lib/format';

export default function MapWidget() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  // init map once
  useEffect(() => {
    if (!ref.current) return;
    const handle = createMap(ref.current, { center: [37.8, -96], zoom: 4 });

    // геолокация → центр (без ошибок и гонок)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          whenReady(handle, () => setView(handle, [latitude, longitude], 10));
        },
        () => {
          /* игнорируем — останется дефолт USA */
        },
        { enableHighAccuracy: false, timeout: 3000 },
      );
    }

    onMapClick(handle, async (ll) => {
      if (busy) return;
      setBusy(true);
      try {
        showPopup(
          handle,
          ll,
          `<small style="font:12px system-ui;opacity:.8">Loading…</small>`,
        );
        const zoom = handle.map.getZoom();

        // High zoom → reverse geocode (OSM Nominatim)
        if (zoom >= 11) {
          try {
            const url = new URL('https://nominatim.openstreetmap.org/reverse');
            url.searchParams.set('format', 'jsonv2');
            url.searchParams.set('lat', String(ll.lat));
            url.searchParams.set('lon', String(ll.lng));
            url.searchParams.set('zoom', '18');
            url.searchParams.set('addressdetails', '1');
            const res = await fetch(url.toString(), {
              headers: { 'Accept-Language': 'en' },
            });
            const data = await res.json();

            const rows = Object.entries(data.address ?? {})
              .slice(0, 15)
              .map(
                ([k, v]) =>
                  `<tr>
                  <td style="padding:2px 6px;font-weight:600;">${titleCase(String(k))}</td>
                  <td style="padding:2px 6px;">${String(v)}</td>
                </tr>`,
              )
              .join('');

            const html = rows
              ? `<div style="max-width:320px"><table style="border-collapse:collapse;font:12px/1.3 system-ui">${rows}</table></div>`
              : `<div style="max-width:320px">📍 ${data.display_name ?? 'No address found'}</div>`;

            showPopup(handle, ll, html);
            return;
          } catch {
            /* fall back to GFI */
          }
        }

        // Low zoom → WMS GFI (countries)
        const url = await identifyWms(handle, ll, WMS_URL, {
          layers: 'ne:ne_10m_admin_0_countries',
        });

        if (!url) {
          showPopup(handle, ll, '<b>Failed to create WMS request</b>');
          return;
        }

        const text = await (await fetch(url)).text();

        let html = '<b>No features</b>';
        try {
          const json = JSON.parse(text);
          const f = json?.features?.[0];
          if (f?.properties) {
            const rows = Object.entries(f.properties)
              .slice(0, 20)
              .map(
                ([k, v]) =>
                  `<tr>
                  <td style="padding:2px 6px;font-weight:600;">${titleCase(String(k))}</td>
                  <td style="padding:2px 6px;">${String(v)}</td>
                </tr>`,
              )
              .join('');
            html = `<div style="max-width:320px"><table style="border-collapse:collapse;font:12px/1.3 system-ui">${rows}</table></div>`;
          }
        } catch {
          html = `<pre style="margin:0;max-width:320px;white-space:pre-wrap">${text.slice(0, 2000)}</pre>`;
        }
        showPopup(handle, ll, html);
      } catch (e) {
        showPopup(
          handle,
          ll,
          `<b>Identify error</b><br/><small>${String(e)}</small>`,
        );
      } finally {
        setBusy(false);
      }
    });

    return () => destroy(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />;
}
