export interface SpawnedDino {
  name: string
  map: string
  latitude?: number
  longitude?: number
}

export interface ParseResult {
  dinos: SpawnedDino[]
  firstTime: string
  lastTime: string
  totalMessages: number
}