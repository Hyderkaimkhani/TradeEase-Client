<script setup lang="ts">
import DemoGrid from '../components/Grid.vue'
import { ref } from 'vue'

const searchQuery = ref('')
const gridColumns = ['name', 'power']
const gridData = [
  { id: 1, name: 'Chuck Norris', power: Infinity },
  { id: 2, name: 'Bruce Lee', power: 9000 },
  { id: 3, name: 'Jackie Chan', power: 7000 },
  { id: 4, name: 'Jet Li', power: 8000 },
  { id: 5, name: 'Donnie Yen', power: 8500 },
  { id: 6, name: 'Tony Jaa', power: 7500 },
  { id: 7, name: 'Iko Uwais', power: 6500 },
  { id: 8, name: 'Scott Adkins', power: 6000 },
  { id: 9, name: 'Michael Jai White', power: 5500 },
  { id: 10, name: 'Jean-Claude Van Damme', power: 5000 },
   {
            "id": 1,
            "name": "taimoor",
            "phone": "0300212319",
            "city": "tando",
            "address": "pak colony",
            "entityType": "Customer",
            "paymentTerms": "cash",
            "creditBalance": 100000.00,
            "isActive": true
        },
]

// Action handlers
const handleView = (entry: any) => {
  console.log('View entry:', entry)
  alert(`Viewing: ${entry.id} (Power: ${entry.power})`)
}

const handleEdit = (entry: any) => {
  console.log('Edit entry:', entry)
  alert(`Editing: ${entry.id} (Power: ${entry.power})`)
}

const handleDelete = (entry: any) => {
  console.log('Delete entry:', entry)
  if (confirm(`Are you sure you want to delete ${entry.id} | ${entry.name}?`)) {
    alert(`Deleted: ${entry.name}`)
    // Here you would typically make an API call to delete the entry
  }
}
</script>

<template>
  <div class="p-4">
    <!-- <h1 class="text-2xl font-bold text-gray-800 mb-6">Sample Grid with Actions</h1> -->
    
    <form class="mb-4">
      <label class="text-sm font-medium text-gray-700">
        Search:
        <input 
          v-model="searchQuery" 
          class="border border-gray-300 rounded-md px-3 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Search by name or power..."
        />
      </label>
    </form>

    <DemoGrid
      :data="gridData"
      :columns="gridColumns"
      :filter-key="searchQuery"
      :show-actions="true"
      :actions="['view', 'edit', 'delete']"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>
