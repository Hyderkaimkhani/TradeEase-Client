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
  useMessage,
} from 'naive-ui';
import { useOrders } from '../composables/useOrders';
import { FormInst } from 'naive-ui';
import { orderColumns } from '../Constants/GridColumns';
import type { RuleType } from 'async-validator';
import { EntityType, OrderStatus, PaymentStatus } from '../Constants/Enums';
import { useCustomers } from '../composables/useCustomers';
import { useCommon } from '../composables/useCommon';

// Message API
const message = useMessage();

// Get orders data and methods
const {
  orders,
  loading,
  fetchOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} = useOrders();

const
  { entityList,
    getCustomerSuppliersList
  } = useCustomers();

const
  { fruits,
    fetchFruits
  } = useCommon();

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Order');
const isEditing = ref(false);
const currentOrderId = ref<number | null>(null);

// Filter state
const selectedFruitId = ref<number | null>(null);
const selectedCustomerId = ref<number | null>(null);

const formRef = ref<FormInst | null>(null)
const formKey = ref(0)

// Optional: Reset form
const resetForm = () => {
  Object.assign(formData, {
    customerId: null,
    fruitId: null
  })
  formKey.value++ // force re-render
}

// Form model
const formData = reactive({
  orderNumber: '',
  customerId: null as number | null,
  fruitId: null as number | null,
  truckNumber: '',
  quantity: 0 as number | 0,
  sellingPrice: 0,
  purchasePrice: 0,
  totalPusrchasePrice: 0,
  ProfitLoss: 0,
  amountReceived: 0,
  orderDate: '',
  deliveryDate: '',
  status: OrderStatus.Pending,
  paymentStatus: PaymentStatus.Unpaid,
  notes: '',
});

const totalSellingPrice = computed(() => {
  const qty = formData.quantity ?? 0
  const price = formData.sellingPrice || 0
  return +(qty * price).toFixed(2) // Ensures precision
})

const fruitOptions = fruits;

// Status options
const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Canceled', value: 'Canceled' }
];

// Reset form
const resetFormData = () => {
  formData.orderNumber = '';
  formData.customerId = null;
  formData.fruitId = null;
  formData.truckNumber = '';
  formData.quantity = 0;
  formData.sellingPrice = 0;
  formData.purchasePrice = 0;
  formData.totalPusrchasePrice = 0;
  formData.ProfitLoss = 0;
  formData.orderDate = '';
  formData.deliveryDate = '';
  formData.status = OrderStatus.Pending;
  formData.paymentStatus = PaymentStatus.Unpaid;
  formData.amountReceived = 0;
  formData.notes = '';
  isEditing.value = false;
  currentOrderId.value = null;
};

