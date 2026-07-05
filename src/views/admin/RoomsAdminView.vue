<template>
  <div>
    <header class="admin-header">
      <div>
        <h1>Gestion de habitaciones</h1>
        <p class="muted">Administra el estado, precio y disponibilidad de cada habitacion.</p>
      </div>
    </header>

    <section class="rooms-admin-layout">
      <article class="panel rooms-list-panel">
        <div class="panel-header">
          <div>
            <h2>Habitaciones registradas</h2>
            <p class="muted">Lista actual del inventario del hotel.</p>
          </div>
        </div>
        <div class="filters-row">
          <select v-model="filters.type">
            <option value="">Todos los tipos</option>
            <option>Doble</option>
            <option>Individual</option>
            <option>Suite</option>
          </select>
          <select v-model="filters.status">
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <div class="table-wrap panel-table">
          <table>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Piso</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.id">
                <td>{{ room.id }}</td>
                <td>
                  <img v-if="room.imageUrl" class="room-thumb" :src="room.imageUrl" :alt="room.name" />
                  <span v-else class="muted">Sin imagen</span>
                </td>
                <td>{{ room.name }}</td>
                <td>{{ room.type }}</td>
                <td>{{ room.floor }}</td>
                <td><span class="status" :class="room.status">{{ statusLabels[room.status] }}</span></td>
                <td>{{ money(room.price) }}</td>
                <td>
                  <div class="table-actions">
                    <button class="button small green" type="button" @click="edit(room)">Editar</button>
                    <button class="button small" type="button" @click="remove(room.id)">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside class="panel room-form-panel">
        <div class="panel-header">
          <div>
            <h2>Agregar o editar</h2>
            <p class="muted">Completa los datos principales de la habitacion.</p>
          </div>
        </div>

        <form class="form-stack" novalidate @submit.prevent="submit">
          <div class="field">
            <label for="id">Numero</label>
            <input id="id" v-model.trim="form.id" type="text" inputmode="numeric" placeholder="Ej: 301" @input="form.id = digitsOnlyValue(form.id)" />
            <FormError :message="errors.id" />
          </div>
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" v-model.trim="form.name" type="text" placeholder="Habitacion Deluxe" @input="form.name = nameCharactersOnly(form.name)" />
            <FormError :message="errors.name" />
          </div>
          <div class="field">
            <label for="type">Tipo</label>
            <select id="type" v-model="form.type">
              <option value="">Seleccionar</option>
              <option>Doble</option>
              <option>Individual</option>
              <option>Suite</option>
            </select>
            <FormError :message="errors.type" />
          </div>
          <div class="grid two">
            <div class="field">
              <label for="floor">Piso</label>
              <input id="floor" v-model.number="form.floor" type="number" min="1" />
              <FormError :message="errors.floor" />
            </div>
            <div class="field">
              <label for="capacity">Capacidad</label>
              <input id="capacity" v-model.number="form.capacity" type="number" min="1" />
              <FormError :message="errors.capacity" />
            </div>
          </div>
          <div class="field">
            <label for="price">Precio por noche</label>
            <input id="price" v-model.number="form.price" type="number" min="1" />
            <FormError :message="errors.price" />
          </div>
          <div class="field">
            <label for="status">Estado</label>
            <select id="status" v-model="form.status">
              <option value="">Seleccionar</option>
              <option value="available">Disponible</option>
              <option value="occupied">Ocupada</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
            <FormError :message="errors.status" />
          </div>
          <div class="field">
            <label for="imageUrl">Imagen de la habitacion</label>
            <input id="imageUrl" v-model.trim="form.imageUrl" type="url" placeholder="/images/habitaciones/301.jpg" />
            <input type="file" accept="image/*" @change="loadImageFile" />
            <p class="muted small-note">Puedes pegar una ruta/URL o seleccionar una imagen desde tu equipo.</p>
            <FormError :message="imageError || errors.imageUrl" />
            <div v-if="form.imageUrl" class="image-preview">
              <img :src="form.imageUrl" alt="Vista previa de la habitacion" />
              <button class="button small secondary" type="button" @click="clearImage">Quitar imagen</button>
            </div>
          </div>
          <button class="button" type="submit">Guardar Habitacion</button>
          <button class="button secondary" type="button" @click="resetForm">Limpiar</button>
          <AppAlert :message="alert" :type="alertType" />
        </form>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import AppAlert from "../../components/AppAlert.vue";
import FormError from "../../components/FormError.vue";
import { statusLabels, useHotelStore } from "../../stores/hotelStore";
import { money } from "../../utils/formatters";
import { digitsOnlyValue, nameCharactersOnly, validateRoom } from "../../utils/validators";

const store = useHotelStore();
const alert = ref("");
const alertType = ref("success");
const imageError = ref("");
const errors = reactive({});
const filters = reactive({ type: "", status: "" });
const form = reactive({ id: "", name: "", type: "", floor: "", capacity: "", price: "", status: "", imageUrl: "" });

const filteredRooms = computed(() => store.rooms.filter((room) => {
  const matchesType = !filters.type || room.type === filters.type;
  const matchesStatus = !filters.status || room.status === filters.status;
  return matchesType && matchesStatus;
}));

function resetForm() {
  Object.assign(form, { id: "", name: "", type: "", floor: "", capacity: "", price: "", status: "", imageUrl: "" });
  imageError.value = "";
  Object.keys(errors).forEach((key) => delete errors[key]);
}

function edit(room) {
  Object.assign(form, {
    id: room.id,
    name: room.name,
    type: room.type,
    floor: room.floor,
    capacity: room.capacity,
    price: room.price,
    status: room.status,
    imageUrl: room.imageUrl || ""
  });
}

function loadImageFile(event) {
  const [file] = event.target.files || [];
  imageError.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    imageError.value = "Selecciona un archivo de imagen valido.";
    event.target.value = "";
    return;
  }
  if (file.size > 1500000) {
    imageError.value = "La imagen debe pesar menos de 1.5 MB para guardarse en el navegador.";
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.imageUrl = reader.result;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  form.imageUrl = "";
  imageError.value = "";
}

function remove(roomId) {
  store.deleteRoom(roomId);
  alertType.value = "success";
  alert.value = "Habitacion eliminada correctamente.";
}

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  alert.value = "";
  alertType.value = "success";
  imageError.value = "";
  const result = validateRoom(form);
  Object.assign(errors, result.errors);
  if (!result.valid) return;
  const saved = store.saveRoom({ ...form });
  if (!saved.ok) {
    alertType.value = "danger";
    alert.value = saved.message;
    return;
  }
  alertType.value = "success";
  alert.value = "Habitacion guardada correctamente.";
  resetForm();
}
</script>
