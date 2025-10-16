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
        <th class="p-2 border"> Start Date</th>
        <th class="p-2 border">Avg Delay</th>
        <th class="p-2 border">Schedule</th>
        <th class="p-2 border"> Num updates</th>
      </tr>
      </thead>

      <tbody>
      <tr class="border">
        <td class="border px-2">
          {{ feed }}
        </td>
<!--        <td class="border px-2">{{ entity.tripUpdate.trip.startDate }}</td>
        <td class="border px-2">{{ getAverageDelay(entity) }}</td>
        <td class="border px-2"> {{ formatEnumName(getScheduleName(entity.tripUpdate.trip.scheduleRelationship)) }}</td>
        <td class="border px-2"> {{ entity.tripUpdate.stopTimeUpdate.length }}</td>-->
      </tr>
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

  }
}
</script>

<style scoped>

</style>