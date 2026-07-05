<template>
  <div>
    <h1>Reportes</h1>
    <section class="panel admin-section">
      <h2>Filtros</h2>
      <form class="form-grid" @submit.prevent="apply">
        <div class="field">
          <label for="month">Fecha</label>
          <input id="month" v-model="filters.month" type="month" />
        </div>
        <div class="field">
          <label for="roomType">Tipo de habitacion</label>
          <select id="roomType" v-model="filters.roomType">
            <option>Todas</option>
            <option>Doble</option>
            <option>Individual</option>
            <option>Suite</option>
          </select>
        </div>
        <div class="field">
          <label for="reservationStatus">Estado de reserva</label>
          <select id="reservationStatus" v-model="filters.reservationStatus">
            <option value="Todos">Todos</option>
            <option value="confirmed">Confirmada</option>
            <option value="pending">Pendiente</option>
            <option value="checked-in">En hospedaje</option>
            <option value="completed">Completada</option>
          </select>
        </div>
        <button class="button" type="submit">Aplicar Filtros</button>
      </form>
      <AppAlert :message="alert" />
    </section>

    <section class="grid four admin-section">
      <StatCard label="Ingresos" :value="money(stats.revenue)" />
      <StatCard label="Reservas confirmadas" :value="stats.confirmedCount" />
      <StatCard label="En hospedaje" :value="stats.checkedInCount" />
      <StatCard label="Clientes frecuentes" :value="stats.frequentClients" />
    </section>

    <section class="grid two admin-section">
      <div class="panel">
        <h2>Ingresos por tipo</h2>
        <div class="chart-box">
          <Bar :data="revenueChart" :options="chartOptions" />
        </div>
      </div>
      <div class="panel">
        <h2>Reservas por estado</h2>
        <div class="chart-box">
          <Doughnut :data="statusChart" :options="chartOptions" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip } from "chart.js";
import AppAlert from "../../components/AppAlert.vue";
import StatCard from "../../components/StatCard.vue";
import { useHotelStore } from "../../stores/hotelStore";
import { money } from "../../utils/formatters";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const store = useHotelStore();
const alert = ref("");
const filters = reactive({ month: "", roomType: "Todas", reservationStatus: "Todos" });
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };
const stats = computed(() => store.reportStats(filters));

const revenueChart = computed(() => {
  const types = ["Individual", "Doble", "Suite"];
  const data = types.map((type) => {
    return stats.value.reservations.reduce((sum, reservation) => {
      const room = store.roomById(reservation.roomId);
      const countsAsRevenue = ["confirmed", "checked-in", "completed"].includes(reservation.status);
      return room?.type === type && countsAsRevenue ? sum + Number(reservation.total || 0) : sum;
    }, 0);
  });
  return { labels: types, datasets: [{ label: "Ingresos", data, backgroundColor: ["#c8922b", "#0f7b45", "#c1121f"] }] };
});

const statusChart = computed(() => {
  return {
    labels: ["Confirmadas", "Pendientes", "En hospedaje", "Completadas"],
    datasets: [
      {
        data: [stats.value.confirmedCount, stats.value.pendingCount, stats.value.checkedInCount, stats.value.completedCount],
        backgroundColor: ["#0f7b45", "#c8922b", "#315f9f", "#667085"]
      }
    ]
  };
});

function apply() {
  alert.value = "Filtros aplicados.";
}
</script>
