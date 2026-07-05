<template>
  <section class="login-card">
    <div class="brand-lockup">
      <div class="brand-mark">Uleam</div>
      <div class="brand-subtitle">Hotel Universitario</div>
      <h1>Crear Cuenta</h1>
      <p class="muted">Registra tus datos para reservar habitaciones como usuario.</p>
    </div>

    <form class="form-stack" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="name">Nombres y apellidos</label>
        <input id="name" v-model.trim="form.name" type="text" placeholder="Ingresa tu nombre completo" @input="form.name = nameCharactersOnly(form.name)" />
        <FormError :message="errors.name" />
      </div>
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="correo@uleam.edu.ec" />
        <FormError :message="errors.email" />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="form.password" type="password" placeholder="Minimo 6 caracteres" />
        <FormError :message="errors.password" />
      </div>
      <div class="field">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Repite tu contraseña" />
        <FormError :message="errors.confirmPassword" />
      </div>

      <button class="button" type="submit">Crear Cuenta</button>
      <RouterLink class="button secondary" to="/login">Ya tengo cuenta</RouterLink>
      <AppAlert :message="alert" type="danger" />
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppAlert from "../components/AppAlert.vue";
import FormError from "../components/FormError.vue";
import { useHotelStore } from "../stores/hotelStore";
import { nameCharactersOnly, validateRegister } from "../utils/validators";

const router = useRouter();
const store = useHotelStore();
const alert = ref("");
const form = reactive({ name: "", email: "", password: "", confirmPassword: "" });
const errors = reactive({});

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";

  const validation = validateRegister(form);
  Object.assign(errors, validation.errors);
  if (!validation.valid) return;

  const result = store.registerUser(form);
  if (!result.ok) {
    errors.email = result.message;
    alert.value = result.message;
    return;
  }

  router.push(result.redirect);
}
</script>
