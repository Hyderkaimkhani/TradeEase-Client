<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NDatePicker,
  NButton,
  NDataTable,
  NSpace,
  useMessage,
} from 'naive-ui';
import { useAccounts } from '../composables/useAccounts';
import { useCustomers } from '../composables/useCustomers';
import {apiService} from '../api/ApiService';

const message = useMessage();
const { accountList, getAccountsDropdown } = useAccounts();
const { entityList, getCustomersList } = useCustomers();

const loading = ref(false);
const statement = ref<any>(null);

const form = reactive({
  accountId: null as number | null,
  entityId: null as number | null,
  fromDate: ref<number | null>(null),
  toDate: ref<number | null>(null),
});

const rules = {
  fromDate: [{ required: true, message: 'From date is required', trigger: ['change'],validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('From date is required');
        }
        return true;
      } }],
  toDate: [{ required: true, message: 'To date is required', trigger: ['change'], validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('To date is required');
        }
        return true;
      } }],
};

const columns = [
  { title: 'Date', key: 'transactionDate', render(row: any) { return new Date(row.transactionDate).toLocaleDateString(); } },
  { title: 'Account', key: 'accountName' },
  { title: 'Type', key: 'transactionType' },
  { title: 'Direction', key: 'transactionDirection' },
  { title: 'Amount', key: 'amount', render(row: any) { return row.amount.toLocaleString(); } },
  { title: 'Entity', key: 'entityName' },
  { title: 'Running Balance', key: 'runningBalance', render(row: any) { return row.runningBalance.toLocaleString(); } },
];

function validateForm() {
  if (!form.accountId && !form.entityId) {
    message.error('Either Account or Entity is required');
    return false;
  }
  if (!form.fromDate || !form.toDate) {
    message.error('From and To dates are required');
    return false;
  }
  return true;
}

async function fetchStatement() {
  if (!validateForm()) return;
  loading.value = true;
  try {
    const res = await apiService.post('/api/AccountTransaction/statement', {
      accountId: form.accountId || 0,
      entityId: form.entityId || 0,
      fromDate: form.fromDate,
      toDate: form.toDate,
    });
    if (!res.isError) {
      statement.value = res.model;
    } else {
      message.error(res.message || 'Failed to fetch statement');
    }
  } catch (e: any) {
    message.error(e.message || 'Error fetching statement');
  } finally {
    loading.value = false;
  }
}

getAccountsDropdown();
getCustomersList();
</script>

<template>
  <div>
    <n-card title="Account Statement" class="mb-4">
      <n-form :model="form" :rules="rules" label-placement="top" class="grid grid-cols-2 gap-4">
        <n-form-item label="Account" path="accountId">
          <n-select v-model:value="form.accountId" :options="accountList" placeholder="Select account" clearable />
        </n-form-item>
        <n-form-item label="Entity" path="entityId">
          <n-select v-model:value="form.entityId" :options="entityList" placeholder="Select entity" clearable />
        </n-form-item>
        <n-form-item label="From Date" path="fromDate">
          <n-date-picker v-model:value="form.fromDate" type="date" placeholder="From date" clearable />
        </n-form-item>
        <n-form-item label="To Date" path="toDate">
          <n-date-picker v-model:value="form.toDate" type="date" placeholder="To date" clearable />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="fetchStatement" :loading="loading">Fetch Statement</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card v-if="statement" :title="statement.statementTitle">
      <div class="mb-2 text-sm text-gray-600">
        <div>Account: {{ statement.accountName }}</div>
        <div>Entity: {{ statement.entityName }}</div>
        <div>Period: {{ new Date(statement.fromDate).toLocaleDateString() }} - {{ new Date(statement.toDate).toLocaleDateString() }}</div>
        <div>Opening Balance: {{ statement.openingBalance.toLocaleString() }}</div>
        <div>Closing Balance: {{ statement.closingBalance.toLocaleString() }}</div>
      </div>
      <n-data-table :columns="columns" :data="statement.transactions" striped />
    </n-card>
  </div>
</template>
