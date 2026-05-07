// BROskiPet species catalogue.
//
// Image paths point at /public/pets/{species}.png (copied from
// H:/dNFTpet/BROskiPets-LLM-dNFT/broski_pets/{species}/{species}_evo1.png).
//
// `babyMetadataCid` is currently a placeholder until pinata_upload_all.py runs.
// MintPetButton refuses to mint while the CID still starts with "PLACEHOLDER_"
// so users can never burn 100 BROski$ on a broken CID.

export type SpeciesId =
  | 'apex_dragon'
  | 'blizzard_lizard'
  | 'chaos_cat'
  | 'cyber_fox'
  | 'gigabyte_guinea_pig'
  | 'hyper_beam_bunny'
  | 'hyper_hamster'
  | 'hyperfocus_horse'
  | 'power_pup'
  | 'sonic_spider'

export type SpeciesConfig = {
  id:               SpeciesId
  displayName:      string
  emoji:            string
  imageUrl:         string
  /** IPFS CID for the Baby-stage metadata JSON. Replace placeholders after pinata_upload_all.py. */
  babyMetadataCid:  string
}

export const SPECIES: readonly SpeciesConfig[] = [
  { id: 'apex_dragon',         displayName: 'Apex Dragon',         emoji: '🐲', imageUrl: '/pets/apex_dragon.png',         babyMetadataCid: 'PLACEHOLDER_APEX_DRAGON_BABY_CID' },
  { id: 'blizzard_lizard',     displayName: 'Blizzard Lizard',     emoji: '❄️', imageUrl: '/pets/blizzard_lizard.png',     babyMetadataCid: 'PLACEHOLDER_BLIZZARD_LIZARD_BABY_CID' },
  { id: 'chaos_cat',           displayName: 'Chaos Cat',           emoji: '🐈', imageUrl: '/pets/chaos_cat.png',           babyMetadataCid: 'PLACEHOLDER_CHAOS_CAT_BABY_CID' },
  { id: 'cyber_fox',           displayName: 'Cyber Fox',           emoji: '🦊', imageUrl: '/pets/cyber_fox.png',           babyMetadataCid: 'PLACEHOLDER_CYBER_FOX_BABY_CID' },
  { id: 'gigabyte_guinea_pig', displayName: 'Gigabyte Guinea Pig', emoji: '🐹', imageUrl: '/pets/gigabyte_guinea_pig.png', babyMetadataCid: 'PLACEHOLDER_GIGABYTE_GUINEA_PIG_BABY_CID' },
  { id: 'hyper_beam_bunny',    displayName: 'Hyper Beam Bunny',    emoji: '🐰', imageUrl: '/pets/hyper_beam_bunny.png',    babyMetadataCid: 'PLACEHOLDER_HYPER_BEAM_BUNNY_BABY_CID' },
  { id: 'hyper_hamster',       displayName: 'Hyper Hamster',       emoji: '🐭', imageUrl: '/pets/hyper_hamster.png',       babyMetadataCid: 'PLACEHOLDER_HYPER_HAMSTER_BABY_CID' },
  { id: 'hyperfocus_horse',    displayName: 'Hyperfocus Horse',    emoji: '🐴', imageUrl: '/pets/hyperfocus_horse.png',    babyMetadataCid: 'PLACEHOLDER_HYPERFOCUS_HORSE_BABY_CID' },
  { id: 'power_pup',           displayName: 'Power Pup',           emoji: '🐶', imageUrl: '/pets/power_pup.png',           babyMetadataCid: 'PLACEHOLDER_POWER_PUP_BABY_CID' },
  { id: 'sonic_spider',        displayName: 'Sonic Spider',        emoji: '🕷️', imageUrl: '/pets/sonic_spider.png',        babyMetadataCid: 'PLACEHOLDER_SONIC_SPIDER_BABY_CID' },
] as const

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

export const RARITY_LABELS: Record<Rarity, string> = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  legendary: 'Legendary',
}

export function isRealCid(cid: string): boolean {
  return !cid.startsWith('PLACEHOLDER_') && cid.length >= 10
}

export function getSpecies(id: SpeciesId): SpeciesConfig {
  const found = SPECIES.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown species: ${id}`)
  return found
}
