import test from 'node:test'
import assert from 'node:assert/strict'

import { parseDiscordText } from './discordParser'

test('parsea la lista completa y luego mantiene los dinos activos con actualizaciones posteriores', () => {
  const initialText = [
    'Shiny Bot APP — 9:00 A Shiny Dino has spawned! Budgie Raptor has spawned at Lat 10 Lon 20! [Arkvibes Island]',
    'Shiny Bot APP — 9:01 A Shiny Dino has spawned! Enraged Sabertooth has spawned at Lat 30 Lon 40! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:02 A Shiny Dino has despawned! Budgie Raptor has despawned and will be missed! [Arkvibes Island]',
    'Shiny Bot APP — 9:03 A Shiny Dino has been killed! Enraged Sabertooth has been killed by PlayerOne! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:04 A Shiny Dino has spawned! Fathomless Phiomia has spawned at Lat 50 Lon 60! [Arkvibes Ragnarok]',
  ].join('\n\n')

  const updateText = [
    'Shiny Bot APP — 9:05 A Shiny Dino has spawned! Enraged Sabertooth has spawned at Lat 35 Lon 45! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:06 A Shiny Dino has despawned! Fathomless Phiomia has despawned and will be missed! [Arkvibes Ragnarok]',
    'Shiny Bot APP — 9:07 A Shiny Dino has tamed! Enraged Sabertooth has been tamed by PlayerTwo! [Arkvibes Non Primal Astraeos]',
  ].join('\n\n')

  const combinedText = `${initialText}\n\n${updateText}`

  const result = parseDiscordText(combinedText)

  assert.equal(result.dinos.length, 0)
  assert.ok(result.totalMessages >= 1)
  assert.equal(result.firstTime, '9:00')
  assert.equal(result.lastTime, '9:07')
})

test('parsea entradas nuevas sin espacio tras el signo de exclamación y actualiza correctamente el estado del dino', () => {
  const text = [
    'Shiny Bot APP — 9:30 A Shiny Dino has despawned!Enraged Sabertooth has despawned and will be missed! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:31 A Shiny Dino has spawned!Enraged Sabertooth has spawned at Lat 20 Lon 30! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:32 A Shiny Dino has despawned!Enraged Sabertooth has despawned and will be missed! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:33 A Shiny Dino has been killed!Enraged Sabertooth has been killed by PlayerOne! [Arkvibes Non Primal Astraeos]',
    'Shiny Bot APP — 9:34 A Shiny Dino has spawned!Enraged Sabertooth has spawned at Lat 28 Lon 34! [Arkvibes Non Primal Astraeos]',
  ].join('\n\n')

  const result = parseDiscordText(text)

  assert.equal(result.dinos.length, 1)
  assert.equal(result.dinos[0].name, 'Enraged Sabertooth')
  assert.equal(result.dinos[0].map, 'Non Primal Astraeos')
  assert.equal(result.dinos[0].latitude, 28)
  assert.equal(result.dinos[0].longitude, 34)
})
