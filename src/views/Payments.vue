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
} from 'naive-ui';
import { usePayments } from '../composables/usePayments';
import { FormInst } from 'naive-ui';
import { paymentColumns } from '../Constants/GridColumns';
import type { RuleType } from 'async-validator';
import { EntityType, PaymentMethod } from '../Constants/Enums';
import { useCustomers } from '../composables/useCustomers';

// Message API
const message = useMessage();

// Get payments data and methods
const {
  payments,
  loading,
  fetchPayments,
  addPayment,
  updatePayment,
  deletePayment,
} = usePayments();

const { entityList, getCustomerSuppliersList } = useCustomers();

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Payment');
const isEditing = ref(false);
const isViewing = ref(false);
const currentPaymentId = ref<number | null>(null);

// Filter state
const selectedEntityId = ref<number | null>(null);
const selectedEntityType = ref<string | null>(null);

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref<number>(0);

// Computed total count to ensure reactivity
const computedTotalCount = computed(() => totalCount.value);

const formRef = ref<FormInst | null>(null);
const formKey = ref(0);

// Optional: Reset form
const resetForm = () => {
  Object.assign(formData, {
    entityType: null,
    entityId: null,
  });
  formKey.value++; // force re-render
};

// Form model
const formData = reactive({
  entityType: null as string | null,
  entityId: null as number | null,
  paymentBy: null as string | null,
  amount: 0,
  paymentDate: '',
  paymentMethod: PaymentMethod.Cash,
  notes: '',
});

// Entity type options
const entityTypeOptions = [
  { label: 'Customer', value: EntityType.Customer },
  { label: 'Supplier', value: EntityType.Supplier },
];

// Payment method options
const paymentMethodOptions = [
  { label: 'Cash', value: PaymentMethod.Cash },
  { label: 'Cheque', value: PaymentMethod.Cheque },
  { label: 'Bank Transfer', value: PaymentMethod.BankTransfer },
  { label: 'Mobile Payment', value: PaymentMethod.MobilePayment },
];

// Reset form
const resetFormData = () => {
  formData.entityType = null;
  formData.entityId = null;
  formData.paymentBy = '';
  formData.amount = 0;
  formData.paymentDate = '';
  formData.paymentMethod = PaymentMethod.Cash;
  formData.notes = '';
  isEditing.value = false;
  isViewing.value = false;
  currentPaymentId.value = null;
};

const rules = {
  entityType: [
    {
      required: true,
      message: 'Entity type is required',
      trigger: ['change'],
      validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Entity type is required.');
        return true;
      }
    }
  ],
  entityId: [
    {
      required: true,
      message: 'Entity is required',
      trigger: ['change'],
      validator: (_rule: any, value: any) => {
        if (!isEditing.value && (value == null || value === '')) return new Error('Entity is required.');
        return true;
      }
    }
  ],
  amount: [
    {
      required: true,
      trigger: ['input', 'blur', 'change'],
      validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('Amount is required');
        }
        if (typeof value !== 'number' || value <= 0) {
          return new Error('Amount must be greater than 0');
        }
        return true;
      }
    }
  ],
  paymentDate: [
    {
      required: true,
      message: 'Payment date is required',
      trigger: ['change']
    }
  ],
  paymentMethod: [
    {
      required: true,
      message: 'Payment method is required',
      trigger: ['change']
    }
  ]
};

// Open drawer for adding
const openAddDrawer = () => {
  resetFormData();
  formTitle.value = 'Add Payment';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  console.log('Opening edit drawer with row data:', row);

  resetForm();
  formTitle.value = 'Edit Payment';
  isEditing.value = true;
  currentPaymentId.value = row.id;

  // Fill form with payment data
  formData.entityType = row.entityType;
  formData.entityId = row.entityId;
  formData.paymentBy = row.paymentBy || '';
  formData.amount = row.amount;
  formData.paymentDate = row.paymentDate;
  formData.paymentMethod = row.paymentMethod || PaymentMethod.Cash;
  formData.notes = row.notes || '';

  console.log('Form data after populating:', formData);
  showDrawer.value = true;
};

