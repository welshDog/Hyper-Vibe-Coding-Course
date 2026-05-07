// BROskiPet species catalogue.
//
// Image paths point at /public/pets/{species}.png (copied from
// H:/dNFTpet/BROskiPets-LLM-dNFT/broski_pets/{species}/{species}_evo1.png).
//
// `babyMetadataCid` values are real Pinata v3 CIDs (uploaded 2026-05-07,
// group BROski_pets_dNFTs / 2aedcf70-d4bb-4e13-94c9-ef6098d49aca).
// MintPetButton still refuses to mint if a CID starts with "PLACEHOLDER_"
// so any future species added without pinning can't burn user BROski$.

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
  { id: 'apex_dragon',         displayName: 'Apex Dragon',         emoji: '🐲', imageUrl: '/pets/apex_dragon.png',         babyMetadataCid: 'bafkreifmbfuzdcy3rmaqywbymt4y23tfqx3fcu2bgv4n3vtbuj77yqqzte' },
  { id: 'blizzard_lizard',     displayName: 'Blizzard Lizard',     emoji: '❄️', imageUrl: '/pets/blizzard_lizard.png',     babyMetadataCid: 'bafkreib4w5w6rnyufxkbywxspb266r74lwbumjdhlnzzp2netkkdkfdft4' },
  { id: 'chaos_cat',           displayName: 'Chaos Cat',           emoji: '🐈', imageUrl: '/pets/chaos_cat.png',           babyMetadataCid: 'bafkreiayrp3n742qr7p6z74ibtt27meaklik4iyhdhr7rq42vrqknpdndy' },
  { id: 'cyber_fox',           displayName: 'Cyber Fox',           emoji: '🦊', imageUrl: '/pets/cyber_fox.png',           babyMetadataCid: 'bafkreigyzfipicwnwllxfkll55mbaztfhqehw3os5vmiezksntpxe7iaua' },
  { id: 'gigabyte_guinea_pig', displayName: 'Gigabyte Guinea Pig', emoji: '🐹', imageUrl: '/pets/gigabyte_guinea_pig.png', babyMetadataCid: 'bafkreigwuuqfqq2ikfpufms26d5ykwed6fozmr5c44uvx4ok7bcsk7ioy4' },
  { id: 'hyper_beam_bunny',    displayName: 'Hyper Beam Bunny',    emoji: '🐰', imageUrl: '/pets/hyper_beam_bunny.png',    babyMetadataCid: 'bafkreihanpom3j4kqztxqiqoxpmg54vup4obcgwp5e2rq5tposlvantl4y' },
  { id: 'hyper_hamster',       displayName: 'Hyper Hamster',       emoji: '🐭', imageUrl: '/pets/hyper_hamster.png',       babyMetadataCid: 'bafkreihh6bswkdwnhgbvf37tqbv3z4wgmftx5n6jcsfz2nldyolbm2lgwe' },
  { id: 'hyperfocus_horse',    displayName: 'Hyperfocus Horse',    emoji: '🐴', imageUrl: '/pets/hyperfocus_horse.png',    babyMetadataCid: 'bafkreib6pnkjhzzwbrmrefulglijgelhbwt7sbmommdtm2etrdp44v2zay' },
  { id: 'power_pup',           displayName: 'Power Pup',           emoji: '🐶', imageUrl: '/pets/power_pup.png',           babyMetadataCid: 'bafkreigh4tin25yi7peyfk5r2lma34wgvrrws5biailihc3nbckdrgypdy' },
  { id: 'sonic_spider',        displayName: 'Sonic Spider',        emoji: '🕷️', imageUrl: '/pets/sonic_spider.png',        babyMetadataCid: 'bafkreihtyvnywbollf5w47ovsjw7cbgs6scpacajrkrjp2fstydjqmdlna' },
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
