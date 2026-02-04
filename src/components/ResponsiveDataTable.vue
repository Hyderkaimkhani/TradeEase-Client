<script setup lang="ts">
import { computed } from 'vue';
import { NDataTable, NPagination, NEmpty, NSpin } from 'naive-ui';
import type { DataTableColumn, DataTableBaseColumn } from 'naive-ui';
import { useBreakpoint } from '../composables/useBreakpoint';
import MobileCellRenderer from './MobileCellRenderer.vue';

// Define types for mobile display configuration
export interface MobileColumn {
  key: string;
  label: string;
  /** If true, this will be shown as the primary/title field */
  isPrimary?: boolean;
  /** If true, this will be shown as a badge/tag */
  isTag?: boolean;
  /** Custom render function for mobile display */
  render?: (row: any) => any;
}

export interface ResponsiveTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  striped?: boolean;
  bordered?: boolean;
  /** Mobile-specific column configuration. If not provided, will auto-generate from columns */
  mobileColumns?: MobileColumn[];
  /** Key field for row identification */
  rowKey?: string;
  /** Show pagination */
  showPagination?: boolean;
  /** Current page (v-model:page) */
  page?: number;
  /** Page size (v-model:pageSize) */
  pageSize?: number;
  /** Total count for server-side pagination. If not provided, uses data.length */
  totalCount?: number;
  /** Page size options */
  pageSizes?: number[];
  /** Enable row selection */
  rowSelection?: boolean;
  /** Title field key for mobile card header */
  titleKey?: string;
  /** Subtitle field key for mobile card */
  subtitleKey?: string;
}

const props = withDefaults(defineProps<ResponsiveTableProps>(), {
  loading: false,
  striped: true,
  bordered: false,
  rowKey: 'id',
  showPagination: true,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50],
  rowSelection: false,
});

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:pageSize', pageSize: number): void;
  (e: 'row-click', row: any): void;
}>();

// Use VueUse breakpoint composable
const { isMobile } = useBreakpoint();

// Computed total count
const computedTotalCount = computed(() => {
  return props.totalCount ?? props.data.length;
});

// Computed page count
const pageCount = computed(() => {
  return Math.ceil(computedTotalCount.value / props.pageSize);
});

// Helper to check if column has key property
const hasKey = (col: DataTableColumn): col is DataTableBaseColumn => {
  return 'key' in col && col.key !== undefined;
};

// Get display columns for mobile (exclude actions column for separate rendering)
const displayColumns = computed(() => {
  if (props.mobileColumns) {
    return props.mobileColumns;
  }

  // Auto-generate from table columns
  return props.columns
    .filter(col => hasKey(col) && col.key !== 'actions' && col.key !== 'action')
    .map(col => {
      const baseCol = col as DataTableBaseColumn;
      return {
        key: String(baseCol.key),
        label: (typeof baseCol.title === 'string' ? baseCol.title : '') || String(baseCol.key),
        isPrimary: false,
        isTag: false,
      };
    });
});

// Get actions column if exists
const actionsColumn = computed(() => {
  return props.columns.find(col => hasKey(col) && (col.key === 'actions' || col.key === 'action')) as DataTableBaseColumn | undefined;
});

// Render cell value for mobile
const renderCellValue = (row: any, column: MobileColumn) => {
  const key = column.key;

  // Check if column has custom render function
  if (column.render && typeof column.render === 'function') {
    return column.render(row);
  }

  // Check original columns for render function
  const originalColumn = props.columns.find(c => hasKey(c) && c.key === key) as DataTableBaseColumn | undefined;
  if (originalColumn && 'render' in originalColumn && typeof originalColumn.render === 'function') {
    return originalColumn.render(row, 0);
  }

  // Return raw value
  const value = row[key];
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
};

// Get primary field value for mobile card header
const getPrimaryValue = (row: any) => {
  if (props.titleKey) {
    return row[props.titleKey] || '-';
  }

  // Try to find a primary column
  const primaryCol = displayColumns.value.find(c => c.isPrimary);
  if (primaryCol) {
    return row[primaryCol.key] || '-';
  }

  // Fallback to first column or name/title field
  const nameField = ['name', 'title', 'orderNumber', 'supplyNumber', 'accountNumber'].find(f => row[f]);
  if (nameField) return row[nameField];

  return row[displayColumns.value[0]?.key] || '-';
};

