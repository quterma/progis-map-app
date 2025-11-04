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
import {
  WMS_ENDPOINT,
  WMS_INFO_FORMAT,
  WMS_LAYERS,
} from '../../infrastructure/map/wms.config';

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

        // WMS GetFeatureInfo for populated places
        const url = await identifyWms(handle, ll, WMS_ENDPOINT, {
          layers: WMS_LAYERS.POPULATED,
          infoFormat: WMS_INFO_FORMAT,
        });

        // Log the exact GFI URL for debugging
        console.debug('GetFeatureInfo URL:', url);

        // Fetch with retry logic for 502 errors
        let response = await fetch(url);

        // Retry once on 502 Bad Gateway
        if (response.status === 502) {
          console.debug('502 error, retrying after 300ms...');
          await new Promise((resolve) => setTimeout(resolve, 300));
          response = await fetch(url);
        }

        // Check for HTTP errors
        if (response.status >= 400) {
          let errorMsg = 'Service temporarily unavailable';
          if (response.status === 502) {
            errorMsg = 'Service temporarily unavailable';
          } else if (response.status >= 400 && response.status < 500) {
            errorMsg = 'No features – try zoom in or click closer';
          }
          showPopup(handle, ll, `<b>${errorMsg}</b>`);
          return;
        }

        const text = await response.text();

        let html = '<b>No features – try zoom in or click closer</b>';

        // Check if HTML contains actual feature data (has table rows)
        if (text && text.trim() && text.includes('<tr>')) {
          html = `<div style="max-width:320px;max-height:400px;overflow:auto">${text}</div>`;
        } else if (text && text.trim()) {
          // Show raw response for debugging if no table rows found
          html = `<div style="max-width:320px;">
            <b>No features – try zoom in or click closer</b>
            <details style="margin-top:8px;font-size:11px;opacity:0.7;">
              <summary>Debug info</summary>
              <pre style="white-space:pre-wrap;max-height:200px;overflow:auto;">${text.slice(0, 1000)}</pre>
            </details>
          </div>`;
        }

        showPopup(handle, ll, html);
      } catch (e) {
        console.error('GetFeatureInfo error:', e);
        showPopup(
          handle,
          ll,
          `<b>Service temporarily unavailable</b><br/><small>${String(e)}</small>`,
        );
      } finally {
        setBusy(false);
      }
    });

    return () => destroy(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={ref} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
