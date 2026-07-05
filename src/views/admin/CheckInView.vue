<template>
  <div>
    <h1>Check-in</h1>
    <section class="grid two admin-section">
      <div class="panel">
        <h2>Buscar Cliente</h2>
        <form class="form-stack" @submit.prevent="search">
          <div class="field">
            <label for="clientQuery">Cedula, reserva o nombre del cliente</label>
            <input id="clientQuery" v-model.trim="query" type="text" placeholder="Ingresa datos de reserva" />
            <FormError :message="searchError" />
          </div>
          <button class="button" type="submit">Buscar</button>
        </form>
        <div class="result-box">
          <template v-if="found">
            <p><strong>{{ found.clientName }}</strong></p>
            <p>Reserva: {{ found.id }}</p>
            <p>Habitacion: {{ found.roomId }}</p>
          </template>
          <p v-else class="muted">Busca una reserva confirmada para ver los detalles.</p>
        </div>
      </div>

      <div class="panel">
        <h2>Asignar Habitacion</h2>
        <form class="form-stack" novalidate @submit.prevent="submit">
          <div class="field">
            <label for="reservationId">Reserva</label>
            <select id="reservationId" v-model="form.reservationId" @change="syncRoom">
              <option value="">Seleccionar reserva</option>
              <option v-for="reservation in confirmed" :key="reservation.id" :value="reservation.id">
                {{ reservation.id }} - {{ reservation.clientName }}
              </option>
            </select>
            <FormError :message="errors.reservationId" />
          </div>
          <div class="field">
            <label for="roomId">Numero de habitacion</label>
            <input id="roomId" v-model.trim="form.roomId" type="text" inputmode="numeric" placeholder="Ej: 101" @input="form.roomId = digitsOnlyValue(form.roomId)" />
            <FormError :message="errors.roomId" />
          </div>
          <button class="button" type="submit">Confirmar Check-in</button>
          <AppAlert :message="alert" />
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import AppAlert from "../../components/AppAlert.vue";
import FormError from "../../components/FormError.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { digitsOnlyValue, validateCheckIn } from "../../utils/validators";

const store = useHotelStore();
const query = ref("");
const searchError = ref("");
const found = ref(null);
const alert = ref("");
const errors = reactive({});
const form = reactive({ reservationId: "", roomId: "" });
const confirmed = computed(() => store.confirmedReservations);

function search() {
  searchError.value = "";
  const term = query.value.toLowerCase();
  if (!term) {
    searchError.value = "Ingresa un dato de busqueda.";
    return;
  }
  found.value = confirmed.value.find((reservation) => {
    return reservation.clientName.toLowerCase().includes(term) || reservation.id.toLowerCase() === term || reservation.identification === term;
  }) || null;
  if (found.value) {
    form.reservationId = found.value.id;
    form.roomId = found.value.roomId;
  }
}

function syncRoom() {
  const reservation = confirmed.value.find((item) => item.id === form.reservationId);
  form.roomId = reservation?.roomId || "";
}

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  const result = validateCheckIn(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  const checkIn = store.createCheckIn({ ...form });
  alert.value = checkIn.ok ? "Check-in confirmado correctamente." : checkIn.message;
  if (checkIn.ok) {
    form.reservationId = "";
    form.roomId = "";
    found.value = null;
    query.value = "";
  }
}
</script>
