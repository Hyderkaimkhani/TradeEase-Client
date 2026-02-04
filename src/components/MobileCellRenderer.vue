<script setup lang="ts">
import { defineComponent } from 'vue';
import type { MobileColumn } from './ResponsiveDataTable.vue';

const props = defineProps<{
    row: any;
    column: MobileColumn;
    renderCellValue: (row: any, column: MobileColumn) => any;
}>();

// Create a functional component wrapper that's stable
const CellContent = defineComponent({
    name: 'CellContent',
    setup() {
        return () => {
            const result = props.renderCellValue(props.row, props.column);

            // If it's a VNode object (from h()), return it directly
            if (result && typeof result === 'object' && result.__v_isVNode) {
                return result;
            }

            // If result is an array of VNodes (e.g. from NSpace), return them
            if (Array.isArray(result)) {
                return result;
            }

            // If it's a primitive, just render text
            return String(result ?? '-');
        };
    }
});
</script>

<template>
    <CellContent />
</template>
