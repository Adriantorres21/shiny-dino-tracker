<script setup lang="ts">
import { ref } from 'vue'

import {
  addDiscordText,
  deleteAllEntries,
} from '../firebase/database'

const text = ref('')
const saving = ref(false)
const deleting = ref(false)
const error = ref('')

async function addEntry() {
  const cleanText =
    text.value.trim()

  if (!cleanText) {
    return
  }

  saving.value = true
  error.value = ''

  try {
    await addDiscordText(
      cleanText
    )

    text.value = ''
  } catch (err) {
    console.error(err)

    error.value =
      'No se pudo agregar la entrada.'
  } finally {
    saving.value = false
  }
}

async function clearAllEntries() {
  const confirmed =
    window.confirm(
      '¿Seguro que quieres eliminar TODOS los eventos de Firebase?'
    )

  if (!confirmed) {
    return
  }

  deleting.value = true
  error.value = ''

  try {
    await deleteAllEntries()

    text.value = ''
  } catch (err) {
    console.error(err)

    error.value =
      'No se pudieron eliminar los eventos.'
  } finally {
    deleting.value = false
  }
}

function clearInput() {
  text.value = ''
  error.value = ''
}
</script>

<template>
  <section class="discord-input">

    <div class="input-header">

      <div class="input-title">
        <h2>Shiny BotAPP</h2>

        <span>
          Agrega nuevos mensajes de Discord
        </span>
      </div>

      <div class="input-actions">

        <button
          type="button"
          class="clear-button"
          :disabled="
            !text.trim() ||
            saving ||
            deleting
          "
          @click="clearInput"
        >
          Limpiar
        </button>

        <button
          type="button"
          class="update-button"
          :disabled="
            !text.trim() ||
            saving ||
            deleting
          "
          @click="addEntry"
        >
          <span v-if="saving">
            Agregando...
          </span>

          <span v-else>
            Agregar
          </span>
        </button>

        <button
          type="button"
          class="danger-button"
          :disabled="
            saving ||
            deleting
          "
          @click="clearAllEntries"
        >
          <span v-if="deleting">
            Eliminando...
          </span>

          <span v-else>
            Eliminar eventos
          </span>
        </button>

      </div>

    </div>

    <textarea
      v-model="text"
      placeholder="Pega aquí el texto de Shiny BotAPP..."
      spellcheck="false"
      @keydown.ctrl.enter="addEntry"
    />

    <div
      v-if="error"
      class="input-error"
    >
      {{ error }}
    </div>

    <div class="input-hint">
      Ctrl + Enter para agregar rápidamente
    </div>

  </section>
</template>
