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
  NSelect,
  NTag,
  useMessage,
  NPopconfirm,
  NIcon,
  NInputNumber
} from 'naive-ui';
import { TrashOutline as DeleteIcon, PencilOutline as EditIcon } from '@vicons/ionicons5';
import { useTrucks } from '../composables/useTrucks';

// Message API
const message = useMessage();

// Get trucks data and methods
const {
  trucks,
  loading,
  fetchTrucks,
  addTruck,
  updateTruck,
  deleteTruck
} = useTrucks();

// Drawer state
const showDrawer = ref(false);
const formTitle = ref('Add Truck');
const isEditing = ref(false);
const currentTruckId = ref<number | null>(null);

// Form model
const formData = reactive({
  truckNumber: '',
  type: '',
  make: '',
  model: '',
  year: 2023,
  capacity: 0,
  fuelType: '',
  mileage: 0,
  availability: 'available',
  lastMaintenance: ''
});

// Truck types options
const truckTypes = [
  { label: 'Box Truck', value: 'box' },
  { label: 'Semi-Trailer', value: 'semi' },
  { label: 'Flatbed', value: 'flatbed' },
  { label: 'Refrigerated', value: 'refrigerated' },
  { label: 'Tanker', value: 'tanker' },
  { label: 'Dump Truck', value: 'dump' }
];

// Fuel types options
const fuelTypes = [
  { label: 'Diesel', value: 'diesel' },
  { label: 'Gasoline', value: 'gasoline' },
  { label: 'Electric', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'CNG', value: 'cng' }
];

// Availability options
const availabilityOptions = [
  { label: 'Available', value: 'available' },
  { label: 'In Use', value: 'in-use' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Service', value: 'out-of-service' }
];

// Reset form
const resetForm = () => {
  formData.truckNumber = '';
  formData.type = '';
  formData.make = '';
  formData.model = '';
  formData.year = 2023;
  formData.capacity = 0;
  formData.fuelType = '';
  formData.mileage = 0;
  formData.availability = 'available';
  formData.lastMaintenance = '';
  isEditing.value = false;
  currentTruckId.value = null;
};

// Open drawer for adding
const openAddDrawer = () => {
  resetForm();
  formTitle.value = 'Add Truck';
  showDrawer.value = true;
};

// Open drawer for editing
const openEditDrawer = (row: any) => {
  resetForm();
  formTitle.value = 'Edit Truck';
  isEditing.value = true;
  currentTruckId.value = row.id;
  
  // Fill form with truck data
  Object.assign(formData, row);
  showDrawer.value = true;
};

// Handle form submission
const handleSubmit = () => {
  if (isEditing.value && currentTruckId.value !== null) {
    // Update existing truck
    updateTruck(currentTruckId.value, formData)
      .then(() => {
        message.success('Truck updated successfully');
        showDrawer.value = false;
      })
      .catch((error) => {
        message.error(error.message || 'Failed to update truck');
      });
  } else {
    // Add new truck
    addTruck(formData)
      .then(() => {
        message.success('Truck added successfully');
        showDrawer.value = false;
      })
      .catch((error) => {
        message.error(error.message || 'Failed to add truck');
      });
  }
};

// Handle truck deletion
const handleDelete = (id: number) => {
  deleteTruck(id)
    .then(() => {
      message.success('Truck deleted successfully');
    })
    .catch((error) => {
      message.error(error.message || 'Failed to delete truck');
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
    title: 'Truck Number',
    key: 'truckNumber',
    width: 130
  },
  {
    title: 'Type',
    key: 'type',
    width: 130,
    render(row: any) {
      const type = truckTypes.find(t => t.value === row.type);
      return type ? type.label : row.type;
    }
  },
  {
    title: 'Make & Model',
    key: 'makeModel',
    render(row: any) {
      return `${row.make} ${row.model} (${row.year})`;
    }
  },
  {
    title: 'Capacity',
    key: 'capacity',
    width: 100,
    render(row: any) {
      return `${row.capacity} tons`;
    }
  },
  {
    title: 'Availability',
    key: 'availability',
    width: 130,
    render(row: any) {
      const statusColors: any = {
        'available': 'success',
        'in-use': 'info',
        'maintenance': 'warning',
        'out-of-service': 'error'
      };
      
      return h(
        NTag,
        {
          type: statusColors[row.availability] || 'default',
          size: 'small'
        },
        {
          default: () => {
            const option = availabilityOptions.find(o => o.value === row.availability);
            return option ? option.label : row.availability;
          }
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
                default: () => 'Are you sure you want to delete this truck?'
              }
            )
          ]
        }
      );
    }
  }
];

// Load trucks on mount
fetchTrucks();
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Trucks</h1>
      <n-button type="primary" @click="openAddDrawer">
        Add Truck
      </n-button>
    </div>

    <!-- Trucks Table -->
    <n-card>
      <n-data-table
        :columns="columns"
        :data="trucks"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        striped
      />
    </n-card>

    <!-- Truck Drawer -->
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
          <n-form-item label="Truck Number" path="truckNumber" required>
            <n-input v-model:value="formData.truckNumber" placeholder="e.g., TRK-1234" />
          </n-form-item>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Type" path="type">
              <n-select
                v-model:value="formData.type"
                :options="truckTypes"
                placeholder="Select truck type"
              />
            </n-form-item>

            <n-form-item label="Availability" path="availability">
              <n-select
                v-model:value="formData.availability"
                :options="availabilityOptions"
                placeholder="Select availability"
              />
            </n-form-item>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <n-form-item label="Make" path="make">
              <n-input v-model:value="formData.make" placeholder="e.g., Freightliner" />
            </n-form-item>

            <n-form-item label="Model" path="model">
              <n-input v-model:value="formData.model" placeholder="e.g., Cascadia" />
            </n-form-item>

            <n-form-item label="Year" path="year">
              <n-input-number
                v-model:value="formData.year"
                :min="1990"
                :max="2030"
                style="width: 100%"
              />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Capacity (tons)" path="capacity">
              <n-input-number
                v-model:value="formData.capacity"
                :min="0"
                :precision="1"
                style="width: 100%"
              />
            </n-form-item>

            <n-form-item label="Fuel Type" path="fuelType">
              <n-select
                v-model:value="formData.fuelType"
                :options="fuelTypes"
                placeholder="Select fuel type"
              />
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="Mileage" path="mileage">
              <n-input-number
                v-model:value="formData.mileage"
                :min="0"
                style="width: 100%"
              />
            </n-form-item>

            <n-form-item label="Last Maintenance" path="lastMaintenance">
              <n-input
                v-model:value="formData.lastMaintenance"
                placeholder="YYYY-MM-DD"
              />
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