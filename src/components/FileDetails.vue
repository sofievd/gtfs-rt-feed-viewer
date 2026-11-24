<template>
  <section class="w-full text-left">
    <h2 class="mb-6 text-2xl font-semibold text-[#4A4966]" >Overview</h2>
    <dl class="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
      <template v-for="row in rows" :key="row.label">
        <dt class="font-semibold text-[#4A4966]">{{ row.label }}</dt>
        <dd class="mb-3 min-w-0 break-words text-[#4A4966]">{{ row.value }}</dd>
      </template>
    </dl>
  </section>
</template>

<script>
import { getFileDetails } from '@/utils/fileDetails.js';

export default {
  name: 'FileDetails',
  props: {
    file: { type: Object, required: true },
  },
  computed: {
    rows() {
      return getFileDetails(this.file);
    },
  },
}
</script>
