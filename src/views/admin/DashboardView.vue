<template>
  <div>
    <div class="admin-header">
      <div>
        <h1>Dashboard Administrativo</h1>
        <p class="muted">Resumen operativo del hotel.</p>
      </div>
    </div>

    <section class="grid four">
      <StatCard label="Reservas confirmadas" :value="stats.confirmed" />
      <StatCard label="Habitaciones ocupadas" :value="stats.occupied" />
      <StatCard label="Ingresos" :value="money(stats.revenue)" />
      <StatCard label="Clientes hospedados" :value="stats.hosted" />
    </section>

    <section class="grid two admin-charts">
      <div class="panel">
        <h2>Reservas por estado</h2>
        <div class="chart-box">
          <Bar :data="statusChart" :options="chartOptions" />
        </div>
      </div>
      <div class="panel">
        <h2>Estado de habitaciones</h2>
        <div class="chart-box">
          <Doughnut :data="roomsChart" :options="chartOptions" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip } from "chart.js";
import StatCard from "../../components/StatCard.vue";
import { statusLabels, useHotelStore } from "../../stores/hotelStore";
import { money } from "../../utils/formatters";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const store = useHotelStore();
const stats = computed(() => store.dashboardStats);
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

const statusChart = computed(() => {
  const confirmed = store.reservations.filter((item) => item.status === "confirmed").length;
  const pending = store.reservations.filter((item) => item.status === "pending").length;
  const checkedIn = store.reservations.filter((item) => item.status === "checked-in").length;
  const completed = store.reservations.filter((item) => item.status === "completed").length;
  return {
    labels: ["Confirmadas", "Pendientes", "En hospedaje", "Completadas"],
    datasets: [{ label: "Reservas", data: [confirmed, pending, checkedIn, completed], backgroundColor: ["#0f7b45", "#c8922b", "#315f9f", "#667085"] }]
  };
});

const roomsChart = computed(() => {
  const keys = Object.keys(statusLabels);
  return {
    labels: keys.map((key) => statusLabels[key]),
    datasets: [
      {
        data: keys.map((key) => store.rooms.filter((room) => room.status === key).length),
        backgroundColor: ["#0f7b45", "#c1121f", "#e7b93f", "#667085"]
      }
    ]
  };
});
</script>
