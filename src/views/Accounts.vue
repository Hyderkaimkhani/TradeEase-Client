<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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
  useMessage,
  NPagination
} from 'naive-ui'
import { FormInst } from 'naive-ui'
import { useAccounts } from '../composables/useAccounts'
import { accountColumns } from '../Constants/GridColumns'
import type { CreateAccountRequest, UpdateAccountRequest, Account } from '../Interfaces/account.interface'

const message = useMessage()

const {
  accounts,
  loading,
  totalCount,
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount
} = useAccounts()

// Pagination & filters
const page = ref(1)
const currentPage = ref(1);
const pageSize = ref(10)
const searchTerm = ref('')

// Search state
// const searchTerm = ref('');

// Computed: Filtered Accounts by search term
const filteredAccounts = computed(() => {
  if (!searchTerm.value) return accounts.value;
  const term = searchTerm.value.toLowerCase();
  return accounts.value.filter(a =>
    (a.name && a.name.toLowerCase().includes(term)) ||
    (a.bankName && a.bankName.toLowerCase().includes(term)) ||
    (a.type && a.type.toLowerCase().includes(term)) ||
    (a.accountNumber && a.accountNumber.toLowerCase().includes(term))
  );
});

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAccounts.value.slice(start, start + pageSize.value);
});

// Drawer state
const showDrawer = ref(false)
const formTitle = ref('Add Account')
const isEditing = ref(false)
const currentAccountId = ref<number | null>(null)

const formRef = ref<FormInst | null>(null)

// Regex must match server side validation
const accountTypeOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Bank', value: 'Bank' },
  { label: 'Wallet', value: 'Wallet' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Loan', value: 'Loan' },
  { label: 'Investment', value: 'Investment' },
  { label: 'Others', value: 'Others' },
  // // Virtual/system types (for display only)
  // { label: 'Receivable (system)', value: 'Receivable', disabled: true },
  // { label: 'Payable (system)', value: 'Payable', disabled: true }
]

type FormModel = CreateAccountRequest & { id?: number }
const formData = reactive<FormModel>({
  name: '',
  type: 'Cash',
  accountNumber: '',
  bankName: '',
  openingBalance: 0
})

const rules = {
  name: [
    { required: true, message: 'Name is required', trigger: ['input', 'blur'] },
    { validator: (_: any, v: string) => (v?.length <= 100), message: 'Max 100 chars', trigger: ['input', 'blur'] }
  ],
  type: [
    { required: true, message: 'Type is required', trigger: ['change', 'blur'] },
  ],
  accountNumber: [
    { validator: (_: any, v: string) => (!v || v.length <= 50), message: 'Max 50 chars', trigger: ['input', 'blur'] }
  ],
  bankName: [
    { validator: (_: any, v: string) => (!v || v.length <= 50), message: 'Max 50 chars', trigger: ['input', 'blur'] }
  ],
}

const resetForm = () => {
  formData.name = ''
  formData.type = 'Cash'
  formData.accountNumber = ''
  formData.bankName = ''
  formData.openingBalance = 0
  formData.currentBalance = 0
  isEditing.value = false
  currentAccountId.value = null
}

const openAddDrawer = () => {
  resetForm()
  formTitle.value = 'Add Account'
  showDrawer.value = true
}

