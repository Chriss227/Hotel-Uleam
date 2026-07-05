<template>
  <main class="page">
    <div class="section-header">
      <div>
        <h1>Nuestras Habitaciones</h1>
        <p class="muted">Elige una habitacion disponible segun tu busqueda.</p>
      </div>
      <RouterLink class="button secondary" to="/cliente/reservas">Cambiar busqueda</RouterLink>
    </div>

    <AppAlert :message="alert" type="danger" />

    <section v-if="rooms.length" class="room-list">
      <RoomCard v-for="room in rooms" :key="room.id" :room="room" @select="selectRoom" />
    </section>
    <EmptyState
      v-else
      title="Sin habitaciones disponibles"
      text="Cambia la busqueda o reduce el numero de huespedes para ver mas opciones."
      to="/cliente/reservas"
      action="Cambiar busqueda"
    />
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AppAlert from "../../components/AppAlert.vue";
import EmptyState from "../../components/EmptyState.vue";
import RoomCard from "../../components/RoomCard.vue";
import { useHotelStore } from "../../stores/hotelStore";

const router = useRouter();
const store = useHotelStore();
const alert = ref("");
const rooms = computed(() => store.availableRooms);

function selectRoom(roomId) {
  alert.value = "";
  if (!store.selectRoom(roomId)) {
    alert.value = "La habitacion seleccionada no esta disponible.";
    return;
  }
  router.push("/cliente/detalle-reserva");
}
</script>
