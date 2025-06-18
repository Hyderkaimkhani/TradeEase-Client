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
  NInputGroup,
  NTag,
  useMessage,
  NPopconfirm,
  NIcon
} from 'naive-ui';
import { TrashOutline as DeleteIcon, PencilOutline as EditIcon } from '@vicons/ionicons5';
import { useCustomers } from '../composables/useCustomers';

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

// Form model
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  status: 'active'
});

// Reset form
const resetForm = () => {
  formData.name = '';
  formData.email = '';
  formData.phone = '';
  formData.address = '';
  formData.city = '';
  formData.state = '';
  formData.zipCode = '';
  formData.status = 'active';
  isEditing.value = false;
  currentCustomerId.value = null;
};

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
  if (isEditing.value && currentCustomerId.value !== null) {
    // Update existing customer
    updateCustomer(currentCustomerId.value, formData)
      .then(() => {
        message.success('Customer updated successfully');
        showDrawer.value = false;
      })
      .catch((error) => {
        message.error(error.message || 'Failed to update customer');
      });
  } else {
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
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 70
  },
  {
    title: 'Name',
    key: 'name',
    width: 140
  },
  {
    title: 'Email',
    key: 'email',
    width: 180
  },
  {
    title: 'Phone',
    key: 'phone',
    width: 130
  },
  {
    title: 'Address',
    key: 'address',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render(row: any) {
      const statusType = row.status === 'active' ? 'success' : 'error';
      return h(
        NTag,
        {
          type: statusType,
          size: 'small'
        },
        {
          default: () => row.status
        }
      );
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render(row: any) {
      return h(
        NSpace,
        {
          justify: 'center',
          align: 'center'
        },
        {
          default: () => [
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                onClick: () => openEditDrawer(row)
              },
              {
                default: () => h(
                  NIcon,
                  {
                    color: 'rgb(0, 82, 204)'
                  },
                  {
                    default: () => h(EditIcon)
                  }
                )
              }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row.id),
                negativeText: 'Cancel',
                positiveText: 'Delete'
              },
              {
                trigger: () => h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true
                  },
                  {
                    default: () => h(
                      NIcon,
                      {
                        color: 'rgb(255, 86, 48)'
                      },
                      {
                        default: () => h(DeleteIcon)
                      }
                    )
                  }
                ),
                default: () => 'Are you sure you want to delete this customer?'
              }
            )
          ]
        }
      );
    }
  }
];

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
      <n-data-table
        :columns="columns"
        :data="customers"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        striped
      />
    </n-card>

    <!-- Customer Drawer -->
    <n-drawer
      v-model:show="showDrawer"
      :width="502"
      placement="right"
      :trap-focus="false"
    >
      <n-drawer-content :title="formTitle" closable>
        <n-form
          ref="formRef"
          :model="formData"
          label-placement="top"
        >
          <n-form-item label="Name" path="name" required>
            <n-input v-model:value="formData.name" placeholder="Customer name" />
          </n-form-item>

          <n-form-item label="Email" path="email">
            <n-input v-model:value="formData.email" placeholder="Email address" />
          </n-form-item>

          <n-form-item label="Phone" path="phone">
            <n-input v-model:value="formData.phone" placeholder="Phone number" />
          </n-form-item>

          <n-form-item label="Address" path="address">
            <n-input v-model:value="formData.address" placeholder="Street address" />
          </n-form-item>

          <div class="grid grid-cols-3 gap-4">
            <n-form-item label="City" path="city">
              <n-input v-model:value="formData.city" placeholder="City" />
            </n-form-item>

            <n-form-item label="State" path="state">
              <n-input v-model:value="formData.state" placeholder="State" />
            </n-form-item>

            <n-form-item label="Zip Code" path="zipCode">
              <n-input v-model:value="formData.zipCode" placeholder="Zip code" />
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