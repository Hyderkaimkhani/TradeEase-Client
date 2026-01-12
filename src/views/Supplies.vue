<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  NButton,
  NCard,
  NSpace,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  useMessage,
} from 'naive-ui';
import { useSupplies } from '../composables/useSupplies';
import { FormInst } from 'naive-ui';
import { supplyColumns } from '../Constants/GridColumns';
import { PaymentStatus } from '../Constants/Enums';
import { useCustomers } from '../composables/useCustomers';
import { useCommon } from '../composables/useCommon';
import ResponsiveDataTable from '../components/ResponsiveDataTable.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
const { isMobile } = useBreakpoint();
// Message API
const message = useMessage();

// Get supplies data and methods
const {
  supplies,
  loading,
  fetchSupplies,
  addSupply,
  updateSupply,
  deleteSupply,
} = useSupplies();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadSupplies();
};
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadSupplies();
};

const
  { entityList,
    getCustomersList
  } = useCustomers();

const
  { fruits,
    fetchFruits
  } = useCommon();

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Supply');
const isEditing = ref(false);
const currentSupplyId = ref<number | null>(null);

// Filter state
const selectedFruitId = ref<number | null>(null);
const selectedSupplierId = ref<number | null>(null);

const formRef = ref<FormInst | null>(null)
const formKey = ref(0)

// Optional: Reset form
const resetForm = () => {
  Object.assign(formData, {
    supplierId: null,
    fruitId: null
  })
  formKey.value++ // force re-render
}
// Form model
const formData = reactive({
  supplierId: null as number | null,
  supplyNumber: '',
  fruitId: null as number | null,
  quantity: 0,
  purchasePrice: 0,
  supplyDate: '',
  truckNumber: '',
  paymentStatus: '',
  amountPaid: 0,
  notes: '',
});

const totalPrice = computed(() => {
  const qty = formData.quantity || 0
  const price = formData.purchasePrice || 0
  return +(qty * price).toFixed(2) // Ensures precision
})

// Reset form
const resetFormData = () => {
  formData.supplierId = null;
  formData.supplyNumber = '';
  formData.fruitId = null;
  formData.quantity = 0;
  formData.purchasePrice = 0;
  formData.supplyDate = '';
  formData.truckNumber = '';
  formData.notes = '';
  formData.paymentStatus= PaymentStatus.Unpaid;
  formData.amountPaid = 0;
  isEditing.value = false;
  currentSupplyId.value = null;
};

const rules = {
  supplierId: [
    {
      required: true,
      message: 'Supplier is required',
      trigger: ['change'],
      validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Supplier is required.')
        return true
      }
    }
  ],
  fruitId: [
    {
      required: true,
      message: 'Fruit is required',
      trigger: ['change'],
      validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Fruit is required.')
        return true
      }
    }
  ],
  quantity: [
    {
      required: true,
      trigger: ['input', 'blur', 'change'],
      validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('Quantity is required')
        }
        if (typeof value !== 'number' || value < 1) {
          return new Error('Quantity must be at least 1')
        }
        return true
      }
    }
  ],
  purchasePrice: [
    {
      required: true,
      trigger: ['input', 'blur', 'change'],
      validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('Purchase Price is required')
        }
        if (typeof value !== 'number' || value < 1) {
          return new Error('Purchase Price must be at least 1')
        }
        return true
      }
    }
  ],
  truckNumber: [
    {
      required: true,
      message: 'Truck number is required',
      trigger: ['input', 'blur', 'change']
    }
  ]
};

// Open drawer for adding
const openAddDrawer = () => {
  resetFormData();
  formTitle.value = 'Add Supply';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  console.log('Opening edit drawer with row data:', row);

  resetForm();
  formTitle.value = 'Edit Supply';
  isEditing.value = true;
  currentSupplyId.value = row.id;

  // Fill form with supply data
  formData.supplierId = row.supplierId;
  formData.supplyNumber = row.supplyNumber || '';
  formData.fruitId = row.fruitId;
  formData.quantity = row.quantity;
  formData.purchasePrice = row.purchasePrice;
  formData.supplyDate = row.supplyDate;
  formData.paymentStatus = row.paymentStatus || '';
  formData.amountPaid = row.amountPaid || 0;
  formData.truckNumber = row.truckNumber || '';
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
      if (!formData.supplierId || !formData.fruitId || formData.quantity <= 0 || formData.purchasePrice <= 0) {
        message.error('Please fill in all required fields with valid values');
        console.log('Manual validation failed:', {
          supplierId: formData.supplierId,
          fruitId: formData.fruitId,
          quantity: formData.quantity,
          purchasePrice: formData.purchasePrice
        });
        return;
      }

      const submitData = {
        ...formData,
        supplierId: formData.supplierId,
        fruitId: formData.fruitId,
        supplyDate: formData.supplyDate || new Date().toISOString(),
      };

      console.log('Submit data:', submitData);

      if (isEditing.value && currentSupplyId.value !== null) {
        // Update existing supply
        updateSupply(currentSupplyId.value, {
          id: currentSupplyId.value,
          quantity: formData.quantity,
          purchasePrice: formData.purchasePrice,
          supplyDate: formData.supplyDate || new Date().toISOString(),
          truckNumber: formData.truckNumber,
          notes: formData.notes,
        })
          .then(() => {
            message.success('Supply updated successfully');
            showDrawer.value = false;
            loadSupplies();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to update supply');
          });
      } else {
        // Add new supply
        addSupply(submitData as any)
          .then(() => {
            message.success('Supply added successfully');
            showDrawer.value = false;
            loadSupplies();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to add supply');
          });
      }
    }
  });
};

