import { defineStore } from "pinia";
import { money, nightsBetween, reservationTotals, todayISO, tomorrowISO } from "../utils/formatters";

const HOTEL_STORAGE_KEY = "hotelUleamState";
const BLOCKING_RESERVATION_STATUSES = ["pending", "confirmed", "checked-in"];

export const statusLabels = {
  available: "Disponible",
  occupied: "Ocupada",
  maintenance: "Mantenimiento"
};

const defaultUsers = [
  { id: "USR-1001", name: "Usuario Demo", email: "usuario@uleam.edu.ec", password: "123456", role: "user", createdAt: "2026-05-01T00:00:00.000Z" },
  { id: "ADM-1001", name: "Administrador", email: "admin@uleam.edu.ec", password: "admin123", role: "admin", createdAt: "2026-05-01T00:00:00.000Z" }
];

const defaultRoomImages = {
  101: "/images/habitaciones/101.jpg",
  102: "/images/habitaciones/102.jpg",
  103: "/images/habitaciones/103.jpg",
  104: "/images/habitaciones/104.jpg",
  201: "/images/habitaciones/201.jpg",
  202: "/images/habitaciones/202.jpg",
  203: "/images/habitaciones/203.jpg",
  204: "/images/habitaciones/204.jpg",
  301: "/images/habitaciones/301.jpg",
  302: "/images/habitaciones/302.jpg",
  303: "/images/habitaciones/303.jpg",
  304: "/images/habitaciones/304.jpg"
};

const defaultHotelState = {
  dataVersion: 3,
  session: null,
  users: defaultUsers,
  search: { checkIn: todayISO(), checkOut: tomorrowISO() },
  selectedRoomId: null,
  activeReservationId: null,
  guests: { adults: 2, children: 0, babies: 0 },
  rooms: [
    { id: "101", name: "Habitacion Estandar", type: "Doble", floor: 1, capacity: 2, price: 180, status: "available", imageUrl: defaultRoomImages[101], view: "Vista al mar", beds: "1 cama king", amenities: ["Wifi", "Aire acondicionado", "Desayuno"] },
    { id: "102", name: "Habitacion Deluxe", type: "Individual", floor: 1, capacity: 1, price: 155, status: "available", imageUrl: defaultRoomImages[102], view: "Vista al jardin", beds: "1 cama individual", amenities: ["Wifi", "Minibar", "Escritorio"] },
    { id: "103", name: "Habitacion Twin", type: "Doble", floor: 1, capacity: 2, price: 190, status: "available", imageUrl: defaultRoomImages[103], view: "Vista piscina", beds: "2 camas individuales", amenities: ["Wifi", "Smart TV", "Desayuno"] },
    { id: "104", name: "Habitacion Accesible", type: "Doble", floor: 1, capacity: 2, price: 175, status: "available", imageUrl: defaultRoomImages[104], view: "Vista jardin", beds: "1 cama queen", amenities: ["Wifi", "Ducha accesible", "Aire acondicionado"] },
    { id: "201", name: "Suite Familiar", type: "Suite", floor: 2, capacity: 4, price: 360, status: "available", imageUrl: defaultRoomImages[201], view: "Vista panoramica", beds: "2 camas dobles", amenities: ["Wifi", "Sala", "Desayuno"] },
    { id: "202", name: "Habitacion Ejecutiva", type: "Doble", floor: 2, capacity: 2, price: 220, status: "maintenance", imageUrl: defaultRoomImages[202], view: "Vista ciudad", beds: "1 cama queen", amenities: ["Wifi", "Aire acondicionado", "Caja fuerte"] },
    { id: "203", name: "Suite Junior", type: "Suite", floor: 2, capacity: 3, price: 295, status: "available", imageUrl: defaultRoomImages[203], view: "Vista ciudad", beds: "1 cama king y sofa cama", amenities: ["Wifi", "Sala", "Minibar"] },
    { id: "204", name: "Habitacion Premium", type: "Doble", floor: 2, capacity: 2, price: 240, status: "available", imageUrl: defaultRoomImages[204], view: "Vista al mar", beds: "1 cama king", amenities: ["Wifi", "Balcon", "Cafetera"] },
    { id: "301", name: "Suite Presidencial", type: "Suite", floor: 3, capacity: 4, price: 520, status: "available", imageUrl: defaultRoomImages[301], view: "Vista panoramica", beds: "1 cama king y 2 individuales", amenities: ["Wifi", "Jacuzzi", "Sala privada"] },
    { id: "302", name: "Habitacion Ejecutiva Plus", type: "Doble", floor: 3, capacity: 2, price: 260, status: "available", imageUrl: defaultRoomImages[302], view: "Vista ciudad", beds: "1 cama king", amenities: ["Wifi", "Escritorio", "Caja fuerte"] },
    { id: "303", name: "Habitacion Individual Confort", type: "Individual", floor: 3, capacity: 1, price: 145, status: "available", imageUrl: defaultRoomImages[303], view: "Vista interna", beds: "1 cama individual", amenities: ["Wifi", "Escritorio", "Smart TV"] },
    { id: "304", name: "Suite Universitaria", type: "Suite", floor: 3, capacity: 5, price: 410, status: "available", imageUrl: defaultRoomImages[304], view: "Vista campus", beds: "2 camas queen y sofa cama", amenities: ["Wifi", "Comedor", "Desayuno"] }
  ],
  reservations: [],
  checkIns: [],
  checkOuts: []
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultHotelState));
}