// Get subtitle value
const getSubtitleValue = (row: any) => {
  if (props.subtitleKey) {
    return row[props.subtitleKey] || '';
  }
  return '';
};

// Get display fields for mobile (excluding primary and subtitle)
const getMobileFields = computed(() => {
  const excludeKeys = [props.titleKey, props.subtitleKey].filter(Boolean);
  return displayColumns.value.filter(col =>
    !col.isPrimary && !excludeKeys.includes(col.key)
  );
});

// Pagination handlers
const handlePageChange = (page: number) => {
  emit('update:page', page);
};

const handlePageSizeChange = (size: number) => {
  emit('update:pageSize', size);
};

// Row click handler
const handleRowClick = (row: any) => {
  emit('row-click', row);
};

// Showing entries text
const showingText = computed(() => {
  const start = (props.page - 1) * props.pageSize + 1;
  const end = Math.min(props.page * props.pageSize, computedTotalCount.value);
  return `Showing ${start} to ${end} of ${computedTotalCount.value} entries`;
});
</script>

<template>
  <div class="responsive-data-table">
    <!-- Desktop View: Standard Data Table -->
    <div v-if="!isMobile" class="desktop-view">
      <n-data-table :columns="columns" :data="data" :loading="loading" :striped="striped" :bordered="bordered"
        :row-key="(row: any) => row[rowKey]" :pagination="false" />
    </div>

    <!-- Mobile View: Card-based Layout -->
    <div v-else class="mobile-view">
      <n-spin :show="loading">
        <div v-if="data.length === 0" class="py-8">
          <n-empty description="No data available" />
        </div>

        <div v-else class="space-y-3">
          <div v-for="(row, index) in data" :key="row[rowKey] || index"
            class="mobile-card bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            @click="handleRowClick(row)">
            <!-- Card Header -->
            <div class="mobile-card-header bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 text-base">
                    {{ getPrimaryValue(row) }}
                  </div>
                  <div v-if="getSubtitleValue(row)" class="text-sm text-gray-500 mt-0.5">
                    {{ getSubtitleValue(row) }}
                  </div>
                </div>
                <!-- Row index/number badge -->
                <div class="ml-2 flex items-center gap-2">
                  <slot name="mobile-header-extra" :row="row" :index="index" />
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="mobile-card-body px-4 py-3">
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <template v-for="column in getMobileFields" :key="column.key">
                  <div class="mobile-field">
                    <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                      {{ column.label }}
                    </div>
                    <div class="text-sm text-gray-900 font-medium">
                      <MobileCellRenderer :row="row" :column="column" :render-cell-value="renderCellValue" />
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Card Footer with Actions -->
            <div v-if="actionsColumn?.render" class="mobile-card-footer bg-gray-50 px-4 py-2 border-t border-gray-200">
              <div class="flex justify-end">
                <MobileCellRenderer :row="row"
                  :column="{ key: 'actions', label: '', render: (r: any) => actionsColumn!.render!(r, index) }"
                  :render-cell-value="(r, c) => c.render ? c.render(r) : null" />
              </div>
            </div>
          </div>
        </div>
      </n-spin>
    </div>

    <!-- Pagination (shared for both views) -->
    <div v-if="showPagination && computedTotalCount > 0"
      class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
      <div class="text-sm text-gray-600">
        {{ showingText }}
      </div>
      <n-pagination :page="page" :page-size="pageSize" :page-count="pageCount" :page-sizes="pageSizes" show-size-picker
        :show-quick-jumper="!isMobile" @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
    </div>
  </div>
</template>

<style scoped>
.responsive-data-table {
  width: 100%;
}

.mobile-card {
  transition: box-shadow 0.2s ease;
}

.mobile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-card:active {
  background-color: #f9fafb;
}

.mobile-field {
  min-width: 0;
}

/* Ensure proper rendering of NTag and other components */
.mobile-card-body :deep(.n-tag) {
  font-size: 12px;
}

.mobile-card-footer :deep(.n-space) {
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-card-footer :deep(.n-button) {
  margin: 0;
}

/* Responsive pagination adjustments */
@media (max-width: 640px) {
  .responsive-data-table :deep(.n-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .responsive-data-table :deep(.n-pagination .n-pagination-item) {
    min-width: 32px;
    height: 32px;
  }
}
</style>