const openEditDrawer = (row: Account) => {
  resetForm()
  formTitle.value = 'Edit Account'
  isEditing.value = true
  currentAccountId.value = row.id
  // Fill form (without openingBalance on edit)
  formData.name = row.name
  formData.type = row.type
  formData.accountNumber = row.accountNumber || ''
  formData.bankName = row.bankName || ''
  formData.openingBalance = row.openingBalance || 0
  formData.currentBalance = row.currentBalance  // currentBalance is not editable, set it for display
  showDrawer.value = true
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        if (isEditing.value && currentAccountId.value !== null) {
          const payload: UpdateAccountRequest = {
            id: currentAccountId.value,
            name: formData.name,
            type: formData.type,
            accountNumber: formData.accountNumber || undefined,
            bankName: formData.bankName || undefined,
          }
          await updateAccount(currentAccountId.value, payload)
          message.success('Account updated successfully')
        } else {
          const payload: CreateAccountRequest = {
            name: formData.name,
            type: formData.type,
            accountNumber: formData.accountNumber || undefined,
            bankName: formData.bankName || undefined,
            openingBalance: Number(formData.openingBalance || 0)
          }
          await addAccount(payload)
          message.success('Account added successfully')
        }
        showDrawer.value = false
        // refresh current page to keep pagination consistent
        await fetchAccounts(page.value, pageSize.value)
      } catch (err: any) {
        message.error(err.message || 'Operation failed')
      }
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await deleteAccount(id)
    message.success('Account deleted successfully')
    await fetchAccounts(page.value, pageSize.value)
  } catch (err: any) {
    message.error(err.message || 'Failed to delete account')
  }
}

const columns = accountColumns(openEditDrawer, handleDelete)

const handlePageChange = async (newPage: number) => {
  page.value = newPage
  await fetchAccounts(page.value, pageSize.value)
}

const handlePageSizeChange = async (newSize: number) => {
  pageSize.value = newSize
  page.value = 1
  await fetchAccounts(page.value, pageSize.value)
}

// const handleSearch = async () => {
//   page.value = 1
//   await fetchAccounts(page.value, pageSize.value, accountSearch.value)
// }

// initial load
fetchAccounts(page.value, pageSize.value)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
      <h1 class="text-2xl font-bold">Accounts</h1>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <n-input v-model:value="searchTerm" placeholder="Search" clearable class="w-full sm:w-64"/>
        <!-- <n-button tertiary @click="handleSearch">Search</n-button> -->
        <!-- <n-input v-model:value="searchTerm" placeholder="Search Account" clearable  class="w-full sm:w-64" /> -->
        <n-button type="primary" @click="openAddDrawer">Add Account</n-button>
      </div>
    </div>

    <n-card>
      <n-data-table :columns="columns" :data="paginatedAccounts" :loading="loading" :bordered="false" :pagination="false" striped
         />
        <!-- Custom Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{
          totalCount }} entries
        </div>
        <n-pagination v-model:page="currentPage" v-model:page-size="pageSize"
          :page-count="Math.ceil(totalCount / pageSize)" :page-sizes="[10, 20, 50]" show-size-picker
          show-quick-jumper @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
      </div>
    </n-card>

    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Name" path="name" required>
              <n-input v-model:value="formData.name" placeholder="Account name" />
            </n-form-item>
            <n-form-item label="Type" path="type" required>
              <n-select v-model:value="formData.type" :options="accountTypeOptions" :disabled="isEditing"
                placeholder="Select account type" />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            
            <n-form-item label="Opening Balance" path="openingBalance">
              <n-input-number v-model:value="formData.openingBalance" :precision="2" placeholder="0.00" :disabled="isEditing"/>
            </n-form-item>
            <n-form-item label="Current Balance" path="currentBalance">
              <n-input-number v-model:value="formData.currentBalance" :precision="2" placeholder="0.00" disabled/>
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Account #" path="accountNumber">
              <n-input v-model:value="formData.accountNumber" placeholder="Account number" />
            </n-form-item>
            <n-form-item label="Bank" path="bankName">
              <n-input v-model:value="formData.bankName" placeholder="Bank name" />
            </n-form-item>
          </div>

          <div class="text-xs text-gray-500" v-if="isEditing">
            Opening & Current balance cannot be edited. Adjustments should be made via transactions.
          </div>

          <div class="flex justify-end mt-6">
            <n-space>
              <n-button @click="showDrawer = false">Cancel</n-button>
              <n-button type="primary" @click="handleSubmit" :loading="loading">{{ isEditing ? 'Update' : 'Add'
                }}</n-button>
            </n-space>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>

</template>


