export function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function todayISO() {
  return dateToLocalISO(new Date());
}

export function tomorrowISO() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateToLocalISO(tomorrow);
}

function dateToLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nightsBetween(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end - start) / 86400000);
  return Math.max(diff, 1);
}

export function reservationTotals(room, search) {
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const subtotal = Number(room?.price || 0) * nights;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;
  return { nights, subtotal, taxes, total };
}
