<template>
  <section class="panel empty-state">
    <h2>{{ title }}</h2>
    <p class="muted">{{ text }}</p>
    <RouterLink v-if="to" class="button secondary" :to="to">{{ action }}</RouterLink>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
  to: { type: String, default: "" },
  action: { type: String, default: "Volver" }
});
</script>
