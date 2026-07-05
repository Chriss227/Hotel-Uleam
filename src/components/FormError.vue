<template>
  <span class="error-message">{{ message || "" }}</span>
</template>

<script setup>
defineProps({
  message: { type: String, default: "" }
});
</script>
