<template>
  <main class="page">
    <div class="section-header">
      <h1>Detalle de Reserva</h1>
    </div>

    <section v-if="room" class="grid two">
      <aside class="panel">
        <h2>Resumen de tu reserva</h2>
        <ReservationSummary class="summary-offset" :room="room" :search="store.search" :guests="store.totalGuests" />
      </aside>
      <section class="panel">
        <h2>Tus Datos Personales</h2>
        <form class="form-stack" novalidate @submit.prevent="submit">
          <div class="field">
            <label for="clientName">Nombres y apellidos</label>
            <input id="clientName" v-model.trim="form.clientName" type="text" placeholder="Ingresa tus nombres" @input="form.clientName = nameCharactersOnly(form.clientName)" />
            <FormError :message="errors.clientName" />
          </div>
          <div class="field">
            <label for="identification">Cedula o RUC</label>
            <input id="identification" v-model.trim="form.identification" type="text" inputmode="numeric" placeholder="Ingresa tu identificacion" @input="form.identification = digitsOnlyValue(form.identification)" />
            <FormError :message="errors.identification" />
          </div>
          <div class="field">
            <label for="email">Correo</label>
            <input id="email" v-model.trim="form.email" type="email" placeholder="correo@ejemplo.com" />
            <FormError :message="errors.email" />
          </div>
          <div class="field">
            <label for="phone">Telefono</label>
            <input id="phone" v-model.trim="form.phone" type="tel" inputmode="numeric" placeholder="0999999999" @input="form.phone = digitsOnlyValue(form.phone)" />
            <FormError :message="errors.phone" />
          </div>
          <div class="field">
            <label for="notes">Solicitudes especiales</label>
            <textarea id="notes" v-model.trim="form.notes" placeholder="Opcional"></textarea>
            <FormError :message="errors.notes" />
          </div>
          <button class="button" type="submit">Continuar al Pago</button>
          <AppAlert :message="alert" type="danger" />
        </form>
      </section>
    </section>

    <EmptyState
      v-else
      title="Selecciona una habitacion"
      text="Necesitas elegir una habitacion disponible antes de completar los datos personales."
      to="/cliente/habitaciones"
      action="Ver habitaciones"
    />
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppAlert from "../../components/AppAlert.vue";
import EmptyState from "../../components/EmptyState.vue";
import FormError from "../../components/FormError.vue";
import ReservationSummary from "../../components/ReservationSummary.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { digitsOnlyValue, nameCharactersOnly, validateGuest } from "../../utils/validators";

const router = useRouter();
const store = useHotelStore();
const alert = ref("");
const errors = reactive({});
const form = reactive({ clientName: "", identification: "", email: "", phone: "", notes: "" });
const room = computed(() => store.roomById(store.selectedRoomId));

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  const result = validateGuest(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  const created = store.createReservation({ ...form });
  if (!created.ok) {
    alert.value = created.message;
    return;
  }
  router.push("/cliente/pago");
}
</script>