// Handle supply deletion
const handleDelete = (id: number) => {
  deleteSupply(id)
    .then(() => {
      message.success('Supply deleted successfully');
      loadSupplies();
    })
    .catch((error) => {
      message.error(error.message || 'Failed to delete supply');
    });
};

// Load supplies with filters
const loadSupplies = async () => {
  const count = await fetchSupplies(currentPage.value, pageSize.value, selectedFruitId.value || undefined, selectedSupplierId.value || undefined);
  totalCount.value = count || 0;
};

// Handle filter changes
const handleFruitFilterChange = (value: number | null) => {
  selectedFruitId.value = value;
  loadSupplies();
};

const handleSupplierFilterChange = (value: number | null) => {
  selectedSupplierId.value = value;
  loadSupplies();
};

// Table columns
const columns = supplyColumns(openEditDrawer, handleDelete);
const computedTotalCount = computed(() => totalCount.value);

// Load supplies on mount
loadSupplies();
getCustomersList();
fetchFruits();

</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Supplies</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Supply
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-4">
      <div class="flex gap-4 items-end">
        <n-form-item label="Filter by Fruit">
          <n-select v-model:value="selectedFruitId" placeholder="Select fruit" :options="fruits" clearable
            @update:value="handleFruitFilterChange" style="width: 200px" />
        </n-form-item>
        <n-form-item label="Filter by Supplier">
          <n-select v-model:value="selectedSupplierId" placeholder="Select supplier" :options="entityList" filterable
            clearable @update:value="handleSupplierFilterChange" style="width: 200px" />
        </n-form-item>
        <!-- <n-button @click="loadSupplies" :loading="loading">
          Refresh
        </n-button> -->
      </div>
    </n-card>

    <!-- Supplies Table -->
    <n-card>
      <ResponsiveDataTable
        :columns="columns"
        :data="supplies"
        :loading="loading"
        :page="currentPage"
        :page-size="pageSize"
        :total-count="computedTotalCount"
        :page-sizes="[10, 20, 50]"
        title-key="supplyNumber"
        subtitle-key="supplierName"
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- Supply Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" :height="isMobile ? '90%' : '100%'" :placement="isMobile ? 'bottom' : 'right'" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" :key="formKey" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Supply Number">
              <n-input v-model:value="formData.supplyNumber" placeholder="SUP-0001" disabled />
            </n-form-item>
            <n-form-item label="Fruit" path="fruitId">
              <n-select v-model:value="formData.fruitId" placeholder="Select fruit" :options="fruits" filterable
                clearable :disabled="isEditing" />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Supplier" path="supplierId">
              <n-select v-model:value="formData.supplierId" placeholder="Select supplier" :options="entityList"
                filterable clearable :disabled="isEditing" />
            </n-form-item>
            <n-form-item label="Truck Number" path="truckNumber" required>
              <n-input v-model:value="formData.truckNumber" placeholder="Truck number" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Quantity" path="quantity">
              <n-input-number v-model:value="formData.quantity" placeholder="Quantity" :min="1" :precision="2" />
            </n-form-item>
            <n-form-item label="Purchase Price" path="purchasePrice">
              <n-input-number v-model:value="formData.purchasePrice" placeholder="Purchase price" :min="1"
                :precision="2" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Total Price">
              <n-input-number :value="totalPrice" placeholder="Total price" :precision="2" disabled />
            </n-form-item>
            <n-form-item label="Supply Date" path="supplyDate">
            <n-date-picker :value="formData.supplyDate ? Date.parse(formData.supplyDate) : null" type="datetime"
              placeholder="Select date and time" :update-value-on-close="true" clearable
              @update:value="val => formData.supplyDate = val ? new Date(val).toISOString() : ''" />
          </n-form-item>
          </div>
        <div class="grid grid-cols-2 gap-4">
            <n-form-item v-if="isEditing" label="Payment Status" path="paymentStatus">
              <n-input v-model:value="formData.paymentStatus" placeholder="Payment Status" disabled />
            </n-form-item>
            <n-form-item v-if="isEditing" label="Amount Paid" path="amountPaid">
              <n-input-number v-model:value="formData.amountPaid" placeholder="Amount Paid"  disabled/>
            </n-form-item>
          </div>

          <n-form-item label="Notes" path="notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes" :rows="2" />
          </n-form-item>

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