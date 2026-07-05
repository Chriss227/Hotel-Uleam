<template>
  <main class="page">
    <section v-if="reservation && room" class="grid two">
      <section class="panel">
        <h1>Metodo de Pago</h1>
        <form class="form-stack" novalidate @submit.prevent="submit">
          <div class="field">
            <label>Selecciona un metodo de pago</label>
            <div class="payment-methods">
              <label><input v-model="form.method" type="radio" value="card" />Tarjeta de Credito</label>
              <label><input v-model="form.method" type="radio" value="debit" />Tarjeta de Debito</label>
              <label><input v-model="form.method" type="radio" value="transfer" />Transferencia Bancaria</label>
              <label><input v-model="form.method" type="radio" value="cash" />Pago en Recepcion</label>
            </div>
            <FormError :message="errors.method" />
          </div>
          <template v-if="isCardPayment">
            <div class="field">
              <label for="cardNumber">Numero de tarjeta</label>
              <input id="cardNumber" v-model.trim="form.cardNumber" type="text" inputmode="numeric" placeholder="0000 0000 0000 0000" @input="form.cardNumber = cardNumberCharactersOnly(form.cardNumber)" />
              <FormError :message="errors.cardNumber" />
            </div>
            <div class="field">
              <label for="cardName">Nombre del titular</label>
              <input id="cardName" v-model.trim="form.cardName" type="text" placeholder="Nombre en la tarjeta" @input="form.cardName = nameCharactersOnly(form.cardName)" />
              <FormError :message="errors.cardName" />
            </div>
            <div class="grid two">
              <div class="field">
                <label for="expiry">Fecha de expiracion</label>
                <input id="expiry" v-model.trim="form.expiry" type="text" placeholder="MM/AA" />
                <FormError :message="errors.expiry" />
              </div>
              <div class="field">
                <label for="cvv">CVV</label>
                <input id="cvv" v-model.trim="form.cvv" type="text" inputmode="numeric" placeholder="000" @input="form.cvv = digitsOnlyValue(form.cvv)" />
                <FormError :message="errors.cvv" />
              </div>
            </div>
          </template>

          <template v-else-if="form.method === 'transfer'">
            <div class="field">
              <label for="transferBank">Banco emisor</label>
              <select id="transferBank" v-model="form.transferBank">
                <option value="">Selecciona un banco</option>
                <option>Banco Pichincha</option>
                <option>Banco del Pacifico</option>
                <option>Banco Guayaquil</option>
                <option>Produbanco</option>
              </select>
              <FormError :message="errors.transferBank" />
            </div>
            <div class="field">
              <label for="transferReference">Referencia de transferencia</label>
              <input id="transferReference" v-model.trim="form.transferReference" type="text" inputmode="numeric" placeholder="Ej. 123456789" @input="form.transferReference = digitsOnlyValue(form.transferReference)" />
              <FormError :message="errors.transferReference" />
            </div>
            <p class="muted small-note">La reserva quedara confirmada con la referencia bancaria ingresada.</p>
          </template>

          <div v-else-if="form.method === 'cash'" class="result-box">
            <p><strong>Pago en recepcion</strong></p>
            <p class="muted">No necesitas ingresar datos de tarjeta. El total se cancelara al llegar al hotel.</p>
          </div>

          <button class="button" type="submit">Confirmar Reserva</button>
          <AppAlert :message="alert" />
        </form>
      </section>
      <aside class="panel">
        <h2>Resumen de la Reserva</h2>
        <ReservationSummary class="summary-offset" :room="room" :search="reservation" :guests="reservation.guests" />
        <div class="summary-list payment-summary">
          <div class="summary-row"><span>Metodo</span><strong>{{ methodLabel }}</strong></div>
          <div v-if="isCardPayment && form.cardNumber" class="summary-row"><span>Tarjeta</span><strong>**** {{ cardLast4 }}</strong></div>
          <div v-if="form.method === 'transfer' && form.transferReference" class="summary-row">
            <span>Referencia</span><strong>{{ form.transferReference }}</strong>
          </div>
          <div v-if="form.method === 'cash'" class="summary-row"><span>Pago</span><strong>En recepcion</strong></div>
        </div>
      </aside>
    </section>

    <EmptyState
      v-else
      title="No hay una reserva pendiente"
      text="Regresa al inicio para crear una reserva antes de pagar."
      to="/cliente/reservas"
      action="Ir al inicio"
    />
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppAlert from "../../components/AppAlert.vue";
import EmptyState from "../../components/EmptyState.vue";
import FormError from "../../components/FormError.vue";
import ReservationSummary from "../../components/ReservationSummary.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { downloadReservationReceiptPdf } from "../../utils/invoicePdf";
import { cardNumberCharactersOnly, digitsOnlyValue, nameCharactersOnly, validatePayment } from "../../utils/validators";

const store = useHotelStore();
const router = useRouter();
const alert = ref("");
const errors = reactive({});
const form = reactive({
  method: "",
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvv: "",
  transferBank: "",
  transferReference: ""
});
const reservationId = ref(store.currentReservation?.id || "");
const reservation = computed(() => store.reservations.find((item) => item.id === reservationId.value));
const room = computed(() => (reservation.value ? store.roomById(reservation.value.roomId) : null));
const methodLabels = {
  card: "Tarjeta de credito",
  debit: "Tarjeta de debito",
  transfer: "Transferencia bancaria",
  cash: "Pago en recepcion"
};
const isCardPayment = computed(() => ["card", "debit"].includes(form.method));
const methodLabel = computed(() => methodLabels[form.method] || "Pendiente");
const cardLast4 = computed(() => String(form.cardNumber || "").replace(/\D/g, "").slice(-4));

watch(
  () => form.method,
  (method) => {
    Object.keys(errors).forEach((key) => delete errors[key]);
    alert.value = "";
    if (!["card", "debit"].includes(method)) {
      form.cardNumber = "";
      form.cardName = "";
      form.expiry = "";
      form.cvv = "";
    }
    if (method !== "transfer") {
      form.transferBank = "";
      form.transferReference = "";
    }
  }
);

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  const result = validatePayment(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  const id = reservation.value.id;
  if (store.confirmPayment(id, result.data)) {
    const confirmedReservation = store.reservations.find((item) => item.id === id);
    downloadReservationReceiptPdf(confirmedReservation, room.value);
    router.push({ path: "/cliente/mis-reservas", query: { reserved: id } });
    return;
  }
  alert.value = "La habitacion ya no esta disponible para esas fechas. Elige otra habitacion para continuar.";
}
</script>
