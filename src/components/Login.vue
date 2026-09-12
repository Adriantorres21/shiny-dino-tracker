<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../firebase/auth'

const code = ref('')
const loading = ref(false)
const error = ref('')

const emit = defineEmits<{
  authenticated: []
}>()

async function handleLogin() {
  if (!code.value.trim()) {
    error.value = 'Enter the access code.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await login(code.value)
    emit('authenticated')
  } catch {
    error.value = 'Invalid access code.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-card">
      <div class="login-icon">
        🦖
      </div>

      <h1>Shiny Dino Tracker</h1>

      <p>
        Enter the access code to continue.
      </p>

      <form @submit.prevent="handleLogin">
        <input
          v-model="code"
          type="password"
          placeholder="Access code"
          autocomplete="current-password"
        />

        <button
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Checking...' : 'Enter' }}
        </button>
      </form>

      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>
    </div>
  </main>
</template>