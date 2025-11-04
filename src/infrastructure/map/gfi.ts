export async function fetchGfi(url: string): Promise<string> {
  let res = await fetch(url);
  if (res.status === 502) {
    await new Promise((r) => setTimeout(r, 300));
    res = await fetch(url);
  }

  // Log content-type for debugging
  const ct = res.headers.get('content-type') || '';
  console.log('[GFI] content-type:', ct);

  if (res.status >= 400) {
    if (res.status >= 400 && res.status < 500)
      throw new Error('No features – try zoom in or click closer');
    throw new Error('Service temporarily unavailable');
  }

  // If JSON, log a snippet for debugging but still return text
  if (ct.includes('application/json')) {
    try {
      const json = await res.json();
      const snippet = JSON.stringify(json).slice(0, 400);
      console.log('[GFI] JSON snippet:', snippet);
      return JSON.stringify(json); // Return as text for MapWidget compatibility
    } catch {
      console.log('[GFI] JSON parse failed, falling back to text');
      return res.text();
    }
  }

  return res.text();
}

export function isHtmlWithTable(html: string): boolean {
  return !!html && html.includes('<tr>');
}
