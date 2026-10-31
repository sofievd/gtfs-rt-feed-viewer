import test from 'node:test';
import assert from 'node:assert/strict';
import protobuf from 'protobufjs';
import { fileURLToPath } from 'node:url';
import { getVehicleEntities, getVehiclePositions } from '../src/utils/vehiclePositions.js';

const FeedMessage = protobuf.loadSync(fileURLToPath(new URL('../src/assets/gtfs-realtime.proto', import.meta.url)))
  .lookupType('transit_realtime.FeedMessage');
const vehicle = (position, extra = {}) => ({ id: 'vehicle', vehicle: { position }, ...extra });
const decode = entity => FeedMessage.decode(FeedMessage.encode({
  header: { gtfsRealtimeVersion: '2.0' }, entity,
}).finish());

test('mixed feeds include vehicle entities only', () => {
  const feed = decode([vehicle({ latitude: 0, longitude: 0 }), { id: 'trip', tripUpdate: { trip: { tripId: 'trip' } } }]);
  assert.equal(getVehicleEntities(feed).length, 1);
  assert.deepEqual(getVehicleEntities({}), []);
});

test('decoded missing bearing differs from explicitly supplied north', () => {
  const feed = decode([
    vehicle({ latitude: 0, longitude: 0 }),
    vehicle({ latitude: 0, longitude: 0, bearing: 0 }),
    ...[90, 180, 270, 360].map(bearing => vehicle({ latitude: 59, longitude: 18, bearing })),
  ]);
  const { positions, skippedCount } = getVehiclePositions(getVehicleEntities(feed));
  assert.deepEqual(positions.map(position => position.bearing), [null, 0, 90, 180, 270, 360]);
  assert.equal(positions[0].latitude, 0);
  assert.equal(skippedCount, 0);
});

test('invalid coordinates, deleted vehicles, and absent positions are skipped', () => {
  const entities = [
    vehicle({ latitude: NaN, longitude: 1 }),
    vehicle({ latitude: 91, longitude: 1 }),
    vehicle({ latitude: 1, longitude: -181 }),
    vehicle({ latitude: 1, longitude: Infinity }),
    vehicle({ latitude: 1 }),
    vehicle(Object.create({ latitude: 0, longitude: 0 })),
    vehicle(null),
    vehicle({ latitude: 1, longitude: 1 }, { isDeleted: true }),
    vehicle({ latitude: -90, longitude: 180 }),
  ];
  const { positions, skippedCount } = getVehiclePositions(entities);
  assert.equal(positions.length, 1);
  assert.equal(skippedCount, 8);
});

test('invalid bearings retain the vehicle without an arrow', () => {
  const { positions } = getVehiclePositions([-1, 361, NaN, Infinity].map(
    bearing => vehicle({ latitude: 1, longitude: 1, bearing }),
  ));
  assert.equal(positions.length, 4);
  assert.ok(positions.every(position => position.bearing === null));
});
