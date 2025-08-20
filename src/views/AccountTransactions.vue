<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NSpace,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NPagination,
  useMessage,
  FormInst,
} from 'naive-ui';
import { useAccountTransactions } from '../composables/useAccountTransactions';
import { useAccounts } from '../composables/useAccounts';
import { accountTransactionColumns } from '../Constants/GridColumns';

const message = useMessage();
const {
  transactions,
  loading,
  totalCount,
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} = useAccountTransactions();
const { accountList, getAccountsDropdown } = useAccounts();

const showDrawer = ref(false);
const formTitle = ref('Add Transaction');
const isEditing = ref(false);
const isViewing = ref(false);
const currentTransactionId = ref<number | null>(null);

// Filters
const filterType = ref<string | null>(null);
const filterFromDate = ref<number | null>(null);
const filterToDate = ref<number | null>(null);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const computedTotalCount = computed(() => totalCount.value);

const formRef = ref<FormInst | null>(null);

const transactionTypeOptions = [
  { label: 'Expense', value: 'Expense' },
  { label: 'Income', value: 'Income' },
  { label: 'Transfer', value: 'Transfer' }
];
// const paymentMethodOptions = [
//   { label: 'Cash', value: 'Cash' },
//   { label: 'Cheque', value: 'Cheque' },
//   { label: 'Bank Transfer', value: 'BankTransfer' },
//   { label: 'Mobile Payment', value: 'MobilePayment' },
// ];
const expenseCategories = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Food', value: 'Food' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Salary', value: 'Salary' },
  { label: 'Other', value: 'Other' }
];
const incomeCategories = [
  { label: 'Commission', value: 'Commission' },
  { label: 'Salary', value: 'Salary' },
  { label: 'Other', value: 'Other' }
];

const formData = reactive({
  accountId: null as number | null,
  transactionType: 'Expense',
  amount: 0,
  transactionDate: '',
  notes: '',
  category: '',
  party: '',
  toAccountId: null as number | null,
});

const rules = {
  accountId: [{ required: true, message: 'Account is required', trigger: ['change'],validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Account is required.');
        return true;
      } }],
  transactionType: [{ required: true, message: 'Type is required', trigger: ['change'],validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Type is required.');
        return true;
      } }],
  amount: [{ required: true, message: 'Amount is required', trigger: ['input', 'blur', 'change'],validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('Amount is required');
        }
        if (typeof value !== 'number' || value <= 0) {
          return new Error('Amount must be greater than 0');
        }
        return true;
      } }],
//   transactionDate: [{ required: true, message: 'Date is required', trigger: ['change'] }],
  //paymentMethod: [{ required: true, message: 'Payment method is required', trigger: ['change'] }],
};

function handleFilter() {
  fetchTransactions({
    transactionType: filterType.value || undefined,
    fromDate: filterFromDate.value ? new Date(filterFromDate.value).toISOString().split('T')[0] : undefined,
    toDate: filterToDate.value ? new Date(filterToDate.value).toISOString().split('T')[0] : undefined,
    pageNumber: currentPage.value,
    pageSize: pageSize.value
  });
}

function openAddDrawer() {
  Object.assign(formData, {
    accountId: null,
    transactionType: 'Expense',
    amount: 0,
    transactionDate: '',
    notes: '',
    category: '',
    party: '',
    toAccountId: null,
  });
  formTitle.value = 'Add Transaction';
  showDrawer.value = true;
  isEditing.value = false;
  isViewing.value = false;
  currentTransactionId.value = null;
}

function openViewDrawer(row: any) {
  Object.assign(formData, row);
  formTitle.value = 'View Transaction';
  isViewing.value = true;
  showDrawer.value = true;
  isEditing.value = false;
  currentTransactionId.value = row.id;
}

const handleSubmit = async () => {
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      let payload: any = {
        accountId: formData.accountId,
        transactionType: formData.transactionType,
        amount: formData.amount,
        transactionDate: formData.transactionDate || new Date().toISOString(),
        notes: formData.notes,
        category: formData.transactionType === 'Transfer' ? undefined : formData.category,
        party: formData.party,
        toAccountId: formData.transactionType === 'Transfer' ? formData.toAccountId : undefined,
      };
      const res = await addTransaction(payload);
      if (!res.isError) {
        message.success(res.message || 'Transaction added successfully');
        showDrawer.value = false;
        fetchTransactions({ pageNumber: currentPage.value, pageSize: pageSize.value });
      } else {
        message.error(res.message || 'Failed to add transaction');
      }
    }
  });
};

