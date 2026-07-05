<template>
  <main class="page">
    <section class="panel">
      <div class="section-header">
        <div>
          <h1>Sistema de Reservas</h1>
          <p class="muted">Consulta disponibilidad y selecciona una habitacion.</p>
        </div>
      </div>
      <form class="form-grid" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="checkIn">Check-in</label>
          <input id="checkIn" v-model="form.checkIn" type="date" :min="today" />
          <FormError :message="errors.checkIn" />
        </div>
        <div class="field">
          <label for="checkOut">Check-out</label>
          <input id="checkOut" v-model="form.checkOut" type="date" :min="checkOutMin" />
          <FormError :message="errors.checkOut" />
        </div>
        <div class="field">
          <label for="adults">Adultos</label>
          <input id="adults" v-model.number="form.adults" type="number" min="0" />
          <FormError :message="errors.adults" />
        </div>
        <div class="field">
          <label for="children">Niños</label>
          <input id="children" v-model.number="form.children" type="number" min="0" />
          <FormError :message="errors.children" />
        </div>
        <div class="field">
          <label for="babies">Bebes</label>
          <input id="babies" v-model.number="form.babies" type="number" min="0" />
          <FormError :message="errors.babies" />
        </div>
        <button class="button" type="submit">Buscar Disponibilidad</button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import FormError from "../../components/FormError.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { todayISO, tomorrowISO } from "../../utils/formatters";
import { validateSearch } from "../../utils/validators";

const router = useRouter();
const store = useHotelStore();
const form = reactive({ ...store.search, ...store.guests });
const errors = reactive({});
const today = todayISO();
const checkOutMin = computed(() => {
  if (!form.checkIn || form.checkIn < today) return tomorrowISO();
  const nextDay = new Date(`${form.checkIn}T00:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);
  const year = nextDay.getFullYear();
  const month = String(nextDay.getMonth() + 1).padStart(2, "0");
  const day = String(nextDay.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  const result = validateSearch(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  store.saveSearch(result.data);
  router.push("/cliente/habitaciones");
}
</script>
