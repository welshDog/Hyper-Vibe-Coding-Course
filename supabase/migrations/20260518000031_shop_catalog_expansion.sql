-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000031: BROski$ Shop — catalogue expansion (49 collectible items)
--
-- Why:
--   The shop shipped with 6 utility items but the repo carries 49 pieces of
--   item art (pets, snacks, cosmetics, toys, relics) with nowhere to live.
--   This lights the whole catalogue up: adds an image_url column and seeds
--   every art asset as a real, buyable shop_item.
--
-- Change:
--   1. ADD COLUMN IF NOT EXISTS shop_items.image_url text
--      (public URL under frontend/public — served by Vite at site root).
--   2. Idempotent INSERT of 49 items with stable UUIDs:
--        33330001-* food (6)            33330006-* pet_boost (5)
--        33330002-* hygiene (3)         33330007-* pet_care (9)
--        33330003-* pet_aura (5)        33330008-* pet_frame (5)
--        33330004-* pet_background (5)  33330009-* sacred (2)
--        33330005-* pet_badge (5)       33330010-* toys (4)
--
-- Notes:
--   - Art files carry a literal `.png.png` double extension on disk — the
--     image_url paths below match exactly. (Cosmetic wart; safe to rename
--     in a later sweep, but the paths must track the real filenames.)
--   - metadata: cosmetics carry { "pet_slot": ... } for future BROskiPets
--     equip wiring; consumables carry { "consumable": true }. No item here
--     reuses the profile "cosmetic" key (that stays gold-frame only).
--
-- Idempotent — ON CONFLICT (id) DO NOTHING + ADD COLUMN IF NOT EXISTS.
-- Requires: 000014 (shop_items), 000021 (metadata column).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. image_url column ───────────────────────────────────────────────────────
ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.shop_items.image_url IS
  'Public path to item art, served from frontend/public (e.g. /images/shop/food/x.png.png). NULL = render icon/emoji fallback.';

-- ── 2. Catalogue ──────────────────────────────────────────────────────────────

INSERT INTO public.shop_items
  (id, name, description, price_tokens, price_gbp, category, is_available, image_url, metadata)
