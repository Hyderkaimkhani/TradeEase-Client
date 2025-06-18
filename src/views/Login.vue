<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NIcon,
  useMessage
} from 'naive-ui';
import { MailOutline, LockClosedOutline, PersonOutline } from '@vicons/ionicons5';
import { useAuth } from '../composables/useAuth';

// Router
const router = useRouter();
const message = useMessage();
const { login, signup } = useAuth();

// Tab state
const activeTab = ref('login');

// Form models
const loginForm = reactive({
  email: '',
  password: ''
});

const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Loading states
const isLoggingIn = ref(false);
const isSigningUp = ref(false);

// Form rules
const loginRules = {
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
};

const signupRules = {
  name: [
    { required: true, message: 'Please input your name', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        return value === signupForm.password;
      },
      message: 'Passwords do not match',
      trigger: 'blur'
    }
  ]
};

// Form refs
const loginFormRef = ref<any>(null);
const signupFormRef = ref<any>(null);

// Handle login
const handleLogin = (e: Event) => {
  e.preventDefault();
  loginFormRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoggingIn.value = true;
      try {
        await login(loginForm.email, loginForm.password);
        message.success('Login successful');
        router.push('/app/dashboard');
      } catch (error: any) {
        message.error(error.message || 'Login failed');
      } finally {
        isLoggingIn.value = false;
      }
    }
  });
};

// Handle signup
const handleSignup = (e: Event) => {
  e.preventDefault();
  signupFormRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isSigningUp.value = true;
      try {
        await signup(signupForm.name, signupForm.email, signupForm.password);
        message.success('Signup successful');
        router.push('/app/dashboard');
      } catch (error: any) {
        message.error(error.message || 'Signup failed');
      } finally {
        isSigningUp.value = false;
      }
    }
  });
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <n-card class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-primary-600">ShipManager</h1>
        <p class="text-gray-500">Trade Ease</p>
      </div>

      <n-tabs v-model:value="activeTab" animated>
        <!-- Login Tab -->
        <n-tab-pane name="login" tab="Login">
          <n-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-placement="top"
          >
            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="loginForm.email"
                placeholder="Enter your email"
                clearable
              >
                <template #prefix>
                  <n-icon><mail-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="Password" path="password">
              <n-input
                v-model:value="loginForm.password"
                type="password"
                placeholder="Enter your password"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-closed-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-button
              type="primary"
              block
              @click="handleLogin"
              :loading="isLoggingIn"
              class="mt-4"
            >
              Login
            </n-button>

            <div class="text-center mt-4">
              <span class="text-gray-500">Don't have an account? </span>
              <a href="#" @click.prevent="activeTab = 'signup'" class="text-primary-500">Sign up</a>
            </div>
          </n-form>
        </n-tab-pane>

        <!-- Sign up Tab -->
        <n-tab-pane name="signup" tab="Sign up">
          <n-form
            ref="signupFormRef"
            :model="signupForm"
            :rules="signupRules"
            label-placement="top"
          >
            <n-form-item label="Name" path="name">
              <n-input
                v-model:value="signupForm.name"
                placeholder="Enter your name"
                clearable
              >
                <template #prefix>
                  <n-icon><person-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="signupForm.email"
                placeholder="Enter your email"
                clearable
              >
                <template #prefix>
                  <n-icon><mail-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="Password" path="password">
              <n-input
                v-model:value="signupForm.password"
                type="password"
                placeholder="Create a password"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-closed-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="Confirm Password" path="confirmPassword">
              <n-input
                v-model:value="signupForm.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                show-password-on="click"
              >
                <template #prefix>
                  <n-icon><lock-closed-outline /></n-icon>
                </template>
              </n-input>
            </n-form-item>

            <n-button
              type="primary"
              block
              @click="handleSignup"
              :loading="isSigningUp"
              class="mt-4"
            >
              Sign up
            </n-button>

            <div class="text-center mt-4">
              <span class="text-gray-500">Already have an account? </span>
              <a href="#" @click.prevent="activeTab = 'login'" class="text-primary-500">Login</a>
            </div>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>