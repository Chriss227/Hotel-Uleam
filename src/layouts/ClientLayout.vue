<template>
  <div>
    <header class="topbar">
      <RouterLink class="brand-mark" to="/cliente/reservas">Hotel Uleam</RouterLink>
      <nav class="topnav">
        <RouterLink to="/cliente/reservas">Inicio</RouterLink>
        <RouterLink to="/cliente/mis-reservas">Reservas</RouterLink>
        <button class="nav-button" type="button" @click="logout">Salir</button>
      </nav>
    </header>
    <ReservationProgress v-if="showReservationProgress" />
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ReservationProgress from "../components/ReservationProgress.vue";
import { useHotelStore } from "../stores/hotelStore";

const route = useRoute();
const router = useRouter();
const store = useHotelStore();
const progressRoutes = new Set(["client-reservations", "client-rooms", "client-detail", "client-payment"]);
const showReservationProgress = computed(() => progressRoutes.has(route.name));

function logout() {
  store.logout();
  router.push("/login");
}
</script>
