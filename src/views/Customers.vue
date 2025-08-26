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
  NPagination,
  useMessage
} from 'naive-ui';
import { useCustomers } from '../composables/useCustomers';
import { FormInst } from 'naive-ui';
import { customerColumns } from '../Constants/GridColumns';

// Message API
const message = useMessage();

// Get customers data and methods
const {
  customers,
  loading,
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer
} = useCustomers();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = computed(() => filteredCustomers.value.length);

// Search state
const searchTerm = ref('');

// Computed: Filtered customers by search term
const filteredCustomers = computed(() => {
  if (!searchTerm.value) return customers.value;
  const term = searchTerm.value.toLowerCase();
  return customers.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(term)) ||
    (c.phone && c.phone.toLowerCase().includes(term)) ||
    (c.address && c.address.toLowerCase().includes(term)) ||
    (c.city && c.city.toLowerCase().includes(term))
  );
});

// Computed: Paginated customers
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCustomers.value.slice(start, start + pageSize.value);
});

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page;
};
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Customer');
const isEditing = ref(false);
const currentCustomerId = ref<number | null>(null);

const formRef = ref<FormInst | null>(null)
// Form model
const formData = reactive({
  name: '',
  phone: '',
  address: '',
  city: '',
  creditBalance: 0,
  paymentTerms: '',
});

// Reset form
const resetForm = () => {
  formData.name = '';
  formData.phone = '';
  formData.address = '';
  formData.city = '';
  formData.creditBalance = 0;
  formData.paymentTerms = '';
  isEditing.value = false;
  currentCustomerId.value = null;
};

const rules = {
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: ['input', 'blur']
    }
  ],
  phone: [
    {
      required: true,
      message: 'Phone number is required',
      trigger: ['input', 'blur']
    }
  ],
}
// Open drawer for adding
const openAddDrawer = () => {
  resetForm();
  formTitle.value = 'Add Customer';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  resetForm();
  formTitle.value = 'Edit Customer';
  isEditing.value = true;
  currentCustomerId.value = row.id;

  // Fill form with customer data
  Object.assign(formData, row);
  showDrawer.value = true;
};

// Handle form submission
const handleSubmit = () => {

  formRef.value?.validate((errors) => {
    if (!errors) {
      if (isEditing.value && currentCustomerId.value !== null) 
      {
        // Update existing customer
        updateCustomer(currentCustomerId.value, formData)
          .then(() => {
            message.success('Customer updated successfully');
            showDrawer.value = false;
          })
          .catch((error) => {
            message.error(error.message || 'Failed to update customer');
          });
      } 
      else 
      {
        // Add new customer
        addCustomer(formData)
          .then(() => {
            message.success('Customer added successfully');
            showDrawer.value = false;
          })
          .catch((error) => {
            message.error(error.message || 'Failed to add customer');
          });
      }
    }
  })
};

// Handle customer deletion
const handleDelete = (id: number) => {
  deleteCustomer(id)
    .then(() => {
      message.success('Customer deleted successfully');
    })
    .catch((error) => {
      message.error(error.message || 'Failed to delete customer');
    });
};

// Table columns
const columns = customerColumns(openEditDrawer, handleDelete)

// Load customers on mount
fetchCustomers();
</script>

<template>
  <div>

    <!-- <div class="flex justify-between items-center mb-1">
      <h1 class="text-2xl font-bold">Customers</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Customer
      </n-button>
    </div> -->

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
      <h1 class="text-2xl font-bold">Customers</h1>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- <n-input v-model:value="accountSearch" placeholder="Search by Account #" class="w-full sm:w-64"
          @keydown.enter="handleSearch" />
        <n-button tertiary @click="handleSearch">Search</n-button> -->
        <n-input v-model:value="searchTerm" placeholder="Search" clearable  class="w-full sm:w-64" />
        <n-button type="primary" @click="openAddDrawer">Add Customer</n-button>
      </div>
    </div>

    <!-- Search and Table -->
    <!-- <n-card class="mb-1">
      <div class="flex gap-4 items-center">
         <n-form-item label="Search"> 
        <n-input v-model:value="searchTerm" placeholder="Search customers..." clearable style="width: 250px" />
      </div>
    </n-card> -->

    <n-card>
      <n-data-table :columns="columns" :data="paginatedCustomers" :loading="loading" :pagination="false" striped />

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

    <!-- Customer Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <n-form-item label="Name" path="name" required>
            <n-input v-model:value="formData.name" placeholder="Customer name" />
          </n-form-item>


          <n-form-item label="Phone" path="phone" required>
            <n-input v-model:value="formData.phone" placeholder="Phone number" />
          </n-form-item>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Credit Balance" path="creditBalance">
              <n-input-number v-model:value="formData.creditBalance" placeholder="Credit Balance"
                :disabled="isEditing" />
            </n-form-item>
          </div>
          <n-form-item label="Address" path="address">
            <n-input v-model:value="formData.address" placeholder="Street address" />
          </n-form-item>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="City" path="city">
              <n-input v-model:value="formData.city" placeholder="City" />
            </n-form-item>
            <n-form-item label="Payment Terms" path="paymentTerms">
              <n-input v-model:value="formData.paymentTerms" placeholder="Payment terms" />
            </n-form-item>
          </div>

          <div class="flex justify-end mt-6">
            <n-space>
              <n-button @click="showDrawer = false">
                Cancel
              </n-button>
              <n-button type="primary" @click="handleSubmit" :loading="loading">
                {{ isEditing ? 'Update' : 'Add' }}
              </n-button>
            </n-space>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>