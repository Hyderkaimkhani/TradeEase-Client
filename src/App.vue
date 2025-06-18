<script setup lang="ts">
import { useRouter } from 'vue-router';
import { setupNavigationGuards } from './router';
import { NMessageProvider } from 'naive-ui';

// Set up router navigation guards
const router = useRouter();
setupNavigationGuards(router);
</script>

<template>
  <n-message-provider>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </n-message-provider>
</template>