const rules = {
  customerId: [
    {
      required: true,
      message: 'Customer is required',
      trigger: ['change'],
      validator: (_rule: any, value: any) => {
        if (value == null || value === '') return new Error('Customer is required.')
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
  sellingPrice: [
    {
      required: true,
      trigger: ['input', 'blur', 'change'],
      validator: (_rule: any, value: any) => {
        if (value === null || value === undefined || value === '') {
          return new Error('Selling Price is required')
        }
        if (typeof value !== 'number' || value < 1) {
          return new Error('Selling Price must be at least 1')
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
  formTitle.value = 'Add Order';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  console.log('Opening edit drawer with row data:', row);

  resetForm();
  formTitle.value = 'Edit Order';
  isEditing.value = true;
  currentOrderId.value = row.id;

  // Fill form with order data
  
  formData.orderNumber = row.orderNumber || '';
  formData.customerId = row.customerId;
  formData.fruitId = row.fruitId;
  formData.truckNumber = row.truckNumber || '';
  formData.quantity = row.quantity;
  formData.sellingPrice = row.sellingPrice;
  formData.purchasePrice = row.purchasePrice || 0;
  formData.totalPusrchasePrice = row.totalPurchasePrice || 0;
  formData.ProfitLoss = row.profitLoss || 0;
  formData.amountReceived = row.amountReceived || 0;
  formData.orderDate = row.orderDate;
  formData.deliveryDate = row.deliveryDate || '';
  formData.status = row.status || 'Pending';
  formData.paymentStatus = row.paymentStatus || PaymentStatus.Unpaid;
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
      if (!formData.customerId || !formData.fruitId || formData.quantity <= 0 || formData.sellingPrice <= 0) {
        message.error('Please fill in all required fields with valid values');
        console.log('Manual validation failed:', {
          customerId: formData.customerId,
          fruitId: formData.fruitId,
          quantity: formData.quantity,
          sellingPrice: formData.sellingPrice
        });
        return;
      }

      const submitData = {
        ...formData,
        customerId: formData.customerId!,
        fruitId: formData.fruitId!,
        quantity: formData.quantity!,
        sellingPrice: formData.sellingPrice,
        orderDate: formData.orderDate || new Date().toISOString(),
        deliveryDate: formData.deliveryDate || undefined,
        status: formData.status,
        notes: formData.notes,
      };

      console.log('Submit data:', submitData);

      if (isEditing.value && currentOrderId.value !== null) {
        // Update existing order
        updateOrder(currentOrderId.value, {
          id: currentOrderId.value,
          fruitId: formData.fruitId!,
          truckNumber: formData.truckNumber,
          quantity: formData.quantity!,
          sellingPrice: formData.sellingPrice,
          deliveryDate: formData.deliveryDate || undefined,
          status: formData.status,
          notes: formData.notes,
        })
          .then(() => {
            message.success('Order updated successfully');
            showDrawer.value = false;
            loadOrders();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to update order');
          });
      } else {
        // Add new order
        addOrder(submitData as any)
          .then(() => {
            message.success('Order added successfully');
            showDrawer.value = false;
            loadOrders();
          })
          .catch((error) => {
            message.error(error.message || 'Failed to add order');
          });
      }
    }
  });
};

// Handle order deletion
const handleDelete = (id: number) => {
  deleteOrder(id)
    .then(() => {
      message.success('Order deleted successfully');
      loadOrders();
    })
    .catch((error) => {
      message.error(error.message || 'Failed to delete order');
    });
};

// Load orders with filters
const loadOrders = () => {
  fetchOrders(1, 10, selectedFruitId.value || undefined, selectedCustomerId.value || undefined);
};

// Handle filter changes
const handleFruitFilterChange = (value: number | null) => {
  selectedFruitId.value = value;
  loadOrders();
};

const handleCustomerFilterChange = (value: number | null) => {
  selectedCustomerId.value = value;
  loadOrders();
};

// Table columns
const columns = orderColumns(openEditDrawer, handleDelete);

// Load orders on mount
loadOrders();
getCustomerSuppliersList(EntityType.Customer);
fetchFruits();

</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Orders</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Order
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-4">
      <div class="flex gap-4 items-end">
        <n-form-item label="Filter by Fruit">
          <n-select v-model:value="selectedFruitId" placeholder="Select fruit" :options="fruits" clearable
            @update:value="handleFruitFilterChange" style="width: 200px" />
        </n-form-item>
        <n-form-item label="Filter by Customer">
          <n-select v-model:value="selectedCustomerId" placeholder="Select customer" :options="entityList" filterable
            clearable @update:value="handleCustomerFilterChange" style="width: 200px" />
        </n-form-item>
        <n-button @click="loadOrders" :loading="loading">
          Refresh
        </n-button>
      </div>
    </n-card>

    <!-- Orders Table -->
    <n-card>
      <n-data-table :columns="columns" :data="orders" :loading="loading" :pagination="{ pageSize: 10 }" striped />
    </n-card>

    <!-- Order Drawer -->
    <n-drawer v-model:show="showDrawer" :width="502" placement="right" :trap-focus="false">
      <n-drawer-content :title="formTitle" closable>
        <n-form ref="formRef" :model="formData" :rules="rules" :key="formKey" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Order Number">
              <n-input v-model:value="formData.orderNumber" placeholder="ORD-0001" disabled />
            </n-form-item>
            <n-form-item label="Fruit" path="fruitId" >
              <n-select v-model:value="formData.fruitId" placeholder="Select fruit" :options="fruits" filterable
                clearable :disabled="isEditing" />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Customer" path="customerId">
              <n-select v-model:value="formData.customerId" placeholder="Select customer" :options="entityList"
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
            <n-form-item label="Selling Price" path="sellingPrice">
              <n-input-number v-model:value="formData.sellingPrice" placeholder="Selling price" :min="1"
                :precision="2" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Total Selling Price" path="totalSellingPrice">
              <n-input-number :value="totalSellingPrice" placeholder="Total selling price" :precision="2" disabled />
            </n-form-item>
            <n-form-item v-if="isEditing" label="Profit/Loss" path="profitLoss" hidden="true">
              <n-input-number v-model:value="formData.ProfitLoss" placeholder="Profit/Loss" :precision="2" disabled />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item v-if="isEditing" label="Amount Received" path="amountReceived">
              <n-input-number v-model:value="formData.amountReceived" placeholder="Amount Received" :precision="2"
                disabled />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item v-if="isEditing" label="Purchase Price" path="purchasePrice">
              <n-input-number v-model:value="formData.purchasePrice" placeholder="Purchase price" :precision="2" disabled />
            </n-form-item>
            <n-form-item v-if="isEditing" label="Total Purchase Price" path="totalPusrchasePrice">
              <n-input-number v-model:value="formData.totalPusrchasePrice" placeholder="Total Purchase Price" :precision="2" disabled />
            </n-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Order Date" path="orderDate">
              <n-date-picker :value="formData.orderDate ? Date.parse(formData.orderDate) : null" type="datetime"
                placeholder="Select order date and time" :update-value-on-close="true" clearable
                @update:value="val => formData.orderDate = val ? new Date(val).toISOString() : ''" />
            </n-form-item>
            <n-form-item label="Delivery Date" path="deliveryDate">
              <n-date-picker :value="formData.deliveryDate ? Date.parse(formData.deliveryDate) : null" type="datetime"
                placeholder="Select delivery date and time" :update-value-on-close="true" clearable
                @update:value="val => formData.deliveryDate = val ? new Date(val).toISOString() : ''" />
            </n-form-item>
          </div>

<div class="grid grid-cols-2 gap-4">
          <n-form-item label="Status" path="status">
            <n-select v-model:value="formData.status" placeholder="Select status" :options="statusOptions" />
          </n-form-item>
          <n-form-item label="Payment Status" path="paymentStatus">
              <n-input v-model:value="formData.paymentStatus" placeholder="Payment Status" :precision="2" disabled />
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