const openViewDrawer = (row: any) => {
  console.log('Opening edit drawer with row data:', row);

  resetForm();
  formTitle.value = 'View Payment';
  isViewing.value = true;
  currentPaymentId.value = row.id;

  // Fill form with payment data
  formData.entityType = row.entityType;
  formData.entityId = row.entityId;
  formData.paymentBy = row.paymentBy || '';
  formData.amount = row.amount;
  formData.paymentDate = row.paymentDate;
  formData.paymentMethod = row.paymentMethod || PaymentMethod.Cash;
  formData.notes = row.notes || '';

  console.log('Form data after populating:', formData);
  showDrawer.value = true;
};

// Handle form submission
const handleSubmit = () => {
  console.log('Form data before validation:', formData);

  formRef.value?.validate((errors) => {
    console.log('Validation errors:', errors);

    if (!errors) {
      // Ensure we have valid values before submission
      if (!formData.entityType || (!isEditing.value && !formData.entityId) || formData.amount <= 0) {
        message.error('Please fill in all required fields with valid values');
        console.log('Manual validation failed:', {
          entityType: formData.entityType,
          entityId: formData.entityId,
          amount: formData.amount,
          isEditing: isEditing.value
        });
        return;
      }

      const submitData = {
        ...formData,
        entityType: formData.entityType!,
        entityId: isEditing.value ? formData.entityId : formData.entityId!,
        amount: formData.amount,
        paymentDate: formData.paymentDate || new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      console.log('Submit data:', submitData);

      if (isEditing.value && currentPaymentId.value !== null) {
        // Update existing payment
        updatePayment(currentPaymentId.value, {
          id: currentPaymentId.value,
          amount: formData.amount,
          paymentDate: formData.paymentDate || new Date().toISOString(),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        })
          .then(() => {
            message.success('Payment updated successfully');
            showDrawer.value = false;
            loadPayments();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to update payment');
          });
      } else {
        // Add new payment
        addPayment(submitData as any)
          .then(() => {
            message.success('Payment added successfully');
            showDrawer.value = false;
            loadPayments();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to add payment');
          });
      }
    }
  });
};

// Handle payment deletion
const handleDelete = (id: number) => {
  deletePayment(id)
    .then(() => {
      message.success('Payment deleted successfully');
      loadPayments();
    })
    .catch((error) => {
      message.error(error.message || 'Failed to delete payment');
    });
};

// Load payments with filters
const loadPayments = async () => {
  const count = await fetchPayments(currentPage.value, pageSize.value, selectedEntityId.value || undefined);
  totalCount.value = count || 0;
  console.log('Loaded payments:', {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    totalCount: totalCount.value,
    paymentsCount: payments.value.length,
    totalPages: Math.ceil((count || 0) / pageSize.value),
    canGoNext: currentPage.value < Math.ceil((count || 0) / pageSize.value),
    canGoPrev: currentPage.value > 1
  });
};

// Handle filter changes
const handleEntityTypeChange = (value: string | null) => {
  selectedEntityType.value = value;
  selectedEntityId.value = null;
  currentPage.value = 1; // Reset to first page when filter changes
  if (value) {
    getCustomerSuppliersList(value as EntityType);
  }
  loadPayments();
};

const handleEntityFilterChange = (value: number | null) => {
  selectedEntityId.value = value;
  currentPage.value = 1; // Reset to first page when filter changes
  loadPayments();
};

// Handle pagination changes
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadPayments();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // Reset to first page when page size changes
  loadPayments();
};

// Table columns
const columns = paymentColumns(openViewDrawer, handleDelete);

// Pagination configuration
const paginationConfig = computed(() => {
  console.log('Pagination config updated:', {
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: totalCount.value,
    totalPages: Math.ceil(totalCount.value / pageSize.value)
  });
  
  return {
    page: currentPage.value,
    pageSize: pageSize.value,
    pageSizes: [2, 5, 10, 20, 50],
    showSizePicker: true,
    showQuickJumper: true,
    itemCount: totalCount.value,
    onUpdatePage: handlePageChange,
    onUpdatePageSize: handlePageSizeChange,
    prefix: () => `Total ${totalCount.value} items`
  };
});

