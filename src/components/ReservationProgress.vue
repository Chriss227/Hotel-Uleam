<template>
  <section class="booking-progress" aria-label="Progreso de reserva">
    <div class="booking-progress-title">Hotel Uleam</div>
    <div class="booking-steps">
      <div v-for="step in steps" :key="step.number" class="booking-step" :class="{ active: step.number === activeStep, complete: step.number < activeStep }">
        <div class="step-line"></div>
        <div class="step-number">{{ step.number }}</div>
        <div class="step-label">{{ step.label }}</div>
        <div class="step-value">{{ step.value }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHotelStore } from "../stores/hotelStore";
import { money, reservationTotals } from "../utils/formatters";

const route = useRoute();
const store = useHotelStore();

const activeStep = computed(() => {
  if (route.path.includes("/habitaciones")) return 2;
  if (route.path.includes("/detalle-reserva")) return 3;
  if (route.path.includes("/pago")) return 4;
  return 1;
});

const selectedRoom = computed(() => store.roomById(store.selectedRoomId));
const activeReservation = computed(() => store.reservations.find((reservation) => reservation.id === store.activeReservationId) || store.currentReservation);
const total = computed(() => {
  if (activeStep.value >= 4 && activeReservation.value?.total) return activeReservation.value.total;
  if (activeStep.value < 3 || !selectedRoom.value) return 0;
  return reservationTotals(selectedRoom.value, store.search).total;
});

const stayLabel = computed(() => {
  if (!store.search?.checkIn || !store.search?.checkOut) return "Selecciona fechas";
  return `${formatShortDate(store.search.checkIn)} - ${formatShortDate(store.search.checkOut)}`;
});

const guestsLabel = computed(() => {
  const guests = store.totalGuests || 1;
  return `${guests} huesped${guests === 1 ? "" : "es"}`;
});

const roomLabel = computed(() => {
  if (activeStep.value < 3) return "Por elegir";
  return selectedRoom.value?.name || store.roomById(activeReservation.value?.roomId)?.name || "Por elegir";
});

const steps = computed(() => [
  { number: 1, label: "Huespedes", value: guestsLabel.value },
  { number: 2, label: "Dias de estancia", value: stayLabel.value },
  { number: 3, label: "Alojamiento", value: roomLabel.value },
  { number: 4, label: "Total", value: total.value ? money(total.value) : "Pendiente" }
]);

function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("es", { month: "short", day: "numeric" }).format(date);
}
</script>
