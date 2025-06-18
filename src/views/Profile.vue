<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  NCard,
  NSpace,
  NButton,
  NAvatar,
  NForm,
  NFormItem,
  NInput,
  NSwitch,
  NDivider,
  useMessage
} from 'naive-ui';
import { useProfile } from '../composables/useProfile';

// Message API
const message = useMessage();

// Edit mode
const isEditing = ref(false);

// Get profile data
const { 
  profile,
  loading,
  saveProfile,
  fetchProfile
} = useProfile();

// Form model
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  company: '',
  address: '',
  notifications: true
});

// Load profile on mount
onMounted(async () => {
  await fetchProfile();
  // Copy profile data to form
  if (profile.value) {
    Object.assign(formData, profile.value);
  }
});

// Toggle edit mode
const toggleEdit = () => {
  if (isEditing.value) {
    // Save changes
    saveProfile(formData)
      .then(() => {
        message.success('Profile updated successfully');
        isEditing.value = false;
      })
      .catch((error) => {
        message.error(error.message || 'Failed to update profile');
      });
  } else {
    // Enter edit mode
    isEditing.value = true;
  }
};

// Cancel editing
const cancelEdit = () => {
  // Reset form data to current profile
  if (profile.value) {
    Object.assign(formData, profile.value);
  }
  isEditing.value = false;
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Profile</h1>

    <n-card v-if="profile">
      <div class="flex flex-col md:flex-row">
        <!-- Profile image section -->
        <div class="w-full md:w-1/3 flex flex-col items-center p-6">
          <n-avatar round size="large" color="#0052CC" :style="{ height: '100px', width: '100px' }">
            {{ profile?.name?.charAt(0) || 'U' }}
          </n-avatar>
          
          <h2 class="text-xl font-semibold mt-4">{{ profile?.name || 'User' }}</h2>
          <p class="text-gray-500">{{ profile?.position || 'No position' }}</p>
          
          <n-divider />
          
          <div class="w-full">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-500">Company</span>
              <span class="font-medium">{{ profile?.company || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-500">Email</span>
              <span class="font-medium">{{ profile?.email || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Phone</span>
              <span class="font-medium">{{ profile?.phone || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Profile form section -->
        <div class="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Profile Information</h3>
            <n-space>
              <n-button v-if="isEditing" @click="cancelEdit" class="ml-auto">
                Cancel
              </n-button>
              <n-button 
                type="primary" 
                @click="toggleEdit"
                :loading="loading"
              >
                {{ isEditing ? 'Save' : 'Edit' }}
              </n-button>
            </n-space>
          </div>

          <n-form 
            :model="formData" 
            label-placement="left" 
            label-width="100px"
            :disabled="!isEditing || loading"
          >
            <n-form-item label="Name" path="name">
              <n-input v-model:value="formData.name" placeholder="Your name" />
            </n-form-item>
            
            <n-form-item label="Email" path="email">
              <n-input v-model:value="formData.email" placeholder="Your email" />
            </n-form-item>
            
            <n-form-item label="Phone" path="phone">
              <n-input v-model:value="formData.phone" placeholder="Your phone number" />
            </n-form-item>
            
            <n-form-item label="Position" path="position">
              <n-input v-model:value="formData.position" placeholder="Your job position" />
            </n-form-item>
            
            <n-form-item label="Company" path="company">
              <n-input v-model:value="formData.company" placeholder="Your company" />
            </n-form-item>
            
            <n-form-item label="Address" path="address">
              <n-input v-model:value="formData.address" placeholder="Your address" />
            </n-form-item>
            
            <n-form-item label="Notifications" path="notifications">
              <n-switch v-model:value="formData.notifications" />
            </n-form-item>
          </n-form>
        </div>
      </div>
    </n-card>
    <n-card v-else>
      <div class="text-center p-4">
        <p>Loading profile...</p>
      </div>
    </n-card>
  </div>
</template>