<script setup lang="ts">
import { ref, reactive, h } from 'vue';
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
  NTag,
  useMessage,
  NPopconfirm,
  NIcon
} from 'naive-ui';
import { TrashOutline as DeleteIcon, PencilOutline as EditIcon } from '@vicons/ionicons5';
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
  entityType: '',
  creditBalance: 0,
  paymentTerms: '',
});

// Reset form
const resetForm = () => {
  formData.name = '';
  formData.phone = '';
  formData.address = '';
  formData.city = '';
  formData.entityType = '';
  formData.creditBalance = 0;
  formData.paymentTerms = '';
  isEditing.value = false;
  currentCustomerId.value = null;
};

const entityTypeOptions = [
  { label: 'Customer', value: 'Customer' },
  { label: 'Supplier', value: 'Supplier' }
]

const rules = {
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: ['input', 'blur']
    }
  ],
  entityType: [
    {
      required: true,
      message: 'Entity type is required',
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
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Customers</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Customer
      </n-button>
    </div>

    <!-- Customers Table -->
    <n-card>
      <n-data-table :columns="columns" :data="customers" :loading="loading" :pagination="{ pageSize: 10 }" striped />
    </n-card>

    <!-- Customer Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <n-form-item label="Name" path="name" required>
            <n-input v-model:value="formData.name" placeholder="Customer name" />
          </n-form-item>

          <n-form-item label="Entity Type" path="entityType" required>
            <n-select v-model:value="formData.entityType" placeholder="Select entity type" :disabled="isEditing"
              :options="entityTypeOptions" />
          </n-form-item>

          <n-form-item label="Phone" path="phone" required>
            <n-input v-model:value="formData.phone" placeholder="Phone number" />
          </n-form-item>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Credit Balance" path="creditBalance">
              <n-input-number v-model:value="formData.creditBalance" placeholder="Credit Balance" />
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