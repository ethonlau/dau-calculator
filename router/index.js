import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/App.vue';

const routes = [
  {
    path: '/',
    name: 'DAU Calculator',
    component: Home
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
});

export default router;