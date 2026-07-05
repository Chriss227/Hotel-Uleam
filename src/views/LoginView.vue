<template>
  <section class="login-card">
    <div class="brand-lockup">
      <div class="brand-mark">Uleam</div>
      <div class="brand-subtitle">Hotel Universitario</div>
      <h1>Iniciar Sesion</h1>
      <p class="muted">Usuario: usuario@uleam.edu.ec / 123456<br />Admin: admin@uleam.edu.ec / admin123</p>
    </div>

    <form class="form-stack" novalidate @submit.prevent="submit">
      <div class="field">
        <label>Tipo de acceso</label>
        <div class="role-switch">
          <label><input v-model="form.role" type="radio" value="user" /><span>Usuario</span></label>
          <label><input v-model="form.role" type="radio" value="admin" /><span>Administrador</span></label>
        </div>
        <FormError :message="errors.role" />
      </div>
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="correo@uleam.edu.ec" />
        <FormError :message="errors.email" />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="form.password" type="password" placeholder="Contraseña" />
        <FormError :message="errors.password" />
      </div>
      <button class="button" type="submit">Iniciar Sesion</button>
      <RouterLink class="button secondary" to="/registro">Crear cuenta nueva</RouterLink>
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
import { isEmail, required } from "../utils/validators";

const router = useRouter();
const store = useHotelStore();
const alert = ref("");
const form = reactive({ role: "user", email: "", password: "" });
const errors = reactive({});

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  if (!required(form.role)) errors.role = "Selecciona un rol.";
  if (!isEmail(form.email)) errors.email = "Ingresa un correo valido.";
  if (!required(form.password)) errors.password = "Ingresa la contraseña.";
  if (Object.keys(errors).length) return;

  const result = store.login(form.role, form.email, form.password);
  if (!result.ok) {
    errors.password = result.message;
    alert.value = result.message;
    return;
  }
  router.push(result.redirect);
}
</script>
