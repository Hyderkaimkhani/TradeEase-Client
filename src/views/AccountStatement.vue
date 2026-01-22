<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  useMessage,
} from 'naive-ui';
import { useAccounts } from '../composables/useAccounts';
import { useCustomers } from '../composables/useCustomers';
import { useAccountTransactions } from '../composables/useAccountTransactions';
import ResponsiveDataTable from '../components/ResponsiveDataTable.vue';

const message = useMessage();
const { accountList, getAccountsDropdown } = useAccounts();
const { entityList, getCustomersList } = useCustomers();

const loading = ref(false);
const statement = ref<any>(null);
const { fetchStatement,exportStatement } = useAccountTransactions();

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

async function getStatement() {
  if (!validateForm()) return;
  loading.value = true;
  try {
    const filteredFromDate = new Date(form.fromDate!).toISOString().split('T')[0];
    const filteredToDate = new Date(form.toDate!).toISOString().split('T')[0];
    const res = await fetchStatement({
      accountId: form.accountId || null,
      entityId: form.entityId || null,
      fromDate: filteredFromDate,
      toDate: filteredToDate,
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

async function downloadStatement() {
  if (!validateForm()) return;
  loading.value = true;
  try {
    // Use fetchStatement but with export URL
    // const accountName = form.accountId ? accountList.find(a => a.value === form.accountId)?.label : 'All';
    // const entityName = form.entityId ? entityList.find(e => e.value === form.entityId)?.label : 'All';

    // Directly use apiService for file download
    const filteredFromDate = new Date(form.fromDate!).toISOString().split('T')[0];
    const filteredToDate = new Date(form.toDate!).toISOString().split('T')[0];
    // const fileName = `AccountStatement_${form || 'All'}_${form.entityId || 'All'}_${filteredFromDate}_to_${filteredToDate}.pdf`; 
    
    await exportStatement({
      accountId: form.accountId || null,
      entityId: form.entityId || null,
      fromDate: filteredFromDate,
      toDate: filteredToDate,
    });

    // const blob = await response.blob();
    // const urlBlob = window.URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = urlBlob;
    // link.download = 'AccountStatement.pdf';
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    // window.URL.revokeObjectURL(urlBlob);
    // message.success('Statement exported');
  } catch (e: any) {
    message.error(e.message || 'Error exporting statement');
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
      <n-form :model="form" :rules="rules" label-placement="top" class="grid grid-cols-4 gap-2">
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
          <n-space>
            <n-button type="primary" @click="getStatement" :loading="loading">Fetch Statement</n-button>
            <n-button type="default" @click="downloadStatement" :loading="loading">Export Statement</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card v-if="statement" :title="statement.statementTitle">
      <div class="mb-2 text-sm text-gray-600">
        <div v-if="statement.accountName">Account: {{ statement.accountName }}</div>
        <div v-if="statement.entityName">Entity: {{ statement.entityName }}</div>
        <div>Period: {{ new Date(statement.fromDate).toLocaleDateString() }} - {{ new Date(statement.toDate).toLocaleDateString() }}</div>
        <div>Opening Balance: {{ statement.openingBalance.toLocaleString() }}</div>
        <div>Closing Balance: {{ statement.closingBalance.toLocaleString() }}</div>
        <!-- <div :style="{ color: statement.closingBalance > 0 ? 'green' : 
          statement.closingBalance < 0 ? 'red' : 'gray',
                fontWeight: 'bold' }">
          Closing Balance: {{ statement.closingBalance.toLocaleString() }}
        </div> -->
      </div>
      <ResponsiveDataTable
        :columns="columns"
        :data="statement.transactions"
        :show-pagination="statement.transactions.length > 10"
        title-key="description"
        subtitle-key="accountName"
        striped
      />
    </n-card>
  </div>
</template>
