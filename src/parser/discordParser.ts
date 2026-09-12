import type {
  SpawnedDino,
  ParseResult,
} from '../types/dino'

type DinoEventType =
  | 'spawn'
  | 'despawned'
  | 'killed'
  | 'tamed'

interface DinoEvent {
  position: number
  time: string
  event: DinoEventType
  name: string
  map: string
  latitude?: number
  longitude?: number
}

const TIME_REGEX =
  /(?:###\s\*)?Shiny\s+BotAPP\s*\*?[—–-]\*?\s*\*(\d{1,2}:\d{2})/gi

const EVENT_START_REGEX =
  /A\s+Shiny\s+Dino\s+has\s+(spawned|despawned|been\s+killed|been\s+tamed)!/gi

const SPAWN_DETAILS_REGEX =
  /(?:^|\r?\n)\s*\*{0,2}(.+?)\*{0,2}\s+has\s+spawned\s+at\s+Lat\s+(-?\d+(?:\.\d+)?)\s+Lon\s+(-?\d+(?:\.\d+)?)!/i

const DESPAWN_DETAILS_REGEX =
  /(?:^|\r?\n)\s*\*{0,2}(.+?)\*{0,2}\s+has\s+despawned(?:\s+and\s+will\s+be\s+missed!)?/i

const KILLED_DETAILS_REGEX =
  /(?:^|\r?\n)\s*\*{0,2}(.+?)\*{0,2}\s+has\s+been\s+killed(?:!|$)/i

const TAMED_DETAILS_REGEX =
  /(?:^|\r?\n)\s*\*{0,2}(.+?)\*{0,2}\s+has\s+been\s+tamed\s+by\s+(.+?)!/i

const MAP_REGEX =
  /\*{0,2}\[([^\]]+)\]\*{0,2}/g

function getDiscordTimes(
  text: string
): string[] {
  return [
    ...text.matchAll(
      TIME_REGEX
    ),
  ].map(
    match => match[1]
  )
}

function getTimeForPosition(
  text: string,
  position: number
): string {
  const textBefore =
    text.slice(
      0,
      position
    )

  const matches =
    [
      ...textBefore.matchAll(
        TIME_REGEX
      ),
    ]

  if (
    matches.length === 0
  ) {
    return ''
  }

  return matches[
    matches.length - 1
  ][1]
}

function getMapFromEvent(
  eventText: string
): string {
  const maps =
    [
      ...eventText.matchAll(
        MAP_REGEX
      ),
    ]

  if (
    maps.length === 0
  ) {
    return ''
  }

  return maps[
    maps.length - 1
  ][1]
    .replace(
      /^Arkvibes\s*/i,
      ''
    )
    .trim()
}

