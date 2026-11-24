<template>
  <aside class="sticky top-0 h-screen w-[300px] shrink-0 overflow-y-auto bg-[#E3E1F5] text-[#4A4966]">
    <RouterLink to="/" class="flex h-[72px] items-center px-6 text-base font-bold" @click.prevent="$emit('home')">GTFS-RT Toolbox</RouterLink>
    <hr class="border-t-1 border-[#7977A6]" />
    <nav aria-label="Site navigation" class="flex flex-col items-start gap-4 px-6 py-8 text-base font-bold">
      <RouterLink to="/" class="hover:underline" exact-active-class="underline" @click.prevent="$emit('home')">Home</RouterLink>
      <RouterLink to="/documentation" class="hover:underline" exact-active-class="underline">Documentation</RouterLink>
      <RouterLink to="/about" class="hover:underline" exact-active-class="underline">About</RouterLink>
    </nav>
    <hr class="border-t-2 border-[#7977A6]" />
    <div class="px-6 py-6">
      <button type="button" class="theme-toggle" @click="$emit('toggle-theme')">
        {{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>
  </aside>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: 'SidePanel',
  components: { RouterLink },
  props: { theme: { type: String, required: true } },
  emits: ['home', 'toggle-theme'],
}
</script>
