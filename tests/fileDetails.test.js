import test from 'node:test';
import assert from 'node:assert/strict';
import protobuf from 'protobufjs';
import { fileURLToPath } from 'node:url';
import { getFileDetails } from '../src/utils/fileDetails.js';

const FeedMessage = protobuf.loadSync(fileURLToPath(new URL('../src/assets/gtfs-realtime.proto', import.meta.url)))
  .lookupType('transit_realtime.FeedMessage');
const details = file => Object.fromEntries(getFileDetails(file).map(row => [row.label, row.value]));
const makeFile = (header = { gtfsRealtimeVersion: '2.0' }, entity = []) => ({
  name: 'feed.pb', size: 2048, source: 'upload', loadedAt: 0,
  feed: FeedMessage.decode(FeedMessage.encode({ header, entity }).finish()),
});

test('file details show exact bytes, readable size, source, and UTC load time', () => {
  const rows = details(makeFile());
  assert.equal(rows.Filename, 'feed.pb');
  assert.equal(rows.Size, '2 KiB (2,048 bytes)');
  assert.equal(rows.Source, 'Upload');
  assert.equal(rows['Loaded at (UTC)'], '1970-01-01T00:00:00.000Z');
  assert.equal(rows['GTFS Realtime version'], '2.0');
  assert.equal(rows.Incrementality, 'FULL_DATASET');
  assert.equal(rows['Feed timestamp (UTC)'], 'Not provided');
  assert.ok(!('Source URL' in rows));
});

test('explicit zero timestamp and differential feeds preserve protobuf semantics', () => {
  const file = makeFile({ gtfsRealtimeVersion: '2.0', timestamp: 0, incrementality: 1 });
  file.source = 'url';
  file.url = 'https://example.test/feed.pb';
  const rows = details(file);
  assert.equal(rows['Feed timestamp (UTC)'], '1970-01-01T00:00:00.000Z');
  assert.equal(rows.Incrementality, 'DIFFERENTIAL');
  assert.equal(rows['Source URL'], file.url);
  assert.equal(rows.Source, 'URL');
});

test('counts distinguish entity categories and deleted entries', () => {
  const rows = details(makeFile(undefined, [
    { id: 'vehicle', vehicle: {} },
    { id: 'trip', tripUpdate: { trip: { tripId: 't' } } },
    { id: 'alert', alert: {} },
    { id: 'deleted', isDeleted: true },
  ]));
  assert.equal(rows['Total entities'], 4);
  assert.equal(rows['Vehicle positions'], 1);
  assert.equal(rows['Trip updates'], 1);
  assert.equal(rows.Alerts, 1);
  assert.equal(rows['Deleted entities'], 1);
});

test('missing metadata and unrepresentable timestamps render safely', () => {
  const rows = details({ feed: { header: { timestamp: { toString: () => '18446744073709551615' } } } });
  assert.equal(rows.Size, 'Not provided');
  assert.equal(rows['Loaded at (UTC)'], 'Not provided');
  assert.equal(rows['Feed timestamp (UTC)'], 'Not provided');
  assert.equal(rows['Total entities'], 0);
  assert.equal(rows['First updated (UTC)'], 'Not provided');
  assert.equal(rows['Last updated (UTC)'], 'Not provided');
});

test('update range uses vehicle and trip observation timestamps, including explicit zero', () => {
  const rows = details(makeFile({ gtfsRealtimeVersion: '2.0', timestamp: 900 }, [
    { id: 'v', vehicle: { timestamp: 120 } },
    { id: 't', tripUpdate: { trip: { tripId: 't' }, timestamp: 0 } },
    { id: 'missing', vehicle: {} },
    { id: 'a', alert: { activePeriod: [{ start: 1, end: 999 }] } },
  ]));
  assert.equal(rows['First updated (UTC)'], '1970-01-01T00:00:00.000Z');
  assert.equal(rows['Last updated (UTC)'], '1970-01-01T00:02:00.000Z');
});

test('absent or invalid observation timestamps do not become epoch dates', () => {
  const rows = details(makeFile(undefined, [
    { id: 'v', vehicle: {} },
    { id: 't', tripUpdate: { trip: {}, timestamp: '18446744073709551615' } },
    { id: 'a', alert: { activePeriod: [{ start: 120 }] } },
  ]));
  assert.equal(rows['First updated (UTC)'], 'Not provided');
  assert.equal(rows['Last updated (UTC)'], 'Not provided');
});
