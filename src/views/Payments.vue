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
import { useRouter } from 'vue-router';
import { PaymentAllocation } from '../Interfaces/payment.interface';

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
  getPaymentById,
} = usePayments();

const { entityList, getCustomerSuppliersList } = useCustomers();
const router = useRouter();

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
  paymentAllocations: [] as PaymentAllocation[],
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
  formData.paymentAllocations = [];
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

const openViewDrawer = async (row: any) => {
  console.log('Opening view drawer with row data:', row);

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

  // Fetch payment details to get allocations
  try {
    const paymentDetails = await getPaymentById(row.id);
    if (paymentDetails && paymentDetails.paymentAllocations) {
      formData.paymentAllocations = paymentDetails.paymentAllocations;
    }
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
  }

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

// State for expanded allocation details
const expandedAllocation = ref<number | null>(null);

// Navigate to order or supply
const navigateToReference = (allocation: any) => {
  if (allocation.referenceType === 'Supply') {
    router.push(`/app/supplies?highlight=${allocation.referenceId}`);
  } else if (allocation.referenceType === 'Order') {
    router.push(`/app/orders?highlight=${allocation.referenceId}`);
  }
};

// Toggle allocation details
const toggleAllocationDetails = (allocationId: number) => {
  expandedAllocation.value = expandedAllocation.value === allocationId ? null : allocationId;
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
      <!-- <div class="mb-4 text-sm text-gray-600">
        Total Records: {{ computedTotalCount }} | Current Page: {{ currentPage }} | Page Size: {{ pageSize }} | Total Pages: {{ Math.ceil(computedTotalCount / pageSize) }} | Can Go Next: {{ currentPage < Math.ceil(computedTotalCount / pageSize) }}
      </div> -->
      <n-data-table :key="`payments-${currentPage}-${pageSize}-${totalCount}`" :columns="columns" :data="payments"
        :loading="loading" :pagination="false" striped />

      <!-- Custom Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, computedTotalCount) }}
          of {{ computedTotalCount }} entries
        </div>
        <n-pagination v-model:page="currentPage" v-model:page-size="pageSize"
          :page-count="Math.ceil(computedTotalCount / pageSize)" :page-sizes="[2, 5, 10, 20, 50]" show-size-picker
          show-quick-jumper @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
      </div>
    </n-card>

    <!-- Payment Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" :key="formKey" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Entity Type" path="entityType">
              <n-select v-model:value="formData.entityType" placeholder="Select entity type"
                :options="entityTypeOptions" clearable :disabled="isEditing || isViewing"
                @update:value="val => { formData.entityType = val; if(val) getCustomerSuppliersList(val as EntityType); }" />
            </n-form-item>
            <n-form-item label="Entity" path="entityId">
              <n-input v-if="isEditing || isViewing" v-model:value="formData.paymentBy" placeholder="Entity name"
                :disabled="isEditing || isViewing" />
              <n-select v-else v-model:value="formData.entityId" placeholder="Select entity" :options="entityList"
                filterable clearable />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Amount" path="amount">
              <n-input-number v-model:value="formData.amount" placeholder="Amount" :min="1" :precision="2"
                :disabled="isViewing" />
            </n-form-item>
            <n-form-item label="Payment Method" path="paymentMethod">
              <n-select v-model:value="formData.paymentMethod" placeholder="Select payment method"
                :options="paymentMethodOptions" :disabled="isViewing" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <n-form-item label="Payment Date" path="paymentDate">
              <n-date-picker :value="formData.paymentDate ? Date.parse(formData.paymentDate) : null" type="datetime"
                placeholder="Select payment date and time" :update-value-on-close="true" clearable
                @update:value="val => formData.paymentDate = val ? new Date(val).toISOString() : ''"
                :disabled="isViewing" />
            </n-form-item>
          </div>

          <n-form-item label="Notes" path="notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes" :rows="2"
              :disabled="isViewing" />
          </n-form-item>

          <!-- Payment Allocations -->
          <div v-if="isViewing && formData.paymentAllocations && formData.paymentAllocations.length > 0" class="mt-2">
            <h3 class="text-lg font-semibold mb-2">Payment Allocations</h3>
            <div class="space-y-3">
              <div v-for="allocation in formData.paymentAllocations" :key="allocation.id"
                class="border rounded-lg bg-gray-50 overflow-hidden">
                <!-- Allocation Header -->
                <div class="p-4 hover:bg-gray-100 cursor-pointer transition-colors flex justify-between items-center"
                  @click="toggleAllocationDetails(allocation.id)">
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ allocation.referenceType }} # {{ allocation.number }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Allocated Amount: Rs. {{ allocation.allocatedAmount.toLocaleString() }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-blue-600 text-sm">
                      {{ expandedAllocation === allocation.id ? 'Hide' : 'Show' }} details
                    </div>
                    <n-icon class="transition-transform"
                      :class="{ 'rotate-180': expandedAllocation === allocation.id }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </n-icon>
                  </div>
                </div>

                <!-- Expanded Details -->
                <div v-if="expandedAllocation === allocation.id" class="border-t bg-white p-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div class="font-medium text-gray-700 mb-2"></div>
                      <div class="space-y-1">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Truck Number:</span>
                          <span class="font-medium">{{ allocation.truckNumber }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Date:</span>
                          <span class="font-medium">{{ new Date(allocation.operationDate).toISOString().slice(0, 10)
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Allocated:</span>
                          <span class="font-medium text-green-600">Rs. {{ allocation.allocatedAmount.toLocaleString()
                            }}</span>
                        </div>
                        <div class=" mt-8">
                          <n-button size="small" type="primary" @click="navigateToReference(allocation)">
                            View Full Details
                          </n-button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="font-medium text-gray-700 mb-2"></div>
                      <div class="space-y-1">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Payment Status:</span>
                          <span class="font-medium" :class="{
                            'text-green-600': allocation.paymentStatus === 'Paid',
                            'text-orange-500': allocation.paymentStatus === 'Partial'
                          }">{{ allocation.paymentStatus }}</span>
                        </div>
                        <!-- <div class="flex justify-between">
                          <span class="text-gray-600">Quantity:</span>
                          <span class="font-medium">{{ allocation.quantity }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Price:</span>
                          <span class="font-medium">{{ allocation.price }}</span>
                        </div> -->
                        <div class="flex justify-between">
                          <span class="text-gray-600">Total:</span>
                          <span class="font-medium text-orange-600">Rs. {{ allocation.totalPrice.toLocaleString()
                            }}</span>
                        </div>


                      </div>
                    </div>
                    <!-- <div>
                      <div class="font-medium text-gray-700 mb-2">Quick Actions</div>
                      <div class="space-y-2">
                        <n-button 
                          size="small" 
                          type="primary" 
                          @click="navigateToReference(allocation)"
                        >
                          View Full Details
                        </n-button>
                      </div>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-3 text-sm text-gray-500">
              Total Allocated: Rs. {{ formData.paymentAllocations.reduce((sum, a) => sum + a.allocatedAmount,
              0).toLocaleString() }}
            </div>
          </div>

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