VALUES
  -- ── 🍔 Snacks & Fuel (food) ─────────────────────────────────────────────────
  ('33330001-0000-0000-0000-000000000001', 'API Apple',
   'A crisp byte of fruit. Keeps the rate-limiter away. 🍎',
   20, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_api_apple.png.png', '{"consumable":true}'::jsonb),
  ('33330001-0000-0000-0000-000000000002', 'BROski Burger',
   'Double-stacked, fully loaded. Refuels you mid-deploy. 🍔',
   35, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_broski_burger.png.png', '{"consumable":true}'::jsonb),
  ('33330001-0000-0000-0000-000000000003', 'Hyper Energy Drink',
   'Liquid focus in a can. 100% legal caffeine units. ⚡',
   25, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_energy_drink.png.png', '{"consumable":true}'::jsonb),
  ('33330001-0000-0000-0000-000000000004', 'Hyper Donut',
   'Glazed, sprinkled, dopamine-loaded. The dev breakfast of champions. 🍩',
   20, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_hyper_donut.png.png', '{"consumable":true}'::jsonb),
  ('33330001-0000-0000-0000-000000000005', 'Markdown Muffin',
   'Freshly baked in `## headers`. Best with coffee. 🧁',
   18, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_markdown_muffin.png.png', '{"consumable":true}'::jsonb),
  ('33330001-0000-0000-0000-000000000006', 'Pixel Sushi',
   '8-bit omakase, rolled by a master sprite chef. 🍣',
   40, NULL, 'food', TRUE,
   '/images/shop/food/shop_food_pixel_sushi.png.png', '{"consumable":true}'::jsonb),

  -- ── 🧼 Clean & Tidy (hygiene) ───────────────────────────────────────────────
  ('33330002-0000-0000-0000-000000000001', 'Cache Shampoo',
   'Clears the gunk. Lather, rinse, hard-refresh. 🧴',
   22, NULL, 'hygiene', TRUE,
   '/images/shop/hygiene/shop_hygiene_cache_shampoo.png.png', '{"consumable":true}'::jsonb),
  ('33330002-0000-0000-0000-000000000002', 'Lint Brush',
   'Sweeps the fluff off your code. ESLint-approved. 🧹',
   18, NULL, 'hygiene', TRUE,
   '/images/shop/hygiene/shop_hygiene_lint_brush.png.png', '{"consumable":true}'::jsonb),
  ('33330002-0000-0000-0000-000000000003', 'Log Floss',
   'Gets between the stack traces. Minty-fresh logs. 🦷',
   20, NULL, 'hygiene', TRUE,
   '/images/shop/hygiene/shop_hygiene_log_floss.png.png', '{"consumable":true}'::jsonb),

  -- ── 🌀 Pet Auras (pet_aura) ─────────────────────────────────────────────────
  ('33330003-0000-0000-0000-000000000001', 'Cosmic Swirl Aura',
   'Wrap your BROskiPet in a galaxy. Pure main-character energy. 🌀',
   140, NULL, 'pet_aura', TRUE,
   '/images/shop/pet-aura/shop_aura_cosmic_swirl.png.png', '{"pet_slot":"aura"}'::jsonb),
  ('33330003-0000-0000-0000-000000000002', 'Electric Crackle Aura',
   'Crackling voltage that says "do not pet without gloves". ⚡',
   120, NULL, 'pet_aura', TRUE,
   '/images/shop/pet-aura/shop_aura_electric_crackle.png.png', '{"pet_slot":"aura"}'::jsonb),
  ('33330003-0000-0000-0000-000000000003', 'Flame Aura',
   'Your pet, but on fire (the good kind). 🔥',
   110, NULL, 'pet_aura', TRUE,
   '/images/shop/pet-aura/shop_aura_flame.png.png', '{"pet_slot":"aura"}'::jsonb),
  ('33330003-0000-0000-0000-000000000004', 'Hyperfocus Pulse Aura',
   'A steady pulse of pure focus. The flow-state flex. 💠',
   160, NULL, 'pet_aura', TRUE,
   '/images/shop/pet-aura/shop_aura_hyperfocus_pulse.png.png', '{"pet_slot":"aura"}'::jsonb),
  ('33330003-0000-0000-0000-000000000005', 'Matrix Rain Aura',
   'Green code raining around your pet. You see it now. 🟢',
   150, NULL, 'pet_aura', TRUE,
   '/images/shop/pet-aura/shop_aura_matrix_rain.png.png', '{"pet_slot":"aura"}'::jsonb),

  -- ── 🌌 Pet Backgrounds (pet_background) ─────────────────────────────────────
  ('33330004-0000-0000-0000-000000000001', 'Cosmic Vortex',
   'A swirling spacescape behind your pet. Deep. 🌌',
   130, NULL, 'pet_background', TRUE,
   '/images/shop/pet-background/shop_bg_cosmic_vortex.png.png', '{"pet_slot":"background"}'::jsonb),
  ('33330004-0000-0000-0000-000000000002', 'Deep Circuit',
   'Glowing motherboard traces. Your pet lives in the machine. 🔌',
   100, NULL, 'pet_background', TRUE,
   '/images/shop/pet-background/shop_bg_deep_circuit.png.png', '{"pet_slot":"background"}'::jsonb),
  ('33330004-0000-0000-0000-000000000003', 'Dark Lab',
   'Low-lit research lab vibes. Where the magic gets built. 🧪',
   80, NULL, 'pet_background', TRUE,
   '/images/shop/pet-background/shop_bg_lab_dark.png.png', '{"pet_slot":"background"}'::jsonb),
  ('33330004-0000-0000-0000-000000000004', 'Nebula Drift',
   'Soft drifting nebula clouds. Calm, cosmic, classy. ☁️',
   120, NULL, 'pet_background', TRUE,
   '/images/shop/pet-background/shop_bg_nebula_drift.png.png', '{"pet_slot":"background"}'::jsonb),
  ('33330004-0000-0000-0000-000000000005', 'Reality Fracture',
   'The screen behind your pet is literally breaking. Rare. 💥',
   160, NULL, 'pet_background', TRUE,
   '/images/shop/pet-background/shop_bg_reality_fracture.png.png', '{"pet_slot":"background"}'::jsonb),

  -- ── 🎖️ Pet Badges (pet_badge) ──────────────────────────────────────────────
  ('33330005-0000-0000-0000-000000000001', 'BROski Holo Badge',
   'Holographic BROski seal. Catches the light, catches eyes. ✨',
   120, NULL, 'pet_badge', TRUE,
   '/images/shop/pet-badge/shop_badge_broski_holo.png.png', '{"pet_slot":"badge"}'::jsonb),
  ('33330005-0000-0000-0000-000000000002', 'Dev Legend Badge',
   'Earned by those who ship. Worn by those who flex. 🏆',
   250, NULL, 'pet_badge', TRUE,
   '/images/shop/pet-badge/shop_badge_dev_legend.png.png', '{"pet_slot":"badge"}'::jsonb),
  ('33330005-0000-0000-0000-000000000003', 'Founder Badge',
   'Day-one energy. The rarest stamp in the dojo. 👑',
   300, NULL, 'pet_badge', TRUE,
   '/images/shop/pet-badge/shop_badge_founder.png.png', '{"pet_slot":"badge"}'::jsonb),
  ('33330005-0000-0000-0000-000000000004', 'Hyperfocus Crest',
   'The crest of the focused. Lock in. 🛡️',
   150, NULL, 'pet_badge', TRUE,
   '/images/shop/pet-badge/shop_badge_hyperfocus_crest.png.png', '{"pet_slot":"badge"}'::jsonb),
  ('33330005-0000-0000-0000-000000000005', 'Welsh Dragon Badge 🏴󠁧󠁢󠁷󠁬󠁳󠁿',
   'Y Ddraig Goch on your pet''s chest. Llanelli to the world. 🐉',
   200, NULL, 'pet_badge', TRUE,
   '/images/shop/pet-badge/shop_badge_welsh_dragon.png.png', '{"pet_slot":"badge"}'::jsonb),

  -- ── ⚡ Pet Boosters (pet_boost) ─────────────────────────────────────────────
  ('33330006-0000-0000-0000-000000000001', 'Evolution Potion',
   'Force-evolves your BROskiPet to its next form. One-time use. 🧬',
   300, NULL, 'pet_boost', TRUE,
   '/images/shop/pet-boost/shop_boost_evolution_potion.png.png', '{"consumable":true,"boost":"evolution"}'::jsonb),
  ('33330006-0000-0000-0000-000000000002', 'Happiness Max',
   'Pins your pet''s mood to max for 24h. Pure serotonin. 😄',
   120, NULL, 'pet_boost', TRUE,
   '/images/shop/pet-boost/shop_boost_happiness_max.png.png', '{"consumable":true,"boost":"happiness"}'::jsonb),
  ('33330006-0000-0000-0000-000000000003', 'Hyper Kibble',
   'Premium fuel. +50% XP from care actions for a day. 🍖',
   100, NULL, 'pet_boost', TRUE,
   '/images/shop/pet-boost/shop_boost_hyper_kibble.png.png', '{"consumable":true,"boost":"xp"}'::jsonb),
  ('33330006-0000-0000-0000-000000000004', 'Quantum Shard',
   'Rare crafting mat. Unlocks quantum-tier evolutions. 🔷',
   250, NULL, 'pet_boost', TRUE,
   '/images/shop/pet-boost/shop_boost_quantum_shard.png.png', '{"consumable":true,"boost":"craft"}'::jsonb),
  ('33330006-0000-0000-0000-000000000005', 'XP Booster',
   '2× XP on everything for 48h. Stack the gains. 📈',
   150, NULL, 'pet_boost', TRUE,
   '/images/shop/pet-boost/shop_boost_xp_booster.png.png', '{"consumable":true,"boost":"xp"}'::jsonb),

  -- ── 🐾 Pet Care (pet_care) ──────────────────────────────────────────────────
  ('33330007-0000-0000-0000-000000000001', 'HyperFuel',
   'High-octane pet food. Big stat bump, big happy pet. 🛢️',
   45, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_food_hyperfuel.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000002', 'Classic Kibble',
   'Reliable, cheap, gets the job done. The daily driver. 🥣',
   20, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_food_kibble.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000003', 'Power Snack',
   'A quick boost between care sessions. Crunchy. ⚡',
   35, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_food_power_snack.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000004', 'Holo Puzzle',
   'A holographic brain-teaser. Keeps your pet sharp. 🧩',
   50, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_toy_holo_puzzle.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000005', 'Quantum Toy',
   'It''s in two places at once. Your pet is obsessed. 🌀',
   60, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_toy_quantum.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000006', 'Debug Duck',
   'Rubber-duck debugging, now a toy your pet loves. 🦆',
   30, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_toy_rubber_duck.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000007', 'Choc Drop Treat',
   'A little reward. Big tail wag. 🍫',
   25, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_treat_choc_drop.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000008', 'Legendary Vibe Treat',
   'The treat of legends. Your pet ascends (briefly). 🌟',
   90, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_treat_legendary_vibe.png.png', '{"consumable":true}'::jsonb),
  ('33330007-0000-0000-0000-000000000009', 'Rainbow Treat',
   'Tastes like every colour at once. Maximum joy. 🌈',
   40, NULL, 'pet_care', TRUE,
   '/images/shop/pet-care/pet_shop_treat_rainbow.png.png', '{"consumable":true}'::jsonb),

  -- ── 🖼️ Pet Frames (pet_frame) ──────────────────────────────────────────────
  ('33330008-0000-0000-0000-000000000001', 'Basic Neon Frame',
   'Clean neon border. Where every collection starts. 🟪',
   90, NULL, 'pet_frame', TRUE,
   '/images/shop/pet-frame/shop_frame_basic_neon.png.png', '{"pet_slot":"frame"}'::jsonb),
  ('33330008-0000-0000-0000-000000000002', 'Glitch RGB Frame',
   'Chromatic-aberration edges. Tastefully broken. 📺',
   140, NULL, 'pet_frame', TRUE,
   '/images/shop/pet-frame/shop_frame_glitch_rgb.png.png', '{"pet_slot":"frame"}'::jsonb),
  ('33330008-0000-0000-0000-000000000003', 'Holo Foil Frame',
   'Trading-card holo foil. Tilt it in the light. ✨',
   200, NULL, 'pet_frame', TRUE,
   '/images/shop/pet-frame/shop_frame_holo_foil.png.png', '{"pet_slot":"frame"}'::jsonb),
  ('33330008-0000-0000-0000-000000000004', 'Quantum Crack Frame',
   'A fracture in spacetime around your pet. Rare. 💠',
   180, NULL, 'pet_frame', TRUE,
   '/images/shop/pet-frame/shop_frame_quantum_crack.png.png', '{"pet_slot":"frame"}'::jsonb),
  ('33330008-0000-0000-0000-000000000005', 'Welsh Celtic Frame 🏴󠁧󠁢󠁷󠁬󠁳󠁿',
   'Hand-knotted Celtic border. Heritage flex. 🐉',
   220, NULL, 'pet_frame', TRUE,
   '/images/shop/pet-frame/shop_frame_welsh_celtic.png.png', '{"pet_slot":"frame"}'::jsonb),

  -- ── 🔮 Sacred Relics (sacred) ───────────────────────────────────────────────
  ('33330009-0000-0000-0000-000000000001', 'Redemption Core',
   'The rarest relic. Resets one mistake. Use it wisely. 🔮',
   1200, NULL, 'sacred', TRUE,
   '/images/shop/sacred/shop_sacred_redemption_core.png.png', '{"rarity":"legendary"}'::jsonb),
  ('33330009-0000-0000-0000-000000000002', 'Vault Seal',
   'Seals your legacy in the Hyper vault. Founder-tier flex. 🗝️',
   1500, NULL, 'sacred', TRUE,
   '/images/shop/sacred/shop_sacred_vault_seal.png.png', '{"rarity":"legendary"}'::jsonb),

  -- ── 🎾 Toys & Gadgets (toys) ────────────────────────────────────────────────
  ('33330010-0000-0000-0000-000000000001', 'Code Ball',
   'Throw it, it bounces back compiled. Endless fun. 🎾',
   30, NULL, 'toys', TRUE,
   '/images/shop/toys/shop_toy_code_ball.png.png', '{"consumable":true}'::jsonb),
  ('33330010-0000-0000-0000-000000000002', 'The Deploy Button',
   'Big. Red. Satisfying. Does nothing. Worth every token. 🔴',
   45, NULL, 'toys', TRUE,
   '/images/shop/toys/shop_toy_deploy_button.png.png', '{"consumable":true}'::jsonb),
  ('33330010-0000-0000-0000-000000000003', 'Laser Pointer',
   'Maximum chaos, minimum effort. Pet not included. 🔴',
   25, NULL, 'toys', TRUE,
   '/images/shop/toys/shop_toy_laser_pointer.png.png', '{"consumable":true}'::jsonb),
  ('33330010-0000-0000-0000-000000000004', 'Webhook Whistle',
   'Blow it, something pings back. Eventually. 📣',
   35, NULL, 'toys', TRUE,
   '/images/shop/toys/shop_toy_webhook_whistle.png.png', '{"consumable":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ── Verify (uncomment to check) ───────────────────────────────────────────────
-- SELECT category, count(*) FROM public.shop_items
-- WHERE id::text LIKE '3333%' GROUP BY category ORDER BY category;
-- ^ expect 49 rows total across 10 categories.

COMMIT;