function cleanDinoName(
  name: string
): string {
  return name
    .replace(
      /\*\*/g,
      ''
    )
    .replace(
      /\*/g,
      ''
    )
    .replace(
      /:\w+:/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}

function parseEvent(
  text: string,
  position: number,
  end: number
): DinoEvent | null {
  const eventText =
    text.slice(
      position,
      end
    )

  const time =
    getTimeForPosition(
      text,
      position
    )

  /*
   * =========================
   * SPAWN
   * =========================
   */

  const spawn =
    eventText.match(
      SPAWN_DETAILS_REGEX
    )

  if (spawn) {
    return {
      position,
      time,
      event: 'spawn',
      name:
        cleanDinoName(
          spawn[1]
        ),
      map:
        getMapFromEvent(
          eventText
        ),
      latitude:
        Number(spawn[2]),
      longitude:
        Number(spawn[3]),
    }
  }

  /*
   * =========================
   * DESPAWN
   * =========================
   */

  const despawn =
    eventText.match(
      DESPAWN_DETAILS_REGEX
    )

  if (despawn) {
    return {
      position,
      time,
      event: 'despawned',
      name:
        cleanDinoName(
          despawn[1]
        ),
      map:
        getMapFromEvent(
          eventText
        ),
    }
  }

  /*
   * =========================
   * KILLED
   * =========================
   */

  const killed =
    eventText.match(
      KILLED_DETAILS_REGEX
    )

  if (killed) {
    return {
      position,
      time,
      event: 'killed',
      name:
        cleanDinoName(
          killed[1]
        ),
      map:
        getMapFromEvent(
          eventText
        ),
    }
  }

  /*
   * =========================
   * TAMED
   * =========================
   */

  const tamed =
    eventText.match(
      TAMED_DETAILS_REGEX
    )

  if (tamed) {
    return {
      position,
      time,
      event: 'tamed',
      name:
        cleanDinoName(
          tamed[1]
        ),
      map:
        getMapFromEvent(
          eventText
        ),
    }
  }

  return null
}

function extractEvents(
  text: string
): DinoEvent[] {
  const matches =
    [
      ...text.matchAll(
        EVENT_START_REGEX
      ),
    ]

  const events:
    DinoEvent[] = []

  for (
    let i = 0;
    i < matches.length;
    i++
  ) {
    const match =
      matches[i]

    const position =
      match.index ?? 0

    const end =
      i + 1 <
      matches.length
        ? (
            matches[
              i + 1
            ].index ??
            text.length
          )
        : text.length

    const event =
      parseEvent(
        text,
        position,
        end
      )

    if (event) {
      events.push(
        event
      )
    }
  }

  return events
}

function getEventKey(
  event: DinoEvent
): string {
  return [
    event.event,
    event.time,
    event.name,
    event.map,
    event.latitude ?? '',
    event.longitude ?? '',
  ]
    .join('|')
    .toLowerCase()
}

function removeDuplicateEvents(
  events: DinoEvent[]
): DinoEvent[] {
  const seen =
    new Set<string>()

  const unique:
    DinoEvent[] = []

  for (
    const event of events
  ) {
    const key =
      getEventKey(
        event
      )

    if (
      seen.has(key)
    ) {
      continue
    }

    seen.add(key)

    unique.push(
      event
    )
  }

  return unique
}

function timeToMinutes(
  time: string
): number {
  const match =
    time.match(
      /^(\d{1,2}):(\d{2})$/
    )

  if (!match) {
    return -1
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  )
}

export function parseDiscordText(
  text: string
): ParseResult {
  const discordTimes =
    getDiscordTimes(
      text
    )

  const extractedEvents =
    extractEvents(
      text
    )

  const events =
    removeDuplicateEvents(
      extractedEvents
    )

  /*
   * Ordenamos cronológicamente.
   * Si dos eventos tienen la misma hora,
   * conservamos el orden original del mensaje.
   */

  events.sort(
    (a, b) => {
      const timeA =
        timeToMinutes(
          a.time
        )

      const timeB =
        timeToMinutes(
          b.time
        )

      if (
        timeA === timeB
      ) {
        return (
          a.position -
          b.position
        )
      }

      return (
        timeA -
        timeB
      )
    }
  )

  const activeDinos =
    new Map<
      string,
      DinoEvent
    >()

  for (
    const event of events
  ) {
    const key =
      `${event.name}|${event.map}`
        .toLowerCase()

    /*
     * Un spawn agrega/reemplaza
     * el dino activo.
     */
    if (
      event.event === 'spawn'
    ) {
      activeDinos.set(
        key,
        event
      )

      continue
    }

    /*
     * Despawn, killed y tamed
     * eliminan el dino de activos.
     */
    activeDinos.delete(
      key
    )
  }

  const dinos:
    SpawnedDino[] =
    [
      ...activeDinos.values()
    ].map(
      event => ({
        name:
          event.name,
        map:
          event.map,
        latitude:
          event.latitude,
        longitude:
          event.longitude,
      })
    )

  return {
    dinos,

    firstTime:
      discordTimes[0] ??
      '',

    lastTime:
      discordTimes[
        discordTimes.length - 1
      ] ??
      '',

    totalMessages:
      events.length,
  }
}