const handleDelete = async (id: number) => {
  const res = await deleteTransaction(id);
  if (!res.isError) {
    message.success(res.message || 'Transaction deleted successfully');
    fetchTransactions({ pageNumber: currentPage.value, pageSize: pageSize.value });
  } else {
    message.error(res.message || 'Failed to delete transaction');
    isViewing.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchTransactions({ pageNumber: currentPage.value, pageSize: pageSize.value });
};
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchTransactions({ pageNumber: currentPage.value, pageSize: pageSize.value });
};

const columns = accountTransactionColumns(openViewDrawer, handleDelete);

fetchTransactions({ pageNumber: currentPage.value, pageSize: pageSize.value });
getAccountsDropdown();
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Account Transactions</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Transaction
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-2">
      <div class="flex gap-4 items-center">
        <n-form-item label="Type">
          <n-select v-model:value="filterType" placeholder="Select type" :options="transactionTypeOptions" clearable style="width: 150px" />
        </n-form-item>
        <n-form-item label="From">
          <n-date-picker v-model:value="filterFromDate" type="date" placeholder="From date" clearable style="width: 150px" />
        </n-form-item>
        <n-form-item label="To">
          <n-date-picker v-model:value="filterToDate" type="date" placeholder="To date" clearable style="width: 150px" />
        </n-form-item>
        <n-button @click="handleFilter" :loading="loading">Filter</n-button>
      </div>
    </n-card>

    <!-- Transactions Table -->
    <n-card>
      <n-data-table :key="`transactions-${currentPage}-${pageSize}-${totalCount}`" :columns="columns" :data="transactions" :loading="loading" :pagination="false" striped />
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, computedTotalCount) }} of {{ computedTotalCount }} entries
        </div>
        <n-pagination v-model:page="currentPage" v-model:page-size="pageSize" :page-count="Math.ceil(computedTotalCount / pageSize)" :page-sizes="[2, 5, 10, 20, 50]" show-size-picker show-quick-jumper @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
      </div>
    </n-card>

    <!-- Transaction Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Type" path="transactionType">
              <n-select v-model:value="formData.transactionType" :options="transactionTypeOptions" @update:value="val => { formData.transactionType = val; formData.category = ''; formData.toAccountId = null; }" :disabled="isViewing" />
            </n-form-item>
            <n-form-item label="Account" path="accountId">
              <n-select v-model:value="formData.accountId" placeholder="Select account" :options="accountList" filterable clearable :disabled="isViewing" />
            </n-form-item>      
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Amount" path="amount">
              <n-input-number v-model:value="formData.amount" placeholder="Amount" :min="1" :precision="2" :disabled="isViewing" />
            </n-form-item>
            <n-form-item label="Date" path="transactionDate">
              <n-date-picker :value="formData.transactionDate ? Date.parse(formData.transactionDate) : null" type="datetime" placeholder="Select date and time" :update-value-on-close="true" clearable @update:value="val => formData.transactionDate = val ? new Date(val).toISOString() : ''" :disabled="isViewing" />
            </n-form-item>
          </div>
          <div  v-if="formData.transactionType != 'Transfer'" class="grid grid-cols-2 gap-4">
             <n-form-item label="Category" path="category">
              <n-select v-model:value="formData.category" :options="formData.transactionType === 'Income' ? incomeCategories : expenseCategories" 
            :disabled="isViewing"/>
            </n-form-item>

             <n-form-item label="Party" path="party">
              <n-input v-model:value="formData.party" placeholder="Party (optional)" :disabled="isViewing" />
            </n-form-item>
          </div>
          <!-- <div v-if="formData.transactionType === 'Income'" class="grid grid-cols-2 gap-4">
            <n-form-item label="Category" path="category">
              <n-select v-model:value="formData.category" :options="incomeCategories" :disabled="isViewing" />
            </n-form-item>
          </div> -->
          <div v-if="formData.transactionType === 'Transfer'" class="grid grid-cols-2 gap-4">
            <n-form-item label="To Account" path="toAccountId">
              <n-select v-model:value="formData.toAccountId" placeholder="Select To Account" :options="accountList" filterable clearable :disabled="isViewing" />
            </n-form-item>
          </div>
          <n-form-item label="Notes" path="notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes (optional)" :rows="2" :disabled="isViewing" />
          </n-form-item>
          <div class="flex justify-end mt-6">
            <n-space>
              <n-button @click="showDrawer = false">
                Cancel
              </n-button>
              <n-button type="primary" @click="handleSubmit" :loading="loading" v-if="!isViewing">
                {{ isEditing ? 'Update' : 'Add' }}
              </n-button>
            </n-space>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>



