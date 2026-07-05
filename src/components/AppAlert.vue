<template>
  <div v-if="message" class="alert show" :class="type">{{ message }}</div>
</template>

<script setup>
defineProps({
  message: { type: String, default: "" },
  type: { type: String, default: "success" }
});
</script>