function defaultRoomImageFor(roomId) {
  return defaultRoomImages[String(roomId)] || "";
}

function dateRangesOverlap(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return false;
  return startA < endB && endA > startB;
}

function totalGuestsFrom(state) {
  return Number(state.guests.adults || 0) + Number(state.guests.children || 0) + Number(state.guests.babies || 0);
}

function reservationBlocksRoom(reservation, roomId, search, ignoredReservationId = "") {
  if (!reservation || reservation.id === ignoredReservationId) return false;
  if (reservation.roomId !== roomId) return false;
  if (!BLOCKING_RESERVATION_STATUSES.includes(reservation.status)) return false;
  return dateRangesOverlap(search.checkIn, search.checkOut, reservation.checkIn, reservation.checkOut);
}

function roomHasBlockingReservation(state, roomId, search, ignoredReservationId = "") {
  return state.reservations.some((reservation) => reservationBlocksRoom(reservation, roomId, search, ignoredReservationId));
}

function isRoomAvailableForSearch(state, room, search = state.search, ignoredReservationId = "") {
  if (!room || room.status !== "available") return false;
  return !roomHasBlockingReservation(state, room.id, search, ignoredReservationId);
}

function loadState() {
  if (typeof localStorage === "undefined") return cloneDefaultState();
  const fresh = cloneDefaultState();
  const raw = localStorage.getItem(HOTEL_STORAGE_KEY);
  if (!raw) return fresh;

  try {
    const parsed = JSON.parse(raw);
    if (Number(parsed.dataVersion || 1) < fresh.dataVersion) {
      return fresh;
    }
    const shouldMigrateRoomImages = Number(parsed.dataVersion || 1) < 2;
    const stored = { ...fresh, ...parsed };
    const storedUsers = stored.users?.length ? stored.users : [];
    const storedUserEmails = new Set(storedUsers.map((user) => user.email));
    const missingUsers = fresh.users.filter((user) => !storedUserEmails.has(user.email));
    const storedRoomIds = new Set((stored.rooms || []).map((room) => room.id));
    const missingRooms = fresh.rooms.filter((room) => !storedRoomIds.has(room.id));
    const activeCheckInRoomIds = new Set((stored.checkIns || []).map((checkIn) => checkIn.roomId));
    const confirmedWithoutCheckInRoomIds = new Set(
      (stored.reservations || [])
        .filter((reservation) => reservation.status === "confirmed" && !activeCheckInRoomIds.has(reservation.roomId))
        .map((reservation) => reservation.roomId)
    );
    const rooms = [...(stored.rooms || []), ...missingRooms].map((room) => {
      const normalizedStatus = room.status === "cleaning" ? "available" : room.status;
      return {
        ...room,
        imageUrl: shouldMigrateRoomImages && !room.imageUrl ? defaultRoomImageFor(room.id) : (room.imageUrl || ""),
        status: normalizedStatus === "occupied" && confirmedWithoutCheckInRoomIds.has(room.id) ? "available" : normalizedStatus
      };
    });
    return {
      ...stored,
      dataVersion: fresh.dataVersion,
      users: [...storedUsers, ...missingUsers],
      rooms
    };
  } catch {
    return fresh;
  }
}

