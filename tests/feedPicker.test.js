import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';

const { descriptor } = parse(readFileSync(new URL('../src/components/FeedPicker.vue', import.meta.url), 'utf8'));
const source = descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('import.meta.env.BASE_URL', "'/'").replace('export default', 'return');
const Picker = new Function('DocumentIcon', 'FontAwesomeIcon', source)({}, {});
const makePicker = () => {
  const picker = { ...Picker.data(), $emit: (...args) => { picker.emitted = args; } };
  for (const [name, method] of Object.entries(Picker.methods)) picker[name] = method.bind(picker);
  picker.fileUrl = 'https://example.test/feed.pbf';
  return picker;
};

test('loading remains active until the feed is downloaded and prevents duplicate requests', async t => {
  let complete;
  const fetchMock = t.mock.method(globalThis, 'fetch', () => new Promise(resolve => { complete = resolve; }));
  const picker = makePicker();
  const pending = picker.downloadFile();
  assert.equal(picker.isLoading, true);
  await picker.downloadFile();
  assert.equal(fetchMock.mock.callCount(), 1);
  complete({ ok: true, blob: async () => new Blob([new Uint8Array([1, 2, 3])]) });
  await pending;
  assert.equal(picker.isLoading, false);
  assert.equal(picker.emitted[0], 'file-buffer');
  assert.deepEqual(picker.emitted[1], new Uint8Array([1, 2, 3]));
});

test('a failed request dismisses the spinner and displays an error', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
  t.mock.method(console, 'log', () => {});
  const picker = makePicker();
  await picker.downloadFile();
  assert.equal(picker.isLoading, false);
  assert.match(picker.statusMessageUrl, /Unable to download/);
  assert.equal(picker.emitted, undefined);
});
