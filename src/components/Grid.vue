<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <!-- Page Size Selection -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center space-x-2">
        <label for="pageSize" class="text-sm font-medium text-gray-700">Show:</label>
        <select 
          id="pageSize"
          v-model="pageSize" 
          @change="handlePageSizeChange"
          class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span class="text-sm text-gray-600">entries per page</span>
      </div>
      
      <!-- Results info -->
      <div class="text-sm text-gray-600">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-[#36B37E] bg-opacity-10">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column" 
              class="px-6 py-3 text-left text-xs font-bold text-[#36B37E] uppercase tracking-wider border-b border-[#36B37E] border-opacity-20"
            >
              {{ column }}
            </th>
            <th 
              v-if="showActions"
              class="px-6 py-3 text-left text-xs font-bold text-[#36B37E] uppercase tracking-wider border-b border-[#36B37E] border-opacity-20"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="entry in paginatedData" 
            :key="entry.id || entry.name" 
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td 
              v-for="column in columns" 
              :key="column" 
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100"
            >
              {{ entry[column] }}
            </td>
            <td 
              v-if="showActions"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100"
            >
              <div class="flex items-center space-x-2">
                <button
                  v-if="actions.includes('view')"
                  @click="$emit('view', entry)"
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  View
                </button>
                <button
                  v-if="actions.includes('edit')"
                  @click="$emit('edit', entry)"
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-150"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  v-if="actions.includes('delete')"
                  @click="$emit('delete', entry)"
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="showActions ? columns.length + 1 : columns.length" class="px-6 py-8 text-center text-sm text-gray-500">
              No matching data found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-700">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1" 
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Previous
        </button>
        
        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages" 
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  filterKey: {
    type: String,
    default: ''
  },
  showActions: {
    type: Boolean,
    default: false
  },
  actions: {
    type: Array,
    default: () => ['view', 'edit', 'delete']
  }
})

// Define emits for action handlers
const emit = defineEmits(['view', 'edit', 'delete'])

const currentPage = ref(1)
const pageSize = ref(10)

const filteredData = computed(() => {
  if (!props.filterKey) return props.data
  const key = props.filterKey.toLowerCase()
  return props.data.filter(row =>
    props.columns.some(col => String(row[col]).toLowerCase().includes(key))
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / pageSize.value)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredData.value.length))

// Generate visible page numbers for pagination
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage.value - halfVisible)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goToPage(page) {
  currentPage.value = page
}

function handlePageSizeChange() {
  currentPage.value = 1 // Reset to first page when page size changes
}

// Reset to first page on data/filter change
watch([filteredData, pageSize], () => {
  currentPage.value = 1
})
</script>
