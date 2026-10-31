const hasField = (value, field) => Object.prototype.hasOwnProperty.call(value, field);

export function getVehicleEntities(feed) {
  return (feed.entity || []).filter(entity => entity.vehicle != null);
}

export function getVehiclePositions(entities) {
  const positions = [];
  let skippedCount = 0;

  for (const entity of entities) {
    const position = entity.vehicle?.position;
    if (entity.isDeleted || !position ||
        !hasField(position, 'latitude') || !hasField(position, 'longitude') ||
        !Number.isFinite(position.latitude) || !Number.isFinite(position.longitude) ||
        Math.abs(position.latitude) > 90 || Math.abs(position.longitude) > 180) {
      skippedCount += 1;
      continue;
    }

    const bearing = hasField(position, 'bearing') && Number.isFinite(position.bearing) &&
      position.bearing >= 0 && position.bearing <= 360 ? position.bearing : null;

    positions.push({
      entity,
      latitude: position.latitude,
      longitude: position.longitude,
      bearing,
    });
  }

  return { positions, skippedCount };
}
