<template>
      <article class="mx-auto max-w-[800px] space-y-6 px-6 py-12">
        <h1 class="text-3xl font-semibold text-indigo-900">Documentation</h1>
        <section class="space-y-2">
          <h2 class="text-xl font-semibold">Load a feed</h2>
          <p>Select a .pb file from your device or drag it onto the upload area. To load a feed from a URL, paste the URL and select Show. The feed server must allow browser requests through CORS.</p>
          <p>Once the feed is decoded, the page scrolls to its contents.</p>
        </section>
        <section class="space-y-2">
          <h2 class="text-xl font-semibold">Inspect the data</h2>
          <p>Switch between Json view, Tree view, and Table view to explore the decoded feed. Expand entries in the tree to inspect their fields.</p>
        </section>
        <section class="space-y-2">
          <h2 class="text-xl font-semibold">GTFS Realtime format</h2>
          <p>For the feed specification and field definitions, visit the <a href="https://gtfs.org/documentation/realtime/reference/" class="text-indigo-900 underline">official GTFS Realtime reference</a>.</p>
        </section>
      </article>
</template>
