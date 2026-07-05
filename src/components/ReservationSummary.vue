<template>
  <div v-if="room && search" class="summary-list">
    <div class="summary-row"><span>Habitacion</span><strong>{{ room.name }}</strong></div>
    <div class="summary-row"><span>Entrada</span><strong>{{ search.checkIn }}</strong></div>
    <div class="summary-row"><span>Salida</span><strong>{{ search.checkOut }}</strong></div>
    <div class="summary-row"><span>Huespedes</span><strong>{{ guests }}</strong></div>
    <div class="summary-row"><span>Noches</span><strong>{{ totals.nights }}</strong></div>
    <div class="summary-row"><span>Subtotal</span><strong>{{ money(totals.subtotal) }}</strong></div>
    <div class="summary-row"><span>IVA 12%</span><strong>{{ money(totals.taxes) }}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>{{ money(totals.total) }}</strong></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { money, reservationTotals } from "../utils/formatters";

const props = defineProps({
  room: { type: Object, default: null },
  search: { type: Object, default: null },
  guests: { type: Number, default: 1 }
});

const totals = computed(() => reservationTotals(props.room, props.search || {}));
</script>
