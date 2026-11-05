import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from '@vue/compiler-sfc';
import { compile } from '@vue/compiler-dom';
import * as Vue from 'vue';
import { renderToString } from '@vue/server-renderer';
import protobuf from 'protobufjs';

const { descriptor } = parse(readFileSync(new URL('../src/components/GtfsTableView.vue', import.meta.url), 'utf8'));
const Table = new Function(descriptor.script.content.replace('export default', 'return'))();
Table.render = new Function('Vue', compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true }).code)(Vue);
const FeedMessage = protobuf.loadSync(fileURLToPath(new URL('../src/assets/gtfs-realtime.proto', import.meta.url)))
  .lookupType('transit_realtime.FeedMessage');
const decode = entity => FeedMessage.decode(FeedMessage.encode({ header: { gtfsRealtimeVersion: '2.0' }, entity }).finish());
const render = feed => renderToString(Vue.createSSRApp(Table, { feed }));

test('trip table renders absent arrival/departure events and preserves explicit zero delays', async () => {
  const feed = decode([{ id: 'trip', tripUpdate: {
    trip: { tripId: 'trip-1' },
    stopTimeUpdate: [
      { stopSequence: 1, departure: { delay: 0 } },
      { stopSequence: 2, arrival: { delay: -30 } },
      { stopSequence: 3, arrival: { time: 1000 }, departure: {} },
    ],
  } }]);
  const html = await render(feed);
  assert.equal((html.match(/<tr>/g) || []).length, 3);
  assert.match(html, />0<\/td>/);
  assert.match(html, />-30<\/td>/);
  assert.equal(Table.methods.optionalValue(feed.entity[0].tripUpdate.stopTimeUpdate[2].arrival, 'delay'), '-');
});

test('deleted and other entity types do not break the selected table', async () => {
  const feed = decode([
    { id: 'deleted', isDeleted: true },
    { id: 'trip', tripUpdate: { trip: { tripId: 'mixed-trip' }, stopTimeUpdate: [{ stopId: 'a' }] } },
    { id: 'vehicle', vehicle: {} },
    { id: 'alert', alert: {} },
  ]);
  assert.match(await render(feed), /mixed-trip/);
});
