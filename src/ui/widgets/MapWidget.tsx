import { useEffect, useRef } from 'react';
import {
  createMap,
  addWms,
  onMapClick,
  showPopup,
  destroy,
} from '../../infrastructure/map/leafletAdapter';
import { identifyWms } from '../../infrastructure/map/leafletAdapter';

export default function MapWidget() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const handle = createMap(ref.current, { center: [37.8, -96], zoom: 4 }); // USA
    addWms(handle, 'states', '/wms', {
      layers: 'topp:states',
      format: 'image/png',
      transparent: true,
    });

    onMapClick(handle, async (ll) => {
      try {
        const url = await identifyWms(handle, ll, '/wms', {
          layers: 'topp:states',
        });
        const res = await fetch(url);
        const text = await res.text();

        let html = '<b>No features</b>';
        try {
          const json = JSON.parse(text);
          const f = json?.features?.[0];
          if (f?.properties) {
            const rows = Object.entries(f.properties)
              .slice(0, 20)
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:2px 6px;"><b>${k}</b></td><td style="padding:2px 6px;">${String(v)}</td></tr>`,
              )
              .join('');
            html = `<div style="max-width:320px"><table>${rows}</table></div>`;
          }
        } catch {
          html = `<pre style="margin:0;max-width:320px;white-space:pre-wrap">${text.slice(0, 2000)}</pre>`;
        }
        showPopup(handle, ll, html);
      } catch (e) {
        showPopup(
          handle,
          ll,
          `<b>GetFeatureInfo error</b><br/><small>${String(e)}</small>`,
        );
      }
    });

    return () => destroy(handle);
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />;
}
