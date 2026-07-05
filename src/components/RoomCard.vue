<template>
  <article class="room-card">
    <div class="room-image" :class="{ 'has-photo': room.imageUrl }" aria-hidden="true">
      <img v-if="room.imageUrl" :src="room.imageUrl" :alt="room.name" loading="lazy" />
    </div>
    <div>
      <h3>{{ room.name }}</h3>
      <p class="muted">{{ room.type }} &middot; Piso {{ room.floor }} &middot; {{ room.beds }}</p>
      <div class="room-meta">
        <span class="tag">{{ room.view }}</span>
        <span v-for="amenity in room.amenities" :key="amenity" class="tag">{{ amenity }}</span>
        <span class="status" :class="room.status">{{ statusLabels[room.status] }}</span>
      </div>
      <p class="price">{{ money(room.price) }} / noche</p>
    </div>
    <button class="button" type="button" :disabled="room.status !== 'available'" @click="$emit('select', room.id)">
      Reservar
    </button>
  </article>
</template>

<script setup>
import { money } from "../utils/formatters";
import { statusLabels } from "../stores/hotelStore";

defineProps({
  room: { type: Object, required: true }
});

defineEmits(["select"]);
</script>
