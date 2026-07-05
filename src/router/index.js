import { createRouter, createWebHistory } from "vue-router";
import { useHotelStore } from "../stores/hotelStore";
import AuthLayout from "../layouts/AuthLayout.vue";
import ClientLayout from "../layouts/ClientLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ReservationSearchView from "../views/client/ReservationSearchView.vue";
import RoomsView from "../views/client/RoomsView.vue";
import DetailReservationView from "../views/client/DetailReservationView.vue";
import PaymentView from "../views/client/PaymentView.vue";
import MyReservationsView from "../views/client/MyReservationsView.vue";
import DashboardView from "../views/admin/DashboardView.vue";
import CheckInView from "../views/admin/CheckInView.vue";
import CheckOutView from "../views/admin/CheckOutView.vue";
import RoomsAdminView from "../views/admin/RoomsAdminView.vue";
import ReportsView from "../views/admin/ReportsView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    component: AuthLayout,
    children: [{ path: "", name: "login", component: LoginView }]
  },
  {
    path: "/registro",
    component: AuthLayout,
    children: [{ path: "", name: "register", component: RegisterView }]
  },
  {
    path: "/cliente",
    component: ClientLayout,
    meta: { requiresAuth: true, role: "user" },
    children: [
      { path: "", redirect: "/cliente/reservas" },
      { path: "reservas", name: "client-reservations", component: ReservationSearchView },
      { path: "habitaciones", name: "client-rooms", component: RoomsView },
      { path: "detalle-reserva", name: "client-detail", component: DetailReservationView },
      { path: "pago", name: "client-payment", component: PaymentView },
      { path: "mis-reservas", name: "client-my-reservations", component: MyReservationsView }
    ]
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", name: "admin-dashboard", component: DashboardView },
      { path: "checkin", name: "admin-checkin", component: CheckInView },
      { path: "checkout", name: "admin-checkout", component: CheckOutView },
      { path: "habitaciones", name: "admin-rooms", component: RoomsAdminView },
      { path: "reportes", name: "admin-reports", component: ReportsView }
    ]
  },
  { path: "/:pathMatch(.*)*", redirect: "/login" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const store = useHotelStore();
  const requiredRole = to.matched.find((record) => record.meta.role)?.meta.role;

  if (to.meta.requiresAuth || requiredRole) {
    if (!store.session) return "/login";
    if (requiredRole && store.session.role !== requiredRole) {
      return store.session.role === "admin" ? "/admin/dashboard" : "/cliente/reservas";
    }
  }

  if ((to.name === "login" || to.name === "register") && store.session) {
    return store.session.role === "admin" ? "/admin/dashboard" : "/cliente/reservas";
  }

  return true;
});

export default router;
