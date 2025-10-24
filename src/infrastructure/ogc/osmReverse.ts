export async function reverseGeocode(lat: number, lon: number) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');
  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error('Nominatim failed');
  return res.json() as Promise<{
    display_name?: string;
    address?: Record<string, string>;
  }>;
}
