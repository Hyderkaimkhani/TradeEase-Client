<script setup lang="ts">
import { ref, reactive, computed} from 'vue';
import {
  NButton,
  NCard,
  NSpace,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NModal,
  useMessage,
} from 'naive-ui';
import { useBills } from '../composables/useBills';
import ResponsiveDataTable from '../components/ResponsiveDataTable.vue';
import { useCustomers } from '../composables/useCustomers';
import { Bill } from '../Interfaces/bill.interface';
import { billColumns } from '../Constants/GridColumns';
import { useBreakpoint } from '../composables/useBreakpoint';
const { isMobile } = useBreakpoint();
// Message API
const message = useMessage();

// Get bills data and methods
const {
  bills,
  loading,
  totalCount,
  fetchBills,
  createBill,
  getBillById,
  deleteBill,
} = useBills();

const { entityList, getCustomersList } = useCustomers();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

// Filter state
const selectedEntityId = ref<number | null>(null);
const selectedEntityType = ref<string | null>(null);
const referenceNumber = ref('');
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);

// Drawer state
const showDrawer = ref(false);
const showBillModal = ref(false);
const currentBill = ref<Bill | null>(null);
const formTitle = ref('Create Bill');

// Form model
const formData = reactive({
  entityType: '',
  entityId: null as number | null,
  dueDate: '',
  notes: '',
});

// Computed total count
const computedTotalCount = computed(() => totalCount.value);

// Load bills with filters
const loadBills = async () => {
  await fetchBills(
    currentPage.value,
    pageSize.value,
    selectedEntityType.value || undefined,
    selectedEntityId.value || undefined,
    referenceNumber.value || undefined,
    fromDate.value || undefined,
    toDate.value || undefined
  );
};

// Handle filter changes
// const handleEntityTypeChange = (value: string | null) => {
//   selectedEntityType.value = value;
//   selectedEntityId.value = null;
//   formData.entityId = null;
//   currentPage.value = 1;
//   if (value) {
//     getCustomersList();
//   }
//   loadBills();
// };

const handleEntityFilterChange = (value: number | null) => {
  selectedEntityId.value = value;
  currentPage.value = 1;
  loadBills();
};

// Handle pagination changes
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadBills();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadBills();
};

// Create bill
const handleCreateBill = async () => {
  try {
    if (formData.entityId === null) {
      message.error('Please select an entity.');
      return;
    }
    await createBill({
      entityType: formData.entityType,
      entityId: formData.entityId as number,
      dueDate: formData.dueDate,
      notes: formData.notes,
    });
    message.success('Bill created successfully');
    showDrawer.value = false;
    await loadBills();
  } catch (error: any) {
    message.error(error.message || 'Failed to create bill');
  }
};

