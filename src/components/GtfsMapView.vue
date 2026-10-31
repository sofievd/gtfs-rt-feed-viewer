<template>
  <div>
    <p v-if="!positions.length" class="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
      No valid vehicle positions are available in this feed.
    </p>
    <template v-else>
      <p v-if="tileError" role="status" class="mb-3 text-sm text-amber-800">
        Map tiles could not be loaded. Vehicle positions are still available; check your internet connection.
      </p>
      <div ref="mapContainer" class="vehicle-map rounded-xl border border-gray-200"
           role="region" aria-label="Vehicle positions map"></div>
    </template>
    <p class="mt-3 text-sm text-gray-600" role="status">
      {{ positions.length }} out of {{ entities.length }} positions shown on map, {{ skippedCount }} errors
    </p>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getVehiclePositions } from '@/utils/vehiclePositions.js';

export default {
  name: 'GtfsMapView',
  props: {
    entities: { type: Array, required: true },
  },
  data() {
    return { map: null, resizeObserver: null, tileError: false }
  },
  computed: {
    vehiclePositions() {
      return getVehiclePositions(this.entities);
    },
    positions() {
      return this.vehiclePositions.positions;
    },
    skippedCount() {
      return this.vehiclePositions.skippedCount;
    },
  },
  mounted() {
    this.createMap();
  },
  activated() {
    this.$nextTick(() => this.map?.invalidateSize({ pan: false }));
  },
  beforeUnmount() {
    this.destroyMap();
  },
  watch: {
    entities() {
      this.destroyMap();
      this.$nextTick(this.createMap);
    },
  },
  methods: {
    createMap() {
      if (this.map || !this.$refs.mapContainer || !this.positions.length) return;

      this.tileError = false;
      this.map = markRaw(L.map(this.$refs.mapContainer));
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).on('tileerror', () => { this.tileError = true; }).addTo(this.map);

      const coordinates = [];
      for (const position of this.positions) {
        const coordinate = [position.latitude, position.longitude];
        coordinates.push(coordinate);
        const label = position.entity.vehicle.vehicle?.label ||
          position.entity.vehicle.vehicle?.id || position.entity.id || 'Vehicle';
        L.marker(coordinate, {
          icon: this.createIcon(position.bearing),
          title: String(label),
          alt: String(label),
          keyboard: true,
        }).bindPopup(this.createPopup(position)).addTo(this.map);
      }

      if (coordinates.length === 1) {
        this.map.setView(coordinates[0], 16);
      } else {
        this.map.fitBounds(coordinates, { padding: [24, 24], maxZoom: 16 });
      }

      this.resizeObserver = markRaw(new ResizeObserver(() => {
        this.map?.invalidateSize({ pan: false });
      }));
      this.resizeObserver.observe(this.$refs.mapContainer);
    },
    createIcon(bearing) {
      const icon = document.createElement('div');
      icon.className = 'vehicle-map-symbol';
      if (bearing !== null) {
        const arrow = document.createElement('span');
        arrow.className = 'vehicle-map-direction';
        arrow.style.transform = 'rotate(' + bearing + 'deg)';
        icon.append(arrow);
      }
      const dot = document.createElement('span');
      dot.className = 'vehicle-map-dot';
      icon.append(dot);
      return L.divIcon({
        html: icon,
        className: 'vehicle-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    },
    createPopup(position) {
      const { entity, latitude, longitude, bearing } = position;
      const vehicle = entity.vehicle;
      const fields = [
        ['Vehicle', vehicle.vehicle?.label],
        ['Vehicle ID', vehicle.vehicle?.id],
        ['Entity ID', entity.id],
        ['Route ID', vehicle.trip?.routeId],
        ['Trip ID', vehicle.trip?.tripId],
        ['Latitude', latitude],
        ['Longitude', longitude],
        ['Bearing', bearing === null ? null : bearing + '°'],
      ];
      const popup = document.createElement('dl');
      for (const [label, value] of fields) {
        if (value == null || value === '') continue;
        const term = document.createElement('dt');
        term.className = 'font-semibold';
        term.textContent = label;
        const detail = document.createElement('dd');
        detail.className = 'mb-2 break-words';
        detail.textContent = String(value);
        popup.append(term, detail);
      }
      return popup;
    },
    destroyMap() {
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      this.map?.remove();
      this.map = null;
    },
  },
}
</script>

<style scoped>
.vehicle-map {
  height: 600px;
  width: 100%;
  /* Keep Leaflet panes and controls below the site header. */
  isolation: isolate;
  z-index: 0;
}

.vehicle-map :deep(.vehicle-map-symbol) {
  position: relative;
  width: 32px;
  height: 32px;
}

.vehicle-map :deep(.vehicle-map-dot) {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  background: #312e81;
  box-shadow: 0 1px 4px #0006;
}

.vehicle-map :deep(.vehicle-map-direction) {
  position: absolute;
  inset: 0;
  transform-origin: center;
}

.vehicle-map :deep(.vehicle-map-direction::before) {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 9px solid #312e81;
}
</style>
