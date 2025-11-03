import { useEffect, useRef, useState } from 'react';
import {
  createMap,
  addWms,
  removeLayer,
  onMapClick,
  showPopup,
  destroy,
  setView,
  whenReady,
} from '../../infrastructure/map/leafletAdapter';
import { identifyWms } from '../../infrastructure/map/leafletAdapter';
import { WMS_URL } from '../../shared/config/ogc';
import { LAYERS } from '../../shared/config/layers';
import LayersPanel from '../components/LayersPanel';
import { titleCase } from '../../shared/lib/format';

export default function MapWidget() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [h, setH] = useState<ReturnType<typeof createMap> | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, false])),
  );

  // init map once
  useEffect(() => {
    if (!ref.current) return;
    const handle = createMap(ref.current, { center: [37.8, -96], zoom: 4 });
    setH(handle);
    setReady(true);

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

        // WMS GetFeatureInfo for countries
        const url = await identifyWms(handle, ll, WMS_URL, {
          layers: 'ne:ne_10m_admin_0_countries',
        });
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

  // sync WMS overlays with checkboxes
  useEffect(() => {
    if (!h || !ready) return;
    LAYERS.forEach((l) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (visible[l.id]) addWms(h, l.id, l.url, l.params as any);
      else removeLayer(h, l.id);
    });
  }, [visible, h, ready]);

  const items = LAYERS.map((l) => ({
    id: l.id,
    title: l.title,
    visible: visible[l.id],
  }));

  return (
    <>
      <LayersPanel
        items={items}
        disabled={!ready || busy}
        onToggle={(id, v) => setVisible((prev) => ({ ...prev, [id]: v }))}
      />
      <div ref={ref} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