// View bill details
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const viewBill = async (billId: number) => {
//   try {
//     const bill = await getBillById(billId);
//     //currentBill.value = bill;
//     showBillModal.value = true;
//   } catch (error: any) {
//     message.error(error.message || 'Failed to fetch bill details');
//   }
// };

// Delete bill
const handleDeleteBill = async (billId: number) => {
  try {
    await deleteBill(billId);
    message.success('Bill deleted successfully');
    await loadBills();
  } catch (error: any) {
    message.error(error.message || 'Failed to delete bill');
  }
};

const isViewing = ref(false);
const isEditing = ref(false);
const currentBillId = ref<number | null>(null);

function resetFormData() {
  formData.entityType = '';
  formData.entityId = null;
  formData.dueDate = '';
  formData.notes = '';
}

const openAddDrawer = () => {
  resetFormData();
  formTitle.value = 'Create Bill';
  isViewing.value = false;
  isEditing.value = false;
  currentBillId.value = null;
  showDrawer.value = true;
};

const openViewDrawer = async (row: any) => {
  debugger;
  if (!row || typeof row.id !== 'number') {
    message.error('Invalid bill selected.');
    return;
  }
  try {
    const bill = await getBillById(row.id);
    if (!bill) {
      message.error('Bill not found.');
      return;
    }
    // currentBill.value = bill;
    formTitle.value = 'View Bill';
    isViewing.value = true;
    isEditing.value = false;
    currentBillId.value = row.id;
    // Fill formData for view
    // formData.entityType = currentBill.value.entityType;
    // formData.entityId = currentBill.value.entityId;
    // formData.dueDate = currentBill.value.dueDate;
    // formData.notes = currentBill.value.notes;
    showDrawer.value = true;
  } catch (error: any) {
    message.error(error.message || 'Failed to fetch bill details');
  }
};

const openEditDrawer = async (row: any) => {
  if (!row || typeof row.id !== 'number') {
    message.error('Invalid bill selected.');
    return;
  }
  try {
    const bill = await getBillById(row.id);
    if (!bill ) {
      message.error('Bill not found.');
      return;
    }
    // currentBill.value = bill;
    formTitle.value = 'Edit Bill';
    isViewing.value = false;
    isEditing.value = true;
    currentBillId.value = row.id;
    // Fill formData for edit
    // formData.entityType = currentBill.value.entityType;
    // formData.entityId = currentBill.value.entityId;
    // formData.dueDate = currentBill.value.dueDate;
    // formData.notes = currentBill.value.notes;
    showDrawer.value = true;
  } catch (error: any) {
    message.error(error.message || 'Failed to fetch bill details');
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const handleUpdateBill = async () => {
//   try {
//     if (!currentBillId.value) return;
//     await updateBill({
//       Id: currentBillId.value,
//       dueDate: formData.dueDate,
//       notes: formData.notes,
//     });
//     message.success('Bill updated successfully');
//     showDrawer.value = false;
//     await loadBills();
//   } catch (error: any) {
//     message.error(error.message || 'Failed to update bill');
//   }
// };

// Table columns
const columns = billColumns(openViewDrawer, handleDeleteBill, openEditDrawer);

// Load bills on mount
loadBills();
getCustomersList();
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Bills</h1>
      <n-button type="primary" @click="openAddDrawer">
        Create Bill
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-4">
      <div class="flex gap-4 items-center">
        <n-form-item label="Filter by Entity">
          <n-select v-model:value="selectedEntityId" placeholder="Select entity" :options="entityList" filterable
            clearable @update:value="handleEntityFilterChange" style="width: 200px" />
        </n-form-item>
        <n-button @click="loadBills" :loading="loading">
          Refresh
        </n-button>
      </div>
    </n-card>

    <!-- Bills Table -->
    <n-card>
      <ResponsiveDataTable
        :key="`bills-${currentPage}-${pageSize}-${totalCount}`"
        :columns="columns"
        :data="bills"
        :loading="loading"
        :page="currentPage"
        :page-size="pageSize"
        :total-count="computedTotalCount"
        :page-sizes="[10, 20, 50]"
        title-key="referenceNumber"
        subtitle-key="entityName"
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- Create Bill Drawer -->
    <n-drawer v-model:show="showDrawer" :width="600" :height="isMobile ? '90%' : '100%'" :placement="isMobile ? 'bottom' : 'right'">
      <n-drawer-content :title="formTitle" closable>
        <n-form :model="formData" label-placement="top">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Entity" required>
              <n-select v-model:value="formData.entityId" placeholder="Select entity" :options="entityList" filterable
                clearable />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Due Date" path="dueDate">
              <n-date-picker :value="formData.dueDate ? Date.parse(formData.dueDate) : null" type="datetime"
                placeholder="Select due date" :update-value-on-close="true" clearable
                @update:value="val => formData.dueDate = val ? new Date(val).toISOString() : ''" />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">

          </div>

          <n-form-item label="Notes">
            <n-input v-model:value="formData.notes" type="textarea" placeholder="Additional notes" :rows="3" />
          </n-form-item>

          <div class="flex justify-end mt-6">
            <n-space>
              <n-button @click="showDrawer = false">
                Cancel
              </n-button>
              <n-button type="primary" @click="handleCreateBill" :loading="loading">
                Create Bill
              </n-button>
            </n-space>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>

    <!-- Bill Details Modal -->
    <n-modal v-model:show="showBillModal" :mask-closable="false" preset="card" style="width: 800px">
      <div v-if="currentBill" class="space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold">{{ currentBill.billNumber }}</h2>
            <p class="text-gray-600">{{ currentBill.entityName }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Bill Date: {{ new Date(currentBill.billDate).toLocaleDateString() }}</p>
            <p class="text-sm text-gray-600">Due Date: {{ new Date(currentBill.dueDate).toLocaleDateString() }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-2">Bill To:</h3>
            <p>{{ currentBill.entityName }}</p>
            <!-- <p>{{ currentBill.entityAddress }}</p>
            <p>Phone: {{ currentBill.entityPhone }}</p>
            <p>Email: {{ currentBill.entityEmail }}</p>
            <p>GST: {{ currentBill.entityGST }}</p> -->
          </div>
          <div>
            <h3 class="font-semibold mb-2">From:</h3>
            <!-- <p>{{ currentBill.companyInfo.name }}</p>
            <p>{{ currentBill.companyInfo.address }}</p>
            <p>Phone: {{ currentBill.companyInfo.phone }}</p>
            <p>Email: {{ currentBill.companyInfo.email }}</p>
            <p>GST: {{ currentBill.companyInfo.gstNumber }}</p> -->
          </div>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Bill Items:</h3>
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left">Description</th>
                  <th class="px-4 py-2 text-right">Quantity</th>
                  <th class="px-4 py-2 text-right">Unit Price</th>
                  <th class="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentBill.billDetails" :key="item.id" class="border-t">
                  <td class="px-4 py-2">{{ item.description }}</td>
                  <td class="px-4 py-2 text-right">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="px-4 py-2 text-right">Rs. {{ item.unitPrice.toLocaleString() }}</td>
                  <td class="px-4 py-2 text-right">Rs. {{ item.lineTotal.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <div class="w-64 space-y-2">

            <div class="flex justify-between font-bold border-t pt-2">
              <span>Total:</span>
              <span>Rs. {{ currentBill.totalAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-green-600">
              <span>Paid:</span>
              <span>Rs. {{ currentBill.totalPaid.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-red-600 font-bold">
              <span>Balance:</span>
              <span>Rs. {{ currentBill.balance.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <!-- handleGeneratePDF(currentBill.id) -->
          <n-button @click="" type="primary">
            Download PDF
          </n-button>
          <n-button @click="" type="success">
            Send Email
          </n-button>
          <n-button @click="showBillModal = false">
            Close
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template> 