// Load payments on mount
loadPayments();
getCustomerSuppliersList();

// Update total count when payments are loaded
const updateTotalCount = (count: number) => {
  totalCount.value = count;
};

</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Payments</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Payment
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-4">
      <div class="flex gap-4 items-end">
        <n-form-item label="Filter by Entity Type">
          <n-select v-model:value="selectedEntityType" placeholder="Select entity type" :options="entityTypeOptions"
            clearable @update:value="handleEntityTypeChange" style="width: 200px" />
        </n-form-item>
        <n-form-item label="Filter by Entity">
          <n-select v-model:value="selectedEntityId" placeholder="Select entity" :options="entityList" filterable
            clearable @update:value="handleEntityFilterChange" style="width: 200px" />
        </n-form-item>
        <n-button @click="loadPayments" :loading="loading">
          Refresh
        </n-button>
      </div>
    </n-card>

    <!-- Payments Table -->
    <n-card>
      <div class="mb-4 text-sm text-gray-600">
        Total Records: {{ computedTotalCount }} | Current Page: {{ currentPage }} | Page Size: {{ pageSize }} | Total Pages: {{ Math.ceil(computedTotalCount / pageSize) }} | Can Go Next: {{ currentPage < Math.ceil(computedTotalCount / pageSize) }}
      </div>
      <n-data-table 
        :key="`payments-${currentPage}-${pageSize}-${totalCount}`"
        :columns="columns" 
        :data="payments" 
        :loading="loading" 
        :pagination="false"
        striped 
      />
      
      <!-- Custom Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, computedTotalCount) }} of {{ computedTotalCount }} entries
        </div>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :page-count="Math.ceil(computedTotalCount / pageSize)"
          :page-sizes="[2, 5, 10, 20, 50]"
          show-size-picker
          show-quick-jumper
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </n-card>

    <!-- Payment Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" :key="formKey" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Entity Type" path="entityType">
              <n-select v-model:value="formData.entityType" placeholder="Select entity type" :options="entityTypeOptions"
                clearable :disabled="isEditing || isViewing" @update:value="val => { formData.entityType = val; if(val) getCustomerSuppliersList(val as EntityType); }" />
            </n-form-item>
            <n-form-item label="Entity" path="entityId">
              <n-input v-if="isEditing || isViewing" v-model:value="formData.paymentBy" placeholder="Entity name" :disabled="isEditing || isViewing" />
              <n-select v-else v-model:value="formData.entityId" placeholder="Select entity" :options="entityList" filterable
                clearable />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Amount" path="amount">
              <n-input-number v-model:value="formData.amount" placeholder="Amount" :min="1" :precision="2"  :disabled="isViewing"/>
            </n-form-item>
            <n-form-item label="Payment Method" path="paymentMethod">
              <n-select v-model:value="formData.paymentMethod" placeholder="Select payment method" :options="paymentMethodOptions" :disabled="isViewing"/>
            </n-form-item>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <n-form-item label="Payment Date" path="paymentDate">
              <n-date-picker :value="formData.paymentDate ? Date.parse(formData.paymentDate) : null" type="datetime"
                placeholder="Select payment date and time" :update-value-on-close="true" clearable
                @update:value="val => formData.paymentDate = val ? new Date(val).toISOString() : ''" :disabled="isViewing"/>
            </n-form-item>
          </div>

          <n-form-item label="Notes" path="notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes" :rows="2" :disabled="isViewing"/>
          </n-form-item>

          <div class="flex justify-end mt-6">
            <n-space>
              <n-button @click="showDrawer = false">
                Cancel
              </n-button>
              <n-button v-if="!isViewing" type="primary" @click="handleSubmit" :loading="loading" :disabled="isViewing">
                {{ isEditing ? 'Update' : 'Add' }}
              </n-button>
            </n-space>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template> 