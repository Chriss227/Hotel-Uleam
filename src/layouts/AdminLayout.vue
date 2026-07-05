<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <h1>Admin Panel</h1>
      <nav class="side-nav">
        <RouterLink to="/admin/dashboard">Resumen</RouterLink>
        <RouterLink to="/admin/checkin">Check-in</RouterLink>
        <RouterLink to="/admin/checkout">Check-out</RouterLink>
        <RouterLink to="/admin/habitaciones">Habitaciones</RouterLink>
        <RouterLink to="/admin/reportes">Reportes</RouterLink>
        <button type="button" @click="logout">Salir</button>
      </nav>
    </aside>
    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useHotelStore } from "../stores/hotelStore";

const router = useRouter();
const store = useHotelStore();

function logout() {
  store.logout();
  router.push("/login");
}
</script>
