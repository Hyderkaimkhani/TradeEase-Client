<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NCard,
  NSpace,
  NGrid,
  NGi,
  NStatistic,
  NNumberAnimation,
  NIcon,
  NDataTable,
  NPagination,
  NTag
} from 'naive-ui';
import {
  PeopleOutline as CustomersIcon,
  CarOutline as TrucksIcon,
  CubeOutline as ShipmentsIcon,
  WalletOutline as RevenueIcon
} from '@vicons/ionicons5';
import { useDashboard } from '../composables/useDashboard';

// Get dashboard data
const { 
  stats, 
  recentShipments,
  loading,
  fetchDashboardData 
} = useDashboard();

// Table pagination
const page = ref(1);
const pageSize = ref(5);

// Table columns
const shipmentColumns = [
  {
    title: 'ID',
    key: 'id',
    width: 70
  },
  {
    title: 'Customer',
    key: 'customer',
    width: 140
  },
  {
    title: 'From',
    key: 'origin'
  },
  {
    title: 'To',
    key: 'destination'
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render(row: any) {
      const statusColors: any = {
        'in-transit': 'info',
        'delivered': 'success',
        'pending': 'warning',
        'cancelled': 'error'
      };
      const type = statusColors[row.status] || 'default';
      return h(
        NTag,
        {
          type,
          size: 'small'
        },
        {
          default: () => row.status || 'unknown'
        }
      );
    }
  },
  {
    title: 'Date',
    key: 'date'
  }
];

// Load data on mount
onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <!-- Stats Cards -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
      <!-- Customers Card -->
      <n-gi span="4 m:2 l:1">
        <n-card class="h-full">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-lg text-gray-500">Customers</div>
              <div v-if="!loading" class="text-2xl font-bold">
                <n-number-animation :from="0" :to="stats.customers" />
              </div>
              <div v-else class="text-2xl font-bold">-</div>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <n-icon size="24" color="#0052CC">
                <customers-icon />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Trucks Card -->
      <n-gi span="4 m:2 l:1">
        <n-card class="h-full">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-lg text-gray-500">Trucks</div>
              <div v-if="!loading" class="text-2xl font-bold">
                <n-number-animation :from="0" :to="stats.trucks" />
              </div>
              <div v-else class="text-2xl font-bold">-</div>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <n-icon size="24" color="#36b37e">
                <trucks-icon />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Active Shipments Card -->
      <n-gi span="4 m:2 l:1">
        <n-card class="h-full">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-lg text-gray-500">Active Shipments</div>
              <div v-if="!loading" class="text-2xl font-bold">
                <n-number-animation :from="0" :to="stats.activeShipments" />
              </div>
              <div v-else class="text-2xl font-bold">-</div>
            </div>
            <div class="bg-amber-100 p-3 rounded-full">
              <n-icon size="24" color="#ffab00">
                <shipments-icon />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Revenue Card -->
      <n-gi span="4 m:2 l:1">
        <n-card class="h-full">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-lg text-gray-500">Revenue</div>
              <div v-if="!loading" class="text-2xl font-bold">
                $<n-number-animation :from="0" :to="stats.revenue" />
              </div>
              <div v-else class="text-2xl font-bold">-</div>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <n-icon size="24" color="#6554c0">
                <revenue-icon />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Recent Shipments Table -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Recent Shipments</h2>
      <n-card>
        <n-data-table
          :columns="shipmentColumns"
          :data="recentShipments"
          :loading="loading"
          :pagination="{ 
            page, 
            pageSize,
            itemCount: recentShipments.length,
            onUpdatePage: (page) => { page = page },
            onUpdatePageSize: (pageSize) => { pageSize = pageSize }
          }"
          striped
        />
      </n-card>
    </div>
  </div>
</template>