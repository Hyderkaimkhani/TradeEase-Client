<script setup lang="ts">
import { ref, reactive } from 'vue';
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
  useMessage,
} from 'naive-ui';
import { useSupplies } from '../composables/useSupplies';
import { FormInst } from 'naive-ui';
import { supplyColumns } from '../Constants/GridColumns';
import type { RuleType } from 'async-validator';
import { EntityType } from '../Constants/Enums';
import { useCustomers } from '../composables/useCustomers';

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

const
  { entityList,
    getCustomerSuppliersList
  } = useCustomers();

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Supply');
const isEditing = ref(false);
const currentSupplyId = ref<number | null>(null);

// Filter state
const selectedFruitId = ref<number | null>(null);
const selectedSupplierId = ref<number | null>(null);

const formRef = ref<FormInst | null>(null)

// Form model
const formData = reactive({
  supplierId: null,
  supplyNumber:'',
  fruitId: 0,
  quantity: 0,
  purchasePrice: 0,
  supplyDate: '',
  truckNumber: '',
  notes: '',
});


const fruitOptions = ref([
  { label: 'Apple', value: 1 },
  { label: 'Banana', value: 2 },
  { label: 'Orange', value: 3 },
  { label: 'Mango', value: 4 },
]);

// Reset form
const resetForm = () => {
  formData.supplierId = null;
  formData.supplyNumber = '';
  formData.fruitId = 0;
  formData.quantity = 0;
  formData.purchasePrice = 0;
  formData.supplyDate = '';
  formData.truckNumber = '';
  formData.notes = '';
  isEditing.value = false;
  currentSupplyId.value = null;
};

const rules = {
  supplierId: [
    {
      required: true,
      message: 'Supplier is required',
      trigger: ['input', 'blur']
    }
  ],
  fruitId: [
    {
      required: true,
      message: 'Fruit is required',
      trigger: ['input', 'blur']
    }
  ],
  quantity: [
    {
      required: true,
      message: 'Quantity is required',
      trigger: ['input', 'blur']
    },
    {
      type: 'number' as RuleType,
      min: 1,
      message: 'Quantity must be at least 1',
      trigger: ['input', 'blur']
    }
  ],
  purchasePrice: [
    {
      required: true,
      message: 'Purchase price is required',
      trigger: ['input', 'blur']
    },
    {
      type: 'number' as RuleType,
      min: 1,
      message: 'Purchase price must be at least 1',
      trigger: ['input', 'blur']
    }
  ],
  truckNumber: [
    {
      required: true,
      message: 'Truck number is required',
      trigger: ['input', 'blur']
    }
  ]
};

// Open drawer for adding
const openAddDrawer = () => {
  resetForm();
  formTitle.value = 'Add Supply';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  resetForm();
  formTitle.value = 'Edit Supply';
  isEditing.value = true;
  currentSupplyId.value = row.id;

  // Fill form with supply data
  formData.supplierId = row.supplierId;
  formData.fruitId = row.fruitId;
  formData.quantity = row.quantity;
  formData.purchasePrice = row.purchasePrice;
  formData.supplyDate = row.supplyDate;
  formData.truckNumber = row.truckNumber || '';
  formData.notes = row.notes || '';
  showDrawer.value = true;
};

// Handle form submission
const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const submitData = {
        ...formData,
        supplyDate: formData.supplyDate || new Date().toISOString(),
      };

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
const loadSupplies = () => {
  fetchSupplies(1, 10, selectedFruitId.value || undefined, selectedSupplierId.value || undefined);
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

// Load supplies on mount
loadSupplies();
getCustomerSuppliersList(EntityType.Supplier);

</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Supplies</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Supply
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-4">
      <div class="flex gap-4 items-end">
        <n-form-item label="Filter by Fruit">
          <n-select v-model:value="selectedFruitId" placeholder="Select fruit" :options="fruitOptions" clearable
            @update:value="handleFruitFilterChange" style="width: 200px" />
        </n-form-item>
        <n-form-item label="Filter by Supplier">
          <n-select v-model:value="selectedSupplierId" placeholder="Select supplier" :options="entityList" filterable
            clearable @update:value="handleSupplierFilterChange" style="width: 200px" />
        </n-form-item>
        <n-button @click="loadSupplies" :loading="loading">
          Refresh
        </n-button>
      </div>
    </n-card>

    <!-- Supplies Table -->
    <n-card>
      <n-data-table :columns="columns" :data="supplies" :loading="loading" :pagination="{ pageSize: 10 }" striped />
    </n-card>

    <!-- Supply Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <n-form-item label="Supplier Number">
            <n-input v-model:value="formData.supplyNumber" placeholder="SUP-0001" disabled style="width: 200px" />
          </n-form-item>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Supplier" path="supplierId" required>
              <n-select v-model:value="formData.supplierId" placeholder="Select supplier" :options="entityList"
                :disabled="isEditing" />
            </n-form-item>
            <n-form-item label="Fruit" path="fruitId" required>
              <n-select v-model:value="formData.fruitId" placeholder="Select fruit" :options="fruitOptions"
                :disabled="isEditing" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Quantity (kg)" path="quantity" required>
              <n-input-number v-model:value="formData.quantity" placeholder="Quantity" :min="1" :precision="2" />
            </n-form-item>
            <n-form-item label="Purchase Price" path="purchasePrice" required>
              <n-input-number v-model:value="formData.purchasePrice" placeholder="Purchase price" :min="1"
                :precision="2" />
            </n-form-item>
          </div>

          <n-form-item label="Supply Date" path="supplyDate">
            <n-date-picker :value="formData.supplyDate ? Date.parse(formData.supplyDate) : null" type="datetime"
              placeholder="Select date and time" clearable
              @update:value="val => formData.supplyDate = val ? new Date(val).toISOString() : ''" />
          </n-form-item>

          <n-form-item label="Truck Number" path="truckNumber" required>
            <n-input v-model:value="formData.truckNumber" placeholder="Truck number" />
          </n-form-item>

          <n-form-item label="Notes" path="notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes" :rows="3" />
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