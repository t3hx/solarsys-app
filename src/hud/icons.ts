/**
 * @module hud/icons
 * @description Enregistre hors ligne le sous-ensemble d'icones Iconify genere par
 * `scripts/build-icons.mjs`. Importe une fois au demarrage.
 */
import type { IconifyJSON } from '@iconify/react'
import { addCollection } from '@iconify/react'
import collections from '@/hud/icons.generated.json'

for (const collection of collections as IconifyJSON[]) addCollection(collection)
