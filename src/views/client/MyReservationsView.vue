<template>
  <main class="page">
    <div class="section-header">
      <div>
        <h1>Mis Reservas</h1>
        <p class="muted">Consulta las reservas que has realizado con tu cuenta.</p>
      </div>
      <RouterLink class="button secondary" to="/cliente/reservas">Nueva reserva</RouterLink>
    </div>

    <AppAlert :message="alertMessage" :type="alertType" />

    <section v-if="reservations.length" class="reservation-history">
      <article v-for="reservation in reservations" :key="reservation.id" class="panel reservation-item">
        <div>
          <div class="reservation-kicker">{{ reservation.id }}</div>
          <h2>{{ roomName(reservation.roomId) }}</h2>
          <p class="muted">{{ reservation.clientName }} &middot; {{ reservation.guests }} huesped{{ reservation.guests === 1 ? "" : "es" }}</p>
        </div>
        <div class="reservation-meta">
          <span>Entrada</span>
          <strong>{{ reservation.checkIn }}</strong>
        </div>
        <div class="reservation-meta">
          <span>Salida</span>
          <strong>{{ reservation.checkOut }}</strong>
        </div>
        <div class="reservation-meta">
          <span>Estado</span>
          <strong class="status" :class="reservation.status">{{ statusText(reservation) }}</strong>
        </div>
        <div class="reservation-meta">
          <span>Pago</span>
          <strong>{{ paymentText(reservation) }}</strong>
        </div>
        <div class="reservation-total">{{ money(reservation.total) }}</div>
        <div class="reservation-actions">
          <button v-if="canDownloadReceipt(reservation)" class="button small green" type="button" @click="downloadReceipt(reservation)">
            Comprobante
          </button>
          <button v-if="reservation.status === 'completed'" class="button small secondary" type="button" @click="removeCompleted(reservation.id)">
            Eliminar
          </button>
        </div>
      </article>
    </section>

    <EmptyState
      v-else
      title="Aun no tienes reservas"
      text="Cuando completes una reserva con tu cuenta, aparecera en este listado."
      to="/cliente/reservas"
      action="Crear reserva"
    />
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AppAlert from "../../components/AppAlert.vue";
import EmptyState from "../../components/EmptyState.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { money } from "../../utils/formatters";
import { downloadReservationReceiptPdf } from "../../utils/invoicePdf";

const route = useRoute();
const store = useHotelStore();
const alert = ref("");
const alertType = ref("success");
const reservations = computed(() => store.userReservations);
const successMessage = computed(() => {
  const reservationId = route.query.reserved;
  return reservationId ? `Reserva ${reservationId} realizada correctamente. Se genero el comprobante PDF.` : "";
});
const alertMessage = computed(() => alert.value || successMessage.value);

function roomName(roomId) {
  return store.roomById(roomId)?.name || `Habitacion ${roomId}`;
}

function statusText(reservation) {
  if (reservation.status === "confirmed") return "Confirmada";
  if (reservation.status === "pending") return "Pendiente";
  if (reservation.status === "checked-in") return "En hospedaje";
  if (reservation.status === "completed") return "Completada";
  return reservation.status;
}

function paymentText(reservation) {
  const payment = reservation.payment;
  if (!payment) return reservation.paid ? "Pagado" : "Pendiente";
  if (payment.method === "card") return `Credito **** ${payment.cardLast4 || ""}`.trim();
  if (payment.method === "debit") return `Debito **** ${payment.cardLast4 || ""}`.trim();
  if (payment.method === "transfer") return `Transferencia ${payment.transferReference || ""}`.trim();
  if (payment.method === "cash") return "En recepcion";
  return reservation.paid ? "Pagado" : "Pendiente";
}

function canDownloadReceipt(reservation) {
  return ["confirmed", "checked-in", "completed"].includes(reservation.status);
}

function downloadReceipt(reservation) {
  const room = store.roomById(reservation.roomId);
  downloadReservationReceiptPdf(reservation, room);
  alertType.value = "success";
  alert.value = `Comprobante de ${reservation.id} generado correctamente.`;
}

function removeCompleted(reservationId) {
  const confirmed = window.confirm(`¿Seguro que quieres eliminar la reserva ${reservationId}?`);
  if (!confirmed) return;
  const result = store.deleteCompletedReservation(reservationId);
  alertType.value = result.ok ? "success" : "danger";
  alert.value = result.ok ? "Reserva completada eliminada correctamente." : result.message;
}
</script>
