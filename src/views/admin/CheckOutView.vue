<template>
  <div>
    <h1>Check-Out</h1>
    <section class="panel admin-section">
      <h2>Detalles del Cliente y Consumos</h2>
      <form class="form-stack" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="roomId">Habitacion ocupada</label>
          <select id="roomId" v-model="form.roomId">
            <option value="">Seleccionar habitacion</option>
            <option v-for="checkIn in store.checkIns" :key="checkIn.reservationId" :value="checkIn.roomId">
              Habitacion {{ checkIn.roomId }} - {{ checkIn.reservationId }}
            </option>
          </select>
          <FormError :message="errors.roomId" />
        </div>
        <div class="grid three">
          <div class="field">
            <label for="minibar">Minibar</label>
            <input id="minibar" v-model.number="form.minibar" type="number" min="0" />
            <FormError :message="errors.minibar" />
          </div>
          <div class="field">
            <label for="restaurant">Restaurante</label>
            <input id="restaurant" v-model.number="form.restaurant" type="number" min="0" />
            <FormError :message="errors.restaurant" />
          </div>
          <div class="field">
            <label for="laundry">Lavanderia</label>
            <input id="laundry" v-model.number="form.laundry" type="number" min="0" />
            <FormError :message="errors.laundry" />
          </div>
        </div>
        <div class="summary-row total services-total">
          <span>Total de consumos</span>
          <strong>{{ money(servicesTotal) }}</strong>
        </div>
        <button class="button" type="submit">Finalizar Check-Out</button>
        <AppAlert :message="alert" />
      </form>
      <div v-if="pendingInvoice" class="invoice-actions">
        <button class="button green" type="button" @click="generateInvoice">Generar factura PDF</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import AppAlert from "../../components/AppAlert.vue";
import FormError from "../../components/FormError.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { money } from "../../utils/formatters";
import { downloadInvoicePdf } from "../../utils/invoicePdf";
import { validateCheckOut } from "../../utils/validators";

const store = useHotelStore();
const alert = ref("");
const pendingInvoice = ref(null);
const errors = reactive({});
const form = reactive({ roomId: "", minibar: 0, restaurant: 0, laundry: 0 });
const servicesTotal = computed(() => Number(form.minibar || 0) + Number(form.restaurant || 0) + Number(form.laundry || 0));

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  pendingInvoice.value = null;
  const result = validateCheckOut(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  const checkOut = store.createCheckOut({ ...form });
  if (!checkOut.ok) {
    alert.value = checkOut.message;
    return;
  }
  pendingInvoice.value = checkOut.invoice;
  alert.value = `Check-out finalizado. Extras a cobrar: ${money(checkOut.grandTotal)}. La factura esta lista para generar.`;
  form.roomId = "";
  form.minibar = 0;
  form.restaurant = 0;
  form.laundry = 0;
}

function generateInvoice() {
  if (!pendingInvoice.value) return;
  downloadInvoicePdf(pendingInvoice.value);
  alert.value = "Factura PDF generada correctamente.";
}
</script>
