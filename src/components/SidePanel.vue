<template>
  <aside class="sticky top-0 h-screen w-[300px] shrink-0 overflow-y-auto bg-[#E3E1F5] text-[#4A4966]">
    <RouterLink to="/" class="block px-6 py-6 text-base font-bold" @click.prevent="$emit('home')">GTFS-RT Toolbox</RouterLink>
    <hr class="border-t-2 border-[#4A4966]" />
    <nav aria-label="Site navigation" class="flex flex-col items-start gap-4 px-6 py-8 text-base font-bold">
      <RouterLink to="/" class="hover:underline" exact-active-class="underline" @click.prevent="$emit('home')">Home</RouterLink>
      <RouterLink to="/documentation" class="hover:underline" exact-active-class="underline">Documentation</RouterLink>
      <RouterLink to="/about" class="hover:underline" exact-active-class="underline">About</RouterLink>
    </nav>
    <hr class="border-t-2 border-[#4A4966]" />
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
