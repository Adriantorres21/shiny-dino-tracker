<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import Login
  from './components/Login.vue'

import DiscordInput
  from './components/DiscordInput.vue'

import DinoDashboard
  from './components/DinoDashboard.vue'

import {
  observeAuth,
} from './firebase/auth'

import {
  subscribeToEntries,
  type SharedEntry,
} from './firebase/database'

import {
  parseDiscordText,
} from './parser/discordParser'

import type {
  ParseResult,
} from './types/dino'

import type {
  User,
} from 'firebase/auth'


const user =
  ref<User | null>(null)

const entries =
  ref<SharedEntry[]>([])

const result =
  ref<ParseResult>({
    dinos: [],
    firstTime: '',
    lastTime: '',
    totalMessages: 0,
  })


let unsubscribeAuth:
  (() => void) | undefined

let unsubscribeDatabase:
  (() => void) | undefined


function processEntries(
  incoming: SharedEntry[]
) {
  /*
   * Guardamos las entradas tal como
   * existen en Firebase.
   *
   * No eliminamos bloques completos,
   * porque ahora el parser elimina
   * eventos duplicados individualmente.
   */
  entries.value =
    incoming


  /*
   * Unimos todos los bloques
   * cronológicamente.
   */
  const combinedText =
    incoming
      .sort(
        (a, b) =>
          a.addedAt -
          b.addedAt
      )
      .map(
        entry => entry.text
      )
      .join('\n\n')


  if (!combinedText.trim()) {
    result.value = {
      dinos: [],
      firstTime: '',
      lastTime: '',
      totalMessages: 0,
    }

    return
  }


  /*
   * El parser:
   *
   * 1. Extrae eventos.
   * 2. Elimina duplicados.
   * 3. Ordena cronológicamente.
   * 4. Aplica spawn/despawn/killed.
   * 5. Devuelve únicamente los dinos activos.
   */
  result.value =
    parseDiscordText(
      combinedText
    )
}


onMounted(() => {

  unsubscribeAuth =
    observeAuth(
      currentUser => {

        user.value =
          currentUser


        if (currentUser) {

          if (
            !unsubscribeDatabase
          ) {
            unsubscribeDatabase =
              subscribeToEntries(
                processEntries
              )
          }

          return
        }


        /*
         * Usuario desconectado.
         */
        if (
          unsubscribeDatabase
        ) {
          unsubscribeDatabase()

          unsubscribeDatabase =
            undefined
        }


        entries.value = []

        result.value = {
          dinos: [],
          firstTime: '',
          lastTime: '',
          totalMessages: 0,
        }
      }
    )
})


onUnmounted(() => {

  if (unsubscribeAuth) {
    unsubscribeAuth()
  }

  if (
    unsubscribeDatabase
  ) {
    unsubscribeDatabase()
  }
})
</script>


<template>

  <Login
    v-if="!user"
  />


  <main
    v-else
    class="app"
  >

    <header
      class="app-header"
    >

      <div>

        <h1
          class="app-title"
        >
          Shiny Dino Tracker
        </h1>

        <p
          class="app-subtitle"
        >
          ARK Shiny BotAPP
        </p>

      </div>

    </header>


    <DiscordInput />


    <DinoDashboard
      :result="result"
    />

  </main>

</template>