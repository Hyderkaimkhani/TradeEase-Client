<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NButton,
  NDropdown,
  NIcon,
  NAvatar
} from 'naive-ui';
import {
  HomeOutline as HomeIcon,
  PeopleOutline as PeopleIcon,
  CarOutline as TruckIcon,
  PersonOutline as PersonIcon,
  LogOutOutline as LogOutIcon,
  MenuOutline as MenuIcon,
  CubeOutline as SupplyIcon,
  DocumentTextOutline as OrderIcon
} from '@vicons/ionicons5';

// Router
const router = useRouter();
const route = useRoute();

// Responsive sidebar
const collapsed = ref(window.innerWidth <= 768);
const isMobile = ref(window.innerWidth <= 768);

// Check if on mobile and update on resize
const checkScreenWidth = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value) {
    collapsed.value = true;
  }
};

// Listen for window resize
window.addEventListener('resize', checkScreenWidth);

// Menu options
const menuOptions = [
  {
    label: 'Dashboard',
    key: 'dashboard',
    icon: HomeIcon,
    path: '/app/dashboard'
  },
  {
    label: 'Customers',
    key: 'customers',
    icon: PeopleIcon,
    path: '/app/customers'
  },
  {
    label: 'Supplies',
    key: 'supplies',
    icon: SupplyIcon,
    path: '/app/supplies'
  },
  {
    label: 'Orders',
    key: 'orders',
    icon: OrderIcon,
    path: '/app/orders'
  },
  {
    label: 'Trucks',
    key: 'trucks',
    icon: TruckIcon,
    path: '/app/trucks'
  },
  {
    label: 'Sample Page',
    key: 'sample',
    icon: TruckIcon,
    path: '/app/sample'
  }
] as any[];

// User dropdown options
const userOptions = [
  {
    label: 'Profile',
    key: 'profile',
    icon: PersonIcon
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: LogOutIcon
  }
] as any[];

// Active menu item
const activeKey = computed(() => {
  const path = route.path;
  for (const option of menuOptions) {
    if (path === option.path) {
      return option.key;
    }
  }
  return 'dashboard';
});

// Handle menu select
const handleMenuSelect = (key: string) => {
  const selectedOption = menuOptions.find(option => option.key === key);
  if (selectedOption) {
    router.push(selectedOption.path);
    if (isMobile.value) {
      collapsed.value = true;
    }
  }
};

// Handle user dropdown select
const handleUserSelect = (key: string) => {
  if (key === 'profile') {
    router.push('/app/profile');
  } else if (key === 'logout') {
    // Clear auth and redirect to login
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/login');
  }
};

// Toggle sidebar on mobile
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};
</script>

<template>
  <n-layout has-sider style="height: 100vh;">
    <!-- Sidebar -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="240"
      :collapsed="collapsed"
      :native-scrollbar="false"
      show-trigger="bar"
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="sidebar-transition"
    >
      <div class="p-4 flex items-center justify-center">
        <h2 class="text-xl font-bold text-primary-600">TradeEase</h2>
      </div>
      <n-menu
        v-model:value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="0"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- Main layout -->
    <n-layout>
      <!-- Header -->
      <n-layout-header bordered class="py-2 px-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center">
          <!-- Mobile menu toggle -->
          <n-button v-if="isMobile" quaternary circle @click="toggleSidebar">
            <n-icon>
              <menu-icon />
            </n-icon>
          </n-button>
          
          <!-- Company logo/name for desktop -->
          <div v-if="!isMobile" class="ml-4">
            <h1 class="text-lg font-semibold text-primary-600">ShipManager</h1>
          </div>
        </div>

        <!-- User profile dropdown -->
        <n-dropdown trigger="click" :options="userOptions" @select="handleUserSelect">
          <n-avatar
            round
            size="medium"
            color="#0052CC"
            style="cursor: pointer"
          >
            <n-icon>
              <person-icon />
            </n-icon>
          </n-avatar>
        </n-dropdown>
      </n-layout-header>

      <!-- Main content -->
      <n-layout-content class="p-6 bg-gray-50" style="overflow: auto; height: calc(100vh - 60px);">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.sidebar-transition {
  transition: all 0.3s ease;
}
</style>