<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import type {
  ParseResult,
} from '../types/dino'

const props = defineProps<{
  result: ParseResult
}>()

const controlsVisible =
  ref(true)

const visibleMaps =
  ref<Set<string>>(new Set())

const initialized =
  ref(false)

const searchText =
  ref('')

const selectedDinos =
  ref<Set<string>>(new Set())

const maps = computed(() => {
  const mapSet =
    new Set<string>()

  for (
    const dino
    of props.result.dinos
  ) {
    if (dino.map) {
      mapSet.add(dino.map)
    }
  }

  return [...mapSet].sort()
})

watch(
  maps,
  newMaps => {
    if (!initialized.value) {
      visibleMaps.value =
        new Set(newMaps)

      initialized.value =
        true

      return
    }

    const next =
      new Set<string>()

    for (
      const map of newMaps
    ) {
      if (
        visibleMaps.value.has(map)
      ) {
        next.add(map)
      }
    }

    visibleMaps.value =
      next
  },
  {
    immediate: true,
  }
)

function isMapVisible(
  map: string
) {
  return visibleMaps.value.has(
    map
  )
}

function toggleMap(
  map: string
) {
  const next =
    new Set(
      visibleMaps.value
    )

  if (next.has(map)) {
    next.delete(map)
  } else {
    next.add(map)
  }

  visibleMaps.value =
    next
}

function showAllMaps() {
  visibleMaps.value =
    new Set(maps.value)
}

function hideAllMaps() {
  visibleMaps.value =
    new Set()
}

const filteredDinos = computed(() => {
  const search =
    searchText.value
      .trim()
      .toLowerCase()

  if (!search) {
    return props.result.dinos
  }

  return props.result.dinos.filter(
    dino =>
      dino.name
        .toLowerCase()
        .includes(search)
  )
})

const dinosByMap =
  computed(() => {
    const groups =
      new Map<
        string,
        typeof props.result.dinos
      >()

    for (
      const dino
      of filteredDinos.value
    ) {
      if (
        !isMapVisible(dino.map)
      ) {
        continue
      }

      if (
        !groups.has(dino.map)
      ) {
        groups.set(
          dino.map,
          []
        )
      }

      groups
        .get(dino.map)!
        .push(dino)
    }

    return [...groups.entries()]
  })

function formatCoordinate(
  value: number | undefined
) {
  if (
    value === undefined
  ) {
    return '-'
  }

  return value.toFixed(2)
}

function clearSearch() {
  searchText.value = ''
}

function getDinoKey(
  dino: typeof props.result.dinos[number]
) {
  return [
    dino.name,
    dino.map,
    dino.latitude ?? '',
    dino.longitude ?? '',
  ]
    .join('|')
    .toLowerCase()
}

function isDinoSelected(
  dino: typeof props.result.dinos[number]
) {
  return selectedDinos.value.has(
    getDinoKey(dino)
  )
}

function toggleDinoSelection(
  dino: typeof props.result.dinos[number]
) {
  const next =
    new Set(
      selectedDinos.value
    )

  const key =
    getDinoKey(dino)

  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }

  selectedDinos.value =
    next
}
</script>

