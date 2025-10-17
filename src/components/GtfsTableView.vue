<template>
  <!--  <pre>
    {{JSON.stringify(feed, undefined, 2)}}
  </pre>
 -->
  <div class="flex justify-center">
    <table class="border border-indigo-900 text-center">
      <thead>
      <tr class="border broder-indigo-900 p-2">
        <th class="p-2 border">Trip Id</th>
        <th class="p-2 border">Start date</th>
        <th class="p-2 border"> Sequence number</th>
        <th class="p-2 border">Arrival Delay</th>
        <th class="p-2 border">Departure Delay</th>
        <th class="p-2 border">Schedule</th>
      </tr>
      </thead>

      <tbody>
      <template v-for="entity in feed.entity" :key="entity.id">

        <tr v-for="stop in entity.tripUpdate.stopTimeUpdate" :key="stop.stopSequence">

          <td class="border"> {{ entity.tripUpdate.trip.tripId }}</td>
          <td class="border px-2"> {{ formatDate(entity.tripUpdate.trip.startDate) }}</td>
          <td class="border px-2">{{ stop.stopSequence }}</td>
          <td class="border px-2">{{ stop.arrival.delay }}</td>
          <td class="border px-2">{{ stop.departure.delay }}</td>
          <td class="border px-2"> {{
              formatEnumName(getScheduleName(entity.tripUpdate.trip.scheduleRelationship))
            }}
          </td>


        </tr>
      </template>
      </tbody>
    </table>
  </div>


</template>

<script>
export default {
  name: "GtfsTableView",
  props: ["feed"],
  methods: {
    getAverageDelay(entity) {
      const updates = entity.tripUpdate?.stopTimeUpdate || [];
      const delays = updates
          .map(s => s.arrival?.delay ?? s.departure?.delay)
          .filter(d => typeof d === 'number');

      if (!delays.length) return null;

      const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
      console.log(Math.round(avg))
      return Math.round(avg);
    },
    getScheduleName(scheduleCode) {
      const scheduleMap = {
        0: "SCHEDULED",
        1: "SKIPPED",
        2: "NO_DATA",
        3: "UNSCHEDULED",
      };
      return scheduleMap[scheduleCode];
    },
    formatEnumName(value) {
      return value
          ? value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
          : 'Unknown';
    },
    formatDate(dateString) {

      if (!dateString || dateString.length !== 8) {
        return '-'
      }
      const cleanedDateString = dateString.trim()
      return `${cleanedDateString.substring(0,4)}-${cleanedDateString.substring(4,6)}-${cleanedDateString.substring(6,8)}`;
    }

  }
}
</script>

<style scoped>

</style>