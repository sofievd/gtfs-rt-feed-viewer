const hasField = (value, field) => Object.prototype.hasOwnProperty.call(value, field);
const missing = 'Not provided';

function formatDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : missing;
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return missing;
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  const unit = bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const readable = (bytes / 1024 ** unit).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return readable + ' ' + units[unit] + ' (' + bytes.toLocaleString('en-US') + ' bytes)';
}

export function getFileDetails(file) {
  const header = file.feed.header || {};
  const entities = file.feed.entity || [];
  const timestamp = hasField(header, 'timestamp') ? header.timestamp?.toString() : null;
  const timestampDate = timestamp == null ? missing : formatDate(Number(timestamp) * 1000);
  const incrementality = header.incrementality ?? 0;
  const rows = [
    { label: 'Filename', value: file.name || missing },
    { label: 'Size', value: formatSize(file.size) },
    { label: 'Source', value: file.source === 'url' ? 'URL' : file.source === 'upload' ? 'Upload' : missing },
  ];
  if (file.source === 'url') rows.push({ label: 'Source URL', value: file.url || missing });
  rows.push(
    { label: 'Loaded at (UTC)', value: file.loadedAt == null ? missing : formatDate(file.loadedAt) },
    { label: 'GTFS Realtime version', value: header.gtfsRealtimeVersion || missing },
    { label: 'Feed timestamp (UTC)', value: timestamp == null ? missing : timestampDate === missing ? missing : timestampDate + ' (' + timestamp + ' Unix seconds)' },
    { label: 'Incrementality', value: incrementality === 0 ? 'FULL_DATASET' : incrementality === 1 ? 'DIFFERENTIAL' : 'Unknown (' + incrementality + ')' },
    { label: 'Total entities', value: entities.length },
    { label: 'Vehicle positions', value: entities.filter(entity => entity.vehicle != null).length },
    { label: 'Trip updates', value: entities.filter(entity => entity.tripUpdate != null).length },
    { label: 'Alerts', value: entities.filter(entity => entity.alert != null).length },
    { label: 'Deleted entities', value: entities.filter(entity => entity.isDeleted).length },
  );
  return rows;
}