function createUserId(users) {
  const numbers = users
    .filter((user) => user.role === "user")
    .map((user) => Number(String(user.id).replace(/\D/g, "")))
    .filter(Boolean);
  return `USR-${Math.max(1001, ...numbers) + 1}`;
}

function createReservationId(reservations) {
  const numbers = reservations
    .map((reservation) => Number(String(reservation.id).replace(/\D/g, "")))
    .filter(Boolean);
  return `RSV-${Math.max(1000, ...numbers) + 1}`;
}

function createInvoiceId(checkOuts) {
  const numbers = checkOuts
    .map((checkOut) => Number(String(checkOut.invoice?.id || checkOut.id || "").replace(/\D/g, "")))
    .filter(Boolean);
  return `FAC-${Math.max(1000, ...numbers) + 1}`;
}

export const useHotelStore = defineStore("hotel", {
  state: () => loadState(),
  getters: {
    totalGuests: (state) => totalGuestsFrom(state),
    availableRooms(state) {
      const guests = totalGuestsFrom(state);
      return state.rooms.filter((room) => room.capacity >= guests && isRoomAvailableForSearch(state, room));
    },
    matchingRooms(state) {
      const guests = totalGuestsFrom(state);
      return state.rooms.filter((room) => room.capacity >= guests && isRoomAvailableForSearch(state, room));
    },
    confirmedReservations: (state) => state.reservations.filter((reservation) => reservation.status === "confirmed"),
    currentReservation: (state) => {
      const sessionEmail = state.session?.role === "user" ? state.session.email.toLowerCase() : "";
      const pending = state.reservations.filter((reservation) => {
        if (reservation.status !== "pending") return false;
        if (!sessionEmail) return true;
        const ownerEmail = reservation.createdByEmail?.toLowerCase();
        const guestEmail = reservation.email?.toLowerCase();
        return ownerEmail === sessionEmail || (!ownerEmail && guestEmail === sessionEmail);
      });
      return pending[pending.length - 1] || null;
    },
    userReservations: (state) => {
      const sessionEmail = state.session?.email?.toLowerCase();
      if (!sessionEmail) return [];
      return state.reservations
        .filter((reservation) => {
          if (!["pending", "confirmed", "checked-in", "completed"].includes(reservation.status)) return false;
          const ownerEmail = reservation.createdByEmail?.toLowerCase();
          const guestEmail = reservation.email?.toLowerCase();
          return ownerEmail === sessionEmail || (!ownerEmail && guestEmail === sessionEmail);
        })
        .sort((a, b) => String(b.id).localeCompare(String(a.id)));
    },
    dashboardStats(state) {
      const confirmed = state.reservations.filter((reservation) => reservation.status === "confirmed");
      const occupied = state.rooms.filter((room) => room.status === "occupied").length;
      const revenue = state.reservations
        .filter((reservation) => ["confirmed", "checked-in", "completed"].includes(reservation.status))
        .reduce((sum, item) => sum + Number(item.total || 0), 0);
      return { confirmed: confirmed.length, occupied, revenue, hosted: state.checkIns.length };
    },
    roomById: (state) => (id) => state.rooms.find((room) => room.id === id),
    reportStats: (state) => (filters = {}) => {
      const reservations = state.reservations.filter((reservation) => {
        const room = state.rooms.find((item) => item.id === reservation.roomId);
        const matchesMonth = !filters.month || reservation.checkIn?.startsWith(filters.month);
        const matchesType = !filters.roomType || filters.roomType === "Todas" || room?.type === filters.roomType;
        const matchesStatus = !filters.reservationStatus || filters.reservationStatus === "Todos" || reservation.status === filters.reservationStatus;
        return matchesMonth && matchesType && matchesStatus;
      });
      const confirmed = reservations.filter((reservation) => reservation.status === "confirmed");
      const revenueReservations = reservations.filter((reservation) => ["confirmed", "checked-in", "completed"].includes(reservation.status));
      return {
        reservations,
        revenue: revenueReservations.reduce((sum, item) => sum + Number(item.total || 0), 0),
        frequentClients: new Set(reservations.map((item) => item.email)).size,
        confirmedCount: confirmed.length,
        pendingCount: reservations.filter((reservation) => reservation.status === "pending").length,
        checkedInCount: reservations.filter((reservation) => reservation.status === "checked-in").length,
        completedCount: reservations.filter((reservation) => reservation.status === "completed").length
      };
    }
  },
  actions: {
    persist() {
      localStorage.setItem(HOTEL_STORAGE_KEY, JSON.stringify(this.$state));
    },
    login(role, email, password) {
      const selected = this.users.find((user) => user.role === role && user.email.toLowerCase() === email.toLowerCase());
      if (!selected || selected.password !== password) {
        return { ok: false, message: "Credenciales incorrectas para el rol seleccionado." };
      }
      this.session = { role, email: selected.email, name: selected.name, startedAt: new Date().toISOString() };
      this.persist();
      return { ok: true, redirect: role === "admin" ? "/admin/dashboard" : "/cliente/reservas" };
    },
    registerUser(payload) {
      const email = payload.email.trim().toLowerCase();
      const exists = this.users.some((user) => user.email.toLowerCase() === email);
      if (exists) return { ok: false, message: "Ya existe una cuenta registrada con este correo." };

      const user = {
        id: createUserId(this.users),
        name: payload.name.trim(),
        email,
        password: payload.password,
        role: "user",
        createdAt: new Date().toISOString()
      };
      this.users.push(user);
      this.session = { role: "user", email: user.email, name: user.name, startedAt: new Date().toISOString() };
      this.persist();
      return { ok: true, redirect: "/cliente/reservas" };
    },
    logout() {
      this.session = null;
      this.persist();
    },
    saveSearch(payload) {
      this.search = { checkIn: payload.checkIn, checkOut: payload.checkOut };
      this.guests = { adults: payload.adults, children: payload.children, babies: payload.babies };
      this.selectedRoomId = null;
      this.activeReservationId = null;
      this.persist();
    },
    selectRoom(roomId) {
      const room = this.rooms.find((item) => item.id === roomId);
      if (!isRoomAvailableForSearch(this.$state, room)) return false;
      this.selectedRoomId = roomId;
      this.activeReservationId = null;
      this.persist();
      return true;
    },
    createReservation(payload) {
      const room = this.rooms.find((item) => item.id === this.selectedRoomId);
      if (!isRoomAvailableForSearch(this.$state, room)) {
        return { ok: false, message: "La habitacion seleccionada ya no esta disponible para esas fechas." };
      }
      const totals = reservationTotals(room, this.search);
      const guests = Number(this.guests.adults || 0) + Number(this.guests.children || 0) + Number(this.guests.babies || 0);
      const reservation = {
        id: createReservationId(this.reservations),
        ...payload,
        createdByEmail: this.session?.email || payload.email,
        roomId: room.id,
        checkIn: this.search.checkIn,
        checkOut: this.search.checkOut,
        guests,
        status: "pending",
        paid: false,
        total: totals.total
      };
      this.reservations.push(reservation);
      this.activeReservationId = reservation.id;
      this.persist();
      return { ok: true, reservation };
    },
    confirmPayment(reservationId, paymentData) {
      const reservation = this.reservations.find((item) => item.id === reservationId);
      const room = reservation ? this.rooms.find((item) => item.id === reservation.roomId) : null;
      if (!reservation || !room) return false;
      if (!isRoomAvailableForSearch(this.$state, room, reservation, reservation.id)) return false;
      const confirmedAt = new Date().toISOString();
      reservation.paid = !paymentData.payAtReception;
      reservation.status = "confirmed";
      reservation.payment = {
        ...paymentData,
        confirmedAt,
        paidAt: paymentData.payAtReception ? null : confirmedAt
      };
      this.activeReservationId = null;
      this.selectedRoomId = null;
      this.persist();
      return true;
    },
    createCheckIn(payload) {
      const reservation = this.reservations.find((item) => item.id === payload.reservationId);
      const room = this.rooms.find((item) => item.id === payload.roomId);
      if (!reservation) return { ok: false, message: "La reserva seleccionada no existe." };
      if (reservation.status !== "confirmed") return { ok: false, message: "Solo se puede hacer check-in a reservas confirmadas." };
      if (!room) return { ok: false, message: "La habitacion seleccionada no existe." };
      if (this.checkIns.some((item) => item.reservationId === payload.reservationId)) {
        return { ok: false, message: "Esta reserva ya tiene check-in registrado." };
      }
      if (this.checkIns.some((item) => item.roomId === payload.roomId)) {
        return { ok: false, message: "La habitacion ya esta ocupada por otro check-in activo." };
      }
      if (room.capacity < Number(reservation.guests || 0)) {
        return { ok: false, message: "La habitacion no tiene capacidad suficiente para la reserva." };
      }
      if (!isRoomAvailableForSearch(this.$state, room, reservation, reservation.id)) {
        return { ok: false, message: "La habitacion no esta disponible para las fechas de la reserva." };
      }
      reservation.roomId = room.id;
      reservation.status = "checked-in";
      this.checkIns.push({ ...payload, roomId: room.id, createdAt: new Date().toISOString() });
      room.status = "occupied";
      this.persist();
      return { ok: true };
    },
    createCheckOut(payload) {
      const checkIn = this.checkIns.find((item) => item.roomId === payload.roomId);
      if (!checkIn) return { ok: false, message: "No hay un check-in activo para esta habitacion.", servicesTotal: 0 };
      const minibar = Number(payload.minibar || 0);
      const restaurant = Number(payload.restaurant || 0);
      const laundry = Number(payload.laundry || 0);
      const servicesTotal = minibar + restaurant + laundry;
      const reservationId = checkIn?.reservationId || payload.reservationId;
      const reservation = this.reservations.find((item) => item.id === reservationId);
      const room = this.rooms.find((item) => item.id === payload.roomId);
      const createdAt = new Date().toISOString();
      const lodgingTotal = Number(reservation?.total || 0);
      const grandTotal = servicesTotal;
      const nights = reservation ? nightsBetween(reservation.checkIn, reservation.checkOut) : 1;
      const invoice = {
        id: createInvoiceId(this.checkOuts),
        createdAt,
        createdAtLabel: new Date(createdAt).toLocaleString("es-EC"),
        reservationId,
        clientName: reservation?.clientName || "Cliente",
        identification: reservation?.identification || "No registrado",
        email: reservation?.email || "No registrado",
        roomId: payload.roomId,
        roomName: room?.name || "Habitacion",
        checkIn: reservation?.checkIn || "No registrado",
        checkOut: reservation?.checkOut || "No registrado",
        nights,
        minibar,
        restaurant,
        laundry,
        lodgingTotal,
        servicesTotal,
        grandTotal,
        lodgingTotalLabel: money(lodgingTotal),
        minibarLabel: money(minibar),
        restaurantLabel: money(restaurant),
        laundryLabel: money(laundry),
        servicesTotalLabel: money(servicesTotal),
        grandTotalLabel: money(grandTotal)
      };
      this.checkOuts.push({ ...payload, reservationId, servicesTotal, grandTotal, invoice, createdAt });
      if (reservation) reservation.status = "completed";
      if (room) room.status = "available";
      this.checkIns = this.checkIns.filter((item) => item.reservationId !== reservationId);
      this.persist();
      return { ok: true, servicesTotal, grandTotal, invoice };
    },
    saveRoom(payload) {
      const existing = this.rooms.find((room) => room.id === payload.id);
      const hasActiveCheckIn = this.checkIns.some((checkIn) => checkIn.roomId === payload.id);
      if (existing && hasActiveCheckIn && payload.status === "available") {
        return { ok: false, message: "No puedes marcar esta habitacion como disponible porque todavia tiene un check-out pendiente." };
      }
      const room = {
        id: payload.id,
        name: payload.name || `Habitacion ${payload.type}`,
        type: payload.type,
        floor: Number(payload.floor),
        capacity: Number(payload.capacity || (payload.type === "Suite" ? 4 : payload.type === "Individual" ? 1 : 2)),
        price: Number(payload.price),
        status: payload.status,
        imageUrl: payload.imageUrl || "",
        view: payload.view || "Vista hotel",
        beds: payload.beds || (payload.type === "Individual" ? "1 cama individual" : "1 cama doble"),
        amenities: payload.amenities?.length ? payload.amenities : ["Wifi", "Aire acondicionado"]
      };
      if (existing) Object.assign(existing, room);
      else this.rooms.push(room);
      this.persist();
      return { ok: true };
    },
    deleteRoom(roomId) {
      this.rooms = this.rooms.filter((room) => room.id !== roomId);
      this.persist();
    },
    deleteCompletedReservation(reservationId) {
      const reservation = this.reservations.find((item) => item.id === reservationId);
      if (!reservation) return { ok: false, message: "La reserva seleccionada no existe." };
      if (reservation.status !== "completed") return { ok: false, message: "Solo puedes eliminar reservas completadas." };
      this.reservations = this.reservations.filter((item) => item.id !== reservationId);
      this.persist();
      return { ok: true };
    }
  }
});
