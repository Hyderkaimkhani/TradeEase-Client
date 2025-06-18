import { RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import Customers from '../views/Customers.vue'
import Trucks from '../views/Trucks.vue'

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/app',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'customers',
        name: 'Customers',
        component: Customers
      },
      {
        path: 'trucks',
        name: 'Trucks',
        component: Trucks
      },
      {
        path: '',
        redirect: '/app/dashboard'
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

// Navigation guard for auth
export const setupNavigationGuards = (router: any) => {
  router.beforeEach((to: any, from: any, next: any) => {
    // For now, just simulate auth check with localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
      next('/app/dashboard')
    } else {
      next()
    }
  })
}

export default routes