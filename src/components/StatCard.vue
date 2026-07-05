<template>
  <article class="stat-card">
    <span class="muted">{{ label }}</span>
    <div class="stat-value">{{ value }}</div>
  </article>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true }
});
</script>
