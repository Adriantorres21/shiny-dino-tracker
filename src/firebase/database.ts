import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  onValue,
} from 'firebase/database'

import { firebaseApp } from './config'

const database = getDatabase(firebaseApp)

const entriesRef =
  ref(database, 'shared/entries')

export interface SharedEntry {
  id: string
  text: string
  addedAt: number
}

export async function addDiscordText(
  text: string
) {
  const cleanText =
    text.trim()

  if (!cleanText) {
    return
  }

  const newEntry =
    push(entriesRef)

  await set(newEntry, {
    text: cleanText,
    addedAt: Date.now(),
  })
}

export async function deleteAllEntries() {
  await remove(entriesRef)
}

export function subscribeToEntries(
  callback: (
    entries: SharedEntry[]
  ) => void
) {
  return onValue(
    entriesRef,
    snapshot => {
      if (!snapshot.exists()) {
        callback([])
        return
      }

      const data =
        snapshot.val()

      const entries:
        SharedEntry[] = []

      for (
        const [id, value]
        of Object.entries(data)
      ) {
        const entry =
          value as {
            text?: string
            addedAt?: number
          }

        if (
          typeof entry.text !==
          'string'
        ) {
          continue
        }

        entries.push({
          id,
          text: entry.text,
          addedAt:
            typeof entry.addedAt ===
            'number'
              ? entry.addedAt
              : 0,
        })
      }

      entries.sort(
        (a, b) =>
          a.addedAt -
          b.addedAt
      )

      callback(entries)
    }
  )
}