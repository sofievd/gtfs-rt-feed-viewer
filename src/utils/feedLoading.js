import root from '@/assets/gtfs-realtime.js';

export async function downloadFeed(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Failed to download feed (HTTP ${response.status})`);
  return new Uint8Array(await response.arrayBuffer());
}

export function decodeFeed(bytes, name, { source = 'upload', url = null } = {}) {
  return {
    feed: root.transit_realtime.FeedMessage.decode(bytes),
    name,
    size: bytes.byteLength,
    source,
    url,
    loadedAt: Date.now(),
  };
}
