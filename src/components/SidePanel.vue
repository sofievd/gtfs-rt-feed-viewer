<template>
  <aside class="sticky top-0 h-screen w-[300px] shrink-0 overflow-y-auto bg-[#E3E1F5] text-[#4A4966]">
    <RouterLink to="/" class="block px-6 py-6 text-xl font-semibold" @click.prevent="$emit('home')">Gtfs-RT Feed Viewer</RouterLink>
    <hr class="border-t border-[#4A4966]" />
    <nav aria-label="Site navigation" class="flex flex-col items-start gap-4 px-6 py-5 text-sm">
      <RouterLink to="/" class="hover:underline" exact-active-class="font-semibold underline" @click.prevent="$emit('home')">Home</RouterLink>
      <RouterLink to="/documentation" class="hover:underline" exact-active-class="font-semibold underline">Documentation</RouterLink>
      <RouterLink to="/about" class="hover:underline" exact-active-class="font-semibold underline">About</RouterLink>
    </nav>
    <hr class="border-t border-[#4A4966]" />
  </aside>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: 'SidePanel',
  components: { RouterLink },
  emits: ['home'],
}
</script>