<template>
  <section class="dashboard">

    <!-- =========================
         CONTROLES DE MAPA
         ========================= -->

    <div
      v-if="controlsVisible"
      class="floating-controls"
    >
      <div
        class="floating-controls-header"
      >
        <div>
          <div
            class="floating-controls-title"
          >
            Controles
          </div>

          <div
            class="floating-controls-subtitle"
          >
            {{ result.dinos.length }}
            dinos activos
          </div>
        </div>

        <button
          type="button"
          class="floating-control-close"
          title="Ocultar controles"
          @click="
            controlsVisible = false
          "
        >
          −
        </button>
      </div>

      <div
        class="floating-controls-body"
      >
        <div
          class="control-section-header"
        >
          <span>
            Mapas
          </span>

          <span
            class="control-map-count"
          >
            {{ maps.length }}
          </span>
        </div>

        <div
          class="map-control-actions"
        >
          <button
            type="button"
            class="map-action-button"
            @click="showAllMaps"
          >
            Mostrar todos
          </button>

          <button
            type="button"
            class="map-action-button"
            @click="hideAllMaps"
          >
            Ocultar todos
          </button>
        </div>

        <div
          v-if="maps.length"
          class="map-filters"
        >
          <button
            v-for="map in maps"
            :key="map"
            type="button"
            class="map-filter-button"
            :class="{
              active:
                isMapVisible(map)
            }"
            @click="
              toggleMap(map)
            "
          >
            <span
              class="map-filter-indicator"
            ></span>

            {{ map }}
          </button>
        </div>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="show-controls-button"
      title="Mostrar controles"
      @click="
        controlsVisible = true
      "
    >
      <span>☰</span>
      Controles
    </button>

    <!-- =========================
         RESUMEN
         ========================= -->

    <div
      class="dashboard-summary"
    >
      <div
        class="summary-card"
      >
        <span
          class="summary-label"
        >
          Activos
        </span>

        <span
          class="summary-value"
        >
          {{ result.dinos.length }}
        </span>
      </div>

      <div
        class="summary-card"
      >
        <span
          class="summary-label"
        >
          Eventos
        </span>

        <span
          class="summary-value"
        >
          {{ result.totalMessages }}
        </span>
      </div>

      <div
        class="summary-card"
      >
        <span
          class="summary-label"
        >
          INICIO
        </span>

        <span
          class="summary-value summary-time"
        >
          {{ result.firstTime || '-' }}
        </span>
      </div>

      <div
        class="summary-card"
      >
        <span
          class="summary-label"
        >
          FIN
        </span>

        <span
          class="summary-value summary-time"
        >
          {{ result.lastTime || '-' }}
        </span>
      </div>
    </div>

    <!-- =========================
         SIN DINOS
         ========================= -->

    <div
      v-if="
        result.dinos.length === 0
      "
      class="empty-state"
    >
      <h3>
        No hay dinos activos
      </h3>

      <p>
        Agrega mensajes de Shiny BotAPP
        para comenzar.
      </p>
    </div>

    <template v-else>

      <!-- =========================
           BUSCADOR
           ========================= -->

      <div
        class="dino-search"
      >
        <div
          class="dino-search-header"
        >
          <div>
            <h2>
              Buscar dinosaurio
            </h2>

            <span>
              {{ filteredDinos.length }}
              de
              {{ result.dinos.length }}
              dinos
            </span>
          </div>

          <button
            v-if="searchText"
            type="button"
            class="search-clear-button"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>

        <div
          class="search-input-wrapper"
        >
          <span
            class="search-icon"
          >
            🔎
          </span>

          <input
            v-model="searchText"
            type="text"
            class="dino-search-input"
            placeholder="Buscar por nombre... Ej. pachy"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>

      <!-- =========================
           MAPAS / DINOS
           ========================= -->

      <section
        v-for="[
          map,
          dinos
        ] in dinosByMap"
        :key="map"
        class="map-section"
      >
        <div
          class="map-section-header"
        >
          <div
            class="map-section-title"
          >
            <h2>
              {{ map }}
            </h2>

            <span
              class="map-count"
            >
              {{ dinos.length }}
            </span>
          </div>
        </div>

        <div
          class="dino-grid"
        >
          <article
            v-for="dino in dinos"
            :key="
              `${dino.name}-${dino.map}-${dino.latitude}-${dino.longitude}`
            "
            class="dino-card"
            :class="{
              selected:
                isDinoSelected(dino)
            }"
            @click="
              toggleDinoSelection(dino)
            "
          >
            <div
              class="dino-card-accent"
            ></div>

            <div
              class="dino-name-wrapper"
            >
              <h3
                class="dino-name"
              >
                {{ dino.name }}
              </h3>

              <div
                class="dino-name-tooltip"
              >
                {{ dino.name }}
              </div>
            </div>

            <div
              v-if="
                dino.latitude !==
                  undefined &&
                dino.longitude !==
                  undefined
              "
              class="dino-coordinates"
            >
              <span>
                LAT
              </span>

              {{ formatCoordinate(
                dino.latitude
              ) }}

              <span
                class="coordinate-separator"
              >
                ·
              </span>

              <span>
                LON
              </span>

              {{ formatCoordinate(
                dino.longitude
              ) }}
            </div>
          </article>
        </div>
      </section>

      <!-- =========================
           BÚSQUEDA SIN RESULTADOS
           ========================= -->

      <div
        v-if="
          filteredDinos.length === 0 &&
          searchText
        "
        class="empty-state search-empty-state"
      >
        <strong>
          No se encontraron dinos
        </strong>

        <span>
          No hay ningún dinosaurio cuyo
          nombre contenga
          "{{ searchText }}"
        </span>

        <button
          type="button"
          @click="clearSearch"
        >
          Limpiar búsqueda
        </button>
      </div>

      <!-- =========================
           TODOS LOS MAPAS OCULTOS
           ========================= -->

      <div
        v-if="
          filteredDinos.length > 0 &&
          dinosByMap.length === 0
        "
        class="empty-filter-state"
      >
        <strong>
          Todos los mapas están ocultos
        </strong>

        <button
          type="button"
          @click="showAllMaps"
        >
          Mostrar todos
        </button>
      </div>

    </template>

  </section